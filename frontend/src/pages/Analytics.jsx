import { useEffect, useState, useCallback } from "react";
import MomentumGauge      from "../components/analytics/MomentumGauge";
import TopicMasteryTree   from "../components/analytics/TopicMasteryTree";
import FocusCheck         from "../components/analytics/FocusCheck";
import DeadlinePredictor  from "../components/analytics/DeadlinePredictor";
import InsightCards       from "../components/analytics/InsightCards";
import SkeletonBlock      from "../components/analytics/SkeletonBlock";

const API = "http://localhost:8000/analytics";
const USER_ID = 1;

const SECTION = ({ title, children, style = {}, delay = 0 }) => (
  <section style={{
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid #E5E7EB",
    padding: "28px 28px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    animation: `fadeInDown 0.4s ease-out ${delay}s both`,
    ...style
  }}>
    {title && (
      <h2 style={{
        color: "#111827", fontFamily: "'DM Sans',sans-serif",
        fontSize: 18, fontWeight: 700, margin: "0 0 20px",
        letterSpacing: -0.3
      }}>{title}</h2>
    )}
    {children}
  </section>
);

export default function Analytics() {
  const [momentum,    setMomentum]    = useState(null);
  const [mastery,     setMastery]     = useState(null);
  const [burnout,     setBurnout]     = useState(null);
  const [deadlines,   setDeadlines]   = useState(null);
  const [insights,    setInsights]    = useState(null);
  const [insightMeta, setInsightMeta] = useState({ generatedAt: null });
  const [loading,     setLoading]     = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [momRes, masRes, burnRes, deadRes, insRes] = await Promise.all([
        fetch(`${API}/momentum?user_id=${USER_ID}`),
        fetch(`${API}/mastery?user_id=${USER_ID}`),
        fetch(`${API}/burnout-flags?user_id=${USER_ID}`),
        fetch(`${API}/deadline-predictions?user_id=${USER_ID}`),
        fetch(`${API}/insights?user_id=${USER_ID}`),
      ]);
      if (momRes.ok)  setMomentum(await momRes.json());
      if (masRes.ok)  setMastery(await masRes.json());
      if (burnRes.ok) setBurnout(await burnRes.json());
      if (deadRes.ok) setDeadlines(await deadRes.json());
      if (insRes.ok) {
        const data = await insRes.json();
        setInsights(data);
        setInsightMeta({ generatedAt: new Date().toISOString() });
      }
    } catch (e) {
      console.warn("Analytics fetch error, using mock data:", e);
      setMomentum({ score: 78, submission_pace_score: 80, time_trend_score: 72, consistency_score: 82, direction: "rising",
        sparkline: [40,45,55,50,60,65,70,68,75,80,78,82,85,78] });
      setMastery([
        { topic_id:"Basics",          mastery_percent: 95, tier:"mastered",   prereq: null },
        { topic_id:"Data Types",      mastery_percent: 82, tier:"mastered",   prereq:"Basics" },
        { topic_id:"Functions",       mastery_percent: 65, tier:"proficient", prereq:"Basics" },
        { topic_id:"OOP",             mastery_percent: 40, tier:"learning",   prereq:"Functions" },
        { topic_id:"Algorithms",      mastery_percent: 10, tier:"locked",     prereq:"Functions" },
        { topic_id:"Data Structures", mastery_percent:  0, tier:"locked",     prereq:"OOP" },
      ]);
      setBurnout([
        { topic_id:"Algorithms",      flag_type:"burnout_risk",   message:"You've been spending a lot of time on Algorithms lately — try a short break and come back fresh." },
        { topic_id:"Data Structures", flag_type:"avoidance_risk", message:"Data Structures hasn't been touched in 10 days and has an upcoming assignment." },
      ]);
      setDeadlines([
        { assignment_id:101, title:"Implement Dijkstra",    topic:"Algorithms",      due_in_days:3,  prediction:"at_risk",   start_by_date:"Today"       },
        { assignment_id:102, title:"Binary Tree Traversal", topic:"Data Structures", due_in_days:7,  prediction:"on_track",  start_by_date:"In 3 days"   },
        { assignment_id:103, title:"Sorting Visualization", topic:"Algorithms",      due_in_days:12, prediction:"start_now", start_by_date:"Tomorrow"    },
      ]);
      setInsights([
        { type:"trend",     text:"You score 38% higher on topics you revisit within 48 hours." },
        { type:"clock",     text:"Your focus is sharpest during morning sessions between 8 AM and 11 AM." },
        { type:"lightbulb", text:"Taking a 5-minute break every hour boosts your retention by 15%." },
      ]);
      setInsightMeta({ generatedAt: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const refreshInsights = async () => {
    try {
      const res = await fetch(`${API}/insights?user_id=${USER_ID}`);
      if (res.ok) {
        setInsights(await res.json());
        setInsightMeta({ generatedAt: new Date().toISOString() });
      }
    } catch (_) {}
  };

  const updatedAt = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F9FAFB",
      fontFamily: "'DM Sans', 'Outfit', sans-serif",
      padding: "0 0 60px",
      /* Override any global max-width / padding from App.jsx */
      marginLeft:  "calc(-20px - max(0px, (100vw - 1200px)/2))",
      marginRight: "calc(-20px - max(0px, (100vw - 1200px)/2))",
      boxSizing: "border-box"
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Page Header ── */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"flex-end",
          padding:"36px 0 28px",
          animation:"fadeInDown 0.35s ease-out 0s both"
        }}>
          <div>
            <h1 style={{ color:"#111827", fontSize:32, fontWeight:800, margin:0, letterSpacing:-1 }}>Your Analytics</h1>
            <p style={{ color:"#6B7280", margin:"6px 0 0", fontSize:13 }}>Last updated {updatedAt}</p>
          </div>
          <span style={{
            background:"#EEF2FF", border:"1px solid #E0E7FF",
            color:"#4F46E5", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:600
          }}>Student View</span>
        </div>

        {/* ── Momentum Score (hero) ── */}
        <SECTION delay={0.05} style={{ textAlign:"center" }}>
          <h2 style={{ color:"#111827", fontSize:18, fontWeight:700, margin:"0 0 4px" }}>Learning Momentum</h2>
          <p style={{ color:"#6B7280", fontSize:13, margin:"0 0 8px" }}>
            Your real-time learning health score — not a grade, a momentum indicator.
          </p>
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"24px 0" }}>
              <SkeletonBlock height={160} width={220} style={{ borderRadius:"50%" }} />
              <SkeletonBlock height={40}  width={280} />
              <SkeletonBlock height={30}  width={140} />
            </div>
          ) : (
            <MomentumGauge data={momentum} />
          )}
        </SECTION>

        {/* ── Focus Check ── */}
        <SECTION title="Focus Check" delay={0.12} style={{ marginTop:20 }}>
          {loading
            ? <div style={{ display:"flex", flexDirection:"column", gap:10 }}><SkeletonBlock height={70} /><SkeletonBlock height={70} /></div>
            : <FocusCheck flags={burnout} userId={USER_ID} />}
        </SECTION>

        {/* ── AI Insight Cards ── */}
        <SECTION title="Personal Insights" delay={0.18} style={{ marginTop:20 }}>
          {loading
            ? <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}><SkeletonBlock height={110}/><SkeletonBlock height={110}/><SkeletonBlock height={110}/></div>
            : <InsightCards insights={insights} onRefresh={refreshInsights} lastRefreshed={insightMeta.generatedAt} />}
        </SECTION>

        {/* ── Mastery Tree + Deadline Predictor (2-col on desktop) ── */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"clamp(300px,65%,65%) 1fr",
          gap:20,
          marginTop:20
        }}
          className="analytics-two-col"
        >
          <SECTION title="Topic Mastery Tree" delay={0.25}>
            {loading
              ? <SkeletonBlock height={260} />
              : <TopicMasteryTree topics={mastery} />}
          </SECTION>

          <SECTION title="Deadline Predictor" delay={0.3}>
            {loading
              ? <div style={{ display:"flex", flexDirection:"column", gap:10 }}><SkeletonBlock height={80}/><SkeletonBlock height={80}/><SkeletonBlock height={80}/></div>
              : <DeadlinePredictor predictions={deadlines} />}
          </SECTION>
        </div>

        {/* Responsive 2-col → 1-col */}
        <style>{`
          @media (max-width: 1023px) {
            .analytics-two-col {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 767px) {
            .analytics-two-col > *:first-child {
              overflow-x: auto;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
