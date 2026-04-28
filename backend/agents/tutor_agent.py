import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

load_dotenv()

TUTOR_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""You are EduAI, a helpful and encouraging AI tutor.
Answer the student's question clearly and concisely.
Always explain step by step. End with a follow-up question to check understanding.

Student Question: {question}

Your Answer:"""
)


def get_tutor_chain():
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        groq_api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.3,
    )
    return TUTOR_PROMPT | llm | StrOutputParser()
