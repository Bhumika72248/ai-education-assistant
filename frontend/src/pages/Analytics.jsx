import { useEffect, useMemo, useState } from "react";
import { Radar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../api/client";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user_id");
    const parsed = Number(raw);
    const userId = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

    api
      .get(`/analytics/me?user_id=${userId}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const radarData = useMemo(
    () => ({
      labels: data?.topics || [],
      datasets: [
        {
          label: "Mastery %",
          data: data?.scores || [],
          backgroundColor: "rgba(99,102,241,0.2)",
          borderColor: "#6366f1",
          pointBackgroundColor: "#6366f1",
        },
      ],
    }),
    [data]
  );

  const lineData = useMemo(
    () => ({
      labels: data?.dates || [],
      datasets: [
        {
          label: "Quiz Score",
          data: data?.quiz_scores || [],
          borderColor: "#8b5cf6",
          tension: 0.35,
          fill: false,
        },
      ],
    }),
    [data]
  );

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-red-500">Unable to load analytics.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">Your Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Quizzes taken", value: data.total_quizzes ?? 0 },
          { label: "Average score", value: `${data.avg_score ?? 0}%` },
          { label: "Day streak", value: `${data.streak ?? 0} days` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-2xl font-semibold text-indigo-600">{stat.value}</div>
          </div>
        ))}
      </div>

      {data.total_quizzes > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-base font-medium text-gray-700 mb-3">Subject mastery</h2>
            <Radar data={radarData} />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="text-base font-medium text-gray-700 mb-3">Score over time</h2>
            <Line data={lineData} />
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-500">
          Take at least one quiz to unlock mastery and trend charts.
        </div>
      )}
    </div>
  );
}
