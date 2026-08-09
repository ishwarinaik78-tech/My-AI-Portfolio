from typing import List, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):

    message: str

    history: List[dict] = Field(
        default_factory=list
    )


class JobRequirement(BaseModel):

    skill: str

    required: bool = True

    category: str = "skill"


class JobRequirements(BaseModel):

    job_title: Optional[str] = None

    required_skills: List[str] = Field(
        default_factory=list
    )

    preferred_skills: List[str] = Field(
        default_factory=list
    )

    minimum_experience_years: Optional[float] = None

    education_requirements: List[str] = Field(
        default_factory=list
    )

    other_requirements: List[str] = Field(
        default_factory=list
    )


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