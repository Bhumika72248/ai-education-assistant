import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import toast from "react-hot-toast";
import api from "../api/client";
import PageWrapper from "../components/ui/PageWrapper";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1px solid rgba(110,72,170,0.15)",
  background: "rgba(255,255,255,0.9)",
  color: "#1A0B42", fontSize: 14,
  fontFamily: "'Inter', sans-serif", outline: "none",
};

export default function Teacher() {
  const [data, setData]                     = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignTopic, setAssignTopic]       = useState("");
  const [file, setFile]                     = useState(null);
  const [uploading, setUploading]           = useState(false);
  const [materials, setMaterials]           = useState([]);
  const [assignedTopics, setAssignedTopics] = useState([]);

  useEffect(() => {
    api.get("/analytics/class").then(r => setData(r.data));
    api.get("/materials").then(r => setMaterials(r.data.materials || []));
    api.get("/quiz/assigned").then(r => setAssignedTopics(r.data.assigned_topics || []));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/materials/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Material uploaded successfully");
      setMaterials(prev => [res.data.material, ...prev]);
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to upload file");
    } finally { setUploading(false); }
  };

  const handleAssignTopic = async (e) => {
    e.preventDefault();
    if (!assignTopic.trim()) return;
    try {
      const res = await api.post("/quiz/assign", { topic: assignTopic.trim() });
      toast.success(res.data.message);
      setAssignedTopics(prev => [{ id: res.data.id, topic: assignTopic.trim(), created_at: new Date().toISOString() }, ...prev]);
      setAssignTopic("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to assign topic");
    }
  };

  if (!data) return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="skeleton" style={{ height: 160, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 160, borderRadius: 20 }} />
        </div>
      </div>
    </PageWrapper>
  );

  const barData = {
    labels: data.topics,
    datasets: [{
      label: "Avg Score (%)",
      data: data.avg_scores,
      backgroundColor: data.avg_scores.map(s => s < 60 ? "rgba(220,38,38,0.6)" : "rgba(110,72,170,0.6)"),
      borderRadius: 8, borderSkipped: false,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255,255,255,0.97)",
        borderColor: "rgba(110,72,170,0.15)",
        borderWidth: 1,
        titleColor: "#1A0B42",
        bodyColor: "#5a4a7a",
        padding: 12, cornerRadius: 10,
      },
    },
    scales: {
      x: { grid: { color: "rgba(110,72,170,0.06)" }, ticks: { color: "#9b8ab8" } },
      y: { grid: { color: "rgba(110,72,170,0.06)" }, ticks: { color: "#9b8ab8" } },
    },
  };

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, margin: "0 0 6px",
          background: "linear-gradient(135deg, #1A0B42 0%, #6E48AA 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", letterSpacing: "-0.03em",
        }}>
          Teacher Dashboard
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
          Manage materials, assign topics, and monitor class performance.
        </p>
      </motion.div>

      {/* Upload + Assign */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Upload */}
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(110,72,170,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📄</span>
            Course Material Upload
          </h2>
          <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: "20px", borderRadius: 12, border: "2px dashed rgba(110,72,170,0.2)", background: "rgba(110,72,170,0.04)", textAlign: "center", cursor: "pointer" }}>
              <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} id="file-upload" />
              <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                <p style={{ margin: 0, fontSize: 13, color: file ? "#6E48AA" : "var(--text-secondary)", fontWeight: file ? 600 : 400 }}>
                  {file ? file.name : "Click to select PDF"}
                </p>
              </label>
            </div>
            <motion.button type="submit" disabled={!file || uploading}
              whileHover={file && !uploading ? { scale: 1.02, y: -2 } : {}}
              whileTap={file && !uploading ? { scale: 0.98 } : {}}
              style={{
                padding: "11px", borderRadius: 10, border: "none",
                background: !file || uploading ? "rgba(110,72,170,0.3)" : "linear-gradient(135deg, #6E48AA, #9D50BB)",
                color: "#FFFFFF", fontSize: 14, fontWeight: 700,
                cursor: !file || uploading ? "not-allowed" : "pointer",
                fontFamily: "'Inter', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {uploading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Uploading...</> : "Upload PDF Material"}
            </motion.button>
          </form>
        </motion.div>

        {/* Assign Topic */}
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(5,150,105,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🎯</span>
            Assign Quiz Topic
          </h2>
          <form onSubmit={handleAssignTopic} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input type="text" placeholder="e.g. Cell Biology, Machine Learning..."
              value={assignTopic} onChange={e => setAssignTopic(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = "rgba(110,72,170,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(110,72,170,0.1)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(110,72,170,0.15)"; e.target.style.boxShadow = "none"; }}
            />
            <motion.button type="submit" disabled={!assignTopic.trim()}
              whileHover={assignTopic.trim() ? { scale: 1.02, y: -2 } : {}}
              whileTap={assignTopic.trim() ? { scale: 0.98 } : {}}
              style={{
                padding: "11px", borderRadius: 10, border: "none",
                background: !assignTopic.trim() ? "rgba(5,150,105,0.3)" : "linear-gradient(135deg, #10b981, #059669)",
                color: "#FFFFFF", fontSize: 14, fontWeight: 700,
                cursor: !assignTopic.trim() ? "not-allowed" : "pointer",
                fontFamily: "'Inter', sans-serif",
                boxShadow: assignTopic.trim() ? "0 4px 16px rgba(5,150,105,0.25)" : "none",
              }}
            >
              Assign to All Students
            </motion.button>
          </form>
          {assignedTopics.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {assignedTopics.map(t => (
                <div key={t.id} style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: "rgba(5,150,105,0.08)", color: "#059669", border: "1px solid rgba(5,150,105,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🎯</span> {t.topic}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Uploaded Materials */}
      {materials.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "var(--text-primary)" }}>📚 Uploaded Materials</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {materials.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(110,72,170,0.1)" }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>📄 {m.title}</span>
                <a href={`http://localhost:8000${m.file_url}`} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(110,72,170,0.08)", color: "#6E48AA", border: "1px solid rgba(110,72,170,0.18)", textDecoration: "none" }}>
                  View →
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weak Topics Alert */}
      {data.weak_topics?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ padding: "16px 20px", borderRadius: 14, marginBottom: 20, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}>
          <h3 style={{ fontWeight: 700, color: "#dc2626", marginBottom: 10, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            ⚠️ Class Weak Topics (below 60%)
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {data.weak_topics.map(t => (
              <span key={t} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bar Chart */}
      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "var(--text-primary)" }}>Average Score by Topic</h2>
        <Bar data={barData} options={barOptions} />
      </motion.div>

      {/* Students Table */}
      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ padding: 0, overflow: "hidden" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, padding: "18px 20px", borderBottom: "1px solid rgba(110,72,170,0.08)", margin: 0, color: "var(--text-primary)" }}>
          Students Performance
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "rgba(110,72,170,0.04)" }}>
                {["Name", "Email", "Quizzes", "Avg Score"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid rgba(110,72,170,0.08)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.students.map((s, i) => (
                <motion.tr key={i} onClick={() => setSelectedStudent(s)}
                  whileHover={{ background: "rgba(110,72,170,0.04)" }}
                  style={{ borderBottom: "1px solid rgba(110,72,170,0.06)", cursor: "pointer", transition: "background 0.15s ease" }}
                >
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</td>
                  <td style={{ padding: "14px 20px", color: "var(--text-secondary)" }}>{s.email}</td>
                  <td style={{ padding: "14px 20px", color: "var(--text-primary)" }}>{s.quizzes}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: s.avg_score >= 70 ? "rgba(5,150,105,0.1)" : s.avg_score >= 50 ? "rgba(217,119,6,0.1)" : "rgba(220,38,38,0.1)",
                      color: s.avg_score >= 70 ? "#059669" : s.avg_score >= 50 ? "#d97706" : "#dc2626",
                    }}>
                      {s.avg_score}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Student Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedStudent(null)}
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(26,11,66,0.35)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(40px)", border: "1px solid rgba(110,72,170,0.12)", borderRadius: 24, width: "100%", maxWidth: 560, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(110,72,170,0.15)", overflow: "hidden" }}
            >
              <div style={{ padding: "22px 24px", borderBottom: "1px solid rgba(110,72,170,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1A0B42" }}>{selectedStudent.name}</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>{selectedStudent.email}</p>
                </div>
                <motion.button whileHover={{ scale: 1.1, background: "rgba(220,38,38,0.08)" }} whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedStudent(null)}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(110,72,170,0.06)", border: "1px solid rgba(110,72,170,0.12)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontFamily: "'Inter', sans-serif" }}
                >✕</motion.button>
              </div>

              <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Total Quizzes", value: selectedStudent.quizzes, color: "#6E48AA" },
                    { label: "Average Score", value: `${selectedStudent.avg_score}%`, color: "#9D50BB" },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "16px", borderRadius: 12, textAlign: "center", background: "rgba(110,72,170,0.05)", border: `1px solid ${s.color}22` }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Quiz History</h3>
                  {selectedStudent.quizzes > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[...Array(Math.min(3, selectedStudent.quizzes))].map((_, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 10, background: "rgba(110,72,170,0.04)", border: "1px solid rgba(110,72,170,0.08)" }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>Quiz Attempt #{selectedStudent.quizzes - i}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#059669", padding: "3px 10px", borderRadius: 20, background: "rgba(5,150,105,0.1)" }}>Completed</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>No quizzes taken yet.</p>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Tutor Activity</h3>
                  <div style={{ padding: "14px", borderRadius: 10, background: "rgba(110,72,170,0.05)", border: "1px solid rgba(110,72,170,0.12)" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic" }}>
                      {selectedStudent.quizzes > 0 ? "Student has active chat history with the AI Tutor." : "No active chat history found."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
