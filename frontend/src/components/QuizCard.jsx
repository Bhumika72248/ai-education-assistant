export default function QuizCard({ question, index, selected, onAnswer }) {
  return (
    <div className="border rounded p-4 mb-3">
      <p className="font-medium mb-2">{index + 1}. {question.question}</p>
      <div className="space-y-1">
        {question.options?.map((opt, i) => {
          const letter = ["A", "B", "C", "D"][i];
          return (
            <button
              key={i}
              onClick={() => onAnswer?.(letter)}
              className={`block w-full text-left px-3 py-2 rounded border ${
                selected === letter ? "bg-indigo-100 border-indigo-400" : "hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
