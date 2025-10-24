"""
Train XGBoost models for hydroponic plant health prediction
Generates synthetic data and trains multi-output models
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score
import xgboost as xgb
import joblib
import os
from datetime import datetime

# ============================================================================
# Synthetic Data Generation
# ============================================================================

def generate_synthetic_hydroponic_data(n_samples=1500, seed=42):
    """Generate synthetic hydroponic system data"""
    np.random.seed(seed)

    # Generate features
    pH = np.random.uniform(5.5, 7.5, n_samples)
    EC = np.random.uniform(1200, 1800, n_samples)
    water_temp = np.random.uniform(18, 26, n_samples)
    humidity = np.random.uniform(50, 75, n_samples)
    visual_condition = np.random.randint(1, 6, n_samples)  # 1-5

    # Generate correlated targets based on features
    health_status = ((pH > 6.0) & (pH < 7.0) & (EC > 1200) & (EC < 1800)).astype(int)
    health_status = np.where(np.random.random(n_samples) < 0.7, health_status, 1 - health_status)

    growth_rate = ((water_temp > 18) & (water_temp < 24) & (humidity > 55) & (humidity < 75)).astype(int)
    growth_rate = np.where(np.random.random(n_samples) < 0.7, growth_rate, 1 - growth_rate)

    nutrient_issue = ((EC < 1200) | (EC > 1800)).astype(int)
    nutrient_issue = np.where(np.random.random(n_samples) < 0.6, nutrient_issue, 1 - nutrient_issue)

    # Yield prediction (regression)
    yield_score = 50 + 10 * (pH > 6.0) + 10 * (water_temp > 18) + \
                  5 * np.random.normal(0, 1, n_samples)
    yield_score = np.clip(yield_score, 20, 100)

    # Disease risk (regression 0-100)
    disease_risk = 30 - 5 * (humidity > 60) - 5 * (pH > 6.0) + \
                   10 * np.random.normal(0, 1, n_samples)
    disease_risk = np.clip(disease_risk, 5, 95)

    # Create DataFrame
    df = pd.DataFrame({
        'pH': pH,
        'EC': EC,
        'water_temp': water_temp,
        'humidity': humidity,
        'visual_condition_encoded': visual_condition,
        'health_status': health_status,
        'growth_rate': growth_rate,
        'nutrient_issue': nutrient_issue,
        'yield_score': yield_score,
        'disease_risk': disease_risk
    })

    return df


# ============================================================================
# Model Training
# ============================================================================

def train_xgboost_model(X_train, y_train, model_type='classifier'):
    """Train a single XGBoost model"""
    if model_type == 'classifier':
        model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
            verbosity=0
        )
    else:  # regressor
        model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
            verbosity=0
        )

    model.fit(X_train, y_train)
    return model


def evaluate_models(models, X_test, y_h_test, y_g_test, y_n_test, y_y_test, y_d_test):
    """Evaluate all models"""

    # Health status classifier
    y_h_pred = models['health'].predict(X_test)
    health_acc = accuracy_score(y_h_test, y_h_pred)
    print(f"\n[Health Status Classifier]")
    print(f"Accuracy: {health_acc:.4f}")

    # Growth rate classifier
    y_g_pred = models['growth'].predict(X_test)
    growth_acc = accuracy_score(y_g_test, y_g_pred)
    print(f"\n[Growth Rate Classifier]")
    print(f"Accuracy: {growth_acc:.4f}")

    # Nutrient issue classifier
    y_n_pred = models['nutrient'].predict(X_test)
    nutrient_acc = accuracy_score(y_n_test, y_n_pred)
    print(f"\n[Nutrient Issue Classifier]")
    print(f"Accuracy: {nutrient_acc:.4f}")

    # Yield score regressor
    y_y_pred = models['yield'].predict(X_test)
    yield_rmse = np.sqrt(mean_squared_error(y_y_test, y_y_pred))
    yield_r2 = r2_score(y_y_test, y_y_pred)
    print(f"\n[Yield Score Regressor]")
    print(f"RMSE: {yield_rmse:.4f}")
    print(f"R² Score: {yield_r2:.4f}")

    # Disease risk regressor
    y_d_pred = models['disease'].predict(X_test)
    disease_rmse = np.sqrt(mean_squared_error(y_d_test, y_d_pred))
    disease_r2 = r2_score(y_d_test, y_d_pred)
    print(f"\n[Disease Risk Regressor]")
    print(f"RMSE: {disease_rmse:.4f}")
    print(f"R² Score: {disease_r2:.4f}")


# ============================================================================
# Main Training Pipeline
# ============================================================================

def main():
    """Main training pipeline"""

    print("\n" + "="*70)
    print("HYDROPONIC PLANT HEALTH XGBOOST MODEL TRAINING")
    print("="*70)

    # Step 1: Generate synthetic data
    print("\n[1/5] Generating synthetic hydroponic data...")
    df = generate_synthetic_hydroponic_data(n_samples=1500)
    print(f"    Generated {len(df)} samples with features: {list(df.columns)}")

    # Step 2: Prepare features and targets
    print("\n[2/5] Preparing features and targets...")
    X = df[['pH', 'EC', 'water_temp', 'humidity', 'visual_condition_encoded']]
    y_health = df['health_status']
    y_growth = df['growth_rate']
    y_nutrient = df['nutrient_issue']
    y_yield = df['yield_score']
    y_disease = df['disease_risk']

    # Split data
    X_train, X_test, y_h_train, y_h_test, y_g_train, y_g_test, \
    y_n_train, y_n_test, y_y_train, y_y_test, \
    y_d_train, y_d_test = train_test_split(
        X, y_health, y_growth, y_nutrient, y_yield, y_disease,
        test_size=0.2, random_state=42
    )

    print(f"    Training set: {len(X_train)} samples")
    print(f"    Test set: {len(X_test)} samples")

    # Step 3: Standardize features
    print("\n[3/5] Standardizing features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Step 4: Train models
    print("\n[4/5] Training XGBoost models...")
    print("[*] Training Health Status Classifier...")
    model_health = train_xgboost_model(X_train_scaled, y_h_train, 'classifier')

    print("[*] Training Growth Rate Classifier...")
    model_growth = train_xgboost_model(X_train_scaled, y_g_train, 'classifier')

    print("[*] Training Nutrient Issue Classifier...")
    model_nutrient = train_xgboost_model(X_train_scaled, y_n_train, 'classifier')

    print("[*] Training Yield Score Regressor...")
    model_yield = train_xgboost_model(X_train_scaled, y_y_train, 'regressor')

    print("[*] Training Disease Risk Regressor...")
    model_disease = train_xgboost_model(X_train_scaled, y_d_train, 'regressor')

    models = {
        'health': model_health,
        'growth': model_growth,
        'nutrient': model_nutrient,
        'yield': model_yield,
        'disease': model_disease
    }

    # Step 5: Evaluate models
    print("\n[5/5] Evaluating models on test set...")
    print("\n" + "="*70)
    print("MODEL EVALUATION RESULTS")
    print("="*70)

    evaluate_models(models, X_test_scaled, y_h_test, y_g_test,
                   y_n_test, y_y_test, y_d_test)

    print("\n" + "="*70)

    # Save models and scaler
    print("\n[*] Saving models and artifacts...")
    os.makedirs('models', exist_ok=True)

    for model_name, model in models.items():
        joblib.dump(model, f'models/xgb_{model_name}_model.pkl')

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
        import json
        json.dump(metadata, f, indent=2)

    print("\n[✓] Training complete!")
    print("[✓] Models saved to 'models/' directory")
    print("[✓] Metadata saved to 'models/metadata.json'")
    print("\nNext steps:")
    print("  1. Copy model files to backend/models/")
    print("  2. Start FastAPI backend: python main.py")
    print("  3. Test endpoints with sample data")
    print("\n" + "="*70 + "\n")


if __name__ == "__main__":
    main()
