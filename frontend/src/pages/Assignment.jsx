import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import PageWrapper from "../components/ui/PageWrapper";
import { BotIcon, FileIcon, NotesIcon, TrophyIcon } from "../components/ui/Icon";

const inputStyle = {
  width: "100%", padding: "12px 16px", borderRadius: 12,
  border: "1px solid rgba(110,72,170,0.15)",
  background: "rgba(255,255,255,0.9)",
  color: "#1A0B42", fontSize: 14,
  fontFamily: "'Inter', sans-serif", outline: "none",
};
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "var(--text-secondary)", marginBottom: 8,
  letterSpacing: "0.05em", textTransform: "uppercase",
};

export default function Assignment() {
  const [title, setTitle]               = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [rubric, setRubric]             = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [result, setResult]             = useState(null);
  const [history, setHistory]           = useState([]);

  async function fetchHistory() {
    try {
      const response = await api.get("/assignment/history");
      setHistory(response.data?.history || []);
    } catch { setHistory([]); }
  }

  useEffect(() => { fetchHistory(); }, []);

  async function handleEvaluate() {
    if (!title.trim() || !studentAnswer.trim()) {
      setError("Please fill in title and answer before evaluating.");
      return;
    }
    setLoading(true); setError("");
    try {
      const response = await api.post("/assignment/evaluate", {
        title: title.trim(),
        student_answer: studentAnswer.trim(),
        rubric: rubric.trim() || null,
      }, { timeout: 30000 });
      setResult(response.data?.evaluation || null);
      await fetchHistory();
    } catch (err) {
      const message = err?.response?.data?.detail
        || (err?.code === "ECONNABORTED" ? "Request timed out. Please try again." : "Evaluation failed. Please try again.");
      setError(message);
    } finally { setLoading(false); }
  }

  const gradeColor = (grade) => {
    if (!grade) return "#6E48AA";
    const g = grade.toUpperCase();
    if (g.startsWith("A")) return "#059669";
    if (g.startsWith("B")) return "#6E48AA";
    if (g.startsWith("C")) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, margin: "0 0 6px",
          background: "linear-gradient(135deg, #1A0B42 0%, #6E48AA 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", letterSpacing: "-0.03em",
        }}>
          Assignment Evaluator
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
          Submit your answer to get AI scoring, strengths, and improvement suggestions.
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 20 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Assignment Title</label>
            <input
              style={inputStyle}
              placeholder="e.g., Explain Newton's 3 Laws"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={e => { e.target.style.borderColor = "rgba(110,72,170,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(110,72,170,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(110,72,170,0.15)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Student Answer</label>
            <textarea
              rows={8}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
              placeholder="Paste your assignment answer here..."
              value={studentAnswer}
              onChange={e => setStudentAnswer(e.target.value)}
              onFocus={e => { e.target.style.borderColor = "rgba(110,72,170,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(110,72,170,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(110,72,170,0.15)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={labelStyle}>Rubric <span style={{ color: "var(--text-muted)", textTransform: "none", fontWeight: 400 }}>(Optional)</span></label>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Provide expected points, marking scheme, or grading criteria..."
              value={rubric}
              onChange={e => setRubric(e.target.value)}
              onFocus={e => { e.target.style.borderColor = "rgba(110,72,170,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(110,72,170,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(110,72,170,0.15)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: "12px 16px", borderRadius: 10,
                background: "rgba(239,68,68,0.1)", color: "#fca5a5",
                fontSize: 13, border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            onClick={handleEvaluate}
            disabled={loading}
            style={{
              padding: "13px 24px", borderRadius: 12, border: "none",
              background: loading ? "rgba(110,72,170,0.4)" : "linear-gradient(135deg, #6E48AA, #9D50BB)",
              color: "#FFFFFF", fontSize: 14, fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              fontFamily: "'Inter', sans-serif",
              boxShadow: loading ? "none" : "0 6px 20px rgba(110,72,170,0.4), 0 0 12px rgba(0,242,255,0.1)",
              display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
            }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Evaluating...</>
            ) : <><BotIcon size={16} /> Evaluate Assignment</>}
          </motion.button>
        </div>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 20, position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6E48AA, #9D50BB, #00F2FF)" }} />
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: "var(--text-primary)" }}>
              Evaluation Result
            </h2>

            {/* Score row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Score",     value: result.score ?? "—",     color: "#6E48AA" },
                { label: "Max Score", value: result.max_score ?? "—", color: "var(--text-secondary)" },
                { label: "Grade",     value: result.grade ?? "—",     color: gradeColor(result.grade) },
              ].map(s => (
                <div key={s.label} style={{
                  padding: "16px", borderRadius: 12, textAlign: "center",
                  background: "rgba(255,255,255,0.7)",
                  border: `1px solid ${s.color}22`,
                }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Strengths
                    </h3>
                <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.strengths.map((item, idx) => (
                    <li key={idx} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {result.improvements?.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Improvements
                    </h3>
                <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.improvements.map((item, idx) => (
                    <li key={idx} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed feedback */}
            {result.detailed_feedback && (
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Detailed Feedback
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                  {result.detailed_feedback}
                </p>
              </div>
            )}

            {/* Rewrite suggestion */}
            {result.rewrite_suggestion && (
              <div style={{
                padding: "16px", borderRadius: 12,
                background: "rgba(110,72,170,0.06)",
                border: "1px solid rgba(110,72,170,0.15)",
              }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#6E48AA", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Rewrite Suggestion
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                  {result.rewrite_suggestion}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>
          Past Evaluations
        </h2>
        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 20px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>No assignment history yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map(item => (
              <motion.div
                key={item.id}
                whileHover={{ x: 4 }}
                style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(110,72,170,0.1)",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{item.title}</p>
                  <span style={{
                    padding: "3px 10px", borderRadius: 20,
                    background: "rgba(110,72,170,0.08)", color: "#6E48AA",
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {item.score ?? "—"}
                  </span>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-muted)" }}>
                  {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {item.feedback || "—"}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </PageWrapper>
  );
}
