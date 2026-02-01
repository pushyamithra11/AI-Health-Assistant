



import re, json, hashlib, math

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dlat, dlon = math.radians(lat2-lat1), math.radians(lon2-lon1)
    a = math.sin(dlat/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlon/2)**2
    return round(R * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a))), 2)

def clean_ai_json(text: str):
    try:
        cleaned = re.sub(r"```(?:json)?\s?|\s?```", "", text).strip()
        data = json.loads(cleaned[cleaned.find('{'):cleaned.rfind('}')+1])
        if "specialist" in data:
            spec = data["specialist"]
            data["specialist"] = spec[0] if isinstance(spec, list) else spec
        return data
    except: return None

def generate_cache_key(symptoms: str, latitude: float):
    symp_hash = hashlib.md5(symptoms.lower().strip().encode()).hexdigest()
    return f"triage_{symp_hash}_{round(latitude, 2)}"