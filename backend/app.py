

# import time
# import json
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from config import logger, cache, model
# from models import HospitalRequest, FinalResponse
# from utils import clean_ai_json, generate_cache_key
# from maps_hospitals import get_nearby_hospitals, http_client, get_ip_location, calculate_haversine
# from auth import router as auth_router

# app = FastAPI(title="SmartHealth AI Backend")
# app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
# app.include_router(auth_router)

# @app.on_event("shutdown")
# async def shutdown_event():
#     await http_client.aclose()

# async def process_health_request(request: HospitalRequest, is_mental: bool):
#     start_time = time.perf_counter()
#     try:
#         # Lat/Lon coercion to float
#         lat = float(request.latitude)
#         lon = float(request.longitude)
        
#         if lat == 0 and lon == 0: 
#             lat, lon = await get_ip_location()

#         cache_key = generate_cache_key(request.symptoms, f"{lat},{lon}")
        
#         if cache:
#             cached_res = cache.get(cache_key)
#             if cached_res:
#                 data = json.loads(cached_res)
#                 data["latency_ms"] = round((time.perf_counter() - start_time) * 1000, 2)
#                 return data

#         # AI Role-Based Prompting
#         role = "Mental Health Expert" if is_mental else "Medical Triage Doctor"
#         spec_requirement = "Psychiatrist or Clinical Psychologist" if is_mental else "Single Medical Specialist"

#         prompt = f"""Act as a {role}. Analyze: {request.symptoms}. Return JSON ONLY.
#         {{
#             "urgency": "High/Moderate/Low",
#             "summary": "...",
#             "possible_conditions": [],
#             "advice": [],
#             "specialist": "...", 
#             "emergency": bool
#         }}"""
        
#         res = await model.generate_content_async(prompt)
#         triage_dict = clean_ai_json(res.text)
        
#         if not triage_dict: raise ValueError("Invalid AI Response")

#         # Hospital Search
#         spec = str(triage_dict.get("specialist", "General Physician"))
#         urg = str(triage_dict.get("urgency", "Moderate"))
#         hospitals = await get_nearby_hospitals(lat, lon, spec, urg)

#         duration = round((time.perf_counter() - start_time) * 1000, 2)
#         final_response = {
#             "triage": triage_dict, 
#             "hospitals": hospitals,
#             "latency_ms": duration
#         }
        
#         if cache:
#             cache.setex(cache_key, 3600, json.dumps(final_response))

#         return final_response

#     except Exception as e:
#         logger.error(f"Endpoint Error: {str(e)}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/api/hospitals/nearby", response_model=FinalResponse)
# async def physical_triage_endpoint(request: HospitalRequest):
#     return await process_health_request(request, False)

# @app.post("/api/mental-health/analyze", response_model=FinalResponse)
# async def mental_triage_endpoint(request: HospitalRequest):
#     return await process_health_request(request, True)

import time
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config import logger, cache, model
from models import HospitalRequest, FinalResponse
from utils import calculate_distance, clean_ai_json, generate_cache_key
from maps_hospitals import get_nearby_hospitals, http_client, get_ip_location
from auth import router as auth_router

app = FastAPI(title="SmartHealth AI Backend")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)

# ... (imports remain same)

async def process_health_request(request: HospitalRequest, is_mental: bool):
    start_time = time.perf_counter()
    try:
        lat, lon = float(request.latitude), float(request.longitude)
        
        # If UI sends 0, backend tries IP. Note: This causes distance jumps
        if lat == 0 and lon == 0: 
            lat, lon = await get_ip_location()

        cache_key = generate_cache_key(request.symptoms, lat)
        
        # 1. Cache Check
        if cache:
            try:
                cached_res = cache.get(cache_key)
                if cached_res:
                    data = json.loads(cached_res)
                    # Show cache retrieval speed in milliseconds
                    elapsed_ms = (time.perf_counter() - start_time) * 1000
                    data["latency_ms"] = round(elapsed_ms, 2)
                    return data
            except Exception as e: 
                logger.error(f"Cache Error: {e}")
        # 2. AI Triage
        role = "Mental Health Expert" if is_mental else "Medical Triage Doctor"
        prompt = f"Act as a {role}. Analyze: {request.symptoms}. Return JSON ONLY with urgency, summary, possible_conditions (list), advice (list), specialist (string), and emergency (bool)."
        
        res = await model.generate_content_async(prompt)
        triage_dict = clean_ai_json(res.text)
        
        if not triage_dict:
            raise ValueError("AI failed to generate valid JSON")

        # 3. Hospital Search
        spec = str(triage_dict.get("specialist", "General Physician"))
        urg = str(triage_dict.get("urgency", "Moderate"))
        hospitals = await get_nearby_hospitals(lat, lon, spec, urg)

        # 4. Final Response Construction
        duration_ms = (time.perf_counter() - start_time) * 1000
        
        final_data = {
            "triage": triage_dict, 
            "hospitals": hospitals,
            "latency_ms": round(duration_ms, 2) # Frontend can divide by 1000 to show seconds
        }
        
        # Save to Redis
        if cache:
            try: 
                cache.setex(cache_key, 3600, json.dumps(final_data))
            except Exception as e:
                logger.error(f"Failed to save to cache: {e}")

        return final_data

    except Exception as e:
        logger.error(f"CRASH: {str(e)}")
        import traceback
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=str(e))

# ... (rest of endpoints remain same)
# app.py

@app.get("/health")
async def health_check():
    # This checks if 'cache' was successfully initialized in config.py
    is_connected = False
    try:
        if cache and cache.ping():
            is_connected = True
    except Exception:
        is_connected = False

    return {
        "status": "online",
        "redis_connected": is_connected,
        "mode": "Live" if is_connected else "Degraded (No Cache)"
    }

@app.post("/api/hospitals/nearby", response_model=FinalResponse)
async def physical_triage_endpoint(request: HospitalRequest):
    return await process_health_request(request, False)

@app.post("/api/mental-health/analyze", response_model=FinalResponse)
async def mental_triage_endpoint(request: HospitalRequest):
    return await process_health_request(request, True)
@app.on_event("shutdown")
async def shutdown_event():
    # This is why we need to import http_client
    await http_client.aclose()