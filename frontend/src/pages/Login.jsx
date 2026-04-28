import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client";
import loginBg from "../images/ChatGPT Image Apr 27, 2026, 11_52_34 PM.png";
import { BotIcon, AnalyticsIcon, QuizIcon, NotesIcon, StudentIcon, CoursesIcon } from "../components/ui/Icon";

export default function Login() {
  const [isLogin, setIsLogin]     = useState(true);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [name, setName]           = useState("");
  const [role, setRole]           = useState("student");
  const [loading, setLoading]     = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);
        const { data } = await api.post("/auth/login", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        toast.success("Welcome back! 🎉");
        navigate(data.role === "teacher" ? "/teacher" : "/");
      } else {
        await api.post("/auth/register", { name, email, password, role });
        toast.success("Account created! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0]?.msg : detail || "Authentication failed";
      toast.error(typeof msg === "string" ? msg : "Authentication failed");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: "1px solid rgba(110,72,170,0.15)",
    background: "rgba(255,255,255,0.9)",
    color: "#1A0B42", fontSize: 14,
    fontFamily: "'Inter', sans-serif", outline: "none",
    transition: "all 0.2s ease",
  };

  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "var(--text-secondary)", marginBottom: 6,
    letterSpacing: "0.05em", textTransform: "uppercase",
  };

  const features = [
    { icon: BotIcon, text: "AI-powered tutoring" },
    { icon: AnalyticsIcon, text: "Smart analytics" },
    { icon: QuizIcon, text: "Adaptive quizzes" },
    { icon: NotesIcon, text: "Auto-generated notes" },
  ];

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: "20px", position: "relative",
      backgroundImage: `url(${loginBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      {/* Full-screen overlay for readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(240,242,255,0.55)",
        backdropFilter: "blur(2px)",
        zIndex: 0,
      }} />
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: "10%", left: "5%",
        width: 300, height: 300,
        background: "radial-gradient(circle, rgba(110,72,170,0.12) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 1,
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "5%",
        width: 250, height: 250,
        background: "radial-gradient(circle, rgba(0,153,204,0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 1,
      }} />

      <div style={{
        display: "flex", width: "100%", maxWidth: 900,
        gap: 0, borderRadius: 28, overflow: "hidden",
        boxShadow: "0 32px 80px rgba(110,72,170,0.15), 0 0 0 1px rgba(110,72,170,0.08)",
        position: "relative", zIndex: 2,
      }}>
        {/* Left panel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #1A0B42 0%, #2d1b69 50%, #1a0b42 100%)",
            padding: "52px 44px", display: "flex",
            flexDirection: "column", justifyContent: "center",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: "30%", left: "30%",
            width: 200, height: 200,
            background: "radial-gradient(circle, rgba(110,72,170,0.3) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #6E48AA, #9D50BB)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, marginBottom: 28, color: '#fff',
              boxShadow: "0 8px 24px rgba(110,72,170,0.5)",
            }}
          ><StudentIcon size={28} /></motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              fontSize: 36, fontWeight: 800, marginBottom: 12,
              background: "linear-gradient(135deg, #FFFFFF 0%, #c4b5fd 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", letterSpacing: "-0.03em", lineHeight: 1.2,
            }}
          >Learn smarter<br />with AI</motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, marginBottom: 36, lineHeight: 1.6 }}
          >
            Your personalized AI education platform for students and teachers.
          </motion.p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0, color: 'white'
                }}>{(() => { const I = f.icon; return <I size={16} /> })()}</div>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 420,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderLeft: "1px solid rgba(110,72,170,0.1)",
            padding: "52px 44px", display: "flex",
            flexDirection: "column", justifyContent: "center",
          }}
        >
          <h2 style={{
            fontSize: 26, fontWeight: 800, marginBottom: 6,
            color: "#1A0B42", letterSpacing: "-0.02em",
          }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32 }}>
            {isLogin ? "Sign in to continue learning" : "Start your learning journey"}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <AnimatePresence>
              {!isLogin && (
                <motion.div key="name-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div key="role-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                  <label style={labelStyle}>I am a</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["student", "teacher"].map(r => (
                      <motion.button
                        key={r} type="button" onClick={() => setRole(r)}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        style={{
                          flex: 1, padding: "10px", borderRadius: 10, border: "1px solid",
                          borderColor: role === r ? "rgba(110,72,170,0.4)" : "rgba(110,72,170,0.12)",
                          background: role === r ? "rgba(110,72,170,0.1)" : "rgba(255,255,255,0.7)",
                          color: role === r ? "#6E48AA" : "var(--text-secondary)",
                          fontSize: 13, fontWeight: 600, cursor: "pointer",
                          fontFamily: "'Inter', sans-serif", transition: "all 0.2s ease",
                          textTransform: "capitalize",
                          boxShadow: role === r ? "0 0 12px rgba(110,72,170,0.15)" : "none",
                        }}
                      >{r === "student" ? <><StudentIcon size={14} /> {r}</> : <><CoursesIcon size={14} /> {r}</>}</motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{
                width: "100%", padding: "13px", borderRadius: 12, border: "none",
                background: loading ? "rgba(110,72,170,0.4)" : "linear-gradient(135deg, #6E48AA, #9D50BB)",
                color: "#FFFFFF", fontSize: 15, fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                fontFamily: "'Inter', sans-serif",
                boxShadow: loading ? "none" : "0 8px 24px rgba(110,72,170,0.35)",
                transition: "all 0.2s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: 4,
              }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />{isLogin ? "Signing in..." : "Creating account..."}</>
              ) : (isLogin ? "Sign in →" : "Create account →")}
            </motion.button>
          </form>

          <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <motion.button
              type="button" onClick={() => setIsLogin(!isLogin)}
              whileHover={{ scale: 1.03 }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#6E48AA", fontWeight: 600, fontSize: 13,
                fontFamily: "'Inter', sans-serif",
              }}
            >{isLogin ? "Sign up" : "Log in"}</motion.button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
