import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/client";
import PageWrapper from "../components/ui/PageWrapper";
import { PlayIcon, FileIcon, StudentIcon, TrophyIcon } from "../components/ui/Icon";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function Courses() {
  const [weakTopics, setWeakTopics]         = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [catalog, setCatalog]               = useState([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;
        const res  = await api.get(`/analytics/me?user_id=${userId}`);
        const data = res.data;
        let wTopics = [];
        if (data.topics && data.scores) {
          wTopics = data.topics.filter((t, i) => data.scores[i] < 70);
        }
        setWeakTopics(wTopics);
        if (wTopics.length > 0) {
          const recRes = await api.post("/courses/recommend", { weak_topics: wTopics });
          setRecommendations(recRes.data.recommendations || []);
        }
        // fetch catalog
        const catRes = await api.get('/courses/catalog');
        setCatalog(catRes.data.courses || []);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  const assignCourse = async (courseId) => {
    try {
      const userId = Number(localStorage.getItem("user_id") || 1);
      const res = await api.post('/courses/assign', { user_id: userId, course_id: courseId });
      // refresh analytics
      await api.get(`/analytics/me?user_id=${userId}`);
      console.log('Assigned', res.data);
      const lp = res.data.learning_path;
      if (lp && lp.note) {
        alert(`Enrolled. Learning path generated (note: ${lp.note})`);
      } else if (lp) {
        alert('Enrolled. Learning path generated.');
      } else {
        alert('Enrolled in course.');
      }
    } catch (err) {
      console.error('Assign failed', err);
      alert('Failed to enroll in course');
    }
  };

  const resourceTypes = [
    { key: "youtube", icon: PlayIcon, label: "YouTube",       color: "#dc2626", bg: "rgba(220,38,38,0.07)",   border: "rgba(220,38,38,0.18)"  },
    { key: "article", icon: FileIcon, label: "Article / Doc", color: "#0099cc", bg: "rgba(0,153,204,0.07)",   border: "rgba(0,153,204,0.18)"  },
    { key: "course",  icon: StudentIcon, label: "Free Course",   color: "#6E48AA", bg: "rgba(110,72,170,0.07)", border: "rgba(110,72,170,0.18)" },
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
          Recommended Courses
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
          Personalized AI recommendations based on your weak topics.
        </p>
      </motion.div>

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 260, borderRadius: 20 }} />
          ))}
        </div>
      )}

      {!loading && weakTopics.length === 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: "center", padding: "60px 24px",
            background: "rgba(110,72,170,0.05)",
            border: "1px dashed rgba(110,72,170,0.2)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16, display: 'inline-flex', alignItems: 'center' }}><TrophyIcon size={48} /></div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#059669", marginBottom: 8 }}>
            No weak topics found!
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
            You're doing great. Keep up the good work!
          </p>
        </motion.div>
      )}

      {!loading && recommendations.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}
        >
          {recommendations.map((rec, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ y: -6 }}
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: 0 }}
            >
              {/* Topic header */}
              <div style={{
                marginBottom: 18, paddingBottom: 14,
                borderBottom: "1px solid rgba(110,72,170,0.1)",
              }}>
                <span style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 20,
                  background: "rgba(239,68,68,0.08)", color: "#fca5a5",
                  fontSize: 11, fontWeight: 700, marginBottom: 8,
                  border: "1px solid rgba(239,68,68,0.18)",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  Weak Topic
                </span>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                  {rec.topic}
                </h2>
              </div>

              {/* Resource links */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {resourceTypes.map(rt => (
                  <a
                    key={rt.key}
                    href={
                      rec[rt.key]?.startsWith("http")
                        ? rec[rt.key]
                        : `https://www.${rt.key === "youtube" ? "youtube.com/results?search_query=" : "google.com/search?q="}${encodeURIComponent(rec[rt.key] || "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <motion.div
                      whileHover={{ x: 4, borderColor: rt.border }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 12,
                        background: rt.bg, border: `1px solid ${rt.border}`,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: `${rt.color}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15,
                      }}>
                        {rt.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: rt.color, fontWeight: 700, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {rt.label}
                        </div>
                        <div style={{
                          fontSize: 13, color: "var(--text-secondary)", fontWeight: 500,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {rec[rt.key] || "—"}
                        </div>
                      </div>
                      <span style={{ color: rt.color, fontSize: 14, flexShrink: 0 }}>→</span>
                    </motion.div>
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Catalog browser */}
      {!loading && catalog.length > 0 && (
        <motion.div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Course Catalog</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, marginTop: 12 }}>
            {catalog.map(c => (
              <div key={c.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.category.toUpperCase()}</div>
                    <h3 style={{ margin: '6px 0 8px' }}>{c.title}</h3>
                  </div>
                  <div>
                    <button onClick={() => assignCourse(c.id)} style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6E48AA,#9D50BB)', color: 'white', fontWeight: 700 }}>
                      Enroll
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{c.description}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </PageWrapper>
  );
}
