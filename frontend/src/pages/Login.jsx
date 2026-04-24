import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/client";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);
        
        const { data } = await api.post("/auth/login", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);

        toast.success("Logged in successfully");
        navigate(data.role === "teacher" ? "/teacher" : "/");
      } else {
        await api.post("/auth/register", { name, email, password, role });
        toast.success("Registered successfully, please login");
        setIsLogin(true);
      }
    } catch (err) {
      console.error("[AUTH ERROR]", err.response?.data);
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0]?.msg : detail || "Authentication failed";
      toast.error(typeof msg === "string" ? msg : "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center fade-in" style={{ backgroundColor: "var(--bg)" }}>
      <div className="card w-96 text-center">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>{isLogin ? "Login to EduAI" : "Register for EduAI"}</h1>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn-primary w-full mt-2">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ color: "var(--accent)" }} className="hover:underline font-medium">
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
