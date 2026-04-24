import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "student";
  const name = localStorage.getItem("name") || "User";
  const firstLetter = name.charAt(0).toUpperCase();

  const NAV_ITEMS = role === "teacher" 
    ? [
        { to: "/teacher", label: "Teacher Dashboard", icon: "👩‍🏫" },
      ]
    : [
        { to: "/", label: "Dashboard", icon: "🏠" },
        { to: "/student", label: "Student Hub", icon: "🎓" },
        { to: "/courses", label: "Courses", icon: "📚" },
        { to: "/chat", label: "Chat", icon: "💬" },
        { to: "/quiz", label: "Quiz", icon: "📝" },
        { to: "/analytics", label: "Analytics", icon: "📊" },
        { to: "/assignment", label: "Assignments", icon: "📋" },
      ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  return (
    <nav style={{
      background: "white", borderBottom: "1px solid var(--border)",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: 56 }}>
        {/* Logo */}
        <Link to={role === "teacher" ? "/teacher" : "/"} style={{
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

        {/* User & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "var(--accent-light)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0
          }} title={name}>
            {firstLetter}
          </div>
          <button onClick={handleLogout} style={{
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--text-secondary)", padding: "4px 10px", borderRadius: "6px",
            fontSize: "12px", cursor: "pointer", fontWeight: "500", transition: "all 0.15s"
          }} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
