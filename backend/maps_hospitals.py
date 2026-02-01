 

import os
import httpx
import re
import asyncio  
from utils import calculate_distance

http_client = httpx.AsyncClient(timeout=httpx.Timeout(20.0))
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

async def get_real_driving_distance(origin_lat, origin_lon, dest_lat, dest_lon):
    """Calculates road distance via Google Distance Matrix API."""
    if not GOOGLE_MAPS_API_KEY: return calculate_distance(origin_lat, origin_lon, dest_lat, dest_lon)
    try:
        url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        params = {
            "origins": f"{origin_lat},{origin_lon}",
            "destinations": f"{dest_lat},{dest_lon}",
            "key": GOOGLE_MAPS_API_KEY
        }
        resp = await http_client.get(url, params=params)
        data = resp.json()
        if data["status"] == "OK" and data["rows"][0]["elements"][0]["status"] == "OK":
            return round(data["rows"][0]["elements"][0]["distance"]["value"] / 1000, 2)
    except: pass
    return calculate_distance(origin_lat, origin_lon, dest_lat, dest_lon)

async def get_nearby_hospitals(lat: float, lon: float, specialist: str, urgency: str):
    if not GOOGLE_MAPS_API_KEY: return []
    
    # 1. Capture Dynamic Location
    curr_lat, curr_lon = lat, lon
    if curr_lat == 0 or curr_lon == 0:
        # Precision Fallback for VIT Chennai area
        curr_lat, curr_lon = 12.8407, 80.1534 

    clean_spec = re.sub(r"[\[\]']", "", str(specialist))
    
    # 2. Symptom-Based Logic
  
    if urgency.lower() == "high":
        search_query = f"Emergency {clean_spec} Hospital"
        search_type = "hospital"
    else:
        search_query = f"{clean_spec} Medical Clinic"
        search_type = "doctor"

    params = {
        "location": f"{curr_lat},{curr_lon}",
        "keyword": search_query,
        "type": search_type,
        "rankby": "distance", 
        "key": GOOGLE_MAPS_API_KEY
    }

    try:
        endpoint = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        resp = await http_client.get(endpoint, params=params)
        places = resp.json().get("results", [])

        # Parallel distance calculation for speed
        tasks = [get_real_driving_distance(curr_lat, curr_lon, p["geometry"]["location"]["lat"], p["geometry"]["location"]["lng"]) for p in places[:10]]
        distances = await asyncio.gather(*tasks)

        results = []
        for i, p in enumerate(places[:10]):
            p_lat, p_lon = p["geometry"]["location"]["lat"], p["geometry"]["location"]["lng"]
            
          
            m_url = f"https://www.google.com/maps/dir/?api=1&origin={curr_lat},{curr_lon}&destination={p_lat},{p_lon}&travelmode=driving"
            
            results.append({
                "name": p.get("name"),
                "lat": p_lat, "lon": p_lon,
                "address": p.get("vicinity", "Nearby"),
                "rating": float(p.get("rating", 0.0)),
                "maps_url": m_url,
                "distance_km": distances[i],
                "available_specialist": clean_spec 
            })
            
        return sorted(results, key=lambda x: x["distance_km"])[:8]
    except Exception as e:
        print(f"Error: {e}")
        return []