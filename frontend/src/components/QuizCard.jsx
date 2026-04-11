import { useState } from "react";

export default function QuizCard({ question, index }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="border rounded p-4 mb-3">
      <p className="font-medium mb-2">{index + 1}. {question.text}</p>
      <div className="space-y-1">
        {question.options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`block w-full text-left px-3 py-2 rounded border ${
              selected === i ? "bg-blue-100 border-blue-400" : "hover:bg-gray-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
