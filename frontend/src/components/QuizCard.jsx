import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizCard({ question, index, total, onNext }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => { setSelected(null); }, [question]);

  const getOptionLetter = (idx) => String.fromCharCode(65 + idx);
  const isCorrectSelection = selected !== null && getOptionLetter(selected) === question.correct;

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const difficultyColor = {
    easy:   { bg: "rgba(5,150,105,0.1)",  color: "#059669" },
    medium: { bg: "rgba(217,119,6,0.1)",  color: "#d97706" },
    hard:   { bg: "rgba(220,38,38,0.1)",  color: "#dc2626" },
  };
  const diff = (question.difficulty_level || "medium").toLowerCase();
  const dc   = difficultyColor[diff] || difficultyColor.medium;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: 20 }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            padding: "5px 12px", borderRadius: 20,
            background: "rgba(110,72,170,0.1)", color: "#6E48AA",
            fontSize: 12, fontWeight: 600,
          }}>
            {index + 1} / {total}
          </span>
          <span style={{
            padding: "5px 12px", borderRadius: 20,
            background: dc.bg, color: dc.color,
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {question.difficulty_level || "Medium"}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ width: 100, height: 4, background: "rgba(110,72,170,0.1)", borderRadius: 99, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ height: "100%", background: "linear-gradient(135deg, #6E48AA, #9D50BB)", borderRadius: 99 }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 style={{
        fontSize: 18, fontWeight: 700, color: "#1A0B42",
        marginBottom: 24, lineHeight: 1.5, letterSpacing: "-0.01em",
      }}>
        {question.question}
      </h3>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {question.options?.map((opt, i) => {
          const letter       = getOptionLetter(i);
          const isCorrectOpt = letter === question.correct;
          const isSelected   = selected === i;

          let bg          = "rgba(255,255,255,0.8)";
          let borderColor = "rgba(110,72,170,0.12)";
          let color       = "#1A0B42";
          let letterBg    = "rgba(110,72,170,0.08)";
          let letterColor = "var(--text-secondary)";

          if (selected !== null) {
            if (isCorrectOpt) {
              bg = "rgba(5,150,105,0.1)"; borderColor = "rgba(5,150,105,0.35)";
              color = "#059669"; letterBg = "#059669"; letterColor = "#FFFFFF";
            } else if (isSelected) {
              bg = "rgba(220,38,38,0.08)"; borderColor = "rgba(220,38,38,0.35)";
              color = "#dc2626"; letterBg = "#dc2626"; letterColor = "#FFFFFF";
            } else {
              bg = "rgba(248,249,255,0.5)"; color = "var(--text-muted)";
            }
          }

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              whileHover={selected === null ? { x: 6, borderColor: "rgba(110,72,170,0.35)", background: "rgba(110,72,170,0.06)" } : {}}
              whileTap={selected === null ? { scale: 0.99 } : {}}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 18px", borderRadius: 14,
                border: `1px solid ${borderColor}`,
                background: bg, color,
                cursor: selected === null ? "pointer" : "default",
                textAlign: "left", fontSize: 14,
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s ease", width: "100%",
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: letterBg, color: letterColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, transition: "all 0.2s ease",
              }}>
                {letter}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
              {selected !== null && isCorrectOpt && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 18 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></motion.span>
              )}
              {selected !== null && isSelected && !isCorrectOpt && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 18 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: 20 }}
          >
            <div style={{
              padding: "16px 20px", borderRadius: 14,
              background: isCorrectSelection ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)",
              border: `1px solid ${isCorrectSelection ? "rgba(5,150,105,0.25)" : "rgba(220,38,38,0.25)"}`,
              marginBottom: 16,
            }}>
                <h4 style={{
                margin: "0 0 8px",
                color: isCorrectSelection ? "#059669" : "#dc2626",
                fontWeight: 700, fontSize: 15,
              }}>
                {isCorrectSelection ? "Excellent — correct" : "Not quite right"}
              </h4>
              <p style={{
                margin: 0, fontSize: 13,
                color: isCorrectSelection ? "#065f46" : "#991b1b",
                lineHeight: 1.6,
              }}>
                {question.explanation}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNext(isCorrectSelection)}
              style={{
                width: "100%", padding: "14px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #6E48AA, #9D50BB)",
                color: "#FFFFFF", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
                boxShadow: "0 6px 20px rgba(110,72,170,0.35)",
              }}
            >
              {index === total - 1 ? "See Final Results" : "Next Question →"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
