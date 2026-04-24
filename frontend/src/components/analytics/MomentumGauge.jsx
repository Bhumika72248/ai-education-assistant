import { useEffect, useRef, useState } from "react";

const SPARKLINE_COLORS = { rising: "#3ECF8E", stable: "#4F8EF7", declining: "#FF6B6B" };
const DIRECTION_META = {
  rising:    { label: "Rising 🔥",          color: "#3ECF8E", bg: "rgba(62,207,142,0.12)" },
  stable:    { label: "Stable →",           color: "#4F8EF7", bg: "rgba(79,142,247,0.12)" },
  declining: { label: "Needs attention ⚠️", color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
};

function getArcColor(score) {
  if (score >= 70) return "#3ECF8E";
  if (score >= 40) return "#F5A623";
  return "#FF6B6B";
}

export default function MomentumGauge({ data }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [tooltip, setTooltip] = useState(false);
  const animRef = useRef(null);

  const score = data?.score ?? 0;
  const direction = data?.direction ?? "stable";
  const sparkline = data?.sparkline ?? [];
  const subScores = {
    "Submission Pace": data?.submission_pace_score ?? 0,
    "Time Trend":      data?.time_trend_score      ?? 0,
    Consistency:       data?.consistency_score      ?? 0,
  };

  useEffect(() => {
    let start = null;
    const duration = 1200;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [score]);

  // Arc maths
  const R = 80, cx = 110, cy = 110, strokeW = 14;
  const startAngle = -210, endAngle = 30, totalArc = endAngle - startAngle;
  const frac = displayScore / 100;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPath = (pct) => {
    const sa = toRad(startAngle);
    const ea = toRad(startAngle + totalArc * pct);
    const laf = totalArc * pct > 180 ? 1 : 0;
    const x1 = cx + R * Math.cos(sa), y1 = cy + R * Math.sin(sa);
    const x2 = cx + R * Math.cos(ea), y2 = cy + R * Math.sin(ea);
    return `M ${x1} ${y1} A ${R} ${R} 0 ${laf} 1 ${x2} ${y2}`;
  };

  // Sparkline
  const sparkW = 280, sparkH = 40;
  const vals = sparkline.length ? sparkline : [0];
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const norm = (v) => mx === mn ? sparkH / 2 : sparkH - ((v - mn) / (mx - mn)) * sparkH;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1 || 1)) * sparkW},${norm(v)}`).join(" ");

  const meta = DIRECTION_META[direction] || DIRECTION_META.stable;
  const arcColor = getArcColor(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "28px 0 12px" }}>
      {/* Gauge */}
      <div style={{ position: "relative", cursor: "pointer" }} onMouseEnter={() => setTooltip(true)} onMouseLeave={() => setTooltip(false)}>
        <svg width={220} height={150} viewBox="0 0 220 150">
          {/* Track */}
          <path d={arcPath(1)} fill="none" stroke="#F3F4F6" strokeWidth={strokeW} strokeLinecap="round" />
          {/* Fill */}
          <path d={arcPath(frac)} fill="none" stroke={arcColor} strokeWidth={strokeW} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${arcColor}80)`, transition: "d 0.05s linear" }} />
          {/* Score text */}
          <text x={cx} y={cy + 6} textAnchor="middle" fill="#111827" fontFamily="'DM Sans', sans-serif"
            fontSize={36} fontWeight={700} letterSpacing={-1}>{displayScore}</text>
          <text x={cx} y={cy + 26} textAnchor="middle" fill="#6B7280" fontFamily="'DM Sans', sans-serif" fontSize={11}>MOMENTUM</text>
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: "absolute", top: "110%", left: "50%", transform: "translateX(-50%)",
            background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10,
            padding: "12px 18px", zIndex: 10, minWidth: 200, whiteSpace: "nowrap",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
          }}>
            {Object.entries(subScores).map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 6 }}>
                <span style={{ color: "#6B7280", fontSize: 12 }}>{label}</span>
                <span style={{ color: "#111827", fontSize: 12, fontWeight: 600 }}>{Math.round(val)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sparkline */}
      <svg width={sparkW} height={sparkH + 8} viewBox={`0 0 ${sparkW} ${sparkH + 8}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={SPARKLINE_COLORS[direction] ?? "#4F8EF7"} stopOpacity={0.3} />
            <stop offset="100%" stopColor={SPARKLINE_COLORS[direction] ?? "#4F8EF7"} stopOpacity={1} />
          </linearGradient>
        </defs>
        <polyline points={pts} fill="none" stroke="url(#sparkGrad)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p style={{ color: "#6B7280", fontSize: 11, margin: "-8px 0 0", letterSpacing: 1 }}>LAST 14 DAYS</p>

      {/* Direction Badge */}
      <div style={{
        background: meta.bg, border: `1px solid ${meta.color}40`, borderRadius: 20,
        padding: "6px 18px", color: meta.color, fontWeight: 700, fontSize: 14,
        letterSpacing: 0.5, marginTop: 4
      }}>
        {meta.label}
      </div>
    </div>
  );
}
