"""
Simple preprocessing utilities for hydroponic model
"""
import numpy as np
import joblib
from pathlib import Path


class SimpleScaler:
    """Simple StandardScaler replacement without sklearn"""
    def __init__(self):
        self.mean = None
        self.std = None
    
    def fit(self, X):
        self.mean = np.mean(X, axis=0)
        self.std = np.std(X, axis=0)
        self.std[self.std == 0] = 1  # Avoid division by zero
        return self
    
    def transform(self, X):
        return (X - self.mean) / self.std
    
    def fit_transform(self, X):
        return self.fit(X).transform(X)


class SimpleEncoder:
    """Simple LabelEncoder replacement without sklearn"""
    def __init__(self):
        self.classes_ = None
        self.mapping = None
    
    def fit(self, X):
        if isinstance(X, list):
            X = np.array(X)
        X_flat = X.flatten() if len(X.shape) > 1 else X
        self.classes_ = np.unique(X_flat)
        self.mapping = {c: i for i, c in enumerate(self.classes_)}
        return self
    
    def transform(self, X):
        if isinstance(X, list):
            X = np.array(X)
        X_flat = X.flatten() if len(X.shape) > 1 else X
        return np.array([[self.mapping.get(val, 0) for val in X_flat]])
    
    def fit_transform(self, X):
        return self.fit(X).transform(X)
