import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m)    { return new Date(y, m, 1).getDay(); }

const sampleEvents = {
  "2026-04-02": [{ title: "Math Test",        type: "exam",       color: "#ef4444" }],
  "2026-04-07": [{ title: "Physics Assignment",type: "assignment", color: "#f59e0b" }],
  "2026-04-10": [{ title: "Study Group",       type: "session",    color: "#6366f1" }],
  "2026-04-14": [{ title: "Chemistry Lab",     type: "session",    color: "#6366f1" }],
  "2026-04-16": [{ title: "Biology Quiz",      type: "quiz",       color: "#10b981" }],
  "2026-04-21": [{ title: "Mock Exam",         type: "exam",       color: "#ef4444" }],
  "2026-04-24": [{ title: "Project Due",       type: "assignment", color: "#f59e0b" }],
  "2026-04-28": [{ title: "Review Session",    type: "session",    color: "#6366f1" }],
};
const studiedDays = new Set(["2026-04-01","2026-04-02","2026-04-03","2026-04-07","2026-04-08","2026-04-09","2026-04-10","2026-04-14","2026-04-15"]);

const colorMap = { exam: "#ef4444", assignment: "#f59e0b", session: "#6366f1", quiz: "#10b981" };

export default function StudyCalendar() {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected]   = useState(null);
  const [newEvent, setNewEvent]   = useState({ title: "", type: "session" });
  const [events, setEvents]       = useState(sampleEvents);
  const [showAdd, setShowAdd]     = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDay(viewYear, viewMonth);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  const dateKey = (day) => `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  const addEvent = () => {
    if (!selected || !newEvent.title.trim()) return;
    const key = dateKey(selected);
    setEvents(prev => ({ ...prev, [key]: [...(prev[key]||[]), { title: newEvent.title, type: newEvent.type, color: colorMap[newEvent.type] }] }));
    setNewEvent({ title: "", type: "session" });
    setShowAdd(false);
  };

  const selectedKey    = selected ? dateKey(selected) : null;
  const selectedEvents = selectedKey ? (events[selectedKey] || []) : [];

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 9,
    border: "1px solid rgba(110,72,170,0.15)",
    background: "#fff",
    color: "#1A0B42", fontSize: 13,
    fontFamily: "'Inter', sans-serif", outline: "none",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
      {/* Calendar */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prevMonth}
            style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid rgba(110,72,170,0.15)", background: "#f0f2ff", color: "var(--text-secondary)", cursor: "pointer", fontSize: 16, fontFamily: "'Inter', sans-serif" }}>
            ‹
          </motion.button>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
            {MONTHS[viewMonth]} {viewYear}
          </h2>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={nextMonth}
            style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid rgba(110,72,170,0.15)", background: "#f0f2ff", color: "var(--text-secondary)", cursor: "pointer", fontSize: 16, fontFamily: "'Inter', sans-serif" }}>
            ›
          </motion.button>
        </div>

        {/* Day names */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day      = i + 1;
            const key      = dateKey(day);
            const isToday  = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const isSel    = selected === day;
            const hasEvent = !!events[key];
            const studied  = studiedDays.has(key);

            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(day)}
                style={{
                  textAlign: "center", padding: "10px 4px", borderRadius: 10,
                  cursor: "pointer", position: "relative", fontSize: 13, fontWeight: 600,
                  background: isSel
                    ? "linear-gradient(135deg, #6E48AA, #9D50BB)"
                    : isToday
                    ? "rgba(110,72,170,0.12)"
                    : "#f8f9ff",
                  color: isSel ? "white" : isToday ? "#6E48AA" : "#1A0B42",
                  border: isSel ? "1px solid rgba(110,72,170,0.4)" : "1px solid rgba(110,72,170,0.08)",
                  boxShadow: isSel ? "0 4px 12px rgba(110,72,170,0.25)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {day}
                {studied && !isSel && (
                  <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#10b981" }} />
                )}
                {hasEvent && (
                  <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: isSel ? "white" : events[key][0].color }} />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
          {[["#10b981","Studied"],["#ef4444","Exam"],["#f59e0b","Assignment"],["#6366f1","Session"],["#10b981","Quiz"]].map(([c,l]) => (
            <div key={l+c} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
              {l}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
            {selected ? `${MONTHS[viewMonth]} ${selected}` : "Select a day"}
          </p>

          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {selectedEvents.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>No events. Add one!</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    {selectedEvents.map((ev, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 10,
                        background: "#f8f9ff",
                        border: "1px solid rgba(110,72,170,0.1)",
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color, flexShrink: 0, boxShadow: `0 0 6px ${ev.color}` }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{ev.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>{ev.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showAdd ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Event title..." style={inputStyle} />
                    <select value={newEvent.type} onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                      <option value="session">Study Session</option>
                      <option value="exam">Exam</option>
                      <option value="assignment">Assignment</option>
                      <option value="quiz">Quiz</option>
                    </select>
                    <div style={{ display: "flex", gap: 6 }}>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={addEvent}
                        style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #6E48AA, #9D50BB)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                        Add
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAdd(false)}
                        style={{ flex: 1, padding: "8px", borderRadius: 9, border: "1px solid rgba(110,72,170,0.15)", background: "#f0f2ff", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAdd(true)}
                    style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6E48AA, #9D50BB)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                    + Add Event
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Upcoming */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Upcoming
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Apr 16 — Biology Quiz","Apr 21 — Mock Exam","Apr 24 — Project Due"].map((ev, i) => (
              <div key={i} style={{
                fontSize: 13, padding: "9px 12px", borderRadius: 9,
                background: "#f0f2ff",
                borderLeft: "3px solid #6E48AA",
                color: "var(--text-secondary)",
              }}>
                {ev}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
