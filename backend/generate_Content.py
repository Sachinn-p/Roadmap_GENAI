# Function to generate AI-based content for syllabus topics
def generate_syllabus_content(objectives, syllabus):
    prompt = f"""
    You are an AI educator. Your task is to generate educational content for a syllabus based on the provided learning objectives.

    OBJECTIVES:
    {objectives}

    SYLLABUS:
    {syllabus}

    Generate detailed content for each topic in the syllabus, ensuring it aligns with the given objectives.
    """
    response = genai.generate_text(prompt)
    return response.text