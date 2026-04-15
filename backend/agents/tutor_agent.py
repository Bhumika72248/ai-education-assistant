import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from rag.retriever import get_retriever
from dotenv import load_dotenv

load_dotenv()

TUTOR_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are EduAI, a helpful and encouraging AI tutor.
Use the following course material to answer the student's question.
If the answer is not in the material, say so honestly and give a general answer.
Always explain step by step. End with a follow-up question to check understanding.

Course Material:
{context}

Student Question: {question}

Your Answer:"""
)


def _format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)


def get_tutor_chain():
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.3,
    )
    retriever = get_retriever(k=5)
    return (
        {"context": retriever | _format_docs, "question": RunnablePassthrough()}
        | TUTOR_PROMPT
        | llm
        | StrOutputParser()
    )
