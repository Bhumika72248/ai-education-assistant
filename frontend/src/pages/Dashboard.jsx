import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/client";
import PageWrapper from "../components/ui/PageWrapper";
import {
  StopwatchIcon,
  CalendarIcon,
  NotesIcon,
  ScratchIcon,
  StudentIcon,
  AnalyticsIcon,
  FileIcon,
  ChatIcon,
  BoltIcon,
  QuizIcon,
  FireIcon,
} from "../components/ui/Icon";

const QUICK_LINKS = [
  { to: "/student", icon: StopwatchIcon, label: "Stopwatch",   sub: "Track study time",   color: "#6E48AA", bg: "rgba(110,72,170,0.08)"  },
  { to: "/student", icon: CalendarIcon,  label: "Calendar",    sub: "Study planner",      color: "#0099cc", bg: "rgba(0,153,204,0.08)"  },
  { to: "/student", icon: NotesIcon,     label: "Notes",       sub: "Write & organise",   color: "#059669", bg: "rgba(5,150,105,0.08)"  },
  { to: "/student", icon: ScratchIcon,   label: "Scratch Pad", sub: "Rough work canvas",  color: "#d97706", bg: "rgba(217,119,6,0.08)"  },
  { to: "/student", icon: StudentIcon,   label: "Consistency", sub: "Study heatmap",      color: "#9D50BB", bg: "rgba(157,80,187,0.08)" },
  { to: "/student", icon: AnalyticsIcon, label: "Time Spent",  sub: "Weekly hours",       color: "#6E48AA", bg: "rgba(110,72,170,0.08)"  },
  { to: "/student", icon: FileIcon,      label: "Notes PDF",   sub: "Export & print",     color: "#059669", bg: "rgba(5,150,105,0.08)"  },
  { to: "/chat",    icon: ChatIcon,      label: "AI Tutor",    sub: "Ask anything",       color: "#9D50BB", bg: "rgba(157,80,187,0.08)" },
  { to: "/quiz",    icon: QuizIcon,      label: "Quiz",        sub: "Test knowledge",     color: "#dc2626", bg: "rgba(220,38,38,0.08)"  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function Dashboard() {
  const [analytics, setAnalytics]       = useState(null);
  const [assignedTopics, setAssignedTopics] = useState([]);
  const [materials, setMaterials]       = useState([]);
  const [loadingQuick5, setLoadingQuick5] = useState(false);
  const navigate = useNavigate();

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name     = localStorage.getItem("name") || "Student";

  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user_id");
    const parsed = Number(raw);
    const userId = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const res = await api.get("/analytics/me", { params: { user_id: userId } });
        setAnalytics(res.data);
      } catch (err) {
        // quick client-side fallback so UI remains responsive
        const topics_pool = ["General"];
        const days = Array.from({ length: 7 }).map((_, i) => ({
          day: i + 1,
          focus: topics_pool[i % topics_pool.length],
          tasks: [
            `Review key concepts of ${topics_pool[i % topics_pool.length]}`,
            `Practice 10 questions`,
            `Watch a short tutorial`,
          ],
          estimated_time: "30-45 mins",
        }));
        setAnalytics({
          total_quizzes: 0,
          avg_score: 0,
          topics: [],
          scores: [],
          dates: [],
          quiz_scores: [],
          streak: 0,
          learning_path: { weekly_goal: "General practice", days, note: "Client fallback" },
          study_hours: 0,
          days_active: 0,
        });
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, []);

  useEffect(() => {
    api.get("/quiz/assigned").then(r => setAssignedTopics(r.data.assigned_topics || [])).catch(() => {});
    api.get("/materials").then(r => setMaterials(r.data.materials || [])).catch(() => {});
  }, []);

  const handleQuick5 = async () => {
    setLoadingQuick5(true);
    try {
      const res   = await api.get("/quiz/weakest-topic");
      const topic = res.data.topic;
      navigate(`/quiz?quick5=${encodeURIComponent(topic)}`);
    } catch {
      navigate(`/quiz?quick5=${encodeURIComponent("General Aptitude")}`);
    } finally {
      setLoadingQuick5(false);
    }
  };

  return (
    <PageWrapper>
      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          marginBottom: 28,
          borderRadius: 24,
          padding: "32px 36px",
          background: "#FFFFFF",
          border: "1px solid rgba(110,72,170,0.15)",
          boxShadow: "0 4px 20px rgba(110,72,170,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div style={{
          position: "absolute", top: "-50%", right: "-10%",
          width: 300, height: 300,
          background: "radial-gradient(circle, rgba(110,72,170,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 13, color: "#6E48AA", fontWeight: 600, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {greeting} 👋
          </p>
          <h1 style={{
            fontSize: 30, fontWeight: 800, margin: "0 0 8px",
            background: "linear-gradient(135deg, #1A0B42 0%, #2d1b69 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", letterSpacing: "-0.03em",
          }}>
            {name}
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
            Ready to study? You have 3 upcoming events this week.
          </p>
        </div>

        <motion.button
          onClick={handleQuick5}
          disabled={loadingQuick5}
          whileHover={!loadingQuick5 ? { scale: 1.05, y: -3 } : {}}
          whileTap={!loadingQuick5 ? { scale: 0.97 } : {}}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 28px",
            background: "linear-gradient(135deg, #6E48AA, #9D50BB)",
            border: "none", borderRadius: 14,
            color: "#FFFFFF", fontSize: 15, fontWeight: 700,
            cursor: loadingQuick5 ? "wait" : "pointer",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 8px 28px rgba(110,72,170,0.45), 0 0 15px rgba(0,242,255,0.15)",
            opacity: loadingQuick5 ? 0.7 : 1,
            position: "relative",
          }}
        >
          {loadingQuick5
            ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Launching...</>
            : <><BoltIcon size={18} /> Quick 5 Quiz</>
          }
        </motion.button>
      </motion.div>

      {/* ── Quick Access Grid ── */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#1A0B42", letterSpacing: "0.08em", textTransform: "uppercase" }}
      >
        Quick Access
      </motion.h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}
      >
        {QUICK_LINKS.map((link, i) => (
          <motion.div key={i} variants={item}>
            <Link to={link.to} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: "20px 16px",
                  border: `1px solid ${link.color}30`,
                  cursor: "pointer",
                  transition: "box-shadow 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(110,72,170,0.08)",
                }}
                whileHover_boxShadow={`0 12px 32px ${link.color}25`}
              >
                <div style={{
                  position: "absolute", top: -10, right: -10,
                  width: 60, height: 60,
                  background: `radial-gradient(circle, ${link.color}20 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />
                <div style={{ fontSize: 28, marginBottom: 10, color: link.color, display: 'inline-flex', alignItems: 'center' }}>
                  {(() => {
                    const Icon = link.icon;
                    return <Icon size={28} />;
                  })()}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1A0B42", marginBottom: 3 }}>{link.label}</div>
                <div style={{ fontSize: 11, color: link.color, fontWeight: 500 }}>{link.sub}</div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}
      >
        {[
          { label: "Today's Study", value: "2h 45m",    icon: StopwatchIcon, color: "#6E48AA" },
          { label: "Week Streak",   value: "6 days",     icon: FireIcon,      color: "#d97706" },
          { label: "Notes Created", value: "12",         icon: NotesIcon,     color: "#059669" },
        ].map(s => (
          <motion.div
            key={s.label}
            variants={item}
            whileHover={{ y: -4, scale: 1.02 }}
            className="card-solid"
            style={{ textAlign: "center", border: `1px solid ${s.color}22`, position: "relative", overflow: "hidden" }}
          >
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: 80, height: 80,
              background: `radial-gradient(circle, ${s.color}15 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
            <div style={{ fontSize: 26, marginBottom: 8, display: 'inline-flex', alignItems: 'center' }}>{(() => { const Icon = s.icon; return <Icon size={26} /> })()}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Weekly Learning Path ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="card-solid"
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
              This Week's Learning Path
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
              Personalized 7-day plan
            </p>
          </div>
          <Link to="/analytics" style={{
            fontSize: 12, color: "#6E48AA", textDecoration: "none", fontWeight: 600,
            padding: "5px 12px", borderRadius: 8,
            background: "rgba(110,72,170,0.08)", border: "1px solid rgba(110,72,170,0.18)",
          }}>
            View analytics →
          </Link>
        </div>

        {loadingAnalytics ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
            ))}
          </div>
        ) : !analytics || !analytics.learning_path ? (
          <div style={{
            padding: "24px", textAlign: "center",
            background: "rgba(110,72,170,0.04)", borderRadius: 14,
            border: "1px dashed rgba(110,72,170,0.2)",
          }}>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
              Complete a quiz to generate your personalized 7-day learning path.
            </p>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: 14, fontSize: 13, color: "var(--text-secondary)" }}>
              Goal: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{analytics.learning_path.weekly_goal}</span>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {(analytics.learning_path.days || []).slice(0, 7).map((dayPlan, idx) => (
                <motion.div
                  key={dayPlan.day}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    border: "1px solid rgba(110,72,170,0.12)",
                    borderRadius: 12, padding: "12px 14px",
                    background: "#FFFFFF",
                  }}
                >
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Day {dayPlan.day}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    {dayPlan.focus}
                  </div>
                  <div style={{ fontSize: 11, color: "#6E48AA", marginBottom: 6 }}>{dayPlan.estimated_time}</div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                    {(dayPlan.tasks || []).slice(0, 3).map((task, i) => <li key={i}>{task}</li>)}
                  </ul>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* ── Assigned Topics ── */}
      {assignedTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: 24 }}
        >
          <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#1A0B42", letterSpacing: "0.08em", textTransform: "uppercase", display: 'flex', alignItems: 'center', gap: 8 }}>
            <QuizIcon size={16} /> Assigned Quiz Topics
          </h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {assignedTopics.map(t => (
              <Link key={t.id} to="/quiz" style={{ textDecoration: "none" }}>
                <motion.span
                  whileHover={{ scale: 1.05, y: -2 }}
                  style={{
                    display: "inline-block",
                    padding: "8px 18px", borderRadius: 20,
                    fontSize: 13, fontWeight: 600,
                    background: "#FFFFFF",
                    color: "#6E48AA",
                    border: "1px solid rgba(110,72,170,0.25)",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(110,72,170,0.08)",
                  }}
                >
                  {t.topic}
                </motion.span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Course Materials ── */}
      {materials.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#1A0B42", letterSpacing: "0.08em", textTransform: "uppercase", display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileIcon size={16} /> Course Materials
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {materials.map(m => (
              <a key={m.id} href={`http://localhost:8000${m.file_url}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 14, padding: "18px",
                    border: "1px solid rgba(5,150,105,0.2)",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(5,150,105,0.08)",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10, display: 'inline-flex', alignItems: 'center' }}><FileIcon size={28} /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 500 }}>Click to view PDF →</div>
                </motion.div>
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </PageWrapper>
  );
}
