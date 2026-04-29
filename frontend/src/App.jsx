import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Quiz from "./pages/Quiz";
import Analytics from "./pages/Analytics";
import Notes from "./pages/Notes";
import Assignment from "./pages/Assignment";
import Teacher from "./pages/Teacher";
import StudentHub from "./pages/StudentHub";
import Courses from "./pages/Courses";
import Navbar from "./components/Navbar";
import NarratorIntro from "./components/NarratorIntro";

import bg1 from "./images/ChatGPT Image Apr 27, 2026, 11_50_27 PM.png";
import bg2 from "./images/ChatGPT Image Apr 27, 2026, 11_51_06 PM.png";
import bg3 from "./images/ChatGPT Image Apr 27, 2026, 11_51_20 PM.png";
import bg4 from "./images/ChatGPT Image Apr 27, 2026, 11_52_34 PM.png";

/* ── Page → background image map ── */
const PAGE_BG = {
  "/":           bg2,
  "/student":    bg3,
  "/chat":       bg1,
  "/quiz":       bg4,
  "/analytics":  bg2,
  "/notes":      bg3,
  "/assignment": bg1,
  "/courses":    bg4,
  "/teacher":    bg2,
};

/* ── Custom Cursor ── */
function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos     = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });
  const raf     = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top  = e.clientY + "px";
      }
    };

    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + "px";
        ringRef.current.style.top  = ring.current.y + "px";
      }
      raf.current = requestAnimationFrame(animate);
    };

    const onEnter = () => {
      dotRef.current?.classList.add("hovering");
      ringRef.current?.classList.add("hovering");
    };
    const onLeave = () => {
      dotRef.current?.classList.remove("hovering");
      ringRef.current?.classList.remove("hovering");
    };

    document.addEventListener("mousemove", onMove);
    document.querySelectorAll("a,button,[role=button]").forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    raf.current = requestAnimationFrame(animate);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

/* ── Auth Guards ── */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, allowedRole }) => {
  const role = localStorage.getItem("role") || "student";
  if (role !== allowedRole) {
    return <Navigate to={role === "teacher" ? "/teacher" : "/"} />;
  }
  return children;
};

/* ── Animated Routes (includes background so useLocation works) ── */
function AnimatedRoutes() {
  const location = useLocation();
  const bg = PAGE_BG[location.pathname];

  return (
    <>
      {/* Full-screen background image for inner pages */}
      {bg && (
        <>
          <div style={{
            position: "fixed", inset: 0, zIndex: -2,
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transition: "background-image 0.4s ease",
          }} />
          {/* Light overlay so content stays readable */}
          <div style={{
            position: "fixed", inset: 0, zIndex: -1,
            background: "rgba(240,242,255,0.45)",
            backdropFilter: "blur(0px)",
          }} />
        </>
      )}

      {/* Default CSS background for login page */}
      {!bg && (
        <div className="app-bg">
          <div className="app-bg-grid" />
          <div className="app-bg-blob3" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <PrivateRoute>
              <div style={{ minHeight: "100vh" }}>
                <Navbar />
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
                  <Routes>
                    <Route path="/"           element={<RoleRoute allowedRole="student"><Dashboard /></RoleRoute>} />
                    <Route path="/student"    element={<RoleRoute allowedRole="student"><StudentHub /></RoleRoute>} />
                    <Route path="/chat"       element={<RoleRoute allowedRole="student"><Chat /></RoleRoute>} />
                    <Route path="/quiz"       element={<RoleRoute allowedRole="student"><Quiz /></RoleRoute>} />
                    <Route path="/analytics"  element={<RoleRoute allowedRole="student"><Analytics /></RoleRoute>} />
                    <Route path="/notes"      element={<RoleRoute allowedRole="student"><Notes /></RoleRoute>} />
                    <Route path="/assignment" element={<RoleRoute allowedRole="student"><Assignment /></RoleRoute>} />
                    <Route path="/courses"    element={<RoleRoute allowedRole="student"><Courses /></RoleRoute>} />
                    <Route path="/teacher"    element={<RoleRoute allowedRole="teacher"><Teacher /></RoleRoute>} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          } />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <>
      <NarratorIntro />
      <BrowserRouter>
        <CustomCursor />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.95)",
            color: "#1A0B42",
            border: "1px solid rgba(110,72,170,0.15)",
            backdropFilter: "blur(20px)",
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 8px 32px rgba(110,72,170,0.12)",
          },
          success: { iconTheme: { primary: "#059669", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
        }}
      />
      <AnimatedRoutes />
      </BrowserRouter>
    </>
  );
}
