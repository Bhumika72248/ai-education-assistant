import { useState } from "react";
import api from "../api/client";

export default function Assignment() {
  const [title, setTitle] = useState("");
  const [answer, setAnswer] = useState("");
  const [rubric, setRubric] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function evaluate() {
    if (!title.trim() || !answer.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/assignment/evaluate", {
        title,
        student_answer: answer,
        rubric: rubric || null,
      }, { params: { user_id: localStorage.getItem("user_id") || 1 } });
      setResult(res.data.evaluation);
    } finally {
      setLoading(false);
    }
  }

  const gradeColor = {
    A: "bg-green-100 text-green-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-yellow-100 text-yellow-700",
    D: "bg-orange-100 text-orange-700",
    F: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Assignment Evaluator</h1>

      <div className="space-y-3 mb-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="Assignment title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 rounded w-full h-40"
          placeholder="Write your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <textarea
          className="border p-2 rounded w-full h-20"
          placeholder="Rubric / expected answer (optional)..."
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
        />
        <button
          className="px-6 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
          onClick={evaluate}
          disabled={loading}
        >
          {loading ? "Evaluating..." : "Evaluate"}
        </button>
      </div>

      {result && (
        <div className="border rounded p-4 bg-gray-50 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{result.score}/{result.max_score}</span>
            <span className={`px-3 py-1 rounded-full font-semibold text-sm ${gradeColor[result.grade] || "bg-gray-100"}`}>
              Grade: {result.grade}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-green-700 mb-1">Strengths</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {result.strengths?.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-red-600 mb-1">Improvements</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {result.improvements?.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Detailed Feedback</h3>
            <p className="text-sm text-gray-700">{result.detailed_feedback}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Rewrite Suggestion</h3>
            <p className="text-sm text-gray-600 italic">{result.rewrite_suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
