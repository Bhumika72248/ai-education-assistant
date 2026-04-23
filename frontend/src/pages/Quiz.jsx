import { useState } from "react";
import QuizCard from "../components/QuizCard";
import api from "../api/client";

export default function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchQuiz() {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const { data } = await api.post("/quiz/generate", {
        topic,
        num_questions: 5,
        difficulty,
      });
      setQuiz(data.quiz);
    } finally {
      setLoading(false);
    }
  }

  function getUserId() {
    const value = localStorage.getItem("user_id");
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  async function submitQuiz() {
    if (!quiz?.questions?.length) return;
    const { data } = await api.post("/quiz/submit", {
      topic: quiz.topic || topic,
      user_id: getUserId(),
      answers,
      questions: quiz.questions,
    });
    setResult(data);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Enter topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={fetchQuiz} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
      {quiz?.questions?.map((q, i) => (
        <QuizCard
          key={q.id ?? i}
          question={q}
          index={i}
          selected={answers[String(q.id)]}
          onSelect={(value) => setAnswers((prev) => ({ ...prev, [String(q.id)]: value }))}
        />
      ))}

      {quiz?.questions?.length ? (
        <button className="px-4 py-2 mt-4 bg-green-600 text-white rounded" onClick={submitQuiz}>
          Submit Quiz
        </button>
      ) : null}

      {result ? (
        <div className="mt-4 border rounded p-4 bg-green-50">
          <p className="font-semibold">Score: {result.score}%</p>
          <p>Correct: {result.correct} / {result.total}</p>
        </div>
      ) : null}
    </div>
  );
}
