"""
Hydroponic Plant Health Prediction - FastAPI Backend
=====================================================
RESTful API for hydroponic plant health prediction using XGBoost.
Endpoints:
- POST /predict: Make predictions on new data
- POST /train: Retrain model with new data
- GET /health: Health check endpoint
- GET /model-info: Get model metadata
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import numpy as np
import xgboost as xgb
import joblib
import json
import os
from datetime import datetime
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ============================================================================
# PYDANTIC MODELS (Request/Response Schemas)
# ============================================================================

class PredictionInput(BaseModel):
    """Schema for prediction request"""
    pH: float = Field(..., ge=3.0, le=9.0, description="pH value (3.0-9.0)")
    EC: float = Field(..., ge=500, le=3000, description="EC/TDS value (µS/cm)")
    water_temp: float = Field(..., ge=5, le=40, description="Water temperature (°C)")
    humidity: float = Field(..., ge=10, le=100, description="Air humidity (%)")
    visual_condition: str = Field(..., description="Visual condition: Healthy, Yellowing, Wilting, Leaf Curling, Spotting")
    
    class Config:
        schema_extra = {
            "example": {
                "pH": 6.5,
                "EC": 1500,
                "water_temp": 22,
                "humidity": 65,
                "visual_condition": "Healthy"
            }
        }


class PredictionOutput(BaseModel):
    """Schema for prediction response"""
    health_status: str
    health_score: float
    growth_rate: str
    growth_score: float
    nutrient_issue: str
    nutrient_score: float
    yield_prediction: float
    disease_risk: float
    disease_risk_level: str
    recommendations: List[str]
    feature_importance: Dict[str, float]
    confidence: float
    timestamp: str


class HealthCheckResponse(BaseModel):
    """Schema for health check response"""
    status: str
    models_loaded: bool
    timestamp: str


class ModelInfo(BaseModel):
    """Schema for model info response"""
    training_date: str
    n_features: int
    features: List[str]
    targets: List[str]
    model_type: str
    scaler_type: str


# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title="Hydroponic Plant Health Prediction API",
    description="XGBoost-based API for predicting plant health in hydroponic systems",
    version="1.0.0"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (configure for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# GLOBAL STATE
# ============================================================================

class ModelManager:
    """Manages model loading and inference"""
    
    def __init__(self):
        self.models = {}
        self.scaler = None
        self.metadata = {}
        self.feature_names = ['pH', 'EC', 'water_temp', 'humidity', 'visual_condition_encoded']
        self.visual_condition_map = {
            'Healthy': 0,
            'Yellowing': 1,
            'Wilting': 2,
            'Leaf Curling': 3,
            'Spotting': 4
        }
        self.load_models()
    
    def load_models(self):
        """Load XGBoost models and scaler from disk"""
        try:
            models_dir = os.path.join(os.path.dirname(__file__), 'models')
            
            # Load individual models
            for target in ['health', 'growth', 'nutrient', 'yield', 'disease']:
                # Try .pkl format first (joblib saved), then .json format (XGBoost native)
                model_path_pkl = os.path.join(models_dir, f'xgb_{target}_model.pkl')
                model_path_json = os.path.join(models_dir, f'xgb_{target}_model.json')
                
                if os.path.exists(model_path_pkl):
                    # Load pickle format
                    self.models[target] = joblib.load(model_path_pkl)
                elif os.path.exists(model_path_json):
                    # Load JSON format
                    if target in ['yield', 'disease']:
                        model = xgb.XGBRegressor()
                    else:
                        model = xgb.XGBClassifier()
                    model.load_model(model_path_json)
                    self.models[target] = model
                else:
                    print(f"⚠️  Warning: Model for '{target}' not found at {model_path_pkl} or {model_path_json}")
            
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
    
    def preprocess_input(self, data: PredictionInput) -> np.ndarray:
        """Preprocess input data to match training format"""
        try:
            # Encode visual condition
            visual_encoded = self.visual_condition_map.get(
                data.visual_condition, 0
            )
            
            # Create feature array
            features = np.array([[
                data.pH,
                data.EC,
                data.water_temp,
                data.humidity,
                visual_encoded
            ]])
            
            # Scale features
            if self.scaler is None:
                raise ValueError("Scaler not loaded. Please ensure scaler.pkl exists.")
            
            features_scaled = self.scaler.transform(features)
            return features_scaled
            
        except Exception as e:
            raise ValueError(f"Preprocessing error: {str(e)}")
    
    def predict(self, data: PredictionInput) -> PredictionOutput:
        """Make prediction using loaded models"""
        try:
            if not self.models:
                raise ValueError("Models not loaded. Cannot make predictions.")
            
            # Preprocess input
            X_scaled = self.preprocess_input(data)
            
            # Make predictions
            health_pred = int(self.models['health'].predict(X_scaled)[0])
            growth_pred = int(self.models['growth'].predict(X_scaled)[0])
            nutrient_pred = int(self.models['nutrient'].predict(X_scaled)[0])
            yield_pred = float(self.models['yield'].predict(X_scaled)[0])
            disease_pred = float(self.models['disease'].predict(X_scaled)[0])
            
            # Get probability scores (if available)
            health_proba = float(np.max(self.models['health'].predict_proba(X_scaled)))
            growth_proba = float(np.max(self.models['growth'].predict_proba(X_scaled)))
            nutrient_proba = float(np.max(self.models['nutrient'].predict_proba(X_scaled)))
            
            # Calculate average confidence
            confidence = np.mean([health_proba, growth_proba, nutrient_proba])
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                data, health_pred, nutrient_pred, disease_pred
            )
            
            # Get feature importance
            feature_importance = self._get_feature_importance()
            
            # Convert predictions to readable format
            health_status_map = {0: 'Diseased', 1: 'Stressed', 2: 'Healthy'}
            growth_rate_map = {0: 'Low', 1: 'Moderate', 2: 'High'}
            nutrient_issue_map = {
                0: 'None',
                1: 'Nitrogen Deficiency',
                2: 'Toxicity (High EC)',
                3: 'General Deficiency',
                4: 'Micronutrient Lockout'
            }
            
            disease_level_map = {
                (0, 30): 'Low Risk',
                (30, 60): 'Medium Risk',
                (60, 100): 'High Risk'
            }
            
            disease_level = 'Low Risk'
            for (min_risk, max_risk), level in disease_level_map.items():
                if min_risk <= disease_pred < max_risk:
                    disease_level = level
                    break
            
            return PredictionOutput(
                health_status=health_status_map.get(health_pred, 'Unknown'),
                health_score=float(health_proba),
                growth_rate=growth_rate_map.get(growth_pred, 'Unknown'),
                growth_score=float(growth_proba),
                nutrient_issue=nutrient_issue_map.get(nutrient_pred, 'Unknown'),
                nutrient_score=float(nutrient_proba),
                yield_prediction=max(0, min(100, yield_pred)),  # Clamp to 0-100
                disease_risk=max(0, min(100, disease_pred)),  # Clamp to 0-100
                disease_risk_level=disease_level,
                recommendations=recommendations,
                feature_importance=feature_importance,
                confidence=float(confidence),
                timestamp=datetime.now().isoformat()
            )
            
        except Exception as e:
            raise ValueError(f"Prediction error: {str(e)}")
    
    def _generate_recommendations(self, data: PredictionInput, 
                                 health_pred: int, nutrient_pred: int,
                                 disease_pred: float) -> List[str]:
        """Generate actionable recommendations based on predictions"""
        recommendations = []
        
        # Health-based recommendations
        if health_pred == 0:  # Diseased
            recommendations.append("⚠️ System shows disease signs. Consider quarantine and environmental adjustments.")
        elif health_pred == 1:  # Stressed
            recommendations.append("⚠️ Plants are stressed. Review and optimize environmental parameters.")
        else:  # Healthy
            recommendations.append("✓ Plant health is good. Maintain current conditions.")
        
        # pH recommendations
        if data.pH < 5.5:
            recommendations.append(f"📊 pH is low ({data.pH}). Increase pH gradually using pH Up buffer.")
        elif data.pH > 7.0:
            recommendations.append(f"📊 pH is high ({data.pH}). Decrease pH gradually using pH Down buffer.")
        else:
            recommendations.append(f"✓ pH is optimal ({data.pH}).")
        
        # EC recommendations
        if data.EC < 1200:
            recommendations.append(f"🧂 EC is low ({data.EC}). Increase nutrient concentration or add nutrient solution.")
        elif data.EC > 1800:
            recommendations.append(f"🧂 EC is high ({data.EC}). Dilute with fresh water to avoid nutrient toxicity.")
        else:
            recommendations.append(f"✓ EC level is optimal ({data.EC}).")
        
        # Temperature recommendations
        if data.water_temp < 18:
            recommendations.append(f"🌡️ Water temperature is low ({data.water_temp}°C). Use heater to reach 18-24°C range.")
        elif data.water_temp > 24:
            recommendations.append(f"🌡️ Water temperature is high ({data.water_temp}°C). Use chiller or improve aeration.")
        else:
            recommendations.append(f"✓ Water temperature is optimal ({data.water_temp}°C).")
        
        # Humidity recommendations
        if data.humidity < 50:
            recommendations.append(f"💨 Humidity is low ({data.humidity}%). Increase humidity using humidifier or misting.")
        elif data.humidity > 80:
            recommendations.append(f"💨 Humidity is high ({data.humidity}%). Improve ventilation and air circulation.")
        else:
            recommendations.append(f"✓ Humidity level is optimal ({data.humidity}%).")
        
        # Disease risk recommendations
        if disease_pred > 70:
            recommendations.append(f"🦠 Disease risk is high ({disease_pred:.1f}%). Consider preventive spray treatment.")
        elif disease_pred > 40:
            recommendations.append(f"🦠 Disease risk is moderate ({disease_pred:.1f}%). Monitor closely and maintain cleanliness.")
        
        # Nutrient recommendations
        if nutrient_pred == 1:
            recommendations.append("🌱 Nitrogen deficiency detected. Apply nitrogen-rich fertilizer.")
        elif nutrient_pred == 2:
            recommendations.append("⚠️ Nutrient toxicity detected. Dilute with fresh water and perform partial water change.")
        elif nutrient_pred == 3:
            recommendations.append("🌱 General nutrient deficiency. Add balanced nutrient solution.")
        elif nutrient_pred == 4:
            recommendations.append("🌱 Micronutrient lockout detected. Adjust pH and add chelated micronutrients.")
        
        return recommendations
    
    def _get_feature_importance(self) -> Dict[str, float]:
        """Extract feature importance from health model (primary model)"""
        try:
            if 'health' not in self.models:
                return {name: 0.0 for name in self.feature_names}
            
            model = self.models['health']
            importances = model.feature_importances_
            
            # Normalize to percentage
            total = sum(importances)
            importance_dict = {
                name: float((imp / total) * 100) if total > 0 else 0.0
                for name, imp in zip(self.feature_names, importances)
            }
            
            return importance_dict
            
        except Exception as e:
            print(f"Warning: Could not extract feature importance: {e}")
            return {name: 0.0 for name in self.feature_names}


# Initialize model manager
model_manager = ModelManager()


# ============================================================================
# FASTAPI ENDPOINTS
# ============================================================================

@app.get("/health", response_model=HealthCheckResponse, tags=["System"])
async def health_check():
    """Health check endpoint"""
    return HealthCheckResponse(
        status="healthy",
        models_loaded=len(model_manager.models) > 0,
        timestamp=datetime.now().isoformat()
    )


@app.get("/model-info", response_model=ModelInfo, tags=["System"])
async def get_model_info():
    """Get model metadata and information"""
    metadata = model_manager.metadata
    return ModelInfo(
        training_date=metadata.get('training_date', 'Unknown'),
        n_features=len(metadata.get('features', [])),
        features=metadata.get('features', []),
        targets=metadata.get('targets', []),
        model_type=metadata.get('model_type', 'Unknown'),
        scaler_type=metadata.get('scaler_type', 'Unknown')
    )


@app.post("/predict", response_model=PredictionOutput, tags=["Prediction"])
async def predict(input_data: PredictionInput):
    """
    Make prediction on hydroponic plant health
    
    Example request:
    ```json
    {
      "pH": 6.5,
      "EC": 1500,
      "water_temp": 22,
      "humidity": 65,
      "visual_condition": "Healthy"
    }
    ```
    """
    try:
        if not model_manager.models:
            raise HTTPException(
                status_code=503,
                detail="Models not loaded. Please check backend logs."
            )
        
        result = model_manager.predict(input_data)
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/train", tags=["Training"])
async def retrain_model(background_tasks: BackgroundTasks):
    """
    Trigger model retraining with synthetic data.
    This is an example endpoint. In production, you would:
    1. Accept training data (CSV/JSON)
    2. Validate data format
    3. Run training script asynchronously
    4. Return job ID for status checking
    """
    try:
        # Import training script
        from train_model import generate_synthetic_hydroponic_data, train_xgboost_model, evaluate_models
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import StandardScaler
        
        def retrain_task():
            """Background task to retrain model"""
            print("[*] Starting model retraining...")
            
            # Generate new synthetic data
            df = generate_synthetic_hydroponic_data(n_samples=2000, random_state=42)
            
            # Prepare features and targets
            X = df[['pH', 'EC', 'water_temp', 'humidity', 'visual_condition_encoded']]
            y_health = df['health_status']
            y_growth = df['growth_rate']
            y_nutrient = df['nutrient_issue']
            y_yield = df['yield_score']
            y_disease = df['disease_risk']
            
            # Split data
            X_train, X_test, y_h_train, y_h_test, y_g_train, y_g_test, \
            y_n_train, y_n_test, y_y_train, y_y_test, y_d_train, y_d_test = \
            train_test_split(X, y_health, y_growth, y_nutrient, y_yield, y_disease,
                           test_size=0.2, random_state=42)
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train models
            models = train_xgboost_model(X_train_scaled, y_h_train, y_g_train,
                                        y_n_train, y_y_train, y_d_train)
            
            # Evaluate
            evaluate_models(models, X_test_scaled, y_h_test, y_g_test,
                          y_n_test, y_y_test, y_d_test)
            
            # Save models
            models_dir = os.path.join(os.path.dirname(__file__), 'models')
            os.makedirs(models_dir, exist_ok=True)
            
            for model_name, model in models.items():
                model.save_model(os.path.join(models_dir, f'xgb_{model_name}_model.json'))
            
            joblib.dump(scaler, os.path.join(models_dir, 'scaler.pkl'))
            
            # Reload models in memory
            model_manager.load_models()
            
            print("[✓] Model retraining complete!")
        
        # Schedule background task
        background_tasks.add_task(retrain_task)
        
        return {
            "status": "retraining_started",
            "message": "Model retraining initiated. This may take a few minutes.",
            "timestamp": datetime.now().isoformat()
        }
        
    except ImportError:
        raise HTTPException(
            status_code=400,
            detail="Training module not available. Ensure train_model.py is in backend directory."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")


@app.get("/", tags=["System"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Hydroponic Plant Health Prediction API",
        "version": "1.0.0",
        "description": "XGBoost-based prediction system for hydroponic plant health",
        "endpoints": {
            "GET /health": "Health check",
            "GET /model-info": "Model information",
            "POST /predict": "Make prediction",
            "POST /train": "Retrain model",
            "GET /docs": "Interactive API documentation (Swagger UI)"
        }
    }


# ============================================================================
# STARTUP/SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    print("\n" + "="*70)
    print("HYDROPONIC PLANT HEALTH PREDICTION API - STARTUP")
    print("="*70)
    print(f"[✓] API started at {datetime.now().isoformat()}")
    print(f"[✓] Models loaded: {len(model_manager.models)}")
    print(f"[✓] Available endpoints: /docs (Swagger UI) or /redoc (ReDoc)")
    print("="*70 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("\n[*] API shutdown at {datetime.now().isoformat()}")


# ============================================================================
# RUN APPLICATION
# ============================================================================

if __name__ == '__main__':
    import uvicorn
    print("Starting FastAPI server...")
    print("API will be available at http://localhost:8000")
    print("API docs at http://localhost:8000/docs")
    uvicorn.run(app, host='0.0.0.0', port=8000)
