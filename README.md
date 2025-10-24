# Hydroponic Plant Health Prediction System

A full-stack machine learning web application for predicting hydroponic plant health conditions using XGBoost. The system analyzes environmental parameters and provides real-time insights with actionable recommendations.

## 🎯 Features

- **ML Model**: XGBoost-based multi-output prediction system
- **Real-time Analysis**: Predict plant health, growth rates, nutrient deficiencies, and disease risks
- **Interactive Dashboard**: Modern React frontend with visualizations
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Responsive Design**: Mobile-friendly interface with TailwindCSS
- **Recommendations**: Automated actionable suggestions based on predictions
- **Feature Importance**: Understand which inputs influence predictions

## 📊 Predictions

The system outputs:
1. **Plant Health Status** - Healthy, Stressed, or Diseased
2. **Growth Rate Estimation** - Low, Moderate, or High
3. **Nutrient Deficiency Detection** - Identifies specific nutrient issues
4. **Yield Prediction** - Expected yield score (0-100)
5. **Disease Risk Likelihood** - Risk percentage with severity level
6. **Environmental Recommendations** - Specific pH, EC, temperature adjustments

## 🔧 System Architecture

```
hydroponic-prediction/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── train_model.py          # Model training script
│   ├── requirements.txt        # Python dependencies
│   └── models/                 # Trained model artifacts
│       ├── xgb_health_model.json
│       ├── xgb_growth_model.json
│       ├── xgb_nutrient_model.json
│       ├── xgb_yield_model.json
│       ├── xgb_disease_model.json
│       ├── scaler.pkl
│       └── metadata.json
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── pages/
│       │   ├── InputDashboard.jsx
│       │   └── ResultsView.jsx
│       ├── components/
│       │   └── Common.jsx
│       └── utils/
│           ├── api.js
│           └── helpers.js
└── README.md
```

## 📋 Input Parameters

The application accepts the following inputs:
- **pH Value**: 3.0 - 9.0 (optimal: 5.5 - 7.0)
- **EC/TDS**: 500 - 3000 µS/cm (optimal: 1200 - 1800)
- **Water Temperature**: 5°C - 40°C (optimal: 18 - 24°C)
- **Air Humidity**: 10% - 100% (optimal: 55 - 75%)
- **Visual Condition**: Healthy, Yellowing, Wilting, Leaf Curling, Spotting

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- pip package manager

### 1. Backend Setup

#### Step 1: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Step 2: Train the Model
```bash
python train_model.py
```

This generates synthetic hydroponic data and trains XGBoost models:
- Generates 1,500 synthetic samples
- Trains models for health, growth, nutrient, yield, and disease prediction
- Saves models to `models/` directory
- Creates metadata for model information

Output:
```
[1/5] Generating synthetic hydroponic data...
[2/5] Preparing features and targets...
[3/5] Standardizing features...
[4/5] Training XGBoost models...
[5/5] Evaluating models on test set...
[✓] Training complete!
```

#### Step 3: Start FastAPI Backend
```bash
python main.py
```

Backend runs on `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs` (Swagger UI)
- ReDoc: `http://localhost:8000/redoc`

#### Available API Endpoints

**GET /health**
- Health check endpoint
- Response: `{status: "healthy", models_loaded: true, timestamp: "..."}`

**GET /model-info**
- Get model metadata
- Response: Training date, features, targets, model type

**POST /predict**
- Make prediction on plant health
- Request body:
```json
{
  "pH": 6.5,
  "EC": 1500,
  "water_temp": 22,
  "humidity": 65,
  "visual_condition": "Healthy"
}
```
- Response: All predictions with recommendations and confidence scores

**POST /train**
- Trigger model retraining (background task)
- Response: Training job status

### 2. Frontend Setup

#### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Configure API URL (Optional)
By default, the frontend connects to `http://localhost:8000`. To change:

Create `.env` file:
```
REACT_APP_API_URL=http://your-api-url:8000
```

#### Step 3: Start Development Server
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

#### Build for Production
```bash
npm run build
```

Output goes to `dist/` directory.

## 📖 Usage Guide

### Basic Workflow

