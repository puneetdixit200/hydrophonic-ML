"""
FastAPI Backend for Hydroponic Plant Health Prediction System
Serves ML predictions via REST API endpoints
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import xgboost as xgb
import joblib
import os
import json
from pathlib import Path
from preprocessing import SimpleScaler, SimpleEncoder

# Initialize FastAPI app
app = FastAPI(
    title="Hydroponic Plant Health Predictor API",
    description="Predicts plant health and growth using XGBoost model",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# MODEL PATHS AND INITIALIZATION
# ============================================================================

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / "xgb_model.json"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
ENCODER_PATH = MODEL_DIR / "encoder.pkl"

# Global model and preprocessing objects
model = None
scaler = None
encoder = None


def load_model():
    """Load XGBoost model and preprocessing objects from disk."""
    global model, scaler, encoder
    try:
        if MODEL_PATH.exists():
            model = xgb.Booster(model_file=str(MODEL_PATH))
            scaler = joblib.load(SCALER_PATH)
            encoder = joblib.load(ENCODER_PATH)
            print("✓ Model loaded successfully")
        else:
            print("⚠ Model not found. Please run train_model.py first.")
    except Exception as e:
        print(f"✗ Error loading model: {e}")


# Load model on startup
load_model()

# ============================================================================
# PYDANTIC MODELS FOR REQUEST/RESPONSE VALIDATION
# ============================================================================


class PredictionRequest(BaseModel):
    """Input schema for plant health prediction."""
    ph_value: float  # 3.0 - 9.0
    ec_value: float  # EC/TDS in µS/cm or ppm
    water_temperature: float  # °C
    air_humidity: float  # % (0-100)
    visual_condition: str  # One of: Healthy, Yellowing, Wilting, Leaf Curling, Spotting


class NutrientRecommendation(BaseModel):
    """Nutrient recommendation model."""
    nutrient: str
    issue: str  # Deficiency or Toxicity
    severity: str  # Low, Medium, High


class PredictionResponse(BaseModel):
    """Output schema for plant health prediction."""
    plant_health_status: str  # Healthy, Stressed, Diseased
    growth_rate: str  # Low, Moderate, High
    yield_prediction: float  # Regression score (0-100)
    disease_risk_percentage: float  # 0-100
    nutrient_issues: List[NutrientRecommendation]
    environmental_recommendations: List[str]
    confidence_score: float  # 0-1
    model_version: str


# ============================================================================
# UTILITY FUNCTIONS FOR PREDICTIONS
# ============================================================================


def get_health_status(health_score: float) -> str:
    """Classify health status based on prediction score."""
    if health_score >= 0.66:
        return "Healthy"
    elif health_score >= 0.33:
        return "Stressed"
    else:
        return "Diseased"


def get_growth_rate(growth_score: float) -> str:
    """Classify growth rate based on prediction score."""
    if growth_score >= 0.66:
        return "High"
    elif growth_score >= 0.33:
        return "Moderate"
    else:
        return "Low"


def generate_nutrient_recommendations(
    ph: float, ec: float, health_score: float, visual_condition: str
) -> List[NutrientRecommendation]:
    """Generate nutrient deficiency/toxicity recommendations based on parameters."""
    recommendations = []

    # pH-based nutrient availability analysis
    if ph < 4.5:
        recommendations.append(
            NutrientRecommendation(
                nutrient="Iron, Manganese, Zinc",
                issue="Toxicity - Excessive availability",
                severity="High",
            )
        )
        recommendations.append(
            NutrientRecommendation(
                nutrient="Phosphorus, Calcium", issue="Deficiency", severity="Medium"
            )
        )
    elif 5.5 <= ph <= 6.5:  # Optimal range
        if ec < 800:
            recommendations.append(
                NutrientRecommendation(
                    nutrient="Nitrogen, Phosphorus, Potassium",
                    issue="Deficiency - Low EC",
                    severity="Medium",
                )
            )
    elif ph > 7.5:
        recommendations.append(
            NutrientRecommendation(
                nutrient="Iron, Zinc, Manganese",
                issue="Deficiency - High pH reduces availability",
                severity="High",
            )
        )
        recommendations.append(
            NutrientRecommendation(
                nutrient="Calcium, Magnesium",
                issue="Toxicity potential",
                severity="Medium",
            )
        )

    # EC-based nutrient analysis
    if ec > 2000:
        recommendations.append(
            NutrientRecommendation(
                nutrient="All micronutrients",
                issue="Toxicity - High EC causes salt accumulation",
                severity="High",
            )
        )
    elif ec < 500:
        if not any(
            "Deficiency - Low EC" in r.issue for r in recommendations
        ):
            recommendations.append(
                NutrientRecommendation(
                    nutrient="General nutrients",
                    issue="Deficiency - Insufficient nutrient solution",
                    severity="High",
                )
            )

    # Visual condition-based analysis
    visual_issues = {
        "Yellowing": [
            NutrientRecommendation(
                nutrient="Nitrogen", issue="Deficiency", severity="High"
            )
        ],
        "Wilting": [
            NutrientRecommendation(
                nutrient="Potassium, Water uptake", issue="Deficiency", severity="High"
            )
        ],
        "Leaf Curling": [
            NutrientRecommendation(
                nutrient="Calcium, Boron", issue="Deficiency", severity="Medium"
            )
        ],
        "Spotting": [
            NutrientRecommendation(
                nutrient="Magnesium, Sulfur", issue="Deficiency", severity="Medium"
            )
        ],
    }

    if visual_condition in visual_issues:
        recommendations.extend(visual_issues[visual_condition])

    return recommendations if recommendations else [
        NutrientRecommendation(
            nutrient="General", issue="All levels optimal", severity="Low"
        )
    ]


def generate_environmental_recommendations(
    ph: float, ec: float, temperature: float, humidity: float, health_score: float
) -> List[str]:
    """Generate environmental adjustment recommendations."""
    recommendations = []

    # pH adjustments
    if ph < 5.5:
        recommendations.append(
            f"🔴 pH is too low ({ph:.1f}). Increase pH to 5.5-6.5 range by adding potassium hydroxide or using pH+."
        )
    elif ph > 7.0:
        recommendations.append(
            f"🔴 pH is too high ({ph:.1f}). Reduce pH to 5.5-6.5 range by adding phosphoric acid or pH-."
        )
    else:
        recommendations.append(f"✓ pH ({ph:.1f}) is in optimal range.")

    # EC adjustments
    if ec < 800:
        recommendations.append(
            f"⚠ EC is low ({ec:.0f} µS/cm). Increase nutrient solution concentration."
        )
    elif ec > 1800:
        recommendations.append(
            f"⚠ EC is high ({ec:.0f} µS/cm). Dilute solution with fresh water to prevent salt stress."
        )
    else:
        recommendations.append(f"✓ EC ({ec:.0f} µS/cm) is in good range.")

    # Temperature adjustments
    if temperature < 15:
        recommendations.append(
            f"❄ Water temperature is low ({temperature:.1f}°C). Use heater to maintain 18-24°C."
        )
    elif temperature > 28:
        recommendations.append(
            f"🔥 Water temperature is high ({temperature:.1f}°C). Use chiller or add ice to maintain 18-24°C."
        )
    else:
        recommendations.append(f"✓ Temperature ({temperature:.1f}°C) is optimal.")

    # Humidity adjustments
    if humidity < 40:
        recommendations.append(
            f"💨 Air humidity is low ({humidity:.0f}%). Increase humidity by misting or using humidifiers."
        )
    elif humidity > 80:
        recommendations.append(
            f"💧 Air humidity is high ({humidity:.0f}%). Improve ventilation to reduce fungal disease risk."
        )
    else:
        recommendations.append(f"✓ Humidity ({humidity:.0f}%) is acceptable.")

    return recommendations


def calculate_disease_risk(
    ph: float,
    ec: float,
    temperature: float,
    humidity: float,
    health_score: float,
    visual_condition: str,
) -> float:
    """Calculate disease/pest risk percentage based on environmental factors."""
    risk = 0.0

    # Fungal disease risk (high humidity + warm temperature)
    if humidity > 70 and 18 < temperature < 26:
        risk += 30  # Optimal for fungal growth
    elif humidity > 60 and 15 < temperature < 30:
        risk += 15

    # Bacterial infection risk (high humidity)
    if humidity > 75:
        risk += 20

    # Pest proliferation risk (warm, dry conditions)
    if 24 < temperature < 30 and humidity < 50:
        risk += 15

    # Nutrient stress increases disease susceptibility
    if ec < 600 or ec > 2000:
        risk += 15

    # pH extremes reduce plant immunity
    if ph < 5.0 or ph > 7.5:
        risk += 15

    # Visual condition indicators
    if visual_condition in ["Wilting", "Spotting", "Leaf Curling"]:
        risk += 20

    # Reduce risk for healthy plants
    if health_score > 0.7:
        risk -= 15

    # Cap risk between 0 and 100
    return max(0, min(100, risk))


def calculate_confidence(
    ph: float,
    ec: float,
    temperature: float,
    humidity: float,
) -> float:
    """Calculate prediction confidence based on input parameter ranges."""
    confidence = 1.0

    # Penalize out-of-range inputs
    if not (3.0 <= ph <= 9.0):
        confidence -= 0.3
    elif not (5.0 <= ph <= 7.5):
        confidence -= 0.1

    if not (200 <= ec <= 3000):
        confidence -= 0.3
    elif not (800 <= ec <= 2000):
        confidence -= 0.1

    if not (5 <= temperature <= 35):
        confidence -= 0.3
    elif not (15 <= temperature <= 28):
        confidence -= 0.1

    if not (20 <= humidity <= 95):
        confidence -= 0.3
    elif not (40 <= humidity <= 80):
        confidence -= 0.1

    return max(0.3, min(1.0, confidence))


# ============================================================================
# API ENDPOINTS
# ============================================================================


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "version": "1.0.0",
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """
    Predict plant health and provide recommendations.

    Args:
        request: PredictionRequest with plant parameters

    Returns:
        PredictionResponse with health predictions and recommendations
    """
    if model is None or scaler is None or encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train model first using train_model.py",
        )

    try:
        # Prepare input features
        visual_encoded = encoder.transform([[request.visual_condition]])[0][0]

        # Create feature array: [pH, EC, Temp, Humidity, Visual]
        features = np.array(
            [
                [
                    request.ph_value,
                    request.ec_value,
                    request.water_temperature,
                    request.air_humidity,
                    visual_encoded,
                ]
            ]
        )

        # Scale features
        features_scaled = scaler.transform(features)

        # Make predictions (model outputs 3 values: health, growth, yield)
        dmatrix = xgb.DMatrix(features_scaled)
        predictions = model.predict(dmatrix)[0]
        health_score = predictions[0]
        growth_score = predictions[1]
        yield_score = predictions[2]

        # Generate classifications and recommendations
        health_status = get_health_status(health_score)
        growth_rate = get_growth_rate(growth_score)
        disease_risk = calculate_disease_risk(
            request.ph_value,
            request.ec_value,
            request.water_temperature,
            request.air_humidity,
            health_score,
            request.visual_condition,
        )
        nutrient_issues = generate_nutrient_recommendations(
            request.ph_value,
            request.ec_value,
            health_score,
            request.visual_condition,
        )
        environmental_recs = generate_environmental_recommendations(
            request.ph_value,
            request.ec_value,
            request.water_temperature,
            request.air_humidity,
            health_score,
        )
        confidence = calculate_confidence(
            request.ph_value,
            request.ec_value,
            request.water_temperature,
            request.air_humidity,
        )

        return PredictionResponse(
            plant_health_status=health_status,
            growth_rate=growth_rate,
            yield_prediction=float(yield_score * 100),  # Scale to 0-100
            disease_risk_percentage=disease_risk,
            nutrient_issues=nutrient_issues,
            environmental_recommendations=environmental_recs,
            confidence_score=confidence,
            model_version="1.0.0",
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")


@app.get("/model-info")
def model_info():
    """Get information about the loaded model."""
    if model is None:
        return {"status": "not_loaded", "message": "No model loaded"}

    return {
        "status": "loaded",
        "model_type": "XGBRegressor (Multi-output)",
        "version": "1.0.0",
        "features": ["pH", "EC/TDS", "Water Temperature", "Air Humidity", "Visual Condition"],
        "outputs": ["Health Score", "Growth Score", "Yield Prediction"],
        "input_ranges": {
            "ph_value": "3.0 - 9.0",
            "ec_value": "200 - 3000 µS/cm",
            "water_temperature": "5 - 35 °C",
            "air_humidity": "20 - 95 %",
            "visual_condition": ["Healthy", "Yellowing", "Wilting", "Leaf Curling", "Spotting"],
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
