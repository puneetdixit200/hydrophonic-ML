"""
Hydroponic Plant Health Prediction API
FastAPI backend with XGBoost models
"""

import os
import json
import joblib
import xgboost as xgb
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.preprocessing import StandardScaler
import numpy as np

# Initialize FastAPI app
app = FastAPI(
    title="Hydroponic Plant Health Prediction API",
    description="ML-powered API for predicting hydroponic plant health",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Pydantic Models for validation
# ============================================================================

class PredictionInput(BaseModel):
    """Input model for prediction"""
    pH: float = Field(..., ge=3.0, le=9.0, description="pH value (3.0-9.0)")
    EC: float = Field(..., ge=500, le=3000, description="EC/TDS value (500-3000)")
    water_temp: float = Field(..., ge=5, le=40, description="Water temperature in Celsius (5-40)")
    humidity: float = Field(..., ge=10, le=100, description="Air humidity percentage (10-100)")
    visual_condition: str = Field(..., description="Visual condition of plants")

    class Config:
        json_schema_extra = {
            "example": {
                "pH": 6.5,
                "EC": 1500,
                "water_temp": 22,
                "humidity": 65,
                "visual_condition": "Healthy"
            }
        }


class PredictionOutput(BaseModel):
    """Output model for prediction results"""
    health_status: str
    health_score: float
    growth_rate: str
    growth_score: float
    nutrient_issue: str
    nutrient_score: float
    yield_prediction: float
    disease_risk: float
    timestamp: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    models_loaded: bool
    timestamp: str


# ============================================================================
# Model Manager Class
# ============================================================================

class ModelManager:
    """Manages XGBoost models and scaler"""

    def __init__(self):
        self.models = {}
        self.scaler = None
        self.metadata = None
        self.load_models()

    def load_models(self):
        """Load all trained models"""
        try:
            models_dir = 'models'

            # Load individual models
            for target in ['health', 'growth', 'nutrient', 'yield', 'disease']:
                model_path = os.path.join(models_dir, f'xgb_{target}_model.pkl')
                if os.path.exists(model_path):
                    self.models[target] = joblib.load(model_path)
                else:
                    print(f"⚠️  Warning: Model for '{target}' not found at {model_path}")

            # Load scaler
            scaler_path = os.path.join(models_dir, 'scaler.pkl')
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            else:
                print(f"⚠️  Warning: Scaler not found at {scaler_path}")

            # Load metadata
            metadata_path = os.path.join(models_dir, 'metadata.json')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    self.metadata = json.load(f)

            print(f"[✓] Loaded {len(self.models)} models successfully")

        except Exception as e:
            print(f"[✗] Error loading models: {str(e)}")
            raise

    def encode_visual_condition(self, condition):
        """Encode visual condition to numerical value"""
        mapping = {
            'Healthy': 1,
            'Yellowing': 2,
            'Wilting': 3,
            'Leaf Curling': 4,
            'Spotting': 5,
        }
        return mapping.get(condition, 1)

    def decode_status(self, value):
        """Decode numerical status to text"""
        if value <= 0.33:
            return 'Critical'
        elif value <= 0.66:
            return 'Warning'
        else:
            return 'Healthy'

    def decode_growth(self, value):
        """Decode numerical growth to text"""
        if value <= 0.33:
            return 'Low'
        elif value <= 0.66:
            return 'Moderate'
        else:
            return 'High'

    def make_prediction(self, input_data: PredictionInput) -> PredictionOutput:
        """Make prediction using all models"""

        try:
            # Prepare features
            features = np.array([
                input_data.pH,
                input_data.EC,
                input_data.water_temp,
                input_data.humidity,
                self.encode_visual_condition(input_data.visual_condition)
            ]).reshape(1, -1)

            # Scale features
            features_scaled = self.scaler.transform(features)

            # Get predictions
            health_pred = self.models['health'].predict(features_scaled)[0]
            growth_pred = self.models['growth'].predict(features_scaled)[0]
            nutrient_pred = self.models['nutrient'].predict(features_scaled)[0]
            yield_pred = self.models['yield'].predict(features_scaled)[0]
            disease_pred = self.models['disease'].predict(features_scaled)[0]

            # Get prediction probabilities for scores
            health_score = self.models['health'].predict_proba(features_scaled)[0].max()
            growth_score = self.models['growth'].predict_proba(features_scaled)[0].max()
            nutrient_score = self.models['nutrient'].predict_proba(features_scaled)[0].max()

            # Normalize yield and disease to 0-1 range
            yield_score = min(max(yield_pred / 100, 0), 1)
            disease_score = min(max(disease_pred / 100, 0), 1)

            # Decode predictions
            nutrient_status = 'Issue' if nutrient_pred > 0.5 else 'None'

            return PredictionOutput(
                health_status=self.decode_status(health_score),
                health_score=health_score,
                growth_rate=self.decode_growth(growth_score),
                growth_score=growth_score,
                nutrient_issue=nutrient_status,
                nutrient_score=nutrient_score,
                yield_prediction=yield_pred,
                disease_risk=disease_score,
                timestamp=datetime.now().isoformat()
            )

        except Exception as e:
            raise Exception(f"Error during prediction: {str(e)}")


# ============================================================================
# Initialize Model Manager
# ============================================================================

model_manager = ModelManager()

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check API health and model status"""
    return HealthResponse(
        status="healthy",
        models_loaded=len(model_manager.models) > 0,
        timestamp=datetime.now().isoformat()
    )


@app.post("/predict", response_model=PredictionOutput, tags=["Prediction"])
async def predict(input_data: PredictionInput):
    """
    Make a prediction for plant health
    
    Requires:
    - pH: Plant pH level (3.0-9.0)
    - EC: Electrical conductivity (500-3000)
    - water_temp: Water temperature in Celsius (5-40)
    - humidity: Air humidity percentage (10-100)
    - visual_condition: Visual condition (Healthy, Yellowing, Wilting, Leaf Curling, Spotting)
    """
    try:
        if len(model_manager.models) == 0:
            raise HTTPException(
                status_code=500,
                detail="Models not loaded. Please check server logs."
            )

        prediction = model_manager.make_prediction(input_data)
        return prediction

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Prediction failed: {str(e)}"
        )


@app.get("/model-info", tags=["Model"])
async def get_model_info():
    """Get information about loaded models"""
    try:
        return {
            "models_loaded": list(model_manager.models.keys()),
            "metadata": model_manager.metadata,
            "features": ["pH", "EC", "water_temp", "humidity", "visual_condition"],
            "outputs": [
                "health_status",
                "health_score",
                "growth_rate",
                "growth_score",
                "nutrient_issue",
                "nutrient_score",
                "yield_prediction",
                "disease_risk"
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting model info: {str(e)}"
        )


@app.on_event("startup")
async def startup_event():
    """Startup event"""
    print("\nStarting FastAPI server...")
    print("API will be available at http://localhost:8000")
    print("API docs at http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    from datetime import datetime
    print(f"\n[*] API shutdown at {datetime.now().isoformat()}")


# ============================================================================
# Root endpoint
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """API root endpoint"""
    return {
        "name": "Hydroponic Plant Health Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "model_info": "/model-info",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    print("\n" + "="*70)
    print("HYDROPONIC PLANT HEALTH PREDICTION API - STARTUP")
    print("="*70)
    print(f"[✓] API started at {datetime.now().isoformat()}")
    print(f"[✓] Models loaded: {len(model_manager.models)}")
    print("[✓] Available endpoints: /docs (Swagger UI) or /redoc (ReDoc)")
    print("="*70 + "\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
