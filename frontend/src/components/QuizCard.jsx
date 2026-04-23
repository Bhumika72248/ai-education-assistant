import { useState } from "react";

export default function QuizCard({ question, index, selected, onSelect }) {
  const [localSelected, setLocalSelected] = useState(null);

  const active = selected ?? localSelected;

  function pickOption(optionValue) {
    const normalized = String(optionValue).trim();
    const letter = normalized.charAt(0).toUpperCase();
    if (onSelect) {
      onSelect(letter);
      return;
    }
    setLocalSelected(letter);
  }

  return (
    <div className="border rounded p-4 mb-3">
      <p className="font-medium mb-2">{index + 1}. {question.question || question.text}</p>
      <div className="space-y-1">
        {question.options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => pickOption(opt)}
            className={`block w-full text-left px-3 py-2 rounded border ${
              active === String(opt).trim().charAt(0).toUpperCase()
                ? "bg-blue-100 border-blue-400"
                : "hover:bg-gray-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
