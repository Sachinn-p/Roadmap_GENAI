import os
import time
from flask import Flask, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv
from flask_cors import CORS
import json
from db import MongoDBClient, get_db
from pdfExtraction import read_pdf

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

app = Flask(__name__)
CORS(app)

def upload_to_gemini(path, mime_type=None):
    file = genai.upload_file(path, mime_type=mime_type)
    print(f"Uploaded file '{file.display_name}' as: {file.uri}")
    return file

def wait_for_files_active(files):
    print("Waiting for file processing...")
    for name in (file.name for file in files):
        file = genai.get_file(name)
        while file.state.name == "PROCESSING":
            print(".", end="", flush=True)
            time.sleep(10)
            file = genai.get_file(name)
        if file.state.name != "ACTIVE":
            raise Exception(f"File {file.name} failed to process")
    print("...all files ready")

def generate_roadmap_from_pdf(file_path):
    files = [upload_to_gemini(file_path, mime_type="application/pdf")]
    wait_for_files_active(files)

    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json",
    }

    Prompt_Template = '''Generate a detailed roadmap in JSON format based on the following uploaded PDF file. The JSON structure should strictly follow the format below, ensuring that the keys remain unchanged and the structure is consistent. The roadmap should include course details and a list of units, each with a unit number, unit title, and a list of topics. Here is the expected JSON format:

                    {
                    \"roadMap\": {
                        \"course_name\": \"[Course Name]\",
                        \"roadmap\": [
                        {
                            \"topics\": [
                            \"[Topic 1]\",
                            \"[Topic 2]\",
                            \"[Topic 3]\",
                            ...
                            ],
                            \"unit_number\": \"[Unit Number]\",
                            \"unit_title\": \"[Unit Title]\"
                        },
                        {
                            \"topics\": [
                            \"[Topic 1]\",
                            \"[Topic 2]\",
                            \"[Topic 3]\",
                            ...
                            ],
                            \"unit_number\": \"[Unit Number]\",
                            \"unit_title\": \"[Unit Title]\"
                        },
                        ...
                        ]
                    }
                    }

                    Ensure that the keys 'roadMap', 'course_name', 'roadmap', 'topics', 'unit_number', and 'unit_title' are used exactly as shown. The content within the square brackets should be replaced with relevant information extracted from the PDF file.'''

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash-8b",
        generation_config=generation_config,
        system_instruction=Prompt_Template
    )

    chat_session = model.start_chat(history=[{"role": "user", "parts": [files[0]]}]) 
    response = chat_session.send_message("Generate a detailed roadmap in JSON format based on the uploaded document.")

    return response.text

@app.route('/submit-form', methods=['POST'])
def submit_form():
    name = request.form.get('name')
    career_interest = request.form.get('careerInterest')
    expertise = request.form.get('expertise')
    file1 = request.files.get('file1')
    file2 = request.files.get('file2')

    if not all([name, career_interest, expertise, file1, file2]):
        return jsonify({"error": "All fields are required"}), 400

    file2_path = os.path.join('uploads', file2.filename)
    file1_path = os.path.join('uploads', file1.filename)

    file2.save(file2_path)
    file1.save(file1_path)

    objective = read_pdf(file1_path)
    curriculum = generate_roadmap_from_pdf(file2_path)

    # Ensure curriculum is a valid dictionary
    if isinstance(curriculum, str):
        try:
            curriculum = json.loads(curriculum)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON response from generate_roadmap_from_pdf"}), 500

    if not isinstance(curriculum, dict):
        return jsonify({"error": "curriculum is not a valid dictionary"}), 400

    # Validate 'roadMap' structure
    if "roadMap" in curriculum and isinstance(curriculum["roadMap"], dict):
        course_name = curriculum["roadMap"].get("course_name", "N/A")
    else:
        return jsonify({"error": "Invalid structure for curriculum['roadMap']"}), 400

    # Save to MongoDB
    obj = MongoDBClient("mongodb://localhost:27017/", "education", "content")
    document = {
        "name": name,
        "career_interest": career_interest,
        "expertise": expertise,
        "objective": objective,
        "curriculum": curriculum
    }
    obj.create_documents([document])

    return jsonify({"message": "Roadmap generated successfully", "course_name": course_name}), 200


# Global variable to store the course name
course_name = "Operating Systems"  # Example course name, you can set this dynamically

@app.route('/api/roadmap', methods=['GET'])
def get_roadmap():
    """Expose the roadmap data for React frontend."""
    course_name = request.args.get("name")  # Use `args` for query parameters
    print(course_name)

    if not course_name:
        return jsonify({"error": "Course name is required."}), 400

    # Get the database and collection
    db = get_db()  # Get the MongoDB database
    content_collection = db["content"]  # Access the "content" collection

    # Retrieve documents for the specified course name
    documents = content_collection.find({
        "name": course_name
    })

    # Convert the cursor to a list
    documents = list(documents)

    if not documents:
        return jsonify({"error": f"No roadmap available for course: {course_name}"}), 404

    # Extract the first document (or modify this logic as needed)
    document = documents[0]

    # Access the roadmap data
    roadmap_data = document.get("curriculum", {}).get("roadMap", {})
    course_name = roadmap_data.get("course_name", "N/A")

    # Return the roadmap data to the frontend
    return jsonify({"course_name": course_name, "roadmap": roadmap_data})

