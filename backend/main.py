import json
import shutil
from pathlib import Path

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import FileResponse

from models import ChatRequest

from parser import read_document

from llm import (
    ask_groq,
    extract_job_requirements,
    explain_match
)

from matcher import calculate_match

from prompts import SYSTEM_PROMPT


BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "data"

UPLOAD_DIR = BASE_DIR / "uploads"

PROFILE_FILE = DATA_DIR / "profile.json"

RESUME_FILE = DATA_DIR / "latest_resume.pdf"


DATA_DIR.mkdir(
    exist_ok=True
)

UPLOAD_DIR.mkdir(
    exist_ok=True
)


app = FastAPI(
    title="AI Portfolio Assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://my-ai-portfolio-snowy.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_profile():

    if not PROFILE_FILE.exists():

        raise HTTPException(
            status_code=404,
            detail="Profile data not found."
        )

    try:

        with open(
            PROFILE_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=500,
            detail="profile.json contains invalid JSON."
        )


@app.get("/")
def root():

    return {
        "message": "AI Portfolio Assistant API is running"
    }


@app.get("/api/profile")
def get_profile():

    return load_profile()


@app.get("/api/resume")
def download_resume():

    if not RESUME_FILE.exists():

        raise HTTPException(
            status_code=404,
            detail="Resume not found."
        )

    return FileResponse(
        path=RESUME_FILE,
        media_type="application/pdf",
        filename="Ishwari-Resume.pdf"
    )


@app.post("/api/chat")
def chat(request: ChatRequest):

    if not request.message.strip():

        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    profile = load_profile()

    profile_text = json.dumps(
        profile,
        indent=2,
        ensure_ascii=False
    )

    user_prompt = f"""
Here is the verified candidate information:

{profile_text}

Previous conversation:

{json.dumps(request.history, indent=2, ensure_ascii=False)}

User's new question:

{request.message}

Answer the question using ONLY the verified candidate information.

Important:

- Use the actual values from the candidate profile.
- If the user asks for GitHub, return the actual GitHub URL from links.github.
- If the user asks for LinkedIn, return the actual LinkedIn URL from links.linkedin.
- If the user asks for projects, include ALL projects from the projects array.
- Never use placeholders such as YOUR_GITHUB_URL or YOUR_LINKEDIN_URL.
- Never invent information.
"""

    try:

        answer = ask_groq(
            SYSTEM_PROMPT,
            user_prompt
        )

        return {
            "answer": answer
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"AI request failed: {str(error)}"
        )


@app.post("/api/analyze-job")
async def analyze_job(
    file: UploadFile = File(...)
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    allowed_extensions = [
        ".pdf",
        ".docx",
        ".txt"
    ]

    original_filename = Path(
        file.filename
    ).name

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail="Upload PDF, DOCX or TXT only."
        )

    saved_file = (
        UPLOAD_DIR
        / original_filename
    )

    try:

        with open(
            saved_file,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        job_text = read_document(
            str(saved_file)
        )

        if not job_text.strip():

            raise HTTPException(
                status_code=400,
                detail="Could not extract text from document."
            )

        job_requirements = (
            extract_job_requirements(
                job_text
            )
        )

        profile = load_profile()

        match = calculate_match(
            profile,
            job_requirements
        )

        explanation = explain_match(
            profile,
            job_requirements,
            match
        )

        match["explanation"] = explanation

        return {
            "job": job_requirements,
            "match": match
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Job analysis failed: {str(error)}"
        )

    finally:

        try:

            if saved_file.exists():
                saved_file.unlink()

        except Exception:
            pass


@app.get("/api/health")
def health():

    return {
        "status": "healthy"
    }