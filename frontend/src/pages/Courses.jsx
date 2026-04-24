import { useEffect, useState } from "react";
import api from "../api/client";

export default function Courses() {
  const [weakTopics, setWeakTopics] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        // Get analytics
        const res = await api.get(`/analytics/me?user_id=${userId}`);
        const data = res.data;
        
        // Extract weak topics (< 70)
        let wTopics = [];
        if (data.topics && data.scores) {
          wTopics = data.topics.filter((t, i) => data.scores[i] < 70);
        }

        setWeakTopics(wTopics);

        if (wTopics.length > 0) {
          // Fetch recommendations
          const recRes = await api.post("/courses/recommend", { weak_topics: wTopics });
          setRecommendations(recRes.data.recommendations || []);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  return (
    <div className="p-4 fade-in">
      <h1 className="text-2xl font-bold mb-2">Recommended Courses & Tutorials</h1>
      <p className="text-[var(--text-secondary)] mb-6">Personalized AI recommendations based on your weak topics.</p>

      {loading && <p className="text-gray-500">Analyzing performance and generating recommendations with AI...</p>}

      {!loading && weakTopics.length === 0 && (
        <div className="card text-center p-8">
          <p className="text-[var(--text-secondary)]">You don't have any weak topics! Great job. Keep up the good work!</p>
        </div>
      )}

      {!loading && recommendations.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="card flex flex-col h-full fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="mb-4 border-b pb-2" style={{ borderColor: "var(--border)" }}>
                <span className="tag bg-red-100 text-red-700 mb-2">Weak Topic</span>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{rec.topic}</h2>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-secondary)" }}>YouTube</h3>
                  <a href={rec.youtube.startsWith("http") ? rec.youtube : `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.youtube)}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }} className="hover:underline text-sm block">
                    ▶️ {rec.youtube}
                  </a>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-secondary)" }}>Article / Doc</h3>
                  <a href={rec.article.startsWith("http") ? rec.article : `https://www.google.com/search?q=${encodeURIComponent(rec.article)}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }} className="hover:underline text-sm block">
                    📄 {rec.article}
                  </a>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-secondary)" }}>Free Course</h3>
                  <a href={rec.course.startsWith("http") ? rec.course : `https://www.google.com/search?q=${encodeURIComponent(rec.course)}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }} className="hover:underline text-sm block">
                    🎓 {rec.course}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
