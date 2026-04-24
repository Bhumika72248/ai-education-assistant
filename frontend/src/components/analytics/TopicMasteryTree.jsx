import { useState } from "react";

const TIER_META = {
  mastered:  { color: "#F5A623", glow: "#F5A62360", label: "Mastered",   icon: "⭐" },
  proficient:{ color: "#A855F7", glow: "#A855F760", label: "Proficient", icon: "💡" },
  learning:  { color: "#4F8EF7", glow: "#4F8EF760", label: "Learning",   icon: "📘" },
  locked:    { color: "#9CA3AF", glow: "transparent", label: "Locked",   icon: "🔒" },
};

function buildTree(topics) {
  // Group into rows for display (no prereq = row 0, etc.)
  const nodeMap = {};
  topics.forEach((t) => { nodeMap[t.topic_id] = t; });
  const rows = [];
  const placed = new Set();
  // Row 0: no prereq or prereq not found
  const row0 = topics.filter((t) => !t.prereq || !nodeMap[t.prereq]);
  rows.push(row0);
  row0.forEach((t) => placed.add(t.topic_id));
  // Subsequent rows
  let changed = true;
  while (changed) {
    changed = false;
    const row = topics.filter((t) => !placed.has(t.topic_id) && t.prereq && placed.has(t.prereq));
    if (row.length) { rows.push(row); row.forEach((t) => { placed.add(t.topic_id); changed = true; }); }
  }
  // leftover
  const leftover = topics.filter((t) => !placed.has(t.topic_id));
  if (leftover.length) rows.push(leftover);
  return rows;
}

const NODE_R = 28;
const H_GAP = 110;
const V_GAP = 110;
const PAD = 40;

function computePositions(rows) {
  const positions = {};
  rows.forEach((row, rowIdx) => {
    const y = PAD + rowIdx * V_GAP;
    row.forEach((t, colIdx) => {
      const totalW = (row.length - 1) * H_GAP;
      const x = PAD + colIdx * H_GAP + (rows.reduce((mx, r) => Math.max(mx, r.length), 0) - 1) * H_GAP / 2 - totalW / 2;
      positions[t.topic_id] = { x: PAD + colIdx * H_GAP, y };
    });
  });
  return positions;
}

