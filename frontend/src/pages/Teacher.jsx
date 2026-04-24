import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import api from "../api/client";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Teacher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/analytics/class").then((r) => setData(r.data));
  }, []);

  if (!data) return <div className="text-center py-20 text-gray-400">Loading class analytics...</div>;

  const barData = {
    labels: data.topics,
    datasets: [{
      label: "Avg Score (%)",
      data: data.avg_scores,
      backgroundColor: data.avg_scores.map((s) => s < 60 ? "#f87171" : "#6366f1"),
      borderRadius: 6,
    }],
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>

      {data.weak_topics?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <h3 className="font-semibold text-red-700 mb-1">⚠️ Weak Topics (below 60%)</h3>
          <div className="flex gap-2 flex-wrap">
            {data.weak_topics.map((t) => (
              <span key={t} className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3">Average Score by Topic</h2>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      <div className="border rounded bg-white overflow-hidden">
        <h2 className="font-semibold p-4 border-b">Students Performance</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Quizzes</th>
              <th className="text-left p-3">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3">{s.name}</td>
                <td className="p-3 text-gray-500">{s.email}</td>
                <td className="p-3">{s.quizzes}</td>
                <td className="p-3">
                  <span className={`font-semibold ${s.avg_score >= 70 ? "text-green-600" : s.avg_score >= 50 ? "text-yellow-600" : "text-red-500"}`}>
                    {s.avg_score}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
