import os
import json
import re
import google.generativeai as genai
from models.schemas import QuizSubmission
from youtube_transcript_api import YouTubeTranscriptApi
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use the latest model as requested in previous conversations
MODEL_NAME = "gemini-2.0-flash"

MOCK_QUIZ = [
    {
        "id": 1,
        "question": "What is the primary function of a CPU?",
        "options": ["Store data permanently", "Execute instructions", "Display images", "Connect to the internet"],
        "correct": "B",
        "explanation": "The CPU (Central Processing Unit) executes instructions that make up a computer program.",
        "difficulty_level": "easy"
    },
    {
        "id": 2,
        "question": "Which of these is a statically typed language?",
        "options": ["Python", "JavaScript", "Ruby", "Java"],
        "correct": "D",
        "explanation": "Java requires variable types to be explicitly declared and checked at compile-time.",
        "difficulty_level": "medium"
    },
    {
        "id": 3,
        "question": "What does API stand for?",
        "options": ["Application Programming Interface", "Advanced Protocol Integration", "Automated Process Instance", "Application Process Interface"],
        "correct": "A",
        "explanation": "API stands for Application Programming Interface.",
        "difficulty_level": "easy"
    },
    {
        "id": 4,
        "question": "What is the time complexity of searching an element in a Hash Table?",
        "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        "correct": "D",
        "explanation": "Hash tables provide average O(1) time complexity for search operations.",
        "difficulty_level": "hard"
    },
    {
        "id": 5,
        "question": "Which data structure uses LIFO (Last In, First Out)?",
        "options": ["Queue", "Tree", "Stack", "Graph"],
        "correct": "C",
        "explanation": "A Stack operates on the Last In, First Out (LIFO) principle.",
        "difficulty_level": "medium"
    }
]

def clean_json_response(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

async def generate_quiz(topic: str, num_questions: int = 5, difficulty: str = "medium", adaptive: bool = False) -> list:
    model = genai.GenerativeModel(MODEL_NAME)
    
    adaptive_instruction = ""
    if adaptive:
        adaptive_instruction = "Generate questions in order of increasing difficulty from easy to hard. The difficulty_level field should reflect this progression."
    else:
        adaptive_instruction = f"All questions should be of {difficulty} difficulty."

    prompt = f"""Generate a multiple choice quiz about "{topic}".
I need {num_questions} questions.
{adaptive_instruction}

Respond STRICTLY with a valid JSON array of objects. Do not include markdown formatting or any preamble.
Each object must have exactly these keys:
- "id": an integer starting from 1
- "question": the question text
- "options": an array of 4 strings, representing options A, B, C, D in order
- "correct": a single character "A", "B", "C", or "D"
- "explanation": a brief explanation of why the answer is correct
- "difficulty_level": a string ("easy", "medium", or "hard")

JSON array:"""
    
    try:
        response = model.generate_content(prompt)
        try:
            return json.loads(clean_json_response(response.text))
        except json.JSONDecodeError:
            response = model.generate_content(prompt)
            return json.loads(clean_json_response(response.text))
    except Exception as e:
        print(f"Fallback to mock quiz due to error: {e}")
        return MOCK_QUIZ[:num_questions]

async def generate_youtube_quiz(url: str) -> list:
    video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    if not video_id_match:
        raise ValueError("Invalid YouTube URL")
    
    video_id = video_id_match.group(1)
    
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([t['text'] for t in transcript_list])
    except Exception:
        raise ValueError("This video does not have captions enabled. Try another video.")

    transcript = transcript[:4000]

    model = genai.GenerativeModel(MODEL_NAME)
    prompt = f"""Generate a 5-question multiple choice quiz based strictly on the following video transcript. Do not use generic knowledge, use only what is explained in this transcript.

Transcript:
{transcript}

Respond STRICTLY with a valid JSON array of objects. Do not include markdown formatting or any preamble.
Each object must have exactly these keys:
- "id": an integer starting from 1
- "question": the question text
- "options": an array of 4 strings, representing options A, B, C, D in order
- "correct": a single character "A", "B", "C", or "D"
- "explanation": a brief explanation of why the answer is correct
- "difficulty_level": "medium"

JSON array:"""
    
    try:
        response = model.generate_content(prompt)
        try:
            return json.loads(clean_json_response(response.text))
        except json.JSONDecodeError:
            response = model.generate_content(prompt)
            return json.loads(clean_json_response(response.text))
    except Exception as e:
        print(f"Fallback to mock quiz due to error: {e}")
        return MOCK_QUIZ[:5]

async def generate_exam_quiz(exam: str, section: str, num_questions: int = 5) -> dict:
    model = genai.GenerativeModel(MODEL_NAME)
    prompt = f"""Generate a {num_questions}-question multiple choice quiz for the "{exam}" exam, specifically for the "{section}" section.
The questions must be strictly in the style, pattern, difficulty level, and format of the real {exam} exam.

Respond STRICTLY with a valid JSON array of objects. Do not include markdown formatting or any preamble.
Each object must have exactly these keys:
- "id": an integer starting from 1
- "question": the question text
- "options": an array of 4 strings, representing options A, B, C, D in order
- "correct": a single character "A", "B", "C", or "D"
- "explanation": a brief explanation of why the answer is correct
- "difficulty_level": a string based on the exam's typical difficulty

JSON array:"""
    
    try:
        response = model.generate_content(prompt)
        try:
            questions = json.loads(clean_json_response(response.text))
        except json.JSONDecodeError:
            response = model.generate_content(prompt)
            questions = json.loads(clean_json_response(response.text))
    except Exception as e:
        print(f"Fallback to mock exam due to error: {e}")
        questions = MOCK_QUIZ[:num_questions]
        
    resources = [
        {
            "name": f"PrepInsta {exam} Page",
            "description": f"Comprehensive guide and practice questions for {exam}.",
            "url": "https://prepinsta.com/"
        },
        {
            "name": "IndiaBix Aptitude",
            "description": "Great resource for general aptitude and reasoning.",
            "url": "https://www.indiabix.com/"
        }
    ]
    
    return {"quiz": questions, "resources": resources}

async def evaluate_quiz(submission: QuizSubmission) -> dict:
    return {"score": 0, "total": len(submission.answers)}
