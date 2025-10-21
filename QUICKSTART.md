# Hydroponic Plant Health Predictor

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python train_model.py
python -m uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Key Features
- 🎯 Real-time plant health prediction
- 📊 XGBoost machine learning model
- 💡 Nutrient and disease analysis
- 🎨 Modern React dashboard
- 📱 Mobile responsive design

## Project Structure
- `backend/` - FastAPI server + XGBoost model
- `frontend/` - React + Vite application
- `README.md` - Complete documentation

See README.md for detailed setup and API documentation.
