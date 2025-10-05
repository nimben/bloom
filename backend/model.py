import os
from typing import List, Dict
from datetime import datetime

import joblib
import pandas as pd


MODEL_PATHS = [
    os.getenv("BLOOM_MODEL_PATH"),
    os.path.join(os.getcwd(), "bloom_forecast_model.pkl"),
    os.path.join(os.getcwd(), "..", "bloom_forecast_model.pkl"),
]


def load_model():
    for path in MODEL_PATHS:
        if not path:
            continue
        if os.path.exists(path):
            return joblib.load(path)
    raise FileNotFoundError("bloom_forecast_model.pkl not found. Set BLOOM_MODEL_PATH or place in project root.")


def forecast_months(model, months: int) -> List[Dict]:
    # Create future dataframe with monthly periods
    last_date = datetime.utcnow()
    future = pd.date_range(start=last_date, periods=months, freq='MS')
    df = pd.DataFrame({"ds": future})
    fcst = model.predict(df)
    results = []
    for i in range(months):
        ds = pd.to_datetime(fcst.iloc[i]["ds"])  # type: ignore[index]
        yhat = float(fcst.iloc[i]["yhat"])  # type: ignore[index]
        results.append({
            "month": ds.strftime("%B"),
            "predicted_ndvi": round(max(0.0, min(1.0, yhat)), 3)
        })
    return results


