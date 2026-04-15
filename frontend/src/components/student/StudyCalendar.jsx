import { useState } from "react";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const sampleEvents = {
  "2026-04-02": [{ title: "Math Test", type: "exam", color: "#ef4444" }],
  "2026-04-07": [{ title: "Physics Assignment", type: "assignment", color: "#f59e0b" }],
  "2026-04-10": [{ title: "Study Group", type: "session", color: "#6366f1" }],
  "2026-04-14": [{ title: "Chemistry Lab", type: "session", color: "#6366f1" }],
  "2026-04-16": [{ title: "Biology Quiz", type: "quiz", color: "#10b981" }],
  "2026-04-21": [{ title: "Mock Exam", type: "exam", color: "#ef4444" }],
  "2026-04-24": [{ title: "Project Due", type: "assignment", color: "#f59e0b" }],
  "2026-04-28": [{ title: "Review Session", type: "session", color: "#6366f1" }],
};

const studiedDays = new Set(["2026-04-01","2026-04-02","2026-04-03","2026-04-07",
  "2026-04-08","2026-04-09","2026-04-10","2026-04-14","2026-04-15"]);

export default function StudyCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: "", type: "session" });
  const [events, setEvents] = useState(sampleEvents);
  const [showAdd, setShowAdd] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const dateKey = (day) => `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  const addEvent = () => {
    if (!selected || !newEvent.title.trim()) return;
    const key = dateKey(selected);
    const colorMap = { exam:"#ef4444", assignment:"#f59e0b", session:"#6366f1", quiz:"#10b981" };
    setEvents(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), { title: newEvent.title, type: newEvent.type, color: colorMap[newEvent.type] }]
    }));
    setNewEvent({ title: "", type: "session" });
    setShowAdd(false);
  };

  const selectedKey = selected ? dateKey(selected) : null;
  const selectedEvents = selectedKey ? (events[selectedKey] || []) : [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
      {/* Calendar */}
      <div className="card">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button className="btn-ghost" onClick={prevMonth}>‹</button>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>{MONTHS[viewMonth]} {viewYear}</h2>
          <button className="btn-ghost" onClick={nextMonth}>›</button>
        </div>

        {/* Day names */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = dateKey(day);
            const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const isSelected = selected === day;
            const hasEvent = !!events[key];
            const studied = studiedDays.has(key);
            return (
              <div
                key={day}
                onClick={() => setSelected(day)}
                style={{
                  textAlign: "center", padding: "10px 4px", borderRadius: 9,
                  cursor: "pointer", position: "relative", fontSize: 14, fontWeight: 500,
                  transition: "all 0.15s",
                  background: isSelected ? "var(--accent)" : isToday ? "var(--accent-light)" : "transparent",
                  color: isSelected ? "white" : isToday ? "var(--accent)" : "var(--text-primary)",
                  border: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                }}
              >
                {day}
                {/* Studied dot */}
                {studied && !isSelected && (
                  <div style={{
                    position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)",
                    width: 5, height: 5, borderRadius: "50%", background: "var(--green)"
                  }} />
                )}
                {/* Event dots */}
                {hasEvent && (
                  <div style={{
                    position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)",
                    width: 5, height: 5, borderRadius: "50%",
                    background: isSelected ? "white" : events[key][0].color
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          {[["var(--green)","Studied"],["#ef4444","Exam"],["#f59e0b","Assignment"],["#6366f1","Session"],["#10b981","Quiz"]].map(([c,l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card">
          <p className="section-title" style={{ fontSize: 15 }}>
            {selected ? `${MONTHS[viewMonth]} ${selected}` : "Select a day"}
          </p>
          {selected && (
            <>
              {selectedEvents.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>No events. Add one!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  {selectedEvents.map((ev, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", borderRadius: 8, background: "var(--bg)"
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "capitalize" }}>{ev.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAdd ? (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    value={newEvent.title}
                    onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                    placeholder="Event title..."
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 8,
                      border: "1px solid var(--border)", fontSize: 13
                    }}
                  />
                  <select
                    value={newEvent.type}
                    onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))}
                    style={{
                      width: "100%", padding: "7px 10px", borderRadius: 8,
                      border: "1px solid var(--border)", fontSize: 13
                    }}
                  >
                    <option value="session">Study Session</option>
                    <option value="exam">Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                  </select>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-primary" style={{ flex: 1, fontSize: 13 }} onClick={addEvent}>Add</button>
                    <button className="btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={() => setShowAdd(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="btn-primary" style={{ marginTop: 12, width: "100%", fontSize: 13 }} onClick={() => setShowAdd(true)}>
                  + Add Event
                </button>
              )}
            </>
          )}
        </div>

        {/* Upcoming */}
        <div className="card">
          <p className="section-title" style={{ fontSize: 15, marginBottom: 10 }}>Upcoming</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {["Apr 16 — Biology Quiz","Apr 21 — Mock Exam","Apr 24 — Project Due"].map((ev, i) => (
              <div key={i} style={{
                fontSize: 13, padding: "7px 10px", borderRadius: 8,
                background: "var(--bg)", borderLeft: "3px solid var(--accent)"
              }}>
                {ev}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
