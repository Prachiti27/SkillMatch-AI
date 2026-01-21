def final_score(similarity, resume_skills, jd_skills):
    if not jd_skills:
        return float(round(similarity*100, 2))
    
    overlap = len(set(resume_skills) & set(jd_skills))
    skill_score = overlap / len(jd_skills)
    
    score = (0.6*similarity) + (0.4*skill_score)
    return float(round(score*100, 2))