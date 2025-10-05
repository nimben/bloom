Bloom Backend (FastAPI + GEE + Prophet)

Setup
- Python 3.10+
- Install deps: pip install -r backend/requirements.txt
- Env vars: GEE_SERVICE_ACCOUNT, GOOGLE_APPLICATION_CREDENTIALS, BLOOM_MODEL_PATH
- Create backend/.env with:
- GEMINI_API_KEY=your_api_key_here

Run
- uvicorn backend.main:app --reload --port 8000

Endpoints
- GET /bloom-map?lat=..&lon=..&year=2025
- GET /bloom-forecast?months=6
- POST /chat { message }


