from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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


@app.on_event("startup")
def _startup():
    global _model
    _model = load_model()


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


