import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

function fmt(ms) {
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(cs).padStart(2,"0")}`;
}

const subjects = ["Mathematics","Physics","Chemistry","Biology","History","English","Computer Sc."];

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps]       = useState([]);
  const [subject, setSubject] = useState("Mathematics");
  const startRef = useRef(null);
  const rafRef   = useRef(null);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed;
      const tick = () => {
        setElapsed(Date.now() - startRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const reset = () => { setRunning(false); setElapsed(0); setLaps([]); };
  const lap   = () => setLaps(prev => [{ id: prev.length + 1, time: elapsed, label: subject }, ...prev]);
  const pomoPct = Math.min((elapsed / (25 * 60000)) * 100, 100);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Timer card */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>

        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          ⏱️ Study Stopwatch
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Track focused study sessions</p>

        <select value={subject} onChange={e => setSubject(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, marginBottom: 20, border: "1px solid rgba(110,72,170,0.15)", background: "#fff", color: "#1A0B42", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none" }}>
          {subjects.map(s => <option key={s}>{s}</option>)}
        </select>

        {/* Clock face */}
        <div style={{
          background: running ? "rgba(110,72,170,0.06)" : "#f8f9ff",
          borderRadius: 20, padding: "32px 20px", marginBottom: 24,
          border: `1px solid ${running ? "rgba(110,72,170,0.3)" : "rgba(110,72,170,0.12)"}`,
          transition: "all 0.3s ease",
          boxShadow: running ? "0 0 24px rgba(110,72,170,0.15)" : "0 2px 8px rgba(110,72,170,0.06)",
        }}>
          <motion.div
            animate={{ scale: running ? [1, 1.01, 1] : 1 }}
            transition={{ duration: 1, repeat: running ? Infinity : 0 }}
            style={{
              fontSize: 44, fontWeight: 800, letterSpacing: 2,
              color: running ? "#6E48AA" : "#1A0B42",
              fontVariantNumeric: "tabular-nums",
              fontFamily: "'Inter', sans-serif",
              transition: "color 0.3s ease",
            }}
          >
            {fmt(elapsed)}
          </motion.div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => setRunning(r => !r)}
            style={{
              minWidth: 110, padding: "10px 20px", borderRadius: 10, border: "none",
              background: running ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "linear-gradient(135deg, #6E48AA, #9D50BB)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Inter', sans-serif",
              boxShadow: running ? "0 4px 16px rgba(220,38,38,0.3)" : "0 4px 16px rgba(110,72,170,0.3)",
            }}>
            {running ? "⏸ Pause" : "▶ Start"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={lap} disabled={!running}
            style={{ padding: "10px 16px", borderRadius: 10, background: "#f0f2ff", border: "1px solid rgba(110,72,170,0.2)", color: !running ? "#9b8ab8" : "#6E48AA", fontSize: 13, fontWeight: 600, cursor: !running ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif" }}>
            📍 Lap
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={reset}
            style={{ padding: "10px 16px", borderRadius: 10, background: "#f0f2ff", border: "1px solid rgba(110,72,170,0.2)", color: "#5a4a7a", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            ↺ Reset
          </motion.button>
        </div>

        {/* Pomodoro progress */}
        <div>
          <div style={{ height: 5, background: "rgba(110,72,170,0.1)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
            <motion.div animate={{ width: `${pomoPct}%` }} transition={{ duration: 0.3 }}
              style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #6E48AA, #9D50BB)" }} />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{Math.round(pomoPct)}% of 25-min Pomodoro</p>
        </div>
      </motion.div>

      {/* Laps card */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ maxHeight: 460, overflowY: "auto" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>📍 Lap History</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
          {laps.length === 0 ? "No laps recorded yet" : `${laps.length} lap${laps.length > 1 ? "s" : ""} recorded`}
        </p>

        {laps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: 13 }}>
            Press <strong style={{ color: "var(--text-secondary)" }}>Lap</strong> while the timer is running.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {laps.map((lap, i) => (
              <motion.div key={lap.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, background: "#f8f9ff", border: "1px solid rgba(110,72,170,0.12)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(110,72,170,0.12)", color: "#6E48AA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                    {lap.id}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{lap.label}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, fontVariantNumeric: "tabular-nums", color: "#6E48AA" }}>{fmt(lap.time)}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
