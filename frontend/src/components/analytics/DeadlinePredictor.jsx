import { useState } from "react";

const STATUS_META = {
  on_track:  { color: "#3ECF8E", bg: "rgba(62,207,142,0.12)", label: "On Track"   },
  at_risk:   { color: "#F5A623", bg: "rgba(245,166,35,0.12)",  label: "At Risk"   },
  start_now: { color: "#FF6B6B", bg: "rgba(255,107,107,0.12)", label: "Start Now" },
};

export default function DeadlinePredictor({ predictions }) {
  const [expanded, setExpanded] = useState(false);
  const [modalItem, setModalItem] = useState(null);

  if (!predictions || predictions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "#6B7280" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
        <p style={{ margin: 0, fontSize: 14 }}>All clear — no deadlines in the next 14 days.</p>
      </div>
    );
  }

  const displayList = expanded ? predictions : predictions.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {displayList.map((item, i) => {
        const meta = STATUS_META[item.prediction] || STATUS_META.on_track;
        return (
          <div key={item.assignment_id || i}
            onClick={() => setModalItem(item)}
            style={{
              background: "#FFFFFF", border: "1px solid #E5E7EB",
              borderRadius: 12, padding: "14px 18px", cursor: "pointer",
              transition: "background 0.2s, transform 0.2s",
              animation: `fadeInDown 0.35s ease-out ${i * 0.08}s both`
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#111827", fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>{item.title}</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{
                    background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.25)",
                    color: "#4F8EF7", borderRadius: 6, fontSize: 11, padding: "2px 8px", fontWeight: 600
                  }}>{item.topic}</span>
                  <span style={{ color: "#6B7280", fontSize: 11 }}>Due in {item.due_in_days} days</span>
                </div>
              </div>
              <div style={{
                background: meta.bg, border: `1px solid ${meta.color}40`,
                borderRadius: 8, padding: "4px 12px", color: meta.color, fontWeight: 700, fontSize: 12,
                whiteSpace: "nowrap", flexShrink: 0
              }}>{meta.label}</div>
            </div>
            {(item.prediction === "at_risk" || item.prediction === "start_now") && (
              <p style={{ color: "#6B7280", fontSize: 12, margin: "8px 0 0" }}>
                📅 Start by <span style={{ color: meta.color, fontWeight: 600 }}>{item.start_by_date}</span> based on your pace
              </p>
            )}
          </div>
        );
      })}

      {predictions.length > 5 && (
        <button onClick={() => setExpanded((e) => !e)} style={{
          background: "none", border: "1px solid rgba(79,142,247,0.3)", borderRadius: 10,
          color: "#4F8EF7", fontSize: 13, padding: "10px 0", cursor: "pointer",
          fontWeight: 600, transition: "background 0.2s"
        }}
          onMouseEnter={(e) => e.target.style.background = "rgba(79,142,247,0.08)"}
          onMouseLeave={(e) => e.target.style.background = "none"}
        >
          {expanded ? "Show less ▲" : `See all ${predictions.length} assignments ▼`}
        </button>
      )}

      {/* Mini Modal */}
      {modalItem && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.15s ease-out"
        }} onClick={() => setModalItem(null)}>
          <div style={{
            background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16,
            padding: 28, maxWidth: 380, width: "90%", boxShadow: "0 16px 64px rgba(0,0,0,0.6)"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "#111827", margin: "0 0 8px", fontSize: 18 }}>{modalItem.title}</h3>
            <div style={{
              background: (STATUS_META[modalItem.prediction] || STATUS_META.on_track).bg,
              border: `1px solid ${(STATUS_META[modalItem.prediction] || STATUS_META.on_track).color}40`,
              borderRadius: 8, padding: "4px 12px", color: (STATUS_META[modalItem.prediction] || STATUS_META.on_track).color,
              fontWeight: 700, fontSize: 13, display: "inline-block", marginBottom: 16
            }}>
              {(STATUS_META[modalItem.prediction] || STATUS_META.on_track).label}
            </div>
            <p style={{ color: "#4B5563", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
              Based on your pace in <strong style={{ color: "#4F8EF7" }}>{modalItem.topic}</strong>, you typically need a few days for this type of assignment. It's due in <strong style={{ color: "#111827" }}>{modalItem.due_in_days} days</strong>.
            </p>
            <button onClick={() => setModalItem(null)} style={{
              background: "#F3F4F6", border: "none", borderRadius: 10,
              color: "#6B7280", padding: "10px 24px", cursor: "pointer", fontSize: 14
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
