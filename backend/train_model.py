"""
Hydroponic Plant Health XGBoost Model Training Script
======================================================
Generates synthetic hydroponic sensor data, trains an XGBoost model for plant health prediction.
The model performs both classification and regression to predict:
- Plant Health Status (Healthy, Stressed, Diseased)
- Growth Rate (Low, Moderate, High)
- Nutrient Issues (None, Nitrogen, Phosphorus, Potassium, Micronutrient)
- Yield Score (continuous regression output)
- Disease Risk (0-100%)
"""

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error, r2_score
import joblib
import json
from datetime import datetime
import os

# ============================================================================
# SYNTHETIC DATA GENERATION
# ============================================================================

def generate_synthetic_hydroponic_data(n_samples=1000, random_state=42):
    """
    Generate synthetic hydroponic sensor data simulating real-world conditions.
    
    Parameters:
    -----------
    n_samples : int
        Number of synthetic samples to generate
    random_state : int
        Random seed for reproducibility
        
    Returns:
    --------
    pd.DataFrame with features and target labels
    """
    np.random.seed(random_state)
    
    # Generate synthetic features with realistic ranges
    data = {
        'pH': np.random.uniform(4.5, 8.5, n_samples),                    # Typical range: 5.5-7.0
        'EC': np.random.uniform(800, 2200, n_samples),                   # µS/cm, typical: 1200-1800
        'water_temp': np.random.uniform(15, 28, n_samples),              # °C, typical: 18-24
        'humidity': np.random.uniform(40, 90, n_samples),                # %, typical: 50-80
        'visual_condition_encoded': np.random.randint(0, 5, n_samples),  # 0=Healthy, 1=Yellowing, etc.
    }
    
    df = pd.DataFrame(data)
    
    # Create target variables based on feature combinations
    health_scores = np.zeros(n_samples)
    growth_rates = np.zeros(n_samples)
    nutrient_issues = np.zeros(n_samples)
    yield_scores = np.zeros(n_samples)
    disease_risk = np.zeros(n_samples)
    
    for i in range(n_samples):
        # Health Status Logic
        ph_ok = 5.5 <= df.iloc[i]['pH'] <= 7.0
        ec_ok = 1200 <= df.iloc[i]['EC'] <= 1800
        temp_ok = 18 <= df.iloc[i]['water_temp'] <= 24
        humidity_ok = 55 <= df.iloc[i]['humidity'] <= 75
        visual = df.iloc[i]['visual_condition_encoded']
        
        # Base health calculation
        if visual == 0 and ph_ok and ec_ok and temp_ok and humidity_ok:
            health_scores[i] = 2  # Healthy
        elif visual in [1, 2, 3, 4] or not (ph_ok and ec_ok and temp_ok):
            health_scores[i] = 0  # Diseased
        else:
            health_scores[i] = 1  # Stressed
        
        # Growth Rate Logic
        conditions_met = sum([ph_ok, ec_ok, temp_ok, humidity_ok])
        if conditions_met == 4 and visual == 0:
            growth_rates[i] = 2  # High
        elif conditions_met >= 2:
            growth_rates[i] = 1  # Moderate
        else:
            growth_rates[i] = 0  # Low
        
        # Nutrient Issues Logic
        if not ph_ok:
            if df.iloc[i]['pH'] < 5.5:
                nutrient_issues[i] = 1  # Nitrogen deficiency (acidic)
            else:
                nutrient_issues[i] = 4  # Micronutrient lockout (alkaline)
        elif not ec_ok:
            if df.iloc[i]['EC'] < 1200:
                nutrient_issues[i] = 3  # General nutrient deficiency
            else:
                nutrient_issues[i] = 2  # Nutrient toxicity
        else:
            nutrient_issues[i] = 0  # No issues
        
        # Yield Score (0-100)
        base_yield = 100
        if not ph_ok:
            base_yield -= 15
        if not ec_ok:
            base_yield -= 20
        if not temp_ok:
            base_yield -= 10
        if not humidity_ok:
            base_yield -= 12
        if visual != 0:
            base_yield -= 25
        yield_scores[i] = max(10, base_yield + np.random.normal(0, 5))
        
        # Disease Risk (0-100%)
        risk = 20  # Base risk
        if visual != 0:
            risk += 30
        if not temp_ok:
            risk += 15
        if not humidity_ok:
            risk += 15
        if df.iloc[i]['humidity'] > 80:
            risk += 10  # High humidity increases fungal risk
        disease_risk[i] = min(100, risk + np.random.normal(0, 5))
    
    # Add target columns
    df['health_status'] = health_scores.astype(int)
    df['growth_rate'] = growth_rates.astype(int)
    df['nutrient_issue'] = nutrient_issues.astype(int)
    df['yield_score'] = yield_scores
    df['disease_risk'] = disease_risk
    
    return df


# ============================================================================
# MODEL TRAINING
# ============================================================================

def train_xgboost_model(X_train, y_train_health, y_train_growth, 
                       y_train_nutrient, y_train_yield, y_train_disease):
    """
    Train XGBoost model for multi-output prediction.
    Trains separate models for classification (health, growth, nutrient)
    and regression (yield, disease risk).
    
    Returns:
    --------
    dict containing trained models
    """
    models = {}
    
    # Health Status Classifier (3 classes: Healthy, Stressed, Diseased)
    print("[*] Training Health Status Classifier...")
    models['health'] = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective='multi:softmax',
        num_class=3
    )
    models['health'].fit(X_train, y_train_health, verbose=False)
    
    # Growth Rate Classifier (3 classes: Low, Moderate, High)
    print("[*] Training Growth Rate Classifier...")
    models['growth'] = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective='multi:softmax',
        num_class=3
    )
    models['growth'].fit(X_train, y_train_growth, verbose=False)
    
    # Nutrient Issue Classifier (5 classes: None, N, P, K, Micro)
    print("[*] Training Nutrient Issue Classifier...")
    models['nutrient'] = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective='multi:softmax',
        num_class=5
    )
    models['nutrient'].fit(X_train, y_train_nutrient, verbose=False)
    
    # Yield Score Regressor
    print("[*] Training Yield Score Regressor...")
    models['yield'] = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    models['yield'].fit(X_train, y_train_yield, verbose=False)
    
    # Disease Risk Regressor
    print("[*] Training Disease Risk Regressor...")
    models['disease'] = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    models['disease'].fit(X_train, y_train_disease, verbose=False)
    
    return models


