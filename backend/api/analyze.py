from fastapi import APIRouter
from pydantic import BaseModel
from ai.embedding import get_embedding
from ai.similarity import compute_similarity
from ai.skills import extract_skills
from ai.scoring import final_score

router = APIRouter()

class AnalyzeRequest(BaseModel):
    resume_text: str
    jd_text: str
    
@router.post("/analyze")
def analyze(data: AnalyzeRequest):
    resume_vec = get_embedding(data.resume_text)
    jd_vec = get_embedding(data.jd_text)
    
    similarity = compute_similarity(resume_vec, jd_vec)
    
    resume_skills = extract_skills(data.resume_text)
    jd_skills = extract_skills(data.jd_text)
    
    score = final_score(similarity, resume_skills, jd_skills)
    
    return {
        "score":score,
        "matched_skills": list(set(resume_skills) & set(jd_skills)),
        "missing_skills": list(set(jd_skills) - set(resume_skills))
    }