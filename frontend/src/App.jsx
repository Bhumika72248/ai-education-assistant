import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
              <Navbar />
              <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
                <Routes>
                  {/* Student Routes */}
                  <Route path="/" element={<RoleRoute allowedRole="student"><Dashboard /></RoleRoute>} />
                  <Route path="/student" element={<RoleRoute allowedRole="student"><StudentHub /></RoleRoute>} />
                  <Route path="/chat" element={<RoleRoute allowedRole="student"><Chat /></RoleRoute>} />
                  <Route path="/quiz" element={<RoleRoute allowedRole="student"><Quiz /></RoleRoute>} />
                  <Route path="/analytics" element={<RoleRoute allowedRole="student"><Analytics /></RoleRoute>} />
                  <Route path="/notes" element={<RoleRoute allowedRole="student"><Notes /></RoleRoute>} />
                  <Route path="/assignment" element={<RoleRoute allowedRole="student"><Assignment /></RoleRoute>} />
                  <Route path="/courses" element={<RoleRoute allowedRole="student"><Courses /></RoleRoute>} />
                  
                  {/* Teacher Routes */}
                  <Route path="/teacher" element={<RoleRoute allowedRole="teacher"><Teacher /></RoleRoute>} />
                </Routes>
              </div>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
