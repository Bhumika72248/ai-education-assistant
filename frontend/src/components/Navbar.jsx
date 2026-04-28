import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HomeIcon,
  StudentIcon,
  CoursesIcon,
  ChatIcon,
  QuizIcon,
  AnalyticsIcon,
  AssignmentIcon,
} from "./ui/Icon";

export default function Navbar() {
  const loc      = useLocation();
  const navigate = useNavigate();
  const role     = localStorage.getItem("role") || "student";
  const name     = localStorage.getItem("name") || "User";
  const firstLetter = name.charAt(0).toUpperCase();

  const NAV_ITEMS = role === "teacher"
    ? [{ to: "/teacher", label: "Dashboard", icon: StudentIcon }]
    : [
        { to: "/",           label: "Home",       icon: HomeIcon },
        { to: "/student",    label: "Hub",         icon: StudentIcon },
        { to: "/courses",    label: "Courses",     icon: CoursesIcon },
        { to: "/chat",       label: "AI Tutor",    icon: ChatIcon },
        { to: "/quiz",       label: "Quiz",        icon: QuizIcon },
        { to: "/analytics",  label: "Analytics",   icon: AnalyticsIcon },
        { to: "/assignment", label: "Assignments", icon: AssignmentIcon },
      ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(110,72,170,0.12)",
        boxShadow: "0 4px 24px rgba(110,72,170,0.1)",
      }}
    >
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 20px",
        display: "flex", alignItems: "center", height: 60, gap: 8,
      }}>
        {/* Logo */}
        <Link to={role === "teacher" ? "/teacher" : "/"} style={{ textDecoration: "none", marginRight: 24, flexShrink: 0 }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, #6E48AA, #9D50BB)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, boxShadow: "0 4px 12px rgba(110,72,170,0.3)", color: "#fff",
            }}>
              <StudentIcon size={16} />
            </div>
            <span style={{
              fontWeight: 800, fontSize: 18,
              background: "linear-gradient(135deg, #6E48AA 0%, #9D50BB 50%, #0099cc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", letterSpacing: "-0.03em",
            }}>EduAI</span>
          </motion.div>
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", gap: 2, flex: 1, overflowX: "auto" }}>
          {NAV_ITEMS.map(({ to, label, icon }) => {
            const active = loc.pathname === to;
            return (
              <Link key={to} to={to} style={{ textDecoration: "none", flexShrink: 0 }}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 10,
                    fontSize: 13, fontWeight: active ? 600 : 500,
                    color: active ? "#6E48AA" : "var(--text-secondary)",
                    background: active
                      ? "linear-gradient(135deg, rgba(110,72,170,0.1), rgba(157,80,187,0.07))"
                      : "transparent",
                    border: active ? "1px solid rgba(110,72,170,0.2)" : "1px solid transparent",
                    transition: "all 0.2s ease", position: "relative",
                  }}
                >
                  <span style={{ fontSize: 14, display: "inline-flex", alignItems: "center" }}>
                    {(() => {
                      const Icon = icon;
                      return <Icon size={16} style={{ color: active ? "#6E48AA" : "inherit" }} />;
                    })()}
                  </span>
                  <span>{label}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: "absolute", bottom: -1, left: "50%",
                        transform: "translateX(-50%)",
                        width: 4, height: 4, borderRadius: "50%",
                        background: "#6E48AA",
                        boxShadow: "0 0 8px rgba(110,72,170,0.6)",
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            title={name}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #6E48AA, #9D50BB)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "0 0 0 2px rgba(110,72,170,0.2), 0 4px 12px rgba(110,72,170,0.2)",
            }}
          >{firstLetter}</motion.div>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.03, background: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.3)", color: "#dc2626" }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "rgba(110,72,170,0.06)",
              border: "1px solid rgba(110,72,170,0.15)",
              color: "var(--text-secondary)",
              padding: "5px 12px", borderRadius: 8,
              fontSize: 12, cursor: "pointer", fontWeight: 500,
              fontFamily: "'Inter', sans-serif", transition: "all 0.2s ease",
            }}
          >Logout</motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
