import { useState } from "react";
import api from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";

const DAYS     = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","English","Computer Sc."];
const COLORS   = ["#6366f1","#3b82f6","#10b981","#84cc16","#f97316","#8b5cf6"];

const WEEKLY = [
  { day: "Mon", sessions: [{ sub: "Mathematics", hours: 2.5 }, { sub: "Physics", hours: 1 }] },
  { day: "Tue", sessions: [{ sub: "Chemistry", hours: 1.5 }, { sub: "English", hours: 0.5 }] },
  { day: "Wed", sessions: [{ sub: "Mathematics", hours: 3 }] },
  { day: "Thu", sessions: [{ sub: "Biology", hours: 2 }, { sub: "Computer Sc.", hours: 1 }] },
  { day: "Fri", sessions: [{ sub: "Physics", hours: 2 }, { sub: "Chemistry", hours: 1 }] },
  { day: "Sat", sessions: [{ sub: "Mathematics", hours: 4 }] },
  { day: "Sun", sessions: [] },
];

const WEEKLY_GOALS = { Mathematics: 10, Physics: 6, Chemistry: 5, Biology: 4, English: 3, "Computer Sc.": 4 };

const inputStyle = {
  padding: "8px 12px", borderRadius: 9,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "var(--text-primary)", fontSize: 13,
  fontFamily: "'Inter', sans-serif", outline: "none",
};

export default function TimeTracker() {
  const [sessions, setSessions] = useState(WEEKLY);
  const [log, setLog]           = useState({ day: "Mon", subject: "Mathematics", hours: "" });
  const [showLog, setShowLog]   = useState(false);

  const totalPerSub = {};
  sessions.forEach(d => d.sessions.forEach(s => { totalPerSub[s.sub] = (totalPerSub[s.sub] || 0) + s.hours; }));
  const totalHours = Object.values(totalPerSub).reduce((a, b) => a + b, 0);
  const maxHours   = Math.max(...sessions.map(d => d.sessions.reduce((a, s) => a + s.hours, 0)), 1);

  const addSession = () => {
    if (!log.hours || isNaN(+log.hours) || +log.hours <= 0) return;
    setSessions(prev => prev.map(d => d.day === log.day ? { ...d, sessions: [...d.sessions, { sub: log.subject, hours: +log.hours }] } : d));
    setLog(l => ({ ...l, hours: "" }));
    setShowLog(false);
    // send to backend for analytics
    try {
      const userId = Number(localStorage.getItem("user_id") || 1);
      api.post('/analytics/log-session', null, { params: { user_id: userId, topic: log.subject, duration_hours: +log.hours } });
    } catch (e) { /* non-blocking */ }
  };

  const summaryStats = [
    { label: "Total This Week", value: totalHours.toFixed(1) + "h", color: "#6366f1" },
    { label: "Days Active",     value: `${sessions.filter(d => d.sessions.length > 0).length}/7`, color: "#10b981" },
    { label: "Daily Average",   value: (totalHours / 7).toFixed(1) + "h", color: "#f97316" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {summaryStats.map((s, i) => (
          <motion.div
            key={s.label}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3, scale: 1.02 }}
            style={{ textAlign: "center", border: `1px solid ${s.color}22` }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Bar chart */}
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                📊 Daily Study Hours
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>This week's breakdown</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowLog(s => !s)}
              style={{ padding: "8px 14px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
            >
              + Log Session
            </motion.button>
          </div>

          <AnimatePresence>
            {showLog && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end", overflow: "hidden" }}
              >
                <select value={log.day} onChange={e => setLog(l => ({ ...l, day: e.target.value }))} style={inputStyle}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={log.subject} onChange={e => setLog(l => ({ ...l, subject: e.target.value }))} style={inputStyle}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <input value={log.hours} onChange={e => setLog(l => ({ ...l, hours: e.target.value }))} placeholder="Hours" type="number" min="0.25" max="12" step="0.25"
                  style={{ ...inputStyle, width: 80 }} />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addSession}
                  style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  Add
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 180 }}>
            {sessions.map(d => {
              const totalDay = d.sessions.reduce((a, s) => a + s.hours, 0);
              const barH     = totalDay > 0 ? (totalDay / maxHours) * 150 : 4;
              return (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{totalDay > 0 ? totalDay + "h" : ""}</span>
                  <div style={{ width: "100%", height: 150, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 1 }}>
                    {d.sessions.length === 0 ? (
                      <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                    ) : d.sessions.map((s, i) => {
                      const segH  = (s.hours / (totalDay || 1)) * barH;
                      const color = COLORS[SUBJECTS.indexOf(s.sub)] || "#6366f1";
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: segH }}
                          transition={{ duration: 0.6, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                          title={`${s.sub}: ${s.hours}h`}
                          style={{ borderRadius: i === 0 ? "4px 4px 0 0" : 0, background: color }}
                        />
                      );
                    })}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>{d.day}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            {SUBJECTS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)" }}>
                <div style={{ width: 9, height: 9, borderRadius: 2, background: COLORS[i] }} />
                {s}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Goals */}
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            🎯 Weekly Goals
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Progress vs target</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {SUBJECTS.map((sub, i) => {
              const done = totalPerSub[sub] || 0;
              const goal = WEEKLY_GOALS[sub];
              const pct  = Math.min((done / goal) * 100, 100);
              const color = COLORS[i];
              return (
                <div key={sub}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{sub}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{done}h / {goal}h</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 6 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.4 + i * 0.06, ease: "easeOut" }}
                      style={{ height: "100%", borderRadius: 99, background: pct >= 100 ? "#10b981" : color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
