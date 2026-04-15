import { useState } from "react";

const WEEKS = 24;
const DAYS_PER_WEEK = 7;

function generateData() {
  const data = [];
  const today = new Date();
  for (let w = WEEKS - 1; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + (DAYS_PER_WEEK - 1 - d)));
      const isFuture = date > today;
      const rand = Math.random();
      week.push({
        dateStr: date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        monthShort: date.toLocaleString("en-IN", { month: "short" }),
        hours: isFuture ? 0 : rand < 0.25 ? 0 : Math.round(rand * 8 * 10) / 10,
        isFuture,
      });
    }
    data.push(week);
  }
  return data;
}

const DATA = generateData();

function getColor(hours, isFuture) {
  if (isFuture) return "#f3f4f6";
  if (hours === 0) return "#f1f2f6";
  if (hours < 1)  return "#c7d2fe";
  if (hours < 2)  return "#a5b4fc";
  if (hours < 4)  return "#818cf8";
  if (hours < 6)  return "#6366f1";
  return "#4338ca";
}

export default function ConsistencyMap() {
  const [tooltip, setTooltip] = useState(null);

  const allDays = DATA.flat().filter(d => !d.isFuture);
  const studiedDays = allDays.filter(d => d.hours > 0);
  const totalHours = studiedDays.reduce((s, d) => s + d.hours, 0);

  const streak = (() => {
    const flat = [...allDays].reverse();
    let count = 0;
    for (const d of flat) { if (d.hours > 0) count++; else break; }
    return count;
  })();

  const avgHours = studiedDays.length > 0 ? (totalHours / studiedDays.length).toFixed(1) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Hours", value: Math.round(totalHours) + "h", icon: "📚", bg: "var(--accent-light)", col: "var(--accent)" },
          { label: "Current Streak", value: streak + " days", icon: "🔥", bg: "#fff7ed", col: "#f97316" },
          { label: "Days Studied", value: studiedDays.length + " days", icon: "📅", bg: "var(--green-light)", col: "var(--green)" },
          { label: "Avg / Day", value: avgHours + "h", icon: "⏱️", bg: "#f5f3ff", col: "var(--purple)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ background: s.bg, border: "none", textAlign: "center", padding: "14px 10px" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.col }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="card" style={{ position: "relative" }}>
        <p className="section-title">🗺️ Study Consistency Map</p>
        <p className="section-sub">Last 24 weeks — hover to see details</p>

        <div style={{ overflowX: "auto", paddingBottom: 8 }}>
          <div style={{ display: "flex", gap: 3, minWidth: "fit-content" }}>
            {DATA.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {week.map((day, di) => (
                  <div
                    key={di}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ ...day, bx: rect.left, by: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      width: 13, height: 13, borderRadius: 3,
                      background: getColor(day.hours, day.isFuture),
                      cursor: day.isFuture ? "default" : "pointer",
                      transition: "transform 0.1s",
                    }}
                    onMouseOver={e => { if (!day.isFuture) e.currentTarget.style.transform = "scale(1.4)"; }}
                    onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Month labels */}
          <div style={{ display: "flex", gap: 3, marginTop: 6, minWidth: "fit-content" }}>
            {DATA.map((week, wi) => (
              <div key={wi} style={{ width: 13, fontSize: 9, color: "var(--text-secondary)", textAlign: "center" }}>
                {wi % 4 === 0 ? week[0].monthShort : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Less</span>
          {[0, 0.5, 2, 4, 6].map(h => (
            <div key={h} style={{ width: 13, height: 13, borderRadius: 3, background: getColor(h, false) }} />
          ))}
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>More</span>
        </div>
      </div>

      {/* Subject focus */}
      <div className="card">
        <p className="section-title">📊 Subject Focus (This Month)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          {[
            { sub: "Mathematics", pct: 32, color: "#6366f1" },
            { sub: "Physics", pct: 24, color: "#3b82f6" },
            { sub: "Chemistry", pct: 18, color: "#10b981" },
            { sub: "Biology", pct: 14, color: "#84cc16" },
            { sub: "English", pct: 12, color: "#f97316" },
          ].map(({ sub, pct, color }) => (
            <div key={sub}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{sub}</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{pct}%</span>
              </div>
              <div style={{ background: "var(--border)", borderRadius: 99, height: 7 }}>
                <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: color, transition: "width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && !tooltip.isFuture && (
        <div style={{
          position: "fixed", top: (tooltip.by || 0) - 54, left: (tooltip.bx || 0) + 16,
          background: "#1a1d2e", color: "white",
          padding: "6px 12px", borderRadius: 8, fontSize: 12,
          pointerEvents: "none", zIndex: 9999, whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.dateStr}</div>
          <div style={{ color: "#a5b4fc" }}>
            {tooltip.hours > 0 ? `${tooltip.hours}h studied` : "No study session"}
          </div>
        </div>
      )}
    </div>
  );
}
