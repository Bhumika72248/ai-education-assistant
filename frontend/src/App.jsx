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
import Navbar from "./components/Navbar";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
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
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/student" element={<StudentHub />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/assignment" element={<Assignment />} />
                  <Route path="/teacher" element={<Teacher />} />
                </Routes>
              </div>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
