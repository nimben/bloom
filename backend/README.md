Bloom Backend (FastAPI + GEE + Prophet)

Setup
- Python 3.10+
- Install deps: pip install -r backend/requirements.txt
- Env vars: GEE_SERVICE_ACCOUNT, GOOGLE_APPLICATION_CREDENTIALS, BLOOM_MODEL_PATH

Run
- uvicorn backend.main:app --reload --port 8000

Endpoints
- GET /bloom-map?lat=..&lon=..&year=2025
- GET /bloom-forecast?months=6


