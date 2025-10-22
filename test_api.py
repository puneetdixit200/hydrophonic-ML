#!/usr/bin/env python3
"""
Test script to verify backend API is working correctly
"""
import requests
import json

API_URL = "http://127.0.0.1:8000"

# Test data
test_inputs = {
    "Optimal": {
        "ph_value": 6.0,
        "ec_value": 1200,
        "water_temperature": 21,
        "air_humidity": 60,
        "visual_condition": "Healthy"
    },
    "Stressed": {
        "ph_value": 4.5,
        "ec_value": 2200,
        "water_temperature": 28,
        "air_humidity": 75,
        "visual_condition": "Yellowing"
    },
    "Low pH": {
        "ph_value": 4.0,
        "ec_value": 1000,
        "water_temperature": 20,
        "air_humidity": 55,
        "visual_condition": "Yellowing"
    }
}

print("=" * 70)
print("TESTING HYDROPONIC PLANT HEALTH PREDICTOR API")
print("=" * 70)

# Test health check
print("\n✓ Testing Health Check Endpoint...")
try:
    response = requests.get(f"{API_URL}/health", timeout=5)
    if response.status_code == 200:
        print("✓ Health check passed:", response.json())
    else:
        print(f"✗ Health check failed with status {response.status_code}")
except Exception as e:
    print(f"✗ Error: {e}")

# Test predictions
print("\n" + "=" * 70)
print("TESTING PREDICTIONS")
print("=" * 70)

for scenario, input_data in test_inputs.items():
    print(f"\n{'='*70}")
    print(f"Scenario: {scenario}")
    print(f"{'='*70}")
    print(f"Input: {json.dumps(input_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{API_URL}/predict",
            json=input_data,
            timeout=10,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✓ Prediction successful!")
            print(f"\nScores:")
            print(f"  • Health Score: {result['health_score']:.4f} ({result['health_score']*100:.1f}%)")
            print(f"  • Growth Score: {result['growth_score']:.4f} ({result['growth_score']*100:.1f}%)")
            print(f"  • Yield Score: {result['yield_score']:.4f} ({result['yield_score']*100:.1f}%)")
            
            print(f"\nClassifications:")
            print(f"  • Health Status: {result['plant_health_status']}")
            print(f"  • Growth Rate: {result['growth_rate']}")
            print(f"  • Confidence: {result['confidence_score']*100:.1f}%")
            
            print(f"\nDisease Risk:")
            for disease, risk in result['disease_risk'].items():
                print(f"  • {disease}: {risk*100:.1f}%")
            
            print(f"\nNutrient Recommendations:")
            for i, rec in enumerate(result['nutrient_recommendations'], 1):
                print(f"  {i}. {rec}")
            
            print(f"\nEnvironmental Recommendations:")
            for i, rec in enumerate(result['environmental_recommendations'], 1):
                print(f"  {i}. {rec}")
        else:
            print(f"✗ Error: Status {response.status_code}")
            print(f"Response: {response.text}")
    
    except Exception as e:
        print(f"✗ Error: {e}")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
print("\n✓ If all tests passed, the frontend should work correctly!")
print("✓ Open http://127.0.0.1:9000/app.html in your browser")
