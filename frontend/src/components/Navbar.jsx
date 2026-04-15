import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/student", label: "Student Hub", icon: "🎓" },
  { to: "/chat", label: "Chat", icon: "💬" },
  { to: "/quiz", label: "Quiz", icon: "📝" },
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/assignment", label: "Assignments", icon: "📋" },
  { to: "/teacher", label: "Teacher", icon: "👩‍🏫" },
];

export default function Navbar() {
  const loc = useLocation();
  return (
    <nav style={{
      background: "white", borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: 56 }}>
        {/* Logo */}
        <Link to="/" style={{
          fontWeight: 700, fontSize: 20, color: "var(--accent)",
          textDecoration: "none", marginRight: 32, letterSpacing: "-0.5px"
        }}>
          EduAI
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 4, flex: 1, overflowX: "auto" }}>
          {NAV_ITEMS.map(({ to, label, icon }) => {
            const active = loc.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 8, textDecoration: "none",
                  fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  background: active ? "var(--accent-light)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* User */}
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "var(--accent-light)", color: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0
        }}>
          P
        </div>
      </div>
    </nav>
  );
}
