import { useState } from "react";

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","English","Computer Sc."];
const COLORS = ["#6366f1","#3b82f6","#10b981","#84cc16","#f97316","#8b5cf6"];

// Sample weekly sessions
const WEEKLY = [
  { day: "Mon", sessions: [{ sub: "Mathematics", hours: 2.5 }, { sub: "Physics", hours: 1 }] },
  { day: "Tue", sessions: [{ sub: "Chemistry", hours: 1.5 }, { sub: "English", hours: 0.5 }] },
  { day: "Wed", sessions: [{ sub: "Mathematics", hours: 3 }] },
  { day: "Thu", sessions: [{ sub: "Biology", hours: 2 }, { sub: "Computer Sc.", hours: 1 }] },
  { day: "Fri", sessions: [{ sub: "Physics", hours: 2 }, { sub: "Chemistry", hours: 1 }] },
  { day: "Sat", sessions: [{ sub: "Mathematics", hours: 4 }] },
  { day: "Sun", sessions: [] },
];

const WEEKLY_GOALS = {
  Mathematics: 10, Physics: 6, Chemistry: 5, Biology: 4, English: 3, "Computer Sc.": 4
};

export default function TimeTracker() {
  const [sessions, setSessions] = useState(WEEKLY);
  const [log, setLog] = useState({ day: "Mon", subject: "Mathematics", hours: "" });
  const [showLog, setShowLog] = useState(false);

  const totalPerSub = {};
  sessions.forEach(d => d.sessions.forEach(s => {
    totalPerSub[s.sub] = (totalPerSub[s.sub] || 0) + s.hours;
  }));

  const totalHours = Object.values(totalPerSub).reduce((a, b) => a + b, 0);
  const maxHours = Math.max(...sessions.map(d => d.sessions.reduce((a, s) => a + s.hours, 0)), 1);

  const addSession = () => {
    if (!log.hours || isNaN(+log.hours) || +log.hours <= 0) return;
    setSessions(prev => prev.map(d =>
      d.day === log.day
        ? { ...d, sessions: [...d.sessions, { sub: log.subject, hours: +log.hours }] }
        : d
    ));
    setLog(l => ({ ...l, hours: "" }));
    setShowLog(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <div className="card" style={{ textAlign: "center", background: "var(--accent-light)", border: "none" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{totalHours.toFixed(1)}h</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total This Week</div>
        </div>
        <div className="card" style={{ textAlign: "center", background: "var(--green-light)", border: "none" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green)" }}>
            {sessions.filter(d => d.sessions.length > 0).length}/7
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Days Active</div>
        </div>
        <div className="card" style={{ textAlign: "center", background: "#fff7ed", border: "none" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f97316" }}>
            {(totalHours / 7).toFixed(1)}h
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Daily Average</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Bar chart */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <p className="section-title">📊 Daily Study Hours</p>
              <p className="section-sub">This week's breakdown</p>
            </div>
            <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setShowLog(s => !s)}>
              + Log Session
            </button>
          </div>

          {showLog && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
              <select value={log.day} onChange={e => setLog(l => ({ ...l, day: e.target.value }))}
                style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={log.subject} onChange={e => setLog(l => ({ ...l, subject: e.target.value }))}
                style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <input value={log.hours} onChange={e => setLog(l => ({ ...l, hours: e.target.value }))}
                placeholder="Hours" type="number" min="0.25" max="12" step="0.25"
                style={{ width: 80, padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }} />
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={addSession}>Add</button>
            </div>
          )}

          {/* Bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 180 }}>
            {sessions.map(d => {
              const totalDay = d.sessions.reduce((a, s) => a + s.hours, 0);
              const barH = totalDay > 0 ? (totalDay / maxHours) * 150 : 4;
              return (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>{totalDay > 0 ? totalDay + "h" : ""}</span>
                  {/* Stacked bar */}
                  <div style={{ width: "100%", height: 150, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 1 }}>
                    {d.sessions.length === 0 ? (
                      <div style={{ height: 4, borderRadius: 4, background: "var(--border)" }} />
                    ) : d.sessions.map((s, i) => {
                      const segH = (s.hours / (totalDay || 1)) * barH;
                      const color = COLORS[SUBJECTS.indexOf(s.sub)] || "#6366f1";
                      return (
                        <div key={i} style={{
                          height: segH, borderRadius: i === 0 ? "4px 4px 0 0" : 0,
                          background: color, transition: "height 0.3s ease", title: s.sub
                        }} title={`${s.sub}: ${s.hours}h`} />
                      );
                    })}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{d.day}</span>
                </div>
              );
            })}
          </div>

          {/* Subject legend */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
            {SUBJECTS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-secondary)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i] }} />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="card">
          <p className="section-title">🎯 Weekly Goals</p>
          <p className="section-sub">Progress vs target</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
            {SUBJECTS.map((sub, i) => {
              const done = totalPerSub[sub] || 0;
              const goal = WEEKLY_GOALS[sub];
              const pct = Math.min((done / goal) * 100, 100);
              const color = COLORS[i];
              return (
                <div key={sub}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{sub}</span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{done}h / {goal}h</span>
                  </div>
                  <div style={{ background: "var(--border)", borderRadius: 99, height: 7 }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 99,
                      background: pct >= 100 ? "var(--green)" : color, transition: "width 0.4s ease"
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
