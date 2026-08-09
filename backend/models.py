from pydantic import BaseModel
from typing import List, Optional


class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []


class JobRequirement(BaseModel):
    skill: str
    required: bool = True
    category: str = "skill"


class JobRequirements(BaseModel):
    job_title: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    minimum_experience_years: Optional[float] = None
    education_requirements: List[str] = []
    other_requirements: List[str] = []


class MatchResult(BaseModel):
    score: float
    verdict: str

    matched_skills: List[str]
    missing_required_skills: List[str]
    missing_preferred_skills: List[str]

    experience_match: bool
    education_match: bool

    strengths: List[str]
    concerns: List[str]
    explanation: str