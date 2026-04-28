import { useState } from "react";
import { motion } from "framer-motion";
import { FileIcon, FireIcon, CalendarIcon, StopwatchIcon, AnalyticsIcon } from "../ui/Icon";

const WEEKS = 24, DAYS_PER_WEEK = 7;

function generateData() {
  const data = [], today = new Date();
  for (let w = WEEKS - 1; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + (DAYS_PER_WEEK - 1 - d)));
      const isFuture = date > today;
      const rand = Math.random();
      week.push({
        dateStr:    date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        monthShort: date.toLocaleString("en-IN", { month: "short" }),
        hours:      isFuture ? 0 : rand < 0.25 ? 0 : Math.round(rand * 8 * 10) / 10,
        isFuture,
      });
    }
    data.push(week);
  }
  return data;
}

const DATA = generateData();

function getColor(hours, isFuture) {
  if (isFuture) return "rgba(110,72,170,0.05)";
  if (hours === 0) return "rgba(110,72,170,0.08)";
  if (hours < 1)  return "rgba(110,72,170,0.25)";
  if (hours < 2)  return "rgba(110,72,170,0.45)";
  if (hours < 4)  return "rgba(110,72,170,0.65)";
  if (hours < 6)  return "#6E48AA";
  return "#4a2d7a";
}

export default function ConsistencyMap() {
  const [tooltip, setTooltip] = useState(null);

  const allDays    = DATA.flat().filter(d => !d.isFuture);
  const studiedDays = allDays.filter(d => d.hours > 0);
  const totalHours  = studiedDays.reduce((s, d) => s + d.hours, 0);
  const streak = (() => {
    const flat = [...allDays].reverse();
    let count = 0;
    for (const d of flat) { if (d.hours > 0) count++; else break; }
    return count;
  })();
  const avgHours = studiedDays.length > 0 ? (totalHours / studiedDays.length).toFixed(1) : 0;

  const stats = [
    { label: "Total Hours",    value: Math.round(totalHours) + "h", icon: FileIcon,    color: "#6E48AA" },
    { label: "Current Streak", value: streak + " days",             icon: FireIcon,    color: "#d97706" },
    { label: "Days Studied",   value: studiedDays.length + " days", icon: CalendarIcon, color: "#059669" },
    { label: "Avg / Day",      value: avgHours + "h",               icon: StopwatchIcon, color: "#9D50BB" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4, scale: 1.02 }}
            style={{ textAlign: "center", border: `1px solid ${s.color}22`, position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 80, height: 80, background: `radial-gradient(circle, ${s.color}15 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Heatmap */}
      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em", display: 'flex', alignItems: 'center', gap: 8 }}>
          <AnalyticsIcon size={16} /> Study Consistency Map
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Last 24 weeks — hover to see details</p>

        <div style={{ overflowX: "auto", paddingBottom: 8 }}>
          <div style={{ display: "flex", gap: 3, minWidth: "fit-content" }}>
            {DATA.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {week.map((day, di) => (
                  <motion.div
                    key={di}
                    whileHover={!day.isFuture ? { scale: 1.5, zIndex: 10 } : {}}
                    onMouseEnter={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ ...day, bx: rect.left, by: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      width: 13, height: 13, borderRadius: 3,
                      background: getColor(day.hours, day.isFuture),
                      cursor: day.isFuture ? "default" : "pointer",
                      border: day.hours > 0 && !day.isFuture ? "1px solid rgba(110,72,170,0.2)" : "1px solid rgba(110,72,170,0.06)",
                      transition: "transform 0.1s ease",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Month labels */}
          <div style={{ display: "flex", gap: 3, marginTop: 6, minWidth: "fit-content" }}>
            {DATA.map((week, wi) => (
              <div key={wi} style={{ width: 13, fontSize: 9, color: "var(--text-muted)", textAlign: "center" }}>
                {wi % 4 === 0 ? week[0].monthShort : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Less</span>
          {[0, 0.5, 2, 4, 6].map(h => (
            <div key={h} style={{ width: 13, height: 13, borderRadius: 3, background: getColor(h, false) }} />
          ))}
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>More</span>
        </div>
      </motion.div>

      {/* Subject focus */}
      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.06em", display: 'flex', alignItems: 'center', gap: 8 }}>
          <AnalyticsIcon size={16} /> Subject Focus (This Month)
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { sub: "Mathematics", pct: 32, color: "#6E48AA" },
            { sub: "Physics",     pct: 24, color: "#0099cc" },
            { sub: "Chemistry",   pct: 18, color: "#059669" },
            { sub: "Biology",     pct: 14, color: "#84cc16" },
            { sub: "English",     pct: 12, color: "#d97706" },
          ].map(({ sub, pct, color }) => (
            <div key={sub}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{sub}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ background: "rgba(110,72,170,0.08)", borderRadius: 99, height: 6 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 99, background: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tooltip */}
      {tooltip && !tooltip.isFuture && (
        <div style={{
          position: "fixed",
          top: (tooltip.by || 0) - 58,
          left: (tooltip.bx || 0) + 18,
          background: "rgba(255,255,255,0.97)",
          border: "1px solid rgba(110,72,170,0.15)",
          color: "#1A0B42", padding: "8px 14px", borderRadius: 10,
          fontSize: 12, pointerEvents: "none", zIndex: 9999,
          whiteSpace: "nowrap",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ fontWeight: 700, marginBottom: 3 }}>{tooltip.dateStr}</div>
          <div style={{ color: "#6E48AA" }}>
            {tooltip.hours > 0 ? `${tooltip.hours}h studied` : "No study session"}
          </div>
        </div>
      )}
    </div>
  );
}
