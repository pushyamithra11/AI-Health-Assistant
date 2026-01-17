# import os
# import logging
# import redis
# import vertexai
# from vertexai.generative_models import GenerativeModel
# from dotenv import load_dotenv  # <--- ADD THIS

# # Load the variables from .env into the system environment
# load_dotenv() 

# # 1. Initialize Logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # 2. Redis Connection
# # Professional tip: Also move these to .env later
# cache = redis.Redis(host='127.0.0.1', port=6379, db=0, decode_responses=True, socket_connect_timeout=2)

# # AI Setup
# PROJECT_ID = os.getenv("GCP_PROJECT_ID")
# # Ensure you use the variable from .env for location too!
# LOCATION = os.getenv("GCP_LOCATION", "us-central1") 

# if not PROJECT_ID:
#     logger.error("❌ GCP_PROJECT_ID not found in environment variables!")

# vertexai.init(project=PROJECT_ID, location=LOCATION)
# model = GenerativeModel("gemini-2.0-flash")

import os
import logging
import redis
import vertexai
from vertexai.generative_models import GenerativeModel
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

# 1. Initialize Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 2. Redis Connection with Error Handling
# We try to ping Redis; if it fails, we set cache to None so the app stays online
try:
    cache = redis.Redis(
        host=os.getenv("REDIS_HOST", "127.0.0.1"), 
        port=int(os.getenv("REDIS_PORT", 6379)), 
        db=0, 
        decode_responses=True, 
        socket_connect_timeout=2
    )
    # The .ping() is the critical part that checks the actual connection
    if cache.ping():
        logger.info("✅ Redis connected successfully")
except (redis.ConnectionError, redis.TimeoutError):
    logger.warning("⚠️ Redis not found or connection timed out. Running in 'Degraded Mode' (No Cache).")
    cache = None

# 3. Vertex AI Setup
PROJECT_ID = os.getenv("GCP_PROJECT_ID")
LOCATION = os.getenv("GCP_LOCATION", "us-central1") 

if not PROJECT_ID:
    logger.error("❌ GCP_PROJECT_ID not found in environment variables!")

try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    # Using the flash model as requested
    model = GenerativeModel("gemini-2.0-flash")
    logger.info(f"🚀 AI Model initialized (Project: {PROJECT_ID})")
except Exception as e:
    logger.error(f"❌ Failed to initialize Vertex AI: {e}")
    model = None