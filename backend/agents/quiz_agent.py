import os
import json
import re
import google.generativeai as genai
from langchain_groq import ChatGroq
from models.schemas import QuizSubmission
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.0-flash"
GROQ_MODEL = "llama-3.3-70b-versatile"

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
    groq_llm = ChatGroq(model=GROQ_MODEL, api_key=os.getenv("GROQ_API_KEY"), temperature=0.7)
    
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
        response = groq_llm.invoke(prompt)
        return json.loads(clean_json_response(response.content))
    except json.JSONDecodeError:
        try:
            response = groq_llm.invoke(prompt)
            return json.loads(clean_json_response(response.content))
        except Exception as e:
            print(f"Fallback to mock quiz due to error: {e}")
            return MOCK_QUIZ[:num_questions]
    except Exception as e:
        print(f"Fallback to mock quiz due to error: {e}")
        return MOCK_QUIZ[:num_questions]

async def generate_youtube_quiz(url: str):
    parsed = urlparse(url)
    video_id = None
    if parsed.hostname and ("youtube.com" in parsed.hostname):
        qs = parse_qs(parsed.query)
        vid_list = qs.get("v")
        if vid_list:
            video_id = vid_list[0]
    if not video_id and parsed.hostname and ("youtu.be" in parsed.hostname):
        video_id = parsed.path.lstrip("/")
    if not video_id:
        m = re.search(r"([0-9A-Za-z_-]{11})", url)
        if m:
            video_id = m.group(1)

    if not video_id:
        raise ValueError("Invalid YouTube URL or unable to extract video id")

    transcript = None
    error_msg = None
    
    # Try to get transcript using the correct API
    try:
        print(f"🔍 Attempting to fetch transcript for video {video_id}...")
        api = YouTubeTranscriptApi()
        
        # Try English first
        try:
            result = api.fetch(video_id, languages=['en'])
            transcript_data = result.to_raw_data()
            transcript = " ".join([t.get("text", "") for t in transcript_data])
            print(f"✅ Successfully retrieved English transcript for video {video_id} ({len(transcript)} characters)")
        except NoTranscriptFound:
            # Try without language restriction (any available language)
            print(f"⚠️ No English transcript, trying any available language...")
            try:
                result = api.fetch(video_id)
                transcript_data = result.to_raw_data()
                transcript = " ".join([t.get("text", "") for t in transcript_data])
                print(f"✅ Retrieved transcript in alternate language for video {video_id} ({len(transcript)} characters)")
            except Exception as e:
                error_msg = f"No transcript available: {str(e)[:100]}"
                print(f"⚠️ Could not retrieve any transcript for video {video_id}: {e}")
    except TranscriptsDisabled:
        error_msg = "Transcripts are disabled for this video"
        print(f"⚠️ Transcripts disabled for video {video_id}")
    except VideoUnavailable:
        error_msg = "Video is unavailable or private"
        print(f"⚠️ Video {video_id} is unavailable")
    except Exception as e:
        # Catch all other exceptions (including IP blocks, network errors, etc.)
        error_msg = f"Could not retrieve transcript: {str(e)[:100]}"
        print(f"⚠️ Exception for video {video_id}: {e}")
    
    # If transcript retrieval failed, use AI to generate quiz
    if not transcript or error_msg:
        print(f"🔄 Generating fallback quiz for video {video_id}")
        groq_llm = ChatGroq(model=GROQ_MODEL, api_key=os.getenv("GROQ_API_KEY"), temperature=0.7)
        fallback_prompt = """Generate a 5-question multiple choice quiz about general computer science and programming topics suitable for students.

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
            response = groq_llm.invoke(fallback_prompt)
            quiz = json.loads(clean_json_response(response.content))
            return {"quiz": quiz, "note": f"⚠️ Could not retrieve video transcript. Generated a general educational quiz instead."}
        except Exception as e:
            print(f"⚠️ Fallback AI generation failed: {e}. Using mock quiz.")
            return {"quiz": MOCK_QUIZ[:5], "note": "⚠️ Could not retrieve transcript. Using sample quiz."}

    # Successfully got transcript - generate quiz from it
    print(f"✅ Generating quiz from transcript for video {video_id}")
    transcript = transcript[:4000]

    groq_llm = ChatGroq(model=GROQ_MODEL, api_key=os.getenv("GROQ_API_KEY"), temperature=0.7)
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
        response = groq_llm.invoke(prompt)
        quiz = json.loads(clean_json_response(response.content))
        return {"quiz": quiz}
    except json.JSONDecodeError:
        try:
            response = groq_llm.invoke(prompt)
            quiz = json.loads(clean_json_response(response.content))
            return {"quiz": quiz}
        except Exception as e:
            print(f"⚠️ Quiz generation from transcript failed: {e}. Using mock quiz.")
            return {"quiz": MOCK_QUIZ[:5]}
    except Exception as e:
        print(f"⚠️ Quiz generation failed: {e}. Using mock quiz.")
        return {"quiz": MOCK_QUIZ[:5]}

async def generate_exam_quiz(exam: str, section: str, num_questions: int = 5) -> dict:
    groq_llm = ChatGroq(model=GROQ_MODEL, api_key=os.getenv("GROQ_API_KEY"), temperature=0.7)
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
        response = groq_llm.invoke(prompt)
        questions = json.loads(clean_json_response(response.content))
    except json.JSONDecodeError:
        try:
            response = groq_llm.invoke(prompt)
            questions = json.loads(clean_json_response(response.content))
        except Exception as e:
            print(f"Fallback to mock exam due to error: {e}")
            questions = MOCK_QUIZ[:num_questions]
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
