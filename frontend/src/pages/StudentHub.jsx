import { useState } from "react";
import Stopwatch from "../components/student/Stopwatch";
import StudyCalendar from "../components/student/StudyCalendar";
import NotesEditor from "../components/student/NotesEditor";
import ScratchPad from "../components/student/ScratchPad";
import ConsistencyMap from "../components/student/ConsistencyMap";
import TimeTracker from "../components/student/TimeTracker";
import NotesPDF from "../components/student/NotesPDF";

const tabs = [
  { id: "timer",       icon: "⏱️", label: "Stopwatch"      },
  { id: "calendar",   icon: "📅", label: "Calendar"       },
  { id: "notes",      icon: "📝", label: "Notes"          },
  { id: "scratch",    icon: "✏️", label: "Scratch Pad"    },
  { id: "consistency",icon: "🗺️", label: "Consistency"    },
  { id: "time",       icon: "📊", label: "Time Spent"     },
  { id: "pdf",        icon: "📄", label: "Notes PDF"      },
];

export default function StudentHub() {
  const [active, setActive] = useState("timer");

  const renderContent = () => {
    switch (active) {
      case "timer":        return <Stopwatch />;
      case "calendar":     return <StudyCalendar />;
      case "notes":        return <NotesEditor />;
      case "scratch":      return <ScratchPad />;
      case "consistency":  return <ConsistencyMap />;
      case "time":         return <TimeTracker />;
      case "pdf":          return <NotesPDF />;
      default:             return null;
    }
  };

  return (
    <div className="fade-in" style={{ minHeight: "calc(100vh - 60px)" }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 6, flexWrap: "wrap",
        marginBottom: 20, padding: "4px",
        background: "#ffffff", borderRadius: 12,
        border: "1px solid var(--border)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 9, border: "none",
              cursor: "pointer", fontSize: 13, fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s ease",
              background: active === t.id ? "var(--accent)" : "transparent",
              color: active === t.id ? "white" : "var(--text-secondary)",
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="fade-in" key={active}>
        {renderContent()}
      </div>
    </div>
  );
}
