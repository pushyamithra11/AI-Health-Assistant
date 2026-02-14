🏥 AI Smart Healthcare Assistant:

An AI-powered healthcare platform that provides intelligent disease prediction, triage, and nearby hospital discovery. Built with a FastAPI backend and a modern frontend, leveraging Google Vertex AI (Gemini) for medical insights.

Live Demo

https://smart-healthcare-assistant-two.vercel.app/

✨ Features:

AI Physical Triage: Input symptoms and receive instant AI-driven health guidance.

Hospital Locator: Find the nearest healthcare facilities based on your location.

Secure Authentication: JWT-based user registration and login system.

Interactive Documentation: Fully documented API via Swagger UI.

Tech Stack:

Frontend: React/Next.js (Deployed on Vercel)

Backend: FastAPI, Python (Deployed on Render)

AI Model: Google Vertex AI (Gemini 1.5 Pro/Flash)

Database: TinyDB / JSON-based storage

Security: OAuth2 with Password hashing (Passlib)

Deployment: Vercel(frontend) and Render(backend)

⚙️ Environment Variables:

To run this project, you will need to add the following environment variables to your Render/Vercel dashboards:

Backend (Render):                               

GOOGLE_APPLICATION_CREDENTIALS_JSON     -  	The full content of your Google Service Account JSON key.

PROJECT_ID	                            -    Your Google Cloud Project ID.

SECRET_KEY	                            -    A long random string for JWT encryption.

ALGORITHM	                              -    HS256

🚀 Local Setup:

1. Clone the Repository

Bash

git clone https://github.com/your-username/AI-Health-Assistant.git

cd AI-Health-Assistant

2. Backend Setup
   
Bash

cd backend

python -m venv venv

source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn app:app --reload

3. Frontend Setup
   
Bash

cd frontend

npm install

npm run dev



