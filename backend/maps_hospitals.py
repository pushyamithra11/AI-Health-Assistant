

# import os
# import httpx
# import logging
# import re
# from utils import calculate_distance

# # Global client
# http_client = httpx.AsyncClient(
#     timeout=httpx.Timeout(20.0),
#     limits=httpx.Limits(max_connections=100, max_keepalive_connections=20)
# )

# GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# async def get_ip_location():
#     try:
#         response = await http_client.get("https://ipapi.co/json/", timeout=5.0)
#         if response.status_code == 200:
#             data = response.json()
#             return float(data.get("latitude", 0)), float(data.get("longitude", 0))
#     except Exception:
#         pass
#     return 12.9716, 77.5946 # Default fallback

# async def get_nearby_hospitals(lat: float, lon: float, specialist: str, urgency: str):
#     if not GOOGLE_MAPS_API_KEY:
#         return []
    
#     # CRITICAL: If the UI sends valid coordinates, do NOT use IP location
#     # Use IP location only if coordinates are truly 0.0
#     current_lat, current_lon = float(lat), float(lon)
#     if current_lat == 0 or current_lon == 0:
#         current_lat, current_lon = await get_ip_location()

#     clean_spec = re.sub(r"[\[\]']", "", str(specialist))
#     query = f"{clean_spec} Hospital" if urgency.lower() == "high" else f"{clean_spec} Clinic"
    
#     params = {
#         "query": query,
#         "location": f"{current_lat},{current_lon}",
#         "radius": 15000, # 15km
#         "key": GOOGLE_MAPS_API_KEY
#     }

#     try:
#         resp = await http_client.get("https://maps.googleapis.com/maps/api/place/textsearch/json", params=params)
#         data = resp.json()
        
#         results = []
#         for p in data.get("results", []):
#             p_lat = p["geometry"]["location"]["lat"]
#             p_lon = p["geometry"]["location"]["lng"]
            
#             # Calculate distance using the coordinates used for the search
#             dist = calculate_distance(current_lat, current_lon, p_lat, p_lon)
            
#             # FIXED DIRECTIONS URL: Official Google format
#             # https://www.google.com/maps/dir/?api=1&origin=LAT,LON&destination=LAT,LON
#             m_url = f"https://www.google.com/maps/dir/?api=1&origin={current_lat},{current_lon}&destination={p_lat},{p_lon}"
            
#             results.append({
#                 "name": p.get("name"),
#                 "lat": p_lat,
#                 "lon": p_lon,
#                 "address": p.get("formatted_address", "No address"),
#                 "rating": float(p.get("rating", 0.0)),
#                 "maps_url": m_url,
#                 "distance_km": dist,
#                 "available_specialist": clean_spec 
#             })
        
#         return sorted(results, key=lambda x: x["distance_km"])[:8]
#     except Exception as e:
#         print(f"Maps API Error: {e}")
#         return []

import os
import httpx
import logging
import re
from utils import calculate_distance

# Global client
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(20.0),
    limits=httpx.Limits(max_connections=100, max_keepalive_connections=20)
)

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

async def get_ip_location():
    try:
        response = await http_client.get("https://ipapi.co/json/", timeout=5.0)
        if response.status_code == 200:
            data = response.json()
            return float(data.get("latitude", 0)), float(data.get("longitude", 0))
    except Exception:
        pass
    return 12.9716, 77.5946 # Default fallback (Bangalore)

async def get_nearby_hospitals(lat: float, lon: float, specialist: str, urgency: str):
    if not GOOGLE_MAPS_API_KEY:
        return []
    
    # Priority: If coordinates are provided by the browser (not 0), use them.
    # Otherwise, fallback to IP.
    current_lat, current_lon = float(lat), float(lon)
    if current_lat == 0 or current_lon == 0:
        current_lat, current_lon = await get_ip_location()

    clean_spec = re.sub(r"[\[\]']", "", str(specialist))
    query = f"{clean_spec} Hospital" if urgency.lower() == "high" else f"{clean_spec} Clinic"
    
    params = {
        "query": query,
        "location": f"{current_lat},{current_lon}",
        "radius": 15000, # 15km search radius
        "key": GOOGLE_MAPS_API_KEY
    }

    try:
        resp = await http_client.get("https://maps.googleapis.com/maps/api/place/textsearch/json", params=params)
        data = resp.json()
        
        results = []
        for p in data.get("results", []):
            p_lat = p["geometry"]["location"]["lat"]
            p_lon = p["geometry"]["location"]["lng"]
            
            # Distance is now calculated from the SAME source used in the query
            dist = calculate_distance(current_lat, current_lon, p_lat, p_lon)
            
            # Universal Google Maps Direction Link
            m_url = f"https://www.google.com/maps/dir/?api=1&origin={current_lat},{current_lon}&destination={p_lat},{p_lon}&travelmode=driving"
            
            results.append({
                "name": p.get("name"),
                "lat": p_lat,
                "lon": p_lon,
                "address": p.get("formatted_address", "No address"),
                "rating": float(p.get("rating", 0.0)),
                "maps_url": m_url,
                "distance_km": dist,
                "available_specialist": clean_spec 
            })
        
        # Closest 8 results
        return sorted(results, key=lambda x: x["distance_km"])[:8]
    except Exception as e:
        print(f"Maps API Error: {e}")
        return []