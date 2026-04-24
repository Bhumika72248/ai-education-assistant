import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/client";

const QUICK_LINKS = [
  { to: "/student", icon: "⏱️", label: "Stopwatch", sub: "Track study time", color: "var(--accent-light)", border: "var(--accent)" },
  { to: "/student", icon: "📅", label: "Calendar", sub: "Study planner", color: "#eff6ff", border: "#3b82f6" },
  { to: "/student", icon: "📝", label: "Notes", sub: "Write & organise", color: "#ecfdf5", border: "#10b981" },
  { to: "/student", icon: "✏️", label: "Scratch Pad", sub: "Rough work canvas", color: "#fffbeb", border: "#f59e0b" },
  { to: "/student", icon: "🗺️", label: "Consistency", sub: "Study heatmap", color: "#fdf2f8", border: "#ec4899" },
  { to: "/student", icon: "📊", label: "Time Spent", sub: "Weekly hours", color: "#f5f3ff", border: "#8b5cf6" },
  { to: "/student", icon: "📄", label: "Notes PDF", sub: "Export & print", color: "#f0fdf4", border: "#22c55e" },
  { to: "/chat",    icon: "💬", label: "AI Tutor",  sub: "Ask anything",   color: "var(--accent-light)", border: "var(--accent)" },
  { to: "/quiz",    icon: "🎯", label: "Quiz",      sub: "Test knowledge", color: "#fef2f2", border: "#ef4444" },
  { to: "/analytics",icon: "📈", label: "Analytics",  sub: "AI Insights",    color: "#e0e7ff", border: "#6366f1" },
];

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user_id");
    const parsed = Number(raw);
    const userId = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

    fetch(`/analytics/me?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch(() => setAnalytics(null));
  }, []);

  const navigate = useNavigate();
  const [loadingQuick5, setLoadingQuick5] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleQuick5 = async () => {
    setLoadingQuick5(true);
    try {
      const res = await api.get("/quiz/weakest-topic");
      const topic = res.data.topic;
      navigate(`/quiz?quick5=${encodeURIComponent(topic)}`);
    } catch (err) {
      console.error(err);
      navigate(`/quiz?quick5=${encodeURIComponent("General Aptitude")}`);
    } finally {
      setLoadingQuick5(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Welcome & Quick 5 Banner */}
      <div className="card" style={{ marginBottom: 20, background: "linear-gradient(to right, var(--accent-light), #e0e7ff)", border: "1px solid #c7d2fe", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px", color: "var(--accent)" }}>
            {greeting}, Priya 👋
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 15 }}>
            Ready to study? You have 3 upcoming events this week.
          </p>
        </div>
        
        {/* Quick 5 Button */}
        <button 
          onClick={handleQuick5}
          disabled={loadingQuick5}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70"
          style={{ border: "none", cursor: loadingQuick5 ? "wait" : "pointer" }}
        >
          {loadingQuick5 ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <span style={{ fontSize: "20px" }}>⚡</span>
          )}
          {loadingQuick5 ? "Launching..." : "Quick 5 Quiz"}
        </button>
      </div>

      {/* Quick access grid */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Quick Access</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {QUICK_LINKS.map((item, i) => (
          <Link
            key={i}
            to={item.to}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: item.color, borderRadius: 12, padding: "18px 16px",
                border: `1px solid ${item.border}33`,
                transition: "all 0.15s", cursor: "pointer"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 20 }}>
        {[
          { label: "Today's Study", value: "2h 45m", icon: "⏱️", color: "var(--accent)" },
          { label: "Week Streak", value: "6 days 🔥", icon: "🔥", color: "#f97316" },
          { label: "Notes Created", value: "12", icon: "📝", color: "var(--green)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Personalized weekly plan */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>This Week's Learning Path</h2>
          <Link to="/analytics" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
            View analytics
          </Link>
        </div>

        {!analytics ? (
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>Loading your weekly plan...</p>
        ) : !analytics.learning_path ? (
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 13 }}>
            Complete a quiz to generate your personalized 7-day learning path.
          </p>
        ) : (
          <div>
            <p style={{ marginTop: 0, marginBottom: 10, fontSize: 13, color: "var(--text-secondary)" }}>
              Goal: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{analytics.learning_path.weekly_goal}</span>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {(analytics.learning_path.days || []).slice(0, 7).map((dayPlan) => (
                <div
                  key={dayPlan.day}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Day {dayPlan.day}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                    {dayPlan.focus}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
                    {dayPlan.estimated_time}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-primary)" }}>
                    {(dayPlan.tasks || []).slice(0, 3).map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
