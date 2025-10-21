"""
Training Script for Hydroponic Plant Health XGBoost Model
Generates synthetic data and trains a multi-output regression model
"""

import numpy as np
import pandas as pd
import xgboost as xgb
import joblib
from pathlib import Path
import warnings
from preprocessing import SimpleScaler, SimpleEncoder

warnings.filterwarnings("ignore")

# ============================================================================
# CONFIGURATION
# ============================================================================

RANDOM_SEED = 42
SYNTHETIC_SAMPLES = 500
TEST_SIZE = 0.2
MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / "xgb_model.json"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
ENCODER_PATH = MODEL_DIR / "encoder.pkl"

np.random.seed(RANDOM_SEED)


# ============================================================================
# SYNTHETIC DATA GENERATION
# ============================================================================


def generate_synthetic_data(n_samples: int = 500) -> pd.DataFrame:
    """
    Generate synthetic hydroponic plant health dataset.

    Features:
    - pH: 3.0 to 9.0 (optimal: 5.5-6.5)
    - EC: 200 to 3000 µS/cm (optimal: 800-1800)
    - Temperature: 5 to 35°C (optimal: 18-24°C)
    - Humidity: 20 to 95% (optimal: 40-80%)
    - Visual Condition: Categorical (5 classes)

    Targets:
    - Health Score: 0.0 to 1.0 (higher = healthier)
    - Growth Score: 0.0 to 1.0 (higher = faster growth)
    - Yield Score: 0.0 to 1.0 (higher = better yield)
    """

    data = {
        "pH": np.random.uniform(3.0, 9.0, n_samples),
        "EC": np.random.uniform(200, 3000, n_samples),
        "Temperature": np.random.uniform(5, 35, n_samples),
        "Humidity": np.random.uniform(20, 95, n_samples),
        "Visual_Condition": np.random.choice(
            ["Healthy", "Yellowing", "Wilting", "Leaf Curling", "Spotting"],
            n_samples,
        ),
    }

    df = pd.DataFrame(data)

    # Generate targets based on parameter quality
    health_scores = []
    growth_scores = []
    yield_scores = []

    for idx, row in df.iterrows():
        # Health score calculation
        ph_score = 1.0 - abs(row["pH"] - 6.0) / 3.0  # Optimal at pH 6.0
        ec_score = (
            1.0 - abs(row["EC"] - 1200) / 1200
        )  # Optimal at EC 1200
        temp_score = (
            1.0 - abs(row["Temperature"] - 21) / 16
        )  # Optimal at 21°C
        humidity_score = (
            1.0 - abs(row["Humidity"] - 60) / 40
        )  # Optimal at 60%

        # Average with visual condition weighting
        visual_weights = {
            "Healthy": 1.0,
            "Yellowing": 0.4,
            "Wilting": 0.2,
            "Leaf Curling": 0.3,
            "Spotting": 0.35,
        }
        visual_weight = visual_weights.get(row["Visual_Condition"], 0.5)

        health = (
            (ph_score + ec_score + temp_score + humidity_score) / 4 * visual_weight
        )
        health_scores.append(np.clip(health + np.random.normal(0, 0.05), 0, 1))

        # Growth score (better conditions = faster growth)
        growth = (ph_score * 0.25 + ec_score * 0.3 + temp_score * 0.25 + humidity_score * 0.2) * visual_weight
        growth_scores.append(np.clip(growth + np.random.normal(0, 0.06), 0, 1))

        # Yield score (health and growth combined)
        yield_score = (health + growth) / 2 * visual_weight
        yield_scores.append(np.clip(yield_score + np.random.normal(0, 0.04), 0, 1))

    df["Health_Score"] = health_scores
    df["Growth_Score"] = growth_scores
    df["Yield_Score"] = yield_scores

    return df


# ============================================================================
# DATA PREPROCESSING
# ============================================================================