1. **Open Dashboard**: Navigate to `http://localhost:3000`
2. **Enter Parameters**: Fill in pH, EC, temperature, humidity, and visual condition
3. **Submit**: Click "Predict" button
4. **View Results**: Automatic navigation to results page with:
   - Health status and scores
   - Growth rate estimation
   - Yield prediction
   - Disease risk analysis
   - Nutrient analysis
   - Actionable recommendations
   - Feature importance chart

### Example Analysis

**Input:**
- pH: 6.5 (Optimal)
- EC: 1500 (Optimal)
- Water Temp: 22°C (Optimal)
- Humidity: 65% (Optimal)
- Visual Condition: Healthy

**Expected Output:**
- Health Status: Healthy (High Confidence)
- Growth Rate: High
- Yield: ~85-95
- Disease Risk: Low (<30%)
- Recommendations: Maintain current conditions

**Input (Suboptimal):**
- pH: 4.0 (Too Low)
- EC: 500 (Too Low)
- Water Temp: 28°C (High)
- Humidity: 85% (High)
- Visual Condition: Yellowing

**Expected Output:**
- Health Status: Stressed or Diseased
- Growth Rate: Low
- Yield: ~30-50
- Disease Risk: High (60-80%)
- Recommendations: Adjust pH up, increase EC, cool water, reduce humidity

## 🤖 Machine Learning Details

### Model Architecture

**Multi-Output XGBoost System:**
- Health Status Classifier (3 classes)
- Growth Rate Classifier (3 classes)
- Nutrient Issue Classifier (5 classes)
- Yield Score Regressor
- Disease Risk Regressor

### Training Data

**Synthetic Data Generation:**
- 1,500 samples with realistic hydroponic parameter ranges
- Features correlated with output targets
- Covers healthy and stressed conditions
- Data split: 80% training, 20% testing

### Feature Importance

The model calculates feature importance based on XGBoost gain values:
- Shows which inputs most influence predictions
- Percentage contribution to model decisions
- Updated for each prediction

### Model Performance Metrics

- **Classifiers**: Accuracy scores on test set
- **Regressors**: RMSE and R² scores on test set

Run after training to see detailed metrics.

## 📚 Extending with Real Data

### Using Kaggle Dataset

1. **Download Dataset**:
   - Source: https://www.kaggle.com/datasets/abtabm/plant-growthhydroponics-and-soil-compound-dataset
   - Contains real hydroponic sensor measurements

2. **Prepare Data**:
   ```python
   # In train_model.py, replace synthetic data generation
   import pandas as pd
   
   # Load your CSV
   df = pd.read_csv('your_hydroponic_data.csv')
   
   # Ensure columns match:
   # ['pH', 'EC', 'water_temp', 'humidity', 'visual_condition_encoded',
   #  'health_status', 'growth_rate', 'nutrient_issue', 'yield_score', 'disease_risk']
   ```

3. **Retrain Model**:
   ```bash
   python train_model.py
   ```

4. **Update Backend**:
   - Restart FastAPI server to load new models

### Adding Real Sensor Data

1. **Connect IoT Sensors**:
   - Temperature sensors (DS18B20)
   - EC sensors
   - pH sensors
   - Humidity sensors

2. **Create Data Collection Endpoint**:
   ```python
   @app.post("/collect-sensor-data")
   async def collect_sensor_data(sensor_data: dict):
       # Store in database
       # Accumulate for periodic retraining
       pass
   ```

3. **Implement Automated Retraining**:
   - Trigger `/train` endpoint weekly/monthly
   - Monitor model drift
   - Update recommendations based on new data

## 🔐 Security Considerations

For production deployment:

1. **Enable CORS properly**:
   ```python
   # In main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["yourdomain.com"],  # Specific domain
       allow_credentials=True,
       allow_methods=["GET", "POST"],
       allow_headers=["*"],
   )
   ```

2. **Add API Authentication**:
   - Implement JWT tokens
   - Rate limiting
   - Request validation

3. **Secure Model Files**:
   - Encrypt sensitive model files
   - Restrict file access permissions

4. **Use HTTPS**:
   - Deploy with SSL certificates
   - Redirect HTTP to HTTPS

