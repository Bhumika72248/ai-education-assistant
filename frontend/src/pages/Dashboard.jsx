import { Link } from "react-router-dom";

const QUICK_LINKS = [
  { to: "/student", icon: "⏱️", label: "Stopwatch", sub: "Track study time", color: "var(--accent-light)", border: "var(--accent)" },
  { to: "/student", icon: "📅", label: "Calendar", sub: "Study planner", color: "#eff6ff", border: "#3b82f6" },
  { to: "/student", icon: "📝", label: "Notes", sub: "Write & organise", color: "#ecfdf5", border: "#10b981" },
  { to: "/student", icon: "✏️", label: "Scratch Pad", sub: "Rough work canvas", color: "#fffbeb", border: "#f59e0b" },
  { to: "/student", icon: "🗺️", label: "Consistency", sub: "Study heatmap", color: "#fdf2f8", border: "#ec4899" },
  { to: "/student", icon: "📊", label: "Time Spent", sub: "Weekly hours", color: "#f5f3ff", border: "#8b5cf6" },
  { to: "/student", icon: "📄", label: "Notes PDF", sub: "Export & print", color: "#f0fdf4", border: "#22c55e" },
  { to: "/chat",    icon: "💬", label: "AI Tutor",  sub: "Ask anything",   color: "var(--accent-light)", border: "var(--accent)" },
];

export default function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div className="card" style={{ marginBottom: 20, background: "var(--accent-light)", border: "1px solid #c7d2fe" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "var(--accent)" }}>
          {greeting}, Priya 👋
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
          Ready to study? You have 3 upcoming events this week.
        </p>
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
    </div>
  );
}