def evaluate_models(models, X_test, y_test_health, y_test_growth, 
                   y_test_nutrient, y_test_yield, y_test_disease):
    """
    Evaluate trained models on test set.
    """
    print("\n" + "="*70)
    print("MODEL EVALUATION RESULTS")
    print("="*70)
    
    # Health Status
    y_pred_health = models['health'].predict(X_test)
    print(f"\n[Health Status Classifier]")
    print(f"Accuracy: {(y_pred_health == y_test_health).mean():.4f}")
    
    # Growth Rate
    y_pred_growth = models['growth'].predict(X_test)
    print(f"\n[Growth Rate Classifier]")
    print(f"Accuracy: {(y_pred_growth == y_test_growth).mean():.4f}")
    
    # Nutrient Issue
    y_pred_nutrient = models['nutrient'].predict(X_test)
    print(f"\n[Nutrient Issue Classifier]")
    print(f"Accuracy: {(y_pred_nutrient == y_test_nutrient).mean():.4f}")
    
    # Yield Score
    y_pred_yield = models['yield'].predict(X_test)
    rmse_yield = np.sqrt(mean_squared_error(y_test_yield, y_pred_yield))
    r2_yield = r2_score(y_test_yield, y_pred_yield)
    print(f"\n[Yield Score Regressor]")
    print(f"RMSE: {rmse_yield:.4f}")
    print(f"R² Score: {r2_yield:.4f}")
    
    # Disease Risk
    y_pred_disease = models['disease'].predict(X_test)
    rmse_disease = np.sqrt(mean_squared_error(y_test_disease, y_pred_disease))
    r2_disease = r2_score(y_test_disease, y_pred_disease)
    print(f"\n[Disease Risk Regressor]")
    print(f"RMSE: {rmse_disease:.4f}")
    print(f"R² Score: {r2_disease:.4f}")
    print("="*70 + "\n")


# ============================================================================
# MAIN TRAINING PIPELINE
# ============================================================================

def main():
    """
    Main training pipeline: Generate data, train models, save artifacts.
    """
    print("\n" + "="*70)
    print("HYDROPONIC PLANT HEALTH XGBOOST MODEL TRAINING")
    print("="*70 + "\n")
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Step 1: Generate synthetic data
    print("[1/5] Generating synthetic hydroponic data...")
    df = generate_synthetic_hydroponic_data(n_samples=1500, random_state=42)
    print(f"    Generated {len(df)} samples with features: {list(df.columns)}")
    
    # Step 2: Prepare features and targets
    print("[2/5] Preparing features and targets...")
    X = df[['pH', 'EC', 'water_temp', 'humidity', 'visual_condition_encoded']]
    y_health = df['health_status']
    y_growth = df['growth_rate']
    y_nutrient = df['nutrient_issue']
    y_yield = df['yield_score']
    y_disease = df['disease_risk']
    
    # Split into train/test
    X_train, X_test, y_h_train, y_h_test, y_g_train, y_g_test, \
    y_n_train, y_n_test, y_y_train, y_y_test, y_d_train, y_d_test = \
    train_test_split(X, y_health, y_growth, y_nutrient, y_yield, y_disease,
                     test_size=0.2, random_state=42)
    
    print(f"    Training set: {len(X_train)} samples")
    print(f"    Test set: {len(X_test)} samples")
    
    # Step 3: Standardize features
    print("[3/5] Standardizing features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Step 4: Train models
    print("[4/5] Training XGBoost models...")
    models = train_xgboost_model(X_train_scaled, y_h_train, y_g_train,
                                y_n_train, y_y_train, y_d_train)
    
    # Step 5: Evaluate models
    print("[5/5] Evaluating models on test set...")
    evaluate_models(models, X_test_scaled, y_h_test, y_g_test,
                   y_n_test, y_y_test, y_d_test)
    
    # Save models and scaler
    print("[*] Saving models and artifacts...")
    for model_name, model in models.items():
        model.save_model(f'models/xgb_{model_name}_model.json')
    joblib.dump(scaler, 'models/scaler.pkl')
    
    # Save metadata
    metadata = {
        'training_date': datetime.now().isoformat(),
        'n_samples': len(df),
        'features': ['pH', 'EC', 'water_temp', 'humidity', 'visual_condition_encoded'],
        'targets': ['health_status', 'growth_rate', 'nutrient_issue', 'yield_score', 'disease_risk'],
        'model_type': 'XGBoost Multi-Output',
        'scaler_type': 'StandardScaler'
    }
    
    with open('models/metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("\n[✓] Training complete!")
    print("[✓] Models saved to 'models/' directory")
    print("[✓] Metadata saved to 'models/metadata.json'")
    print("\nNext steps:")
    print("  1. Copy model files to backend/models/")
    print("  2. Start FastAPI backend: python main.py")
    print("  3. Test endpoints with sample data")
    print("\n" + "="*70 + "\n")


if __name__ == '__main__':
    main()
