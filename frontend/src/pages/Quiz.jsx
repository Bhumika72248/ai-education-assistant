import { useState } from "react";
import QuizCard from "../components/QuizCard";
import api from "../api/client";

export default function Quiz() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchQuiz() {
    if (!topic.trim()) return;
    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setResult(null);
    try {
      const res = await api.post(`/quiz/generate`, { topic, num_questions: 5, difficulty });
      setQuiz(res.data.quiz);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(questionId, answer) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  function submitQuiz() {
    if (!quiz?.questions) return;
    let correct = 0;
    quiz.questions.forEach((q) => {
      if ((answers[q.id] || "").toUpperCase() === q.correct.toUpperCase()) correct++;
    });
    const total = quiz.questions.length;
    const score = Math.round((correct / total) * 100);
    setResult({ correct, total, score });
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quiz Generator</h1>

      <div className="flex gap-2 mb-6">
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
        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
          onClick={fetchQuiz}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {quiz?.questions && !result && (
        <>
          {quiz.questions.map((q) => (
            <QuizCard
              key={q.id}
              question={q}
              index={q.id - 1}
              selected={answers[q.id]}
              onAnswer={(ans) => handleAnswer(q.id, ans)}
            />
          ))}
          <button
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded"
            onClick={submitQuiz}
          >
            Submit Quiz
          </button>
        </>
      )}

      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-2">
            Score: {result.score}% ({result.correct}/{result.total})
          </h2>
          <h3 className="font-semibold mt-4 mb-2">Explanations:</h3>
          {quiz.questions.map((q) => (
            <div key={q.id} className="mb-3 p-3 border rounded bg-white">
              <p className="font-medium">{q.id}. {q.question}</p>
              <p className="text-sm text-green-600 mt-1">Correct: {q.correct}</p>
              <p className="text-sm text-gray-500 mt-1">{q.explanation}</p>
            </div>
          ))}
          <button
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded"
            onClick={() => { setQuiz(null); setResult(null); setAnswers({}); }}
          >
            Try Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}
