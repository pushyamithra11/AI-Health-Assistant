# import math
# import re
# import json
# import hashlib

# def calculate_distance(lat1, lon1, lat2, lon2):
#     if lat1 == 0 or lat2 == 0: return 0.0
#     R = 6371
#     d_lat, d_lon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
#     a = math.sin(d_lat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(d_lon/2)**2
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
#     return round(R * c, 2)

# def clean_ai_json(text: str):
#     try:
#         cleaned = re.sub(r"```json\s?|\s?```", "", text).strip()
#         data = json.loads(cleaned[cleaned.find('{'):cleaned.rfind('}')+1])
#         if "specialist" in data and isinstance(data["specialist"], list):
#             data["specialist"] = data["specialist"][0] if data["specialist"] else "General Physician"
#         return data
#     except Exception: return None

# def generate_cache_key(symptoms: str, latitude: float):
#     symptom_hash = hashlib.md5(symptoms.lower().strip().encode()).hexdigest()
#     return f"triage_{symptom_hash}_{round(latitude, 2)}"

import math
import re
import json
import hashlib

def calculate_distance(lat1, lon1, lat2, lon2):
    # If coordinates are 0, we can't calculate distance
    if lat1 == 0 or lat2 == 0 or lon1 == 0 or lon2 == 0: 
        return 0.0
    
    R = 6371 # Earth's radius in KM
    d_lat, d_lon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    
    a = math.sin(d_lat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(d_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return round(R * c, 2)

def clean_ai_json(text: str):
    try:
        # Step 1: Remove markdown code blocks
        cleaned = re.sub(r"```json\s?|\s?```", "", text).strip()
        
        # Step 2: Extract only the content within the first { and last }
        start = cleaned.find('{')
        end = cleaned.rfind('}')
        if start == -1 or end == -1:
            return None
            
        json_content = cleaned[start:end+1]
        data = json.loads(json_content)
        
        # Step 3: Ensure 'specialist' is a string (AI sometimes returns a list)
        if "specialist" in data:
            if isinstance(data["specialist"], list):
                data["specialist"] = data["specialist"][0] if data["specialist"] else "General Physician"
            elif not data["specialist"]:
                data["specialist"] = "General Physician"
                
        return data
    except Exception as e:
        print(f"JSON Cleaning Error: {e}")
        return None

def generate_cache_key(symptoms: str, latitude: float):
    # Use MD5 to create a unique fingerprint for the symptom text
    symptom_hash = hashlib.md5(symptoms.lower().strip().encode()).hexdigest()
    # Cache based on symptoms and general area (rounded lat)
    return f"triage_{symptom_hash}_{round(latitude, 2)}"