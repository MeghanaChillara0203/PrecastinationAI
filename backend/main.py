import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), ""))
sys.path.append(os.path.join(os.path.dirname(__file__), "agents"))

import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from agents.orchestrator_agent import OrchestratorAgent
from agents.quiz_agent import QuizAgent
from agents.help_agent import HelpAgent

# ---------------------------
# Ensure data directory exists
# ---------------------------
DATA_DIR = "backend/data"
os.makedirs(DATA_DIR, exist_ok=True)

TASKS_FILE = os.path.join(DATA_DIR, "tasks.json")
PROFILE_FILE = os.path.join(DATA_DIR, "profile.json")

# ---------------------------
# Load / Save Helpers
# ---------------------------
def load_json(path, fallback):
    if not os.path.exists(path):
        return fallback
    try:
        with open(path, "r") as f:
            return json.load(f)
    except:
        return fallback

def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


# ---------------------------
# FastAPI App
# ---------------------------
app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------
# Pydantic Models
# ---------------------------
class Task(BaseModel):
    id: str
    title: str
    description: str
    category: str
    status: str
    dueDate: str
    dueTime: str
    verificationFailedCount: int = 0
    aiAccess: Optional[str] = None

class UserProfile(BaseModel):
    name: str
    email: str
    bio: Optional[str] = ""
    character: str
    documentName: Optional[str] = None
    documentContent: Optional[str] = None


# ---------------------------
# API Request Models
# ---------------------------
class ProcessRequest(BaseModel):
    title: str
    description: str
    category: str
    contextUrl: Optional[str] = None
    userProfile: Optional[dict] = None

class SubmitQuizRequest(BaseModel):
    normalized: dict
    quiz: dict
    answers: List[int]

class VerifyNetworkingRequest(BaseModel):
    names: List[str]
    task: dict

class SpreadsheetRequest(BaseModel):
    tasks: List[dict]
    user: dict


# ---------------------------
# Agents (require API key)
# ---------------------------
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is missing")

orchestrator = OrchestratorAgent()
quiz_agent = QuizAgent(api_key=API_KEY)
help_agent = HelpAgent(api_key=API_KEY)


# ---------------------------
# DATA ENDPOINTS
# ---------------------------
@app.get("/tasks")
def get_tasks():
    return load_json(TASKS_FILE, [])

@app.post("/save-tasks")
def save_tasks(tasks: List[Task]):
    save_json(TASKS_FILE, [t.dict() for t in tasks])
    return {"status": "ok"}

@app.get("/profile")
def get_profile():
    return load_json(
        PROFILE_FILE,
        {
            "name": "",
            "email": "",
            "bio": "",
            "character": "MALE",
            "documentName": None,
            "documentContent": None,
        },
    )

@app.post("/save-profile")
def save_profile(profile: UserProfile):
    save_json(PROFILE_FILE, profile.dict())
    return {"status": "ok"}


# -----------------------------------------------------
# MAIN ROUTE USED BY FRONTEND FOR QUIZ + HELP
# -----------------------------------------------------
@app.post("/process-task")
async def process_task(payload: ProcessRequest):

    task = {
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "contextUrl": payload.contextUrl,
        "userProfile": payload.userProfile,
    }

    result = await orchestrator.process(task)
    return result


# -----------------------------------------------------
# QUIZ SUBMISSION → MEMORY OR HELP
# -----------------------------------------------------
@app.post("/submit-quiz")
async def submit_quiz(payload: SubmitQuizRequest):
    result = await orchestrator.submit_quiz(
        payload.normalized, payload.quiz, payload.answers
    )
    return result


# -----------------------------------------------------
# NETWORKING VERIFICATION
# -----------------------------------------------------
@app.post("/verify-networking")
async def verify_networking(payload: VerifyNetworkingRequest):
    names = payload.names
    task = payload.task

    # HelpAgent provides name verification capability
    try:
        result = await help_agent.verify_names(names, task)
        return {"verified": result}
    except:
        return {"verified": True}  # fallback


# -----------------------------------------------------
# SPREADSHEET GENERATION
# -----------------------------------------------------
@app.post("/generate-spreadsheet")
async def generate_spreadsheet(payload: SpreadsheetRequest):

    tasks = payload.tasks
    user = payload.user

    # We reuse HelpAgent to generate CSV using Gemini
    try:
        result = await help_agent.generate_spreadsheet(tasks, user)
        return result
    except Exception as e:
        return {"title": "Error.csv", "content": f"Error: {e}"}


# ---------------------------
# Root Test Endpoint
# ---------------------------
@app.get("/")
def root():
    return {"status": "backend running"}
