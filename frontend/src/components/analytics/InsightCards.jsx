import { useState } from "react";

const ICON_MAP = {
  trend:      "📈",
  clock:      "⏰",
  lightbulb:  "💡",
};
const ACCENT = ["#4F8EF7", "#A855F7", "#3ECF8E"];

export default function InsightCards({ insights, onRefresh, lastRefreshed }) {
  const [refreshing, setRefreshing] = useState(false);
  const [hoursLeft, setHoursLeft] = useState(null);

  const handleRefresh = async () => {
    if (lastRefreshed) {
      const diff = (Date.now() - new Date(lastRefreshed).getTime()) / 3600000;
      if (diff < 24) {
        setHoursLeft(Math.ceil(24 - diff));
        return;
      }
    }
    setRefreshing(true);
    setHoursLeft(null);
    await onRefresh?.();
    setRefreshing(false);
  };

  if (!insights || insights.length === 0) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            background: "#F9FAFB", borderRadius: 14, height: 100,
            animation: "shimmer 1.5s ease-in-out infinite",
            backgroundImage: "linear-gradient(90deg,#F9FAFB 0%,#F3F4F6 50%,#F9FAFB 100%)",
            backgroundSize: "200% 100%"
          }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12, alignItems: "center", gap: 10 }}>
        {hoursLeft && (
          <span style={{ color: "#6B7280", fontSize: 12 }}>Next refresh in {hoursLeft}h</span>
        )}
        <button onClick={handleRefresh} disabled={refreshing} style={{
          background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.3)",
          borderRadius: 8, color: "#4F8EF7", fontSize: 12, padding: "6px 14px", cursor: "pointer",
          fontWeight: 600, transition: "background 0.2s", opacity: refreshing ? 0.6 : 1
        }}
          onMouseEnter={(e) => !refreshing && (e.target.style.background = "rgba(79,142,247,0.2)")}
          onMouseLeave={(e) => (e.target.style.background = "rgba(79,142,247,0.1)")}
        >
          {refreshing ? "Refreshing…" : "↻ Refresh insights"}
        </button>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16
      }}>
        {insights.map((ins, i) => (
          <div key={i} style={{
            background: "#FFFFFF",
            borderLeft: `3px solid ${ACCENT[i % ACCENT.length]}`,
            borderRadius: 14, padding: "20px 20px 20px 18px",
            boxShadow: `0 0 0 1px #E5E7EB`,
            animation: `fadeInDown 0.4s ease-out ${i * 0.12}s both`,
            display: "flex", flexDirection: "column", gap: 10
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 22, background: `${ACCENT[i % ACCENT.length]}18`,
                borderRadius: 8, padding: "4px 8px"
              }}>
                {ICON_MAP[ins.type] || "💡"}
              </span>
            </div>
            <p style={{
              color: "#4B5563", fontSize: 14, margin: 0, lineHeight: 1.6, fontWeight: 500
            }}>
              {ins.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
