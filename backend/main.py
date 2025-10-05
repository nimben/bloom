from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import requests
import pandas as pd

try:
    from dotenv import load_dotenv  # type: ignore
except Exception:
    load_dotenv = None

try:
    from sentence_transformers import SentenceTransformer, util  # type: ignore
except Exception:
    SentenceTransformer = None
    util = None

try:
    from .ndvi_utils import estimate_bloom_from_ndvi  # type: ignore
except Exception:
    from ndvi_utils import estimate_bloom_from_ndvi  # type: ignore

try:
    from .gee import fetch_ndvi_for_point, get_ndvi_tile_and_thumbnail  # type: ignore
    from .model import load_model, forecast_months  # type: ignore
except Exception:
    # Allow running from within the backend directory (non-package mode)
    from gee import fetch_ndvi_for_point, get_ndvi_tile_and_thumbnail
    from model import load_model, forecast_months


class ForecastItem(BaseModel):
    month: str
    predicted_ndvi: float


class BloomMapResponse(BaseModel):
    lat: float
    lon: float
    ndvi_index: float
    map_url: str
    thumbnail_url: Optional[str] = None
    bloom_status: str
    season: str
    bloom_score: int
    species: str
    timeline: dict
    data_quality: dict
    last_updated: str


app = FastAPI(title="Bloom Backend", version="0.1.0")

# CORS for local dev (Vite default port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load Prophet model at startup (lazy)
_model = None
_qa_df: Optional[pd.DataFrame] = None
_encoder = None
_qa_embeddings = None


@app.on_event("startup")
def _startup():
    global _model
    global _qa_df, _encoder, _qa_embeddings
    # Load environment variables from backend/.env if present
    if load_dotenv is not None:
        # Load from current directory (backend)
        env_loaded = load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
    _model = load_model()

    # Load CSV only; defer heavy model downloads to avoid startup hangs
    try:
        data_path = os.path.join(os.path.dirname(__file__), "bloom_data.csv")
        if os.path.exists(data_path):
            _qa_df = pd.read_csv(data_path)
    except Exception:
        _qa_df = None


@app.get("/bloom-map", response_model=BloomMapResponse)
def bloom_map(lat: float = Query(...), lon: float = Query(...), year: int = Query(...)):
    ndvi_value, season_name = fetch_ndvi_for_point(lat, lon, year)
    tile_url, thumb_url = get_ndvi_tile_and_thumbnail(lat, lon, year)

    bloom_status = (
        "Peak Bloom" if ndvi_value >= 0.6 else "Active Bloom" if ndvi_value >= 0.4 else "Low Bloom" if ndvi_value >= 0.25 else "Dormant"
    )
    bloom_score = int(max(0, min(100, round(ndvi_value * 100))))

    response = BloomMapResponse(
        lat=lat,
        lon=lon,
        ndvi_index=round(float(ndvi_value), 3),
        map_url=tile_url or "",
        thumbnail_url=thumb_url or None,
        bloom_status=bloom_status,
        season=season_name,
        bloom_score=bloom_score,
        species="Hibiscus",  # Placeholder/speculative; can be replaced by classifier later
        timeline={
            "start": "September" if season_name in ("Spring", "Autumn") else "Variable",
            "peak": "October-November" if season_name == "Spring" else "Variable",
            "end": "December" if season_name in ("Spring", "Autumn") else "Variable",
        },
        data_quality={
            "satellite": "MODIS",
            "confidence": 0.95,
            "trend": "stable",
            "region": "Unknown",
        },
        last_updated=datetime.utcnow().isoformat(timespec="seconds"),
    )

    return response


@app.get("/bloom-forecast")
def bloom_forecast(months: int = Query(6, ge=1, le=24)):
    global _model
    if _model is None:
        _model = load_model()

    forecast = forecast_months(_model, months)
    return {"forecast": [ForecastItem(**item).dict() for item in forecast]}


@app.get("/")
def root():
    return {"status": "ok", "service": "bloom-backend"}


# --- Bloom Chatbot (semantic + NDVI fallback) ---

class Question(BaseModel):
    question: str


@app.post("/ask")
def ask_bloom(q: Question):
    global _qa_df, _encoder, _qa_embeddings

    question_text = (q.question or "").strip().lower()

    # Fast heuristic match against CSV first (no model downloads)
    if _qa_df is not None and not _qa_df.empty and question_text:
        try:
            # Try to find species or country mentioned in the question
            matches = []
            for idx, row in _qa_df.iterrows():
                species = str(row.get('species', '')).lower()
                country = str(row.get('country', '')).lower()
                if species and species in question_text:
                    matches.append((idx, 2))  # higher score if species matches
                elif country and country in question_text:
                    matches.append((idx, 1))
            if matches:
                best_idx = sorted(matches, key=lambda x: x[1], reverse=True)[0][0]
                r = _qa_df.iloc[best_idx]
                return {"answer": f"{r['species']} blooms from {r['bloom_start']} to {r['bloom_end']}. {r['notes']}"}
        except Exception:
            pass

    # Optional semantic path if model is already available (do not trigger downloads)
    if _encoder is not None and _qa_embeddings is not None and util is not None and question_text:
        try:
            query_emb = _encoder.encode(question_text, convert_to_tensor=True)
            result = util.semantic_search(query_emb, _qa_embeddings, top_k=1)
            idx = result[0][0]['corpus_id']
            row = _qa_df.iloc[idx]
            if not row.empty:
                return {"answer": f"{row['species']} blooms from {row['bloom_start']} to {row['bloom_end']}. {row['notes']}"}
        except Exception:
            pass

    # Final NDVI-based fallback (instant placeholder)
    lat, lon = 20.5937, 78.9629
    bloom_estimate = estimate_bloom_from_ndvi(lat, lon)
    return {"answer": f"Approximate bloom season: {bloom_estimate}"}

