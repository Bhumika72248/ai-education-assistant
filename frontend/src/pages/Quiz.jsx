import { useState } from "react";
import QuizCard from "../components/QuizCard";

export default function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [topic, setTopic] = useState("");

  async function fetchQuiz() {
    const res = await fetch(`/quiz/generate?topic=${topic}&num_questions=5`, { method: "POST" });
    const data = await res.json();
    setQuiz(data.quiz);
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
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={fetchQuiz}>
          Generate
        </button>
      </div>
      {quiz && quiz.map((q, i) => <QuizCard key={i} question={q} index={i} />)}
    </div>
  );
}
