from fastapi import APIRouter, UploadFile, File
from typing import List
from ai.embedding import get_embedding
from ai.similarity import compute_similarity
from ai.skills import extract_skills
from ai.scoring import final_score
from parser.pdf_parser import extract_text_from_pdf

router = APIRouter()

@router.post("/rank")
async def rank_resumes(
    resumes: List[UploadFile] = File(...),
    jd_text: str = File(...)
):
    jd_vec = get_embedding(jd_text)
    jd_skills = extract_skills(jd_text)
    
    results = []
    
    for resume in resumes:
        file_bytes = await resume.read()
        resume_text = extract_text_from_pdf(file_bytes)
        
        resume_vec = get_embedding(resume_text)
        similarity = compute_similarity(resume_vec, jd_vec)
        
        resume_skills = extract_skills(resume_text)
        score = final_score(similarity, resume_skills, jd_skills)
        
        results.append({
            "resume_name": resume.filename,
            "score": score,
            "matched_skills": list(set(resume_skills) & set(jd_skills)),
            "missing_skills": list(set(jd_skills) - set(resume_skills))
        })
        
    results.sort(key=lambda x:x["score"], reverse=True)

    return results