@app.route('/getObj', methods=['GET'])
def get_obj():
    course_name = request.args.get("name")
    
    if not course_name:
        return jsonify({"error": "Course name is required."}), 400

    try:
        db = get_db()
        content_collection = db["content"]
        
        document = content_collection.find_one({"name": course_name})
        
        if not document:
            return jsonify({
                "error": f"No roadmap available for course: {course_name}"
            }), 404

        objective = document.get("objective", "")
        return jsonify({"objective": objective})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/video', methods=['GET'])
def get_video():
    import requests
    YOUTUBE_API_KEY = 'AIzaSyDPxEwwyD6JFXOreDotikYS_e6WXHKfB6s'
    YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'
    topic = request.args.get('topic')
    if not topic:
        return jsonify({'error': 'Topic parameter is required'}), 400
    
    params = {
        'part': 'snippet',
        'q': topic,
        'key': YOUTUBE_API_KEY,
        'maxResults': 1,
        'type': 'video'
    }
    
    response = requests.get(YOUTUBE_SEARCH_URL, params=params)
    data = response.json()
    
    if 'items' not in data or not data['items']:
        return jsonify({'error': 'No videos found for the topic'}), 404
    
    video_id = data['items'][0]['id']['videoId']
    video_url = f'https://www.youtube.com/watch?v={video_id}'
    
    return jsonify({'message': f'Video found for topic: {topic}', 'video_url': video_url})

def generate_syllabus_content(objectives, title):
    """
    Generate educational content using Google's Gemini Pro model.
    """
    prompt = f"""


You are an AI educator tasked with creating a comprehensive and engaging educational syllabus for the provided topic. The syllabus should align with the specified learning objectives and include detailed content in the form of an essay with relevant subheadings. Additionally, incorporate educational images with proper attribution to enhance understanding and engagement.

**Instructions:**

1. **Content Structure:**
   - Begin with an introduction to the topic, providing context and relevance.
   - Break the content into logical sections with clear subheadings.
   - Ensure the content flows naturally, building on concepts progressively.
   - Conclude with a summary or key takeaways.

2. **Learning Objectives Alignment:**
   - Ensure all provided learning objectives are addressed within the content.
   - Highlight how each section of the content contributes to achieving the objectives.



4. **Tone and Style:**
   - Use a professional yet accessible tone suitable for the target audience.
   - Avoid jargon unless necessary, and define any technical terms used.

5. **Additional Resources:**
   - Suggest supplementary materials (e.g., articles, videos, or interactive tools) for deeper exploration of the topic.

**Input Parameters:**

- **TITLE:** {title}
- **OBJECTIVES:** {objectives}

**Output Format:**

- A well-structured essay with subheadings, images, and links to reputable sources.  
- Ensure the content is engaging, informative, and aligned with the learning objectives.  
no image description or image link in the output.

  """
    
    # Initialize the model (using gemini-pro as it's the current stable version)
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    try:
        # Generate the content
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        return f"Error generating content: {str(e)}"

@app.route('/generate-content', methods=['POST'])
def generate_content():
    data = request.get_json() 
    objectives = data.get('objective', '')
    title = data.get('selectedTopic', '')
    print(objectives)
    print(title)

    response = generate_syllabus_content(objectives, title)
    return jsonify({'content': response})

@app.route('/explain', methods=['POST', 'OPTIONS'])
def explain_text():
    if request.method == 'OPTIONS':
        # Handle preflight requests
        return '', 204

    try:
        # Extract the text from the request
        data = request.json
        copied_text = data.get("text")

        # Check if the text is provided
        if not copied_text:
            return jsonify({"error": "No text provided"}), 400

        print(f"Received text: {copied_text}")

        # Call the Gemini API to generate an explanation
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(f"Explain this: {copied_text}")
            print(f"Generated explanation: {response.text}")

            # Return the generated explanation as JSON
            return jsonify({"explanation": response.text})

        except Exception as api_error:
            print(f"Error with Gemini API: {api_error}")
            return jsonify({"error": f"Gemini API error: {str(api_error)}"}), 500

    except Exception as e:
        print(f"General Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/translate', methods=['POST'])
def translate_text():
    try:
        # Extract the text and target language from the request
        data = request.json
        text = data.get("text")
        language = data.get("language")

        # Check if the text and language are provided
        if not text or not language:
            return jsonify({"error": "Text or language not provided"}), 400

        print(f"Received text: {text}")
        print(f"Target language: {language}")

        # Call the Gemini API to translate the text
        try:
            model = genai.GenerativeModel('gemini-pro')  # Use 'gemini-pro' for better results
            prompt = f"Translate the following text to {language}: {text}. Provide only the translated text without any additional explanations."
            response = model.generate_content(prompt)
            print(f"Translated text: {response.text}")

            # Extract only the translated text (remove any extra formatting)
            translated_text = response.text.strip()

            # Return the translated text as JSON
            return jsonify({"translation": translated_text})

        except Exception as api_error:
            print(f"Error with Gemini API: {api_error}")
            return jsonify({"error": f"Gemini API error: {str(api_error)}"}), 500

    except Exception as e:
        print(f"General Error: {str(e)}")
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)