def preprocess_data(df: pd.DataFrame):
    """
    Preprocess data for model training.

    Returns:
        X_train, X_test, y_train, y_test, scaler, encoder
    """

    # Separate features and targets
    X = df[["pH", "EC", "Temperature", "Humidity", "Visual_Condition"]].copy()
    y = df[["Health_Score", "Growth_Score", "Yield_Score"]].copy()

    # Encode visual condition
    encoder = SimpleEncoder()
    visual_encoded = encoder.fit_transform(X["Visual_Condition"].values)
    X["Visual_Condition"] = visual_encoded[0]

    # Scale numerical features
    scaler = SimpleScaler()
    X_scaled = scaler.fit_transform(X.values)

    # Simple train-test split
    n_samples = len(X_scaled)
    split_idx = int(n_samples * (1 - TEST_SIZE))
    indices = np.random.permutation(n_samples)
    
    train_idx = indices[:split_idx]
    test_idx = indices[split_idx:]
    
    X_train = X_scaled[train_idx]
    X_test = X_scaled[test_idx]
    y_train = y.iloc[train_idx].values
    y_test = y.iloc[test_idx].values

    return X_train, X_test, y_train, y_test, scaler, encoder


# ============================================================================
# MODEL TRAINING
# ============================================================================


def train_model(X_train, X_test, y_train, y_test):
    """
    Train XGBoost multi-output regression model using DMatrix.
    """

    print("\n" + "=" * 70)
    print("🌱 HYDROPONIC PLANT HEALTH MODEL TRAINING")
    print("=" * 70)

    print(f"\n📊 Dataset Information:")
    print(f"   Training samples: {X_train.shape[0]}")
    print(f"   Test samples: {X_test.shape[0]}")
    print(f"   Features: {X_train.shape[1]}")
    print(f"   Targets: {y_train.shape[1]}")

    print("\n🔄 Training model...")
    
    # Create DMatrix for XGBoost
    dtrain = xgb.DMatrix(X_train, label=y_train)
    dtest = xgb.DMatrix(X_test, label=y_test)
    
    params = {
        'objective': 'reg:squarederror',
        'max_depth': 6,
        'eta': 0.1,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'eval_metric': 'rmse'
    }
    
    # Train model
    evals = [(dtrain, 'train'), (dtest, 'eval')]
    evals_result = {}
    
    model = xgb.train(
        params,
        dtrain,
        num_boost_round=200,
        evals=evals,
        evals_result=evals_result,
        verbose_eval=False
    )

    # Evaluate model
    print("\n📈 Model Evaluation:")
    y_pred_train = model.predict(dtrain)
    y_pred_test = model.predict(dtest)

    # Calculate metrics for each output
    output_names = ["Health Score", "Growth Score", "Yield Score"]
    for i, name in enumerate(output_names):
        train_mse = np.mean((y_train[:, i] - y_pred_train[:, i]) ** 2)
        test_mse = np.mean((y_test[:, i] - y_pred_test[:, i]) ** 2)
        
        # Calculate R² score
        ss_res_train = np.sum((y_train[:, i] - y_pred_train[:, i]) ** 2)
        ss_tot_train = np.sum((y_train[:, i] - np.mean(y_train[:, i])) ** 2)
        train_r2 = 1 - (ss_res_train / ss_tot_train) if ss_tot_train != 0 else 0
        
        ss_res_test = np.sum((y_test[:, i] - y_pred_test[:, i]) ** 2)
        ss_tot_test = np.sum((y_test[:, i] - np.mean(y_test[:, i])) ** 2)
        test_r2 = 1 - (ss_res_test / ss_tot_test) if ss_tot_test != 0 else 0

        print(f"\n   {name}:")
        print(f"      Train MSE: {train_mse:.4f} | Test MSE: {test_mse:.4f}")
        print(f"      Train R²: {train_r2:.4f} | Test R²: {test_r2:.4f}")

    return model


# ============================================================================
# MODEL PERSISTENCE
# ============================================================================


