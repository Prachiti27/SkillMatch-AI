from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.analyze import router as analyze_router
from dotenv import load_dotenv
import os

load_dotenv()

FRONTEND_URI = os.getenv("FRONTEND_URI")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URI],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(analyze_router)

@app.get("/health")
def health():
    return {"status":"ok"}

