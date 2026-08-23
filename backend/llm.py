import json
import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

from prompts import (
    SYSTEM_PROMPT,
    JOB_EXTRACTION_PROMPT,
    MATCH_EXPLANATION_PROMPT
)


BASE_DIR = Path(__file__).resolve().parent

ENV_FILE = BASE_DIR / ".env"

load_dotenv(
    ENV_FILE,
    override=True
)


api_key = os.getenv(
    "GROQ_API_KEY"
)


if not api_key:

    raise ValueError(
        "GROQ_API_KEY is not set. "
        "Add it to backend/.env."
    )


client = Groq(
    api_key=api_key
)


MODEL = "openai/gpt-oss-120b"


def ask_groq(
    system_prompt: str,
    user_prompt: str
) -> str:

    response = client.chat.completions.create(

        model=MODEL,

        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],

        temperature=0
    )

    return response.choices[0].message.content


def extract_job_requirements(
    job_text: str
):

    prompt = (
        JOB_EXTRACTION_PROMPT
        + "\n"
        + job_text
    )

    response = client.chat.completions.create(

        model=MODEL,

        messages=[
            {
                "role": "system",
                "content": "Return only valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],

        response_format={
            "type": "json_object"
        },

        temperature=0
    )

    content = (
        response
        .choices[0]
        .message
        .content
    )

    return json.loads(content)


def explain_match(
    candidate_data,
    job_data,
    match_data
):

    prompt = MATCH_EXPLANATION_PROMPT.format(

        candidate=json.dumps(
            candidate_data,
            indent=2,
            ensure_ascii=False
        ),

        job=json.dumps(
            job_data,
            indent=2,
            ensure_ascii=False
        ),

        match=json.dumps(
            match_data,
            indent=2,
            ensure_ascii=False
        )
    )

    return ask_groq(
        SYSTEM_PROMPT,
        prompt
    )