5. **Environment Variables**:
   - Create `.env` file for sensitive config
   - Never commit secrets to version control

## 📦 Deployment

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package*.json .
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/models:/app/models
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:8000
```

Run:
```bash
docker-compose up -d
```

### Cloud Deployment

**AWS Lambda + API Gateway (Backend):**
- Package FastAPI app as AWS Lambda function
- Set API Gateway endpoint

**Vercel/Netlify (Frontend):**
- Push repo to GitHub
- Connect to Vercel/Netlify
- Auto-deploy on push

**Heroku (Full Stack):**
```bash
heroku create your-app-name
git push heroku main
```

## 🧪 Testing

### API Testing

```bash
# Health check
curl http://localhost:8000/health

# Make prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "pH": 6.5,
    "EC": 1500,
    "water_temp": 22,
    "humidity": 65,
    "visual_condition": "Healthy"
  }'
```

### Frontend Testing

```bash
# Run with npm
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Monitoring & Logging

### Backend Logging

FastAPI includes built-in logging. Add custom logging:

```python
import logging

logger = logging.getLogger(__name__)
logger.info("Message")
logger.error("Error message")
```

### Frontend Error Handling

The app includes error boundaries and try-catch blocks:
- Validation errors displayed in UI
- API errors shown as alerts
- Console logs for debugging

## 🛠️ Troubleshooting

### Models Not Loading

**Issue**: "Models not loaded" error
**Solution**:
1. Ensure you ran `python train_model.py` first
2. Check `backend/models/` directory exists
3. Verify all `.json` and `.pkl` files are present

### Frontend Can't Connect to Backend

**Issue**: CORS error in console
**Solution**:
1. Ensure backend is running on `http://localhost:8000`
2. Check frontend `.env` has correct API URL
3. Verify CORS is enabled in `main.py`

### Port Already in Use

**Issue**: "Address already in use" error
**Solution**:
```bash
# Change backend port
uvicorn main:app --port 8001

# Change frontend port
npm run dev -- --port 3001
```

### Model Accuracy Issues

**Issue**: Predictions don't match expected results
**Solution**:
1. Verify input values are within expected ranges
2. Check model training completed successfully
3. Review feature importance to understand model behavior
4. Consider retraining with more/better data

## 📝 Configuration Files

### `.env` (Frontend)
```
REACT_APP_API_URL=http://localhost:8000
```

### `requirements.txt` (Backend)
- fastapi==0.109.0
- uvicorn[standard]==0.27.0
- xgboost==2.0.3
- numpy==1.24.3
- pandas==2.0.3
- scikit-learn==1.3.2
- joblib==1.3.2
- pydantic==2.5.0

### `package.json` (Frontend)
- react==18.2.0
- react-router-dom==6.20.0
- axios==1.6.2
- recharts==2.10.3
- tailwindcss==3.3.6

## 📄 File Descriptions

- **train_model.py**: XGBoost model training with synthetic data
- **main.py**: FastAPI backend with prediction endpoints
- **InputDashboard.jsx**: User input form page
- **ResultsView.jsx**: Results and recommendations display page
- **Common.jsx**: Reusable UI components (cards, gauges, buttons)
- **api.js**: Axios API client for backend communication
- **helpers.js**: Utility functions for validation and formatting

## 🎓 Educational Value

This project demonstrates:
- Full-stack ML application development
- XGBoost multi-output modeling
- FastAPI RESTful API design
- React component architecture
- Real-time data prediction
- ML model persistence and loading
- Feature importance analysis
- Error handling and validation
- Responsive UI design

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Contributing

To extend this system:
1. Add new ML models
2. Implement real sensor data integration
3. Add user authentication
4. Build admin dashboard for model management
5. Create mobile app version

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation at `/docs`
3. Check browser console for errors
4. Verify all dependencies are installed

## 🔄 Version History

**v1.0.0** (Current)
- Initial release
- Multi-output XGBoost model
- FastAPI backend with 5 endpoints
- React frontend with input and results pages
- Comprehensive recommendations system
- Feature importance visualization

---

**Created**: October 2025  
**Last Updated**: October 2025  
**Status**: Production Ready ✓

🌱 Happy hydroponics monitoring!
