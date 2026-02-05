
import time
import json
from fastapi import FastAPI, HTTPException, Depends 
from fastapi.middleware.cors import CORSMiddleware
from config import logger, cache, model
from models import HospitalRequest, FinalResponse
from utils import clean_ai_json, generate_cache_key
from maps_hospitals import get_nearby_hospitals, http_client
from auth import router as auth_router, get_current_user 
from fastapi.security import OAuth2PasswordBearer

app = FastAPI(title="SmartHealth AI Backend")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Router (Signup/Login)
app.include_router(auth_router)

async def process_health_request(request: HospitalRequest, is_mental: bool):
    start_time = time.perf_counter()
    try:
        lat, lon = float(request.latitude), float(request.longitude)
        
        # 1. Cache Check
        cache_key = generate_cache_key(request.symptoms, lat)
        if cache:
            try:
                cached_res = cache.get(cache_key)
                if cached_res:
                    data = json.loads(cached_res)
                    data["latency_ms"] = round((time.perf_counter() - start_time) * 1000, 2)
                    return data
            except Exception as e:
                logger.error(f"Cache Error: {e}")

        # 2. AI Triage Generation
        role = "Mental Health Expert" if is_mental else "Medical Triage Doctor"
        prompt = (
            f"Act as a {role}. Analyze these symptoms: {request.symptoms}. "
            "Return JSON ONLY with: urgency, summary, possible_conditions (list), "
            "advice (list), specialist (string), and emergency (bool)."
        )
        
        if not model:
            raise HTTPException(status_code=500, detail="AI Model not initialized")
            
        res = await model.generate_content_async(prompt)
        triage_dict = clean_ai_json(res.text)
        
        if not triage_dict:
            raise ValueError("AI failed to generate valid JSON")

        # 3. Hospital Search (Logic handles IP fallback internally if 0,0)
        spec = str(triage_dict.get("specialist", "General Physician"))
        urg = str(triage_dict.get("urgency", "Moderate"))
        hospitals = await get_nearby_hospitals(lat, lon, spec, urg)

        # 4. Final Response Construction
        duration_ms = (time.perf_counter() - start_time) * 1000
        final_data = {
            "triage": triage_dict, 
            "hospitals": hospitals,
            "latency_ms": round(duration_ms, 2)
        }
        
        if cache:
            cache.setex(cache_key, 3600, json.dumps(final_data))

        return final_data

    except Exception as e:
        logger.error(f"CRASH: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "online", "redis": "connected" if cache else "degraded"}




# @app.post("/api/hospitals/nearby", response_model=FinalResponse)
# async def physical_triage_endpoint(request: HospitalRequest, username: str = Depends(get_current_user)):
#     logger.info(f"Authorized Request from {username} for physical triage")
#     return await process_health_request(request, False)
@app.post("/api/hospitals/nearby", response_model=FinalResponse)
async def physical_triage_endpoint(
    request: HospitalRequest, 
    username: str = Depends(get_current_user),
    _token: str = Depends(oauth2_scheme)  # <--- Add this dummy line
):
    logger.info(f"Authorized Request from {username} for physical triage")
    return await process_health_request(request, False)

@app.post("/api/mental-health/analyze", response_model=FinalResponse)
async def mental_triage_endpoint(request: HospitalRequest, username: str = Depends(get_current_user)):
    logger.info(f"Authorized Request from {username} for mental health triage")
    return await process_health_request(request, True)

@app.on_event("shutdown")
async def shutdown_event():
    await http_client.aclose()