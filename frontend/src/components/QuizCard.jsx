import { useState, useEffect } from "react";

export default function QuizCard({ question, index, total, onNext }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(null);
  }, [question]);

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const getOptionLetter = (idx) => String.fromCharCode(65 + idx);
  const isCorrectSelection = selected !== null && getOptionLetter(selected) === question.correct;

  return (
    <div className="card fade-in" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span className="tag" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
          Question {index + 1} of {total}
        </span>
        <span className="tag" style={{ background: "#f3f4f6", color: "var(--text-secondary)", textTransform: "uppercase", fontSize: 10 }}>
          {question.difficulty_level || "Medium"}
        </span>
      </div>
      
      <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20, lineHeight: 1.4 }}>
        {question.question}
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options?.map((opt, i) => {
          const letter = getOptionLetter(i);
          const isCorrectOption = letter === question.correct;
          const isSelected = selected === i;
          
          let bg = "var(--surface)";
          let borderColor = "var(--border)";
          let color = "var(--text-primary)";

          if (selected !== null) {
            if (isCorrectOption) {
              bg = "var(--green-light)";
              borderColor = "var(--green)";
              color = "#065f46";
            } else if (isSelected) {
              bg = "var(--red-light)";
              borderColor = "var(--red)";
              color = "#991b1b";
            } else {
              bg = "#f9fafb";
              borderColor = "var(--border)";
              color = "var(--text-secondary)";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", borderRadius: 10,
                border: `1px solid ${borderColor}`,
                background: bg,
                color: color,
                cursor: selected === null ? "pointer" : "default",
                textAlign: "left",
                fontSize: 15,
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => { if (selected === null) e.currentTarget.style.background = "var(--accent-light)"; }}
              onMouseLeave={e => { if (selected === null) e.currentTarget.style.background = "var(--surface)"; }}
            >
              <span style={{ 
                fontWeight: 600, 
                background: selected !== null && isCorrectOption ? "var(--green)" : selected !== null && isSelected ? "var(--red)" : "var(--border)",
                color: selected !== null && (isCorrectOption || isSelected) ? "white" : "var(--text-secondary)",
                padding: "2px 8px", borderRadius: 6, fontSize: 13
              }}>
                {letter}
              </span> 
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      
      {selected !== null && (
        <div className="fade-in" style={{ marginTop: 24 }}>
          <div style={{ 
            padding: 16, borderRadius: 10, 
            background: isCorrectSelection ? "var(--green-light)" : "var(--red-light)",
            border: `1px solid ${isCorrectSelection ? "var(--green)" : "var(--red)"}`,
            marginBottom: 20
          }}>
            <h4 style={{ margin: "0 0 6px", color: isCorrectSelection ? "#065f46" : "#991b1b", fontWeight: 600 }}>
              {isCorrectSelection ? "✨ Excellent! That is correct." : "💡 Not quite right."}
            </h4>
            <p style={{ margin: 0, fontSize: 14, color: isCorrectSelection ? "#065f46" : "#991b1b", lineHeight: 1.5 }}>
              {question.explanation}
            </p>
          </div>
          
          <button 
            className="btn-primary"
            onClick={() => onNext(isCorrectSelection)}
            style={{ width: "100%", padding: "14px", fontSize: 15 }}
          >
            {index === total - 1 ? "See Final Results" : "Next Question"} →
          </button>
        </div>
      )}
    </div>
  );
}
