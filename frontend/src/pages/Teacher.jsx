import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import toast from "react-hot-toast";
import api from "../api/client";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Teacher() {
  const [data, setData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignTopic, setAssignTopic] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [assignedTopics, setAssignedTopics] = useState([]);

  useEffect(() => {
    api.get("/analytics/class").then((r) => setData(r.data));
    api.get("/materials").then((r) => setMaterials(r.data.materials || []));
    api.get("/quiz/assigned").then((r) => setAssignedTopics(r.data.assigned_topics || []));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/materials/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Material uploaded successfully");
      setMaterials((prev) => [res.data.material, ...prev]);
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleAssignTopic = async (e) => {
    e.preventDefault();
    if (!assignTopic.trim()) return;
    try {
      const res = await api.post("/quiz/assign", { topic: assignTopic.trim() });
      toast.success(res.data.message);
      setAssignedTopics((prev) => [{ id: res.data.id, topic: assignTopic.trim(), created_at: new Date().toISOString() }, ...prev]);
      setAssignTopic("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to assign topic");
    }
  };

  if (!data) return <div className="text-center py-20 text-[var(--text-secondary)] fade-in">Loading class analytics...</div>;

  const barData = {
    labels: data.topics,
    datasets: [{
      label: "Avg Score (%)",
      data: data.avg_scores,
      backgroundColor: data.avg_scores.map((s) => s < 60 ? "#ef4444" : "var(--accent)"),
      borderRadius: 6,
    }],
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 fade-in">
      <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Teacher Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Content Upload Section */}
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <span>📄</span> Course Material Upload
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-[var(--text-secondary)]
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[var(--accent-light)] file:text-[var(--accent)]
                hover:file:bg-indigo-100 transition-colors cursor-pointer"
            />
            <button type="submit" disabled={!file || uploading} className="btn-primary w-full disabled:opacity-50">
              {uploading ? "Uploading & Processing..." : "Upload PDF Material"}
            </button>
          </form>
        </div>

        {/* Assign Topic Section */}
        <div className="card">
          <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <span>🎯</span> Assign Quiz Topic
          </h2>
          <form onSubmit={handleAssignTopic} className="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. Cell Biology, Machine Learning..."
              value={assignTopic}
              onChange={(e) => setAssignTopic(e.target.value)}
              className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <button type="submit" disabled={!assignTopic.trim()} className="btn-primary w-full disabled:opacity-50">
              Assign to All Students
            </button>
          </form>
          {assignedTopics.length > 0 && (
            <ul className="mt-4 space-y-2">
              {assignedTopics.map((t) => (
                <li key={t.id} className="text-sm p-2 rounded flex items-center gap-2" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                  <span>🎯</span> {t.topic}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {materials.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <span>📚</span> Uploaded Materials
          </h2>
          <ul className="space-y-2">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center justify-between p-3 rounded border" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>📄 {m.title}</span>
                <a
                  href={`http://localhost:8000${m.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1 rounded"
                  style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.weak_topics?.length > 0 && (
        <div className="bg-[var(--red-light)] border border-[var(--red)] rounded-xl p-4">
          <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2"><span>⚠️</span> Class Weak Topics (below 60%)</h3>
          <div className="flex gap-2 flex-wrap">
            {data.weak_topics.map((t) => (
              <span key={t} className="px-3 py-1 bg-white text-red-700 border border-red-200 rounded-full text-sm font-medium shadow-sm">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-4 text-[var(--text-primary)]">Average Score by Topic</h2>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      <div className="card p-0 overflow-hidden">
        <h2 className="font-semibold p-4 border-b border-[var(--border)] text-[var(--text-primary)]">Students Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left p-4 font-semibold text-[var(--text-secondary)]">Name</th>
                <th className="text-left p-4 font-semibold text-[var(--text-secondary)]">Email</th>
                <th className="text-left p-4 font-semibold text-[var(--text-secondary)]">Quizzes</th>
                <th className="text-left p-4 font-semibold text-[var(--text-secondary)]">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s, i) => (
                <tr 
                  key={i} 
                  onClick={() => setSelectedStudent(s)}
                  className="border-b last:border-b-0 hover:bg-[var(--accent-light)] transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="p-4 font-medium text-[var(--text-primary)]">{s.name}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{s.email}</td>
                  <td className="p-4 text-[var(--text-primary)]">{s.quizzes}</td>
                  <td className="p-4">
                    <span className={`font-semibold px-2 py-1 rounded-md ${s.avg_score >= 70 ? "bg-[var(--green-light)] text-[var(--green)]" : s.avg_score >= 50 ? "bg-[var(--amber-light)] text-[var(--amber)]" : "bg-[var(--red-light)] text-[var(--red)]"}`}>
                      {s.avg_score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
          <div className="bg-[var(--surface)] rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedStudent.name}</h2>
                <p className="text-sm text-[var(--text-secondary)]">{selectedStudent.email}</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-[var(--text-secondary)] hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--border)] text-center">
                  <h3 className="text-xs uppercase font-semibold text-[var(--text-secondary)]">Total Quizzes Taken</h3>
                  <p className="text-2xl font-bold text-[var(--accent)] mt-1">{selectedStudent.quizzes}</p>
                </div>
                <div className="bg-[var(--bg)] p-4 rounded-lg border border-[var(--border)] text-center">
                  <h3 className="text-xs uppercase font-semibold text-[var(--text-secondary)]">Average Score</h3>
                  <p className="text-2xl font-bold text-[var(--accent)] mt-1">{selectedStudent.avg_score}%</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 border-b pb-2">Recent Quiz History</h3>
                {selectedStudent.quizzes > 0 ? (
                  <ul className="space-y-3">
                    {[...Array(Math.min(3, selectedStudent.quizzes))].map((_, i) => (
                      <li key={i} className="flex justify-between items-center p-3 bg-[var(--bg)] rounded border border-[var(--border)]">
                        <span className="font-medium text-[var(--text-primary)] text-sm">Quiz Attempt #{selectedStudent.quizzes - i}</span>
                        <span className="text-sm font-semibold text-[var(--accent)]">Completed</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)] italic">No quizzes taken yet.</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 border-b pb-2">Recent AI Tutor Chat Activity</h3>
                <div className="bg-[var(--bg)] p-4 rounded border border-[var(--border)]">
                  <p className="text-sm text-[var(--text-secondary)] italic">
                    {selectedStudent.quizzes > 0 
                      ? "Student has active chat history with the AI Tutor. (Detailed transcript requires backend syncing)" 
                      : "No active chat history found."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