export default function TopicMasteryTree({ topics }) {
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!topics || topics.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#8A8FAD" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
        <p>No topic data yet. Start taking quizzes to grow your skill tree!</p>
      </div>
    );
  }

  const topicsWithPrereqs = topics.map((t, idx) => {
    if (t.prereq) return t;
    return {
      ...t,
      prereq: idx > 0 ? topics[Math.floor((idx - 1) / 2)].topic_id : null
    };
  });
  const rows = buildTree(topicsWithPrereqs);
  const maxCols = rows.reduce((mx, r) => Math.max(mx, r.length), 0);
  const svgW = Math.max(400, PAD * 2 + (maxCols - 1) * H_GAP);
  const svgH = PAD * 2 + (rows.length - 1) * V_GAP;

  // Assign x,y per topic
  const positions = {};
  rows.forEach((row, rowIdx) => {
    const rowW = (row.length - 1) * H_GAP;
    const startX = (svgW - rowW) / 2;
    row.forEach((t, colIdx) => {
      positions[t.topic_id] = { x: startX + colIdx * H_GAP, y: PAD + rowIdx * V_GAP };
    });
  });

  const handleNode = (t) => {
    setSelected(t);
    setDrawerOpen(true);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Scrollable tree */}
      <div style={{ overflowX: "auto", overflowY: "visible", width: "100%", paddingBottom: 8 }}>
        <svg width={svgW} height={svgH} style={{ display: "block", minWidth: svgW, animation: "fadeInDown 0.5s ease-out" }}>
          <defs>
            {topics.map((t) => {
              const meta = TIER_META[t.tier] || TIER_META.locked;
              return (
                <filter key={`glow-${t.topic_id}`} id={`glow-${t.topic_id}`}>
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              );
            })}
          </defs>
          {/* Edges */}
          {topics.map((t) => {
            if (!t.prereq || !positions[t.prereq]) return null;
            const from = positions[t.prereq];
            const to = positions[t.topic_id];
            return (
              <line key={`edge-${t.topic_id}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#E5E7EB" strokeWidth={2} />
            );
          })}
          {/* Nodes */}
          {topics.map((t, i) => {
            const pos = positions[t.topic_id];
            if (!pos) return null;
            const meta = TIER_META[t.tier] || TIER_META.locked;
            const isLocked = t.tier === "locked";
            return (
              <g key={t.topic_id} transform={`translate(${pos.x},${pos.y})`}
                style={{ cursor: "pointer", animation: `fadeInDown 0.4s ease-out ${i * 0.07}s both` }}
                onClick={() => handleNode(t)}>
                {/* Glow ring for mastered */}
                {t.tier === "mastered" && (
                  <circle r={NODE_R + 6} fill="none" stroke={meta.color} strokeWidth={2} opacity={0.4}
                    style={{ animation: "pulse 2s ease-in-out infinite" }} />
                )}
                {/* Node circle */}
                <circle r={NODE_R} fill={isLocked ? "#F3F4F6" : `${meta.color}20`}
                  stroke={meta.color} strokeWidth={2}
                  style={isLocked ? { opacity: 0.5 } : { filter: `drop-shadow(0 0 6px ${meta.glow})` }} />
                {/* Icon */}
                <text textAnchor="middle" dominantBaseline="middle" fontSize={18}>{meta.icon}</text>
                {/* Label */}
                <text y={NODE_R + 14} textAnchor="middle" fill={isLocked ? "#9CA3AF" : "#111827"}
                  fontSize={10} fontFamily="'DM Sans', sans-serif" fontWeight={600}>
                  {t.topic_id.length > 12 ? t.topic_id.slice(0, 11) + "…" : t.topic_id}
                </text>
                {/* Mastery % */}
                <text y={NODE_R + 26} textAnchor="middle" fill={meta.color} fontSize={9} fontFamily="monospace">
                  {isLocked ? "—" : `${Math.round(t.mastery_percent)}%`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Drawer */}
      {drawerOpen && selected && (
        <div style={{
          position: "fixed", right: 0, top: 0, height: "100vh", width: 320,
          background: "#FFFFFF", borderLeft: "1px solid #E5E7EB",
          zIndex: 100, padding: 28, boxShadow: "-8px 0 40px rgba(0,0,0,0.1)",
          display: "flex", flexDirection: "column", gap: 16,
          animation: "slideInRight 0.25s ease-out"
        }}>
          <button onClick={() => setDrawerOpen(false)}
            style={{ alignSelf: "flex-end", background: "none", border: "none", color: "#6B7280", fontSize: 20, cursor: "pointer" }}>✕</button>
          <div style={{ fontSize: 32 }}>{(TIER_META[selected.tier] || TIER_META.locked).icon}</div>
          <h3 style={{ color: "#111827", fontFamily: "'DM Sans',sans-serif", fontSize: 22, margin: 0 }}>{selected.topic_id}</h3>
          <div style={{
            background: `${(TIER_META[selected.tier] || TIER_META.locked).color}18`,
            border: `1px solid ${(TIER_META[selected.tier] || TIER_META.locked).color}40`,
            borderRadius: 8, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6,
            color: (TIER_META[selected.tier] || TIER_META.locked).color, fontSize: 13, fontWeight: 700, width: "fit-content"
          }}>
            {(TIER_META[selected.tier] || TIER_META.locked).label}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            {[
              ["Mastery", `${Math.round(selected.mastery_percent)}%`],
              ["Tier", selected.tier],
              ["Last Active", selected.last_activity_at ? new Date(selected.last_activity_at).toLocaleDateString() : "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ color: "#6B7280", fontSize: 11, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>{k}</p>
                <p style={{ color: "#111827", fontSize: 16, fontWeight: 700, margin: 0 }}>{v}</p>
              </div>
            ))}
          </div>
          <button style={{
            marginTop: "auto", background: "linear-gradient(135deg,#4F8EF7,#7C3AED)",
            border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14,
            padding: "13px 0", cursor: "pointer", letterSpacing: 0.5
          }}>
            Jump to this Topic →
          </button>
        </div>
      )}
    </div>
  );
}
