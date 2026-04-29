import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NodePanel({ node, onClose, onComplete }) {
  if (!node) return null;
  const { task } = node;

  const typeColors = {
    learn: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Learn" },
    practice: { bg: "bg-teal-100", text: "text-teal-700", label: "Practice" },
    revise: { bg: "bg-amber-100", text: "text-amber-700", label: "Revise" },
    quiz: { bg: "bg-coral-100", text: "text-coral-700", label: "Quiz" },
  };

  const colors = typeColors[task.task_type] || typeColors.learn;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
      />

      {/* Side Panel */}
      <motion.div
        initial={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
        animate={{ x: 0, boxShadow: "-10px 0 30px rgba(0,0,0,0.1)" }}
        exit={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[420px] bg-white z-50 flex flex-col"
        style={{ boxShadow: "-10px 0 30px rgba(110,72,170,0.15)" }}
      >
        {/* Gradient Header */}
        <div style={{
          background: "linear-gradient(135deg, #6E48AA 0%, #9D50BB 100%)",
          padding: "32px 24px",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Decorative glow */}
          <div style={{
            position: "absolute",
            top: "-50%",
            right: "-20%",
            width: 200,
            height: 200,
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />
          
          <button 
            onClick={onClose} 
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              color: "white"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ 
              fontSize: 11, 
              color: "rgba(255,255,255,0.9)", 
              fontWeight: 700, 
              marginBottom: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase"
            }}>
              Week {node.weekNumber} • Day {node.dayNumber}
            </div>
            
            <h2 style={{
              fontSize: 28,
              fontWeight: 800,
              color: "white",
              marginBottom: 16,
              lineHeight: 1.2,
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              {task.topic_name}
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                background: "rgba(255,255,255,0.25)",
                color: "white",
                backdropFilter: "blur(10px)"
              }}>
                {colors.label}
              </span>
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.95)"
              }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {task.estimated_minutes} min
              </span>
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.95)",
                textTransform: "capitalize"
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: task.difficulty === 'hard' ? '#fca5a5' : task.difficulty === 'medium' ? '#fcd34d' : '#86efac'
                }} />
                {task.difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" style={{ overflowX: 'hidden', background: "#f8f9fa" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <motion.a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(task.youtube_query)}`}
              target="_blank" rel="noreferrer"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "18px 20px",
                borderRadius: 16,
                background: "white",
                border: "1px solid rgba(220,38,38,0.15)",
                boxShadow: "0 2px 8px rgba(220,38,38,0.08)",
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.2s"
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(220,38,38,0.25)"
              }}>
                <svg style={{ width: 22, height: 22 }} fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 2, wordBreak: 'break-word', overflowWrap: 'break-word' }}>Watch Tutorials</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Search YouTube for best videos</div>
              </div>
              <svg style={{ width: 18, height: 18, color: "#cbd5e1" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </motion.a>

            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                to={`/quiz?topic=${encodeURIComponent(task.topic_name)}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "18px 20px",
                  borderRadius: 16,
                  background: "white",
                  border: "1px solid rgba(110,72,170,0.15)",
                  boxShadow: "0 2px 8px rgba(110,72,170,0.08)",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "all 0.2s"
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #6E48AA 0%, #9D50BB 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(110,72,170,0.25)"
                }}>
                  <svg style={{ width: 22, height: 22 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 2, wordBreak: 'break-word', overflowWrap: 'break-word' }}>Take a Quiz</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Test your knowledge right now</div>
                </div>
                <svg style={{ width: 18, height: 18, color: "#cbd5e1" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </motion.div>
          </div>

          <div style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            border: "1px solid rgba(110,72,170,0.1)",
            boxShadow: "0 2px 8px rgba(110,72,170,0.05)"
          }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 12, display: "block" }}>Personal Notes</label>
            <textarea 
              style={{
                width: "100%",
                height: 120,
                padding: 14,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 13,
                color: "#475569",
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#9D50BB";
                e.target.style.boxShadow = "0 0 0 3px rgba(157,80,187,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
              placeholder="Jot down key takeaways, commands, or concepts here..."
            />
          </div>

        </div>

        <div style={{ padding: 24, background: "white", borderTop: "1px solid #e2e8f0" }}>
          <motion.button 
            onClick={onComplete}
            disabled={task.completed}
            whileHover={!task.completed ? { y: -2, scale: 1.02 } : {}}
            whileTap={!task.completed ? { scale: 0.98 } : {}}
            style={{
              width: "100%",
              padding: "16px 24px",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              border: "none",
              cursor: task.completed ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.2s",
              background: task.completed 
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                : "linear-gradient(135deg, #6E48AA 0%, #9D50BB 100%)",
              color: "white",
              boxShadow: task.completed
                ? "0 4px 16px rgba(16,185,129,0.3)"
                : "0 4px 16px rgba(110,72,170,0.3)",
              opacity: task.completed ? 0.9 : 1
            }}
          >
            {task.completed ? (
              <>
                <svg style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Completed
              </>
            ) : (
              "Mark as complete"
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
