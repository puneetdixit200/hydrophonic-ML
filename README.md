# 🌱 Hydroponic Plant Health Prediction System

A **full-stack machine learning web application** that predicts hydroponic plant health and growth outcomes using an **XGBoost model**. Features a modern React + Vite frontend, FastAPI backend, and comprehensive environmental analysis.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Model Training](#model-training)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Input Parameters](#input-parameters)
- [Model Outputs](#model-outputs)
- [Using Real Data](#using-real-data)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Plant Health Prediction
- **Real-time Health Status Classification**: Healthy / Stressed / Diseased
- **Growth Rate Estimation**: Low / Moderate / High
- **Yield Prediction**: Regression-based growth score (0-100%)
- **Confidence Scoring**: Model prediction confidence level

### Environmental Analysis
- **Nutrient Detection**: Identifies deficiencies and toxicities
- **Disease Risk Assessment**: Calculates pest and disease likelihood
- **Environmental Recommendations**: Actionable pH, EC, temperature, and humidity adjustments
- **Visual Plant Symptom Analysis**: Considers leaf yellowing, wilting, curling, and spotting

### User Interface
- **Modern Dashboard**: Clean, intuitive design with TailwindCSS
- **Interactive Forms**: Input validation with preset optimal/stressed scenarios
- **Rich Visualizations**: Charts and gauges for data insights
- **Mobile Responsive**: Works seamlessly on all devices
- **Dark Mode Compatible**: Professional color scheme

### ML Features
- **Multi-Output Regression**: Simultaneous prediction of health, growth, and yield
- **Synthetic Data Generation**: 500+ training samples with realistic hydroponic conditions
- **Scaler & Encoder Persistence**: Automatic preprocessing consistency
- **Cross-validation**: Train/test split evaluation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React + Vite Frontend                 │
│  (Port 5173) - Input Dashboard & Results Visualization  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST (axios)
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Backend                        │
│         (Port 8000) - ML Prediction Engine              │
│                                                          │
│  • POST /predict → Model inference                      │
│  • GET /health → Health check                           │
│  • GET /model-info → Model metadata                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────┐
│                   XGBoost Model                          │
│  (models/xgb_model.json + preprocessing files)          │
│                                                          │
│  Input: pH, EC, Temperature, Humidity, Visual Condition │
│  Output: Health Score, Growth Score, Yield Score        │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
hydroponics-app/
│
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── train_model.py             # Model training script
│   ├── requirements.txt           # Python dependencies
│   └── models/                    # (Created after training)
│       ├── xgb_model.json         # Trained XGBoost model
│       ├── scaler.pkl             # StandardScaler for features
│       └── encoder.pkl            # LabelEncoder for visual condition
│
├── frontend/
│   ├── index.html                 # HTML entry point
│   ├── package.json               # Node dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # TailwindCSS config
│   ├── postcss.config.js          # PostCSS config
│   │
│   └── src/
│       ├── main.jsx               # React root
│       ├── App.jsx                # Main app component
│       ├── App.css                # Global styles
│       ├── index.css              # Tailwind directives
│       │
│       ├── pages/
│       │   ├── InputDashboard.jsx # User input form
│       │   ├── InputDashboard.css
│       │   ├── ResultsView.jsx    # Results display
│       │   └── ResultsView.css
│       │
│       └── components/
│           ├── Header.jsx         # Top navigation
│           └── Footer.jsx         # Footer with info
│
└── README.md                      # This file
```

---

## 🔧 Prerequisites

### System Requirements
- Python 3.9+ (for backend)
- Node.js 16+ (for frontend)
- 2GB+ free disk space

### Software to Install
- **Python Package Manager**: `pip` (included with Python)
- **Node Package Manager**: `npm` (included with Node.js)

### Verify Installation
```bash
# Check Python
python --version

# Check Node.js
node --version
npm --version
```

---

## 🚀 Setup Instructions

### Step 1: Clone or Extract Project

```bash
cd hydroponics-app
```

### Step 2: Set Up Backend

#### 2.1 Create Python Virtual Environment
```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

#### 2.2 Install Python Dependencies
```bash
pip install -r requirements.txt
```

You should see installations for:
- FastAPI (API framework)
- Uvicorn (ASGI server)
- XGBoost (ML model)
- scikit-learn (preprocessing)
- pandas & numpy (data handling)

### Step 3: Set Up Frontend

#### 3.1 Install Node Dependencies
```bash
cd ../frontend
npm install
```

This installs:
- React & React DOM
- Vite (build tool)
- TailwindCSS (styling)
- Axios (HTTP client)
- Recharts (visualization)
- Lucide React (icons)

---

## 🤖 Model Training

### Train the XGBoost Model

**IMPORTANT**: You must train the model before running predictions.

```bash
cd backend

# Make sure your virtual environment is activated
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

python train_model.py
```

#### What This Does:
1. **Generates 500 synthetic samples** of hydroponic plant data
   - pH: 3.0-9.0 (optimal: 5.5-6.5)
   - EC/TDS: 200-3000 µS/cm (optimal: 800-1800)
   - Temperature: 5-35°C (optimal: 18-24°C)
   - Humidity: 20-95% (optimal: 40-80%)
   - Visual condition: 5 categories

2. **Trains an XGBoost model** to predict:
   - Health Score (0-1)
   - Growth Score (0-1)
   - Yield Score (0-1)

3. **Saves model artifacts**:
   - `models/xgb_model.json` - Trained model
   - `models/scaler.pkl` - Feature scaler
   - `models/encoder.pkl` - Visual condition encoder

4. **Displays training metrics**:
   ```
   Health Score: Train MSE: 0.0234 | Test MSE: 0.0241
   Growth Score: Train MSE: 0.0198 | Test MSE: 0.0215
   Yield Score: Train MSE: 0.0156 | Test MSE: 0.0167
   ```

5. **Shows example predictions** with optimal and stressed conditions

#### Expected Output:
```
======================================================================
🌱 HYDROPONIC PLANT HEALTH MODEL TRAINING
======================================================================

📊 Dataset Information:
   Training samples: 400
   Test samples: 100
   Features: 5
   Targets: 3

🔄 Training model...

📈 Model Evaluation:
   Health Score:
      Train MSE: 0.0234 | Test MSE: 0.0241
      Train R²: 0.9456 | Test R²: 0.9312

...

💾 Saving model and preprocessing objects...
   ✓ Model saved: backend/models/xgb_model.json
   ✓ Scaler saved: backend/models/scaler.pkl
   ✓ Encoder saved: backend/models/encoder.pkl

✨ TRAINING COMPLETE!
```

---

## ▶️ Running the Application

### Terminal 1: Start FastAPI Backend

```bash
cd backend

# Activate virtual environment if not already active
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
INFO:     ✓ Model loaded successfully
```

Backend endpoints:
- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs
- Model info: http://localhost:8000/model-info

### Terminal 2: Start React Development Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 3: Open in Browser

1. Navigate to: **http://localhost:5173**
2. You should see the 🌱 Hydro Predictor dashboard
3. Enter plant parameters and click "Get Prediction"
4. View detailed analysis on the results page

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Interactive API Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Endpoints

#### 1. Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "model_loaded": true,
  "version": "1.0.0"
}
```

#### 2. Make Prediction
```bash
POST /predict
Content-Type: application/json

{
  "ph_value": 6.0,
  "ec_value": 1200,
  "water_temperature": 21,
  "air_humidity": 60,
  "visual_condition": "Healthy"
}
```

Response:
```json
{
  "plant_health_status": "Healthy",
  "growth_rate": "High",
  "yield_prediction": 85.5,
  "disease_risk_percentage": 15.2,
  "nutrient_issues": [
    {
      "nutrient": "General",
      "issue": "All levels optimal",
      "severity": "Low"
    }
  ],
  "environmental_recommendations": [
    "✓ pH (6.0) is in optimal range.",
    "✓ EC (1200 µS/cm) is in good range.",
    "✓ Temperature (21.0°C) is optimal.",
    "✓ Humidity (60%) is acceptable."
  ],
  "confidence_score": 0.95,
  "model_version": "1.0.0"
}
```

#### 3. Model Information
```bash
GET /model-info
```

Response:
```json
{
  "status": "loaded",
  "model_type": "XGBRegressor (Multi-output)",
  "version": "1.0.0",
  "features": [
    "pH",
    "EC/TDS",
    "Water Temperature",
    "Air Humidity",
    "Visual Condition"
  ],
  "outputs": [
    "Health Score",
    "Growth Score",
    "Yield Score"
  ],
  "input_ranges": {
    "ph_value": "3.0 - 9.0",
    "ec_value": "200 - 3000 µS/cm",
    "water_temperature": "5 - 35 °C",
    "air_humidity": "20 - 95 %",
    "visual_condition": [
      "Healthy",
      "Yellowing",
      "Wilting",
      "Leaf Curling",
      "Spotting"
    ]
  }
}
```

---

## 📊 Input Parameters

### pH Value
- **Range**: 3.0 - 9.0
- **Optimal**: 5.5 - 6.5
- **Impact**: Nutrient availability, plant stress

### EC/TDS (Electrical Conductivity / Total Dissolved Solids)
- **Range**: 200 - 3000 µS/cm
- **Optimal**: 800 - 1800 µS/cm
- **Impact**: Nutrient concentration, plant health

### Water Temperature
- **Range**: 5 - 35°C
- **Optimal**: 18 - 24°C
- **Impact**: Nutrient uptake, root development, disease risk

### Air Humidity
- **Range**: 20 - 95%
- **Optimal**: 40 - 80%
- **Impact**: Transpiration, fungal disease risk

### Visual Condition
- **Healthy**: Normal appearance, vigorous growth
- **Yellowing**: Chlorosis symptoms, nitrogen deficiency indicator
- **Wilting**: Water stress, potassium deficiency indicator
- **Leaf Curling**: Calcium/boron deficiency, environmental stress
- **Spotting**: Magnesium/sulfur deficiency, pest/disease symptoms

---

## 🎯 Model Outputs

### 1. Plant Health Status
Classification into three categories:
- **🟢 Healthy**: All parameters optimal (score ≥ 0.66)
- **🟡 Stressed**: Suboptimal conditions (0.33 ≤ score < 0.66)
- **🔴 Diseased**: Critical conditions (score < 0.33)

### 2. Growth Rate
- **🟢 High**: Rapid growth expected (score ≥ 0.66)
- **🟡 Moderate**: Normal growth (0.33 ≤ score < 0.66)
- **🔴 Low**: Stunted growth (score < 0.33)

### 3. Yield Prediction
- Regression output: 0 - 100%
- Represents expected plant productivity relative to optimal conditions

### 4. Disease Risk Percentage
- 0 - 100% likelihood of disease/pest infestation
- Based on:
  - Temperature & humidity (fungal/bacterial conditions)
  - pH & EC extremes (plant stress increases susceptibility)
  - Visual symptoms (existing damage indicators)

### 5. Nutrient Issues
Array of detected deficiencies/toxicities with:
- Nutrient affected
- Issue type (deficiency/toxicity)
- Severity (Low/Medium/High)

### 6. Environmental Recommendations
- Specific, actionable suggestions for:
  - pH adjustment strategies
  - EC optimization
  - Temperature management
  - Humidity control

### 7. Confidence Score
- 0 - 1.0 (0 - 100%)
- Indicates prediction reliability
- Reduced for out-of-range inputs
- Helps users trust or question results

---

## 📈 Using Real Data

### Adapting to Your Dataset

The model is trained on synthetic data. To use it with real-world hydroponic sensor data:

#### Option 1: Retrain with Real Data

1. **Prepare your CSV file** with columns:
   ```csv
   pH,EC,Temperature,Humidity,Visual_Condition,Health_Score,Growth_Score,Yield_Score
   6.1,1150,20.5,55,Healthy,0.85,0.80,0.82
   4.2,950,18.2,65,Yellowing,0.45,0.40,0.42
   ...
   ```

2. **Modify `train_model.py`**:
   ```python
   # Replace generate_synthetic_data with your CSV:
   df = pd.read_csv('your_real_data.csv')
   ```

3. **Retrain the model**:
   ```bash
   python train_model.py
   ```

#### Option 2: Fine-tune with Transfer Learning

```python
# In train_model.py, after model training:
# Load real data and continue training
real_df = pd.read_csv('real_data.csv')
X_real, y_real = prepare_real_data(real_df)

# Continue training on real data
model.fit(X_real, y_real, xgb_model=model)
```

#### Option 3: Calibrate Predictions

Create a calibration layer that adjusts predictions based on known real-world outcomes:

```python
# Collect predictions vs. actual outcomes
prediction_errors = []

# Then adjust future predictions
def calibrated_prediction(raw_pred, calibration_data):
    adjustment = np.mean(calibration_data)
    return raw_pred + adjustment
```

### Collecting Sensor Data

For hydroponics, integrate with:
- **pH Sensors**: Analog/I2C/RS485
- **EC Sensors**: Conductivity probes
- **Temperature Sensors**: DHT22, DS18B20, or I2C sensors
- **Humidity Sensors**: DHT22, BME280
- **Visual Analysis**: Plant camera + manual inspection

### Data Pipeline

```python
# backend/sensor_integration.py
import pandas as pd
from datetime import datetime

def log_sensor_reading(ph, ec, temp, humidity, visual_notes):
    """Log sensor data for later retraining"""
    data = {
        'timestamp': datetime.now(),
        'pH': ph,
        'EC': ec,
        'Temperature': temp,
        'Humidity': humidity,
        'Visual_Condition': visual_notes
    }
    
    # Append to CSV
    df = pd.DataFrame([data])
    df.to_csv('sensor_logs.csv', mode='a', header=False, index=False)
```

---

## 🐛 Troubleshooting

### Backend Issues

#### Issue: "Model not loaded" Error
**Cause**: Model files don't exist  
**Solution**:
```bash
cd backend
python train_model.py
```

#### Issue: "Connection refused" on http://localhost:8000
**Cause**: Backend server not running  
**Solution**: Start backend in Terminal 1:
```bash
python -m uvicorn main:app --reload
```

#### Issue: Module import errors (xgboost, fastapi, etc.)
**Cause**: Dependencies not installed  
**Solution**:
```bash
pip install -r requirements.txt
```

#### Issue: Port 8000 already in use
**Cause**: Another process using the port  
**Solution**: Change port in backend:
```bash
python -m uvicorn main:app --port 8001
```
Then update frontend API URL in `frontend/src/pages/InputDashboard.jsx`:
```javascript
const API_BASE_URL = 'http://localhost:8001'
```

### Frontend Issues

#### Issue: "Failed to fetch" errors
**Cause**: Frontend can't reach backend  
**Solution**:
1. Ensure backend is running (see above)
2. Check API URL in InputDashboard.jsx matches backend port
3. Verify CORS settings in main.py

#### Issue: Dependencies not installing
**Cause**: npm cache issues  
**Solution**:
```bash
rm -r node_modules
npm cache clean --force
npm install
```

#### Issue: Vite development server not starting
**Cause**: Port 5173 already in use  
**Solution**:
```bash
npm run dev -- --port 5174
```

### General Issues

#### Issue: Validation errors on form submission
**Solution**: Check that values are within valid ranges:
- pH: 3.0 - 9.0
- EC: 200 - 3000
- Temperature: 5 - 35°C
- Humidity: 20 - 95%

#### Issue: Low prediction confidence
**Cause**: Input parameters far from optimal ranges  
**Solution**: This is expected behavior - use the "Optimal Values" button to test

#### Issue: Python version incompatibility
**Solution**: Ensure Python 3.9 or higher:
```bash
python --version
```

---

## 📚 Advanced Topics

### Custom Model Architecture

Modify `train_model.py` to experiment with:
- Different tree depths
- Learning rates
- Number of estimators
- Feature importance

```python
# In train_model.py
model = xgb.XGBRegressor(
    n_estimators=300,      # More trees
    max_depth=8,           # Deeper trees
    learning_rate=0.05,    # Lower learning rate
    subsample=0.7,         # More regularization
)
```

### Adding More Features

Extend the model to predict:
- Specific nutrient concentrations (NPK levels)
- Pest/disease identification
- Optimal harvesting time
- Energy consumption

Update `main.py` response schema:
```python
class PredictionResponse(BaseModel):
    # ... existing fields ...
    nitrogen_level: float
    phosphorus_level: float
    potassium_level: float
```

### Batch Predictions

Create a batch endpoint for multiple predictions:

```python
@app.post("/predict-batch")
def predict_batch(requests: List[PredictionRequest]):
    results = []
    for request in requests:
        result = predict(request)
        results.append(result)
    return results
```

### Database Integration

Store predictions with PostgreSQL:

```bash
pip install sqlalchemy psycopg2
```

Create a database table:
```python
# models/prediction_log.py
from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime

class PredictionLog(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True)
    plant_health = Column(String)
    yield_prediction = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
```

---

## 🚢 Deployment

### Docker Containerization

**Dockerfile** (backend):
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
  
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
```

### Production Build

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

Backend with Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

---

## 📞 Support & Contributing

For issues or questions:
1. Check the Troubleshooting section
2. Review API documentation at http://localhost:8000/docs
3. Inspect browser console for frontend errors
4. Check backend logs for server errors

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 🙏 Acknowledgments

Built with:
- **FastAPI**: Modern Python web framework
- **XGBoost**: Gradient boosting machine learning
- **React**: UI library
- **TailwindCSS**: Utility-first CSS framework
- **Recharts**: React visualization library

---

## 🌟 Quick Reference

| Task | Command |
|------|---------|
| Train model | `cd backend && python train_model.py` |
| Start backend | `cd backend && python -m uvicorn main:app --reload` |
| Start frontend | `cd frontend && npm run dev` |
| Build frontend | `cd frontend && npm run build` |
| View API docs | http://localhost:8000/docs |
| Access app | http://localhost:5173 |

---

**Happy growing! 🌿**
