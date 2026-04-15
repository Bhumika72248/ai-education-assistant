import { useState, useEffect, useRef } from "react";

function fmt(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(cs).padStart(2,"0")}`;
}

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [subject, setSubject] = useState("Mathematics");
  const startRef = useRef(null);
  const rafRef = useRef(null);

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
  const lap = () => { setLaps(prev => [{ id: prev.length + 1, time: elapsed, label: subject }, ...prev]); };

  const subjects = ["Mathematics","Physics","Chemistry","Biology","History","English","Computer Sc."];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Timer card */}
      <div className="card" style={{ textAlign: "center" }}>
        <p className="section-title" style={{ marginBottom: 4 }}>⏱️ Study Stopwatch</p>
        <p className="section-sub">Track focused study sessions</p>

        {/* Subject selector */}
        <div style={{ marginBottom: 20 }}>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 8,
              border: "1px solid var(--border)", fontSize: 14,
              color: "var(--text-primary)", background: "var(--bg)"
            }}
          >
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Clock face */}
        <div style={{
          background: "var(--bg)", borderRadius: 16,
          padding: "32px 20px", marginBottom: 20,
          border: "1px solid var(--border)"
        }}>
          <div style={{
            fontSize: 48, fontWeight: 700, letterSpacing: 2,
            color: running ? "var(--accent)" : "var(--text-primary)",
            fontVariantNumeric: "tabular-nums", transition: "color 0.3s"
          }}>
            {fmt(elapsed)}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={() => setRunning(r => !r)}
            className="btn-primary"
            style={{
              minWidth: 100,
              background: running ? "var(--red)" : "var(--accent)"
            }}
          >
            {running ? "⏸ Pause" : "▶ Start"}
          </button>
          <button onClick={lap} className="btn-ghost" disabled={!running}>📍 Lap</button>
          <button onClick={reset} className="btn-ghost">↺ Reset</button>
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 20, background: "var(--border)",
          borderRadius: 99, height: 6, overflow: "hidden"
        }}>
          <div style={{
            height: "100%", borderRadius: 99,
            width: `${Math.min((elapsed / (25 * 60000)) * 100, 100)}%`,
            background: running ? "var(--accent)" : "var(--border)",
            transition: "width 0.5s ease, background 0.3s"
          }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
          {Math.min(Math.floor((elapsed / (25 * 60000)) * 100), 100)}% of 25-min Pomodoro
        </p>
      </div>

      {/* Laps card */}
      <div className="card" style={{ maxHeight: 420, overflowY: "auto" }}>
        <p className="section-title">📍 Lap History</p>
        <p className="section-sub">{laps.length === 0 ? "No laps recorded yet" : `${laps.length} laps recorded`}</p>
        {laps.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "40px 20px",
            color: "var(--text-secondary)", fontSize: 14
          }}>
            Press <strong>Lap</strong> while the timer is running to mark session segments.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {laps.map(lap => (
              <div key={lap.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", borderRadius: 10,
                background: "var(--bg)", border: "1px solid var(--border)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: "var(--accent-light)", color: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 600
                  }}>{lap.id}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{lap.label}</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(lap.time)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
