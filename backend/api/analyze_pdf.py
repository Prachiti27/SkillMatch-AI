from fastapi import APIRouter, UploadFile, File
from ai.embedding import get_embedding
from ai.similarity import compute_similarity
from ai.skills import extract_skills
from ai.scoring import final_score
from parser.pdf_parser import extract_text_from_pdf

router = APIRouter()

@router.post("/analyzepdf")
async def analyze_pdf(
    resume: UploadFile = File(...),
    jd_text: str = File(...)
):
    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes)
    
    resume_vec = get_embedding(resume_text)
    jd_vec = get_embedding(jd_text)
    
    similarity = compute_similarity(resume_vec, jd_vec)
    
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(jd_text)
    
    score = final_score(similarity, resume_skills, jd_skills)
    
    return {
        "score": score,
        "matched_skills": list(set(resume_skills) & set(jd_skills)),
        "missing_skills": list(set(jd_skills) - set(resume_skills))
    }