import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Stopwatch    from "../components/student/Stopwatch";
import StudyCalendar from "../components/student/StudyCalendar";
import NotesEditor  from "../components/student/NotesEditor";
import ScratchPad   from "../components/student/ScratchPad";
import ConsistencyMap from "../components/student/ConsistencyMap";
import TimeTracker  from "../components/student/TimeTracker";
import NotesPDF     from "../components/student/NotesPDF";
import PageWrapper  from "../components/ui/PageWrapper";
import { StopwatchIcon, CalendarIcon, NotesIcon, ScratchIcon, StudentIcon, AnalyticsIcon, FileIcon } from "../components/ui/Icon";

const tabs = [
  { id: "timer",       icon: StopwatchIcon, label: "Stopwatch",   color: "#6E48AA" },
  { id: "calendar",   icon: CalendarIcon,  label: "Calendar",     color: "#0099cc" },
  { id: "notes",      icon: NotesIcon,     label: "Notes",        color: "#059669" },
  { id: "scratch",    icon: ScratchIcon,   label: "Scratch Pad",  color: "#d97706" },
  { id: "consistency",icon: StudentIcon,   label: "Consistency",  color: "#9D50BB" },
  { id: "time",       icon: AnalyticsIcon, label: "Time Spent",   color: "#6E48AA" },
  { id: "pdf",        icon: FileIcon,      label: "Notes PDF",    color: "#059669" },
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

  const activeTab = tabs.find(t => t.id === active);

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, margin: "0 0 6px",
          background: "linear-gradient(135deg, #1A0B42 0%, #6E48AA 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", letterSpacing: "-0.03em",
        }}>
          Student Hub
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
          All your productivity tools in one place.
        </p>
      </motion.div>

      {/* Tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "flex", gap: 4, flexWrap: "wrap",
          marginBottom: 24, padding: 5,
          background: "rgba(255,255,255,0.7)",
          borderRadius: 18, border: "1px solid rgba(110,72,170,0.12)",
          boxShadow: "0 2px 12px rgba(110,72,170,0.08)",
        }}
      >
        {tabs.map(t => (
          <motion.button
            key={t.id}
            onClick={() => setActive(t.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 13, border: "none",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s ease",
              background: active === t.id
                ? `linear-gradient(135deg, ${t.color}30, ${t.color}18)`
                : "transparent",
              color: active === t.id ? t.color : "var(--text-secondary)",
              boxShadow: active === t.id ? `0 2px 12px ${t.color}20` : "none",
              border: active === t.id ? `1px solid ${t.color}30` : "1px solid transparent",
            }}
          >
            <span style={{ fontSize: 15, display: 'inline-flex', alignItems: 'center' }}>{(() => { const I = t.icon; return <I size={15} /> })()}</span>
            <span>{t.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </PageWrapper>
  );
}
