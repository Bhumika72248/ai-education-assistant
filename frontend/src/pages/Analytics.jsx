import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Radar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
  CategoryScale, LinearScale, Filler, Tooltip, Legend,
} from "chart.js";
import api from "../api/client";
import PageWrapper from "../components/ui/PageWrapper";
import { NotesIcon, QuizIcon, FireIcon, AnalyticsIcon } from "../components/ui/Icon";

ChartJS.register(RadialLinearScale, PointElement, LineElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);

const chartDefaults = {
  plugins: {
    legend: { labels: { color: "#5a4a7a", font: { family: "'Inter', sans-serif", size: 12 } } },
    tooltip: {
      backgroundColor: "rgba(255,255,255,0.97)",
      borderColor: "rgba(110,72,170,0.15)",
      borderWidth: 1,
      titleColor: "#1A0B42",
      bodyColor: "#5a4a7a",
      padding: 12,
      cornerRadius: 10,
    },
  },
};

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw    = localStorage.getItem("user_id");
    const parsed = Number(raw);
    const userId = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    api.get(`/analytics/me?user_id=${userId}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const radarData = useMemo(() => ({
    labels: data?.topics || [],
    datasets: [{
      label: "Mastery %",
      data: data?.scores || [],
      backgroundColor: "rgba(110,72,170,0.1)",
      borderColor: "#9D50BB",
      pointBackgroundColor: "#6E48AA",
      pointBorderColor: "transparent",
      pointRadius: 5,
    }],
  }), [data]);

  const lineData = useMemo(() => ({
    labels: data?.dates || [],
    datasets: [{
      label: "Quiz Score",
      data: data?.quiz_scores || [],
      borderColor: "#6E48AA",
      backgroundColor: "rgba(110,72,170,0.08)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#9D50BB",
      pointBorderColor: "transparent",
      pointRadius: 5,
    }],
  }), [data]);

  const radarOptions = {
    ...chartDefaults,
    scales: {
      r: {
        grid:      { color: "rgba(110,72,170,0.07)" },
        ticks:     { color: "#9b8ab8", backdropColor: "transparent", font: { size: 10 } },
        pointLabels: { color: "#5a4a7a", font: { size: 12, family: "'Inter', sans-serif" } },
        angleLines: { color: "rgba(110,72,170,0.07)" },
      },
    },
  };

  const lineOptions = {
    ...chartDefaults,
    scales: {
      x: { grid: { color: "rgba(110,72,170,0.06)" }, ticks: { color: "#9b8ab8" } },
      y: { grid: { color: "rgba(110,72,170,0.06)" }, ticks: { color: "#9b8ab8" } },
    },
  };

  if (loading) return (
    <PageWrapper>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 16 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[...Array(2)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 20 }} />)}
      </div>
    </PageWrapper>
  );

  if (!data) return (
    <PageWrapper>
      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-secondary)" }}>
        Unable to load analytics.
      </div>
    </PageWrapper>
  );

  const stats = [
    { label: "Quizzes Taken",  value: data.total_quizzes ?? 0,    icon: NotesIcon, color: "#6E48AA" },
    { label: "Average Score",  value: `${data.avg_score ?? 0}%`,  icon: QuizIcon,  color: "#9D50BB" },
    { label: "Day Streak",     value: `${data.streak ?? 0} days`, icon: FireIcon,  color: "#f97316" },
    { label: "Study Hours",    value: `${data.study_hours ?? 0}h`, icon: AnalyticsIcon, color: "#10b981" },
  ];

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, margin: "0 0 6px",
          background: "linear-gradient(135deg, #1A0B42 0%, #6E48AA 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", letterSpacing: "-0.03em",
        }}>
          Your Performance
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
          Track your learning progress and subject mastery
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, scale: 1.02 }}
            style={{ textAlign: "center", border: `1px solid ${s.color}22`, position: "relative", overflow: "hidden" }}
          >
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: 100, height: 100,
              background: `radial-gradient(circle, ${s.color}15 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
            <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {data.total_quizzes > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
              { title: "Subject Mastery", chart: <Radar data={radarData} options={radarOptions} /> },
              { title: "Score Over Time", chart: <Line data={lineData} options={lineOptions} /> },
          ].map((panel, i) => (
            <motion.div
              key={panel.title}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "var(--text-primary)" }}>
                {panel.title}
              </h2>
              {panel.chart}
            </motion.div>
          ))}
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Study Summary</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Study Hours</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{data.study_hours ?? 0}h</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Days active: {data.days_active ?? 0} — Avg/day: {data.avg_daily_study ?? 0}h</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Enrolled Courses</div>
                {(data.enrollments || []).length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>No active enrollments</div>
                ) : (
                  <ul style={{ marginTop: 8 }}>
                    {(data.enrollments || []).map((e, i) => (
                      <li key={i} style={{ fontSize: 13 }}>{e.course_id} — progress: {e.progress}%</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: "48px 24px", textAlign: "center",
            background: "rgba(110,72,170,0.04)",
            border: "1px dashed rgba(110,72,170,0.2)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16, display: 'inline-flex', alignItems: 'center' }}><AnalyticsIcon size={40} /></div>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: 0 }}>
            Take at least one quiz to unlock mastery and trend charts.
          </p>
        </motion.div>
      )}
    </PageWrapper>
  );
}
