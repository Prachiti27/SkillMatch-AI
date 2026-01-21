SKILLS = [
    "python","java","c++","sql","react","fastapi","docker","ml","nlp"
]

def extract_skills(text: str):
    text = text.lower()
    return [skill for skill in SKILLS if skill in text]