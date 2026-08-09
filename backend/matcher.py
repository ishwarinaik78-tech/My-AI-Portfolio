import re


def normalize(text):
    return re.sub(
        r"[^a-z0-9+#.]",
        "",
        text.lower()
    )


def find_skill_match(
    required_skill,
    candidate_skills
):

    required = normalize(required_skill)

    for skill in candidate_skills:

        candidate = normalize(skill)

        if required == candidate:
            return True

        if required in candidate:
            return True

        if candidate in required:
            return True

    return False


def calculate_match(candidate, job):

    candidate_skills = (
        candidate.get("skills", [])
        + candidate.get("programming_languages", [])
        + candidate.get("frameworks", [])
    )

    required_skills = job.get(
        "required_skills",
        []
    )

    preferred_skills = job.get(
        "preferred_skills",
        []
    )

    matched_required = []

    missing_required = []

    for skill in required_skills:

        if find_skill_match(
            skill,
            candidate_skills
        ):
            matched_required.append(skill)

        else:
            missing_required.append(skill)

    matched_preferred = []

    missing_preferred = []

    for skill in preferred_skills:

        if find_skill_match(
            skill,
            candidate_skills
        ):
            matched_preferred.append(skill)

        else:
            missing_preferred.append(skill)

    total_required = len(required_skills)

    if total_required:
        required_score = (
            len(matched_required)
            / total_required
        ) * 70
    else:
        required_score = 70

    total_preferred = len(preferred_skills)

    if total_preferred:
        preferred_score = (
            len(matched_preferred)
            / total_preferred
        ) * 20
    else:
        preferred_score = 20

    experience_match = True

    required_experience = job.get(
        "minimum_experience_years"
    )

    candidate_experience = candidate.get(
        "total_experience_years"
    )

    if required_experience is not None:

        if candidate_experience is None:
            experience_match = False

        else:
            experience_match = (
                candidate_experience
                >= required_experience
            )

    education_match = True

    education_requirements = job.get(
        "education_requirements",
        []
    )

    candidate_education = candidate.get(
        "education",
        []
    )

    if education_requirements:

        candidate_text = " ".join(
            str(item)
            for item in candidate_education
        ).lower()

        education_match = all(
            requirement.lower()
            in candidate_text
            for requirement
            in education_requirements
        )

    score = required_score + preferred_score

    if experience_match:
        score += 5

    if education_match:
        score += 5

    score = round(
        min(score, 100),
        2
    )

    if missing_required:
        verdict = "Not currently a strong match"

    elif score >= 80:
        verdict = "Strong match"

    elif score >= 60:
        verdict = "Potential match"

    else:
        verdict = "Weak match"

    strengths = []

    if matched_required:
        strengths.append(
            "Matches required skills: "
            + ", ".join(matched_required)
        )

    if matched_preferred:
        strengths.append(
            "Matches preferred skills: "
            + ", ".join(matched_preferred)
        )

    concerns = []

    if missing_required:
        concerns.append(
            "Missing required skills: "
            + ", ".join(missing_required)
        )

    if missing_preferred:
        concerns.append(
            "Missing preferred skills: "
            + ", ".join(missing_preferred)
        )

    if not experience_match:
        concerns.append(
            "Minimum experience requirement "
            "is not satisfied."
        )

    if not education_match:
        concerns.append(
            "Education requirement may not be satisfied."
        )

    return {
        "score": score,
        "verdict": verdict,
        "matched_skills": matched_required,
        "missing_required_skills": missing_required,
        "missing_preferred_skills": missing_preferred,
        "experience_match": experience_match,
        "education_match": education_match,
        "strengths": strengths,
        "concerns": concerns
    }