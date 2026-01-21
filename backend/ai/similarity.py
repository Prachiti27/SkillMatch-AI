from sklearn.metrics.pairwise import cosine_similarity

def compute_similarity(vec1, vec2)->float:
    sim = cosine_similarity([vec1], [vec2])[0][0]
    return float(sim)