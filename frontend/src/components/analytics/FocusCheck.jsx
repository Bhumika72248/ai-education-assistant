import { useState } from "react";

const BASE_URL = "http://localhost:8000";

export default function FocusCheck({ flags, userId = 1, onDismiss }) {
  const [dismissed, setDismissed] = useState([]);

  const visible = (flags || []).filter((f) => !dismissed.includes(f.topic_id)).slice(0, 2);

  if (!flags || flags.length === 0 || visible.length === 0) {
    return (
      <div style={{
        background: "rgba(62,207,142,0.08)", border: "1px solid rgba(62,207,142,0.25)",
        borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", gap: 14
      }}>
        <span style={{ fontSize: 22 }}>✅</span>
        <p style={{ color: "#3ECF8E", margin: 0, fontWeight: 600, fontSize: 14 }}>
          You're pacing well across all topics — keep it up!
        </p>
      </div>
    );
  }

  const handleDismiss = async (topicId) => {
    try {
      await fetch(`${BASE_URL}/analytics/burnout-flags/${encodeURIComponent(topicId)}/dismiss?user_id=${userId}`, {
        method: "POST"
      });
    } catch (_) {}
    setDismissed((prev) => [...prev, topicId]);
    onDismiss?.(topicId);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {visible.map((f, i) => {
        const isBurnout = f.flag_type === "burnout_risk";
        const color = isBurnout ? "#F5A623" : "#FF6B6B";
        const bg = isBurnout ? "rgba(245,166,35,0.08)" : "rgba(255,107,107,0.08)";
        const border = isBurnout ? "rgba(245,166,35,0.3)" : "rgba(255,107,107,0.3)";
        const icon = isBurnout ? "🔥" : "📅";
        return (
          <div key={f.topic_id} style={{
            background: bg, border: `1px solid ${border}`, borderRadius: 14,
            padding: "16px 22px", display: "flex", alignItems: "flex-start",
            gap: 14, animation: `fadeInDown 0.35s ease-out ${i * 0.1}s both`
          }}>
            <span style={{ fontSize: 22, marginTop: 2 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ color, fontWeight: 700, fontSize: 13, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.8 }}>
                {isBurnout ? "Burnout Risk" : "Avoidance Risk"}
              </p>
              <p style={{ color: "#4B5563", fontSize: 14, margin: 0, lineHeight: 1.5 }}>{f.message}</p>
            </div>
            <button onClick={() => handleDismiss(f.topic_id)} style={{
              background: "#F3F4F6", border: `1px solid #E5E7EB`,
              borderRadius: 8, color: "#6B7280", fontSize: 12, padding: "5px 12px",
              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, marginTop: 2,
              transition: "background 0.2s"
            }}
              onMouseEnter={(e) => e.target.style.background = "#E5E7EB"}
              onMouseLeave={(e) => e.target.style.background = "#F3F4F6"}
            >
              Got it
            </button>
          </div>
        );
      })}
    </div>
  );
}