def save_model(model, scaler, encoder):
    """Save model and preprocessing objects."""
    print("\n💾 Saving model and preprocessing objects...")

    # Save model
    model.save_model(str(MODEL_PATH))
    print(f"   ✓ Model saved: {MODEL_PATH}")

    # Save scaler
    joblib.dump(scaler, SCALER_PATH)
    print(f"   ✓ Scaler saved: {SCALER_PATH}")

    # Save encoder
    joblib.dump(encoder, ENCODER_PATH)
    print(f"   ✓ Encoder saved: {ENCODER_PATH}")


def load_saved_model():
    """Load saved model and preprocessing objects."""
    print("\n📂 Loading model and preprocessing objects...")
    model = xgb.Booster(model_file=str(MODEL_PATH))
    scaler = joblib.load(SCALER_PATH)
    encoder = joblib.load(ENCODER_PATH)
    print("   ✓ All objects loaded successfully")
    return model, scaler, encoder


# ============================================================================
# EXAMPLE PREDICTIONS
# ============================================================================


def demonstrate_predictions(model, scaler, encoder):
    """Demonstrate model predictions with example data."""
    print("\n" + "=" * 70)
    print("🧪 DEMONSTRATION PREDICTIONS")
    print("=" * 70)

    examples = [
        {
            "name": "Optimal Conditions",
            "pH": 6.0,
            "EC": 1200,
            "Temperature": 21,
            "Humidity": 60,
            "Visual": "Healthy",
        },
        {
            "name": "Low pH Stress",
            "pH": 4.0,
            "EC": 1000,
            "Temperature": 20,
            "Humidity": 55,
            "Visual": "Yellowing",
        },
        {
            "name": "High EC Toxicity",
            "pH": 6.2,
            "EC": 2500,
            "Temperature": 25,
            "Humidity": 75,
            "Visual": "Wilting",
        },
        {
            "name": "Temperature Stress",
            "pH": 6.5,
            "EC": 1100,
            "Temperature": 32,
            "Humidity": 45,
            "Visual": "Leaf Curling",
        },
    ]

    for example in examples:
        X_example = np.array(
            [
                [
                    example["pH"],
                    example["EC"],
                    example["Temperature"],
                    example["Humidity"],
                    encoder.transform([[example["Visual"]]])[0][0],
                ]
            ]
        )
        X_example_scaled = scaler.transform(X_example)
        dmatrix = xgb.DMatrix(X_example_scaled)
        pred = model.predict(dmatrix)[0]

        print(f"\n   📋 {example['name']}:")
        print(f"      pH: {example['pH']}, EC: {example['EC']}, "
              f"Temp: {example['Temperature']}°C, Humidity: {example['Humidity']}%")
        print(f"      Visual: {example['Visual']}")
        print(f"      → Health Score: {pred[0]:.3f}")
        print(f"      → Growth Score: {pred[1]:.3f}")
        print(f"      → Yield Score: {pred[2]:.3f}")


# ============================================================================
# MAIN EXECUTION
# ============================================================================


def main():
    """Main training pipeline."""
    try:
        # Generate synthetic dataset
        print("\n🌾 Generating synthetic hydroponic dataset...")
        df = generate_synthetic_data(SYNTHETIC_SAMPLES)
        print(f"   ✓ Generated {len(df)} samples")

        # Preprocess data
        print("\n🔧 Preprocessing data...")
        X_train, X_test, y_train, y_test, scaler, encoder = preprocess_data(df)
        print(f"   ✓ Training set shape: {X_train.shape}")
        print(f"   ✓ Test set shape: {X_test.shape}")

        # Train model
        model = train_model(X_train, X_test, y_train, y_test)

        # Save model
        save_model(model, scaler, encoder)

        # Demonstrate predictions
        demonstrate_predictions(model, scaler, encoder)

        print("\n" + "=" * 70)
        print("✨ TRAINING COMPLETE!")
        print("=" * 70)
        print("\nThe model is ready for API predictions.")
        print("Start the FastAPI server with: python -m uvicorn main:app --reload")

    except Exception as e:
        print(f"\n❌ Error during training: {e}")
        raise


if __name__ == "__main__":
    main()
