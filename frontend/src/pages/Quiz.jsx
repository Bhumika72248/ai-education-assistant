import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import api from "../api/client";
import QuizCard from "../components/QuizCard";
import PageWrapper from "../components/ui/PageWrapper";
import { NotesIcon, PlayIcon, StudentIcon, TrophyIcon } from "../components/ui/Icon";

const tabs = [
  { id: "topic",   label: "By Topic",      icon: NotesIcon, desc: "Generate from any topic" },
  { id: "youtube", label: "From YouTube",  icon: PlayIcon,  desc: "Quiz from video transcript" },
  { id: "exam",    label: "Exam Prep",     icon: StudentIcon, desc: "Simulate real exam patterns" },
];

const inputStyle = {
  width: "100%", padding: "12px 16px", borderRadius: 12,
  border: "1px solid rgba(110,72,170,0.15)",
  background: "rgba(255,255,255,0.9)",
  color: "#1A0B42", fontSize: 14,
  fontFamily: "'Inter', sans-serif", outline: "none",
};
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "var(--text-secondary)", marginBottom: 8,
  letterSpacing: "0.05em", textTransform: "uppercase",
};

export default function Quiz() {
  const location = useLocation();
  const [activeTab, setActiveTab]       = useState("topic");
  const [topic, setTopic]               = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty]     = useState("medium");
  const [adaptive, setAdaptive]         = useState(false);
  const [youtubeUrl, setYoutubeUrl]     = useState("");
  const [exam, setExam]                 = useState("TCS NQT");
  const [section, setSection]           = useState("Aptitude");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [quiz, setQuiz]                 = useState(null);
  const [quizNote, setQuizNote]         = useState(null);
  const [resources, setResources]       = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore]               = useState(0);
  const [isFinished, setIsFinished]     = useState(false);
  const [loadingMsg, setLoadingMsg]     = useState("");
  const resultRef = useRef(null);

  useEffect(() => {
    const params     = new URLSearchParams(location.search);
    const quickTopic = params.get("quick5");
    if (quickTopic) {
      setTopic(quickTopic);
      setNumQuestions(5);
      setAdaptive(true);
      setActiveTab("topic");
      generateTopicQuiz(quickTopic, 5, "medium", true);
    }
  }, [location]);

  const resetQuizState = () => {
    setQuiz(null); setQuizNote(null); setCurrentIndex(0); setScore(0);
    setIsFinished(false); setError(null); setResources(null);
  };

  const handleTabChange = (tabId) => { setActiveTab(tabId); resetQuizState(); };

  const generateTopicQuiz = async (t = topic, n = numQuestions, d = difficulty, a = adaptive) => {
    if (!t) return setError("Please enter a topic.");
    setLoading(true); setError(null); setLoadingMsg("Generating questions...");
    try {
      const res = await api.post("/quiz/generate", { topic: t, num_questions: n, difficulty: d, adaptive: a });
      setQuiz(res.data.quiz); setCurrentIndex(0); setIsFinished(false); setScore(0);
    } catch (err) { setError(err.response?.data?.detail || "Failed to generate quiz"); }
    finally { setLoading(false); }
  };

  const generateYoutubeQuiz = async () => {
    if (!youtubeUrl) return setError("Please enter a YouTube URL.");
    setLoading(true); setError(null); setLoadingMsg("Reading video transcript...");
    try {
      const res = await api.post("/quiz/from-youtube", { url: youtubeUrl });
      setQuiz(res.data.quiz);
      setQuizNote(res.data.note || null);
      setCurrentIndex(0); setIsFinished(false); setScore(0);
    } catch (err) { setError(err.response?.data?.detail || "Failed to generate from YouTube"); }
    finally { setLoading(false); }
  };

  const generateExamQuiz = async () => {
    setLoading(true); setError(null); setLoadingMsg("Simulating exam pattern...");
    try {
      const res = await api.post("/quiz/exam-prep", { exam, section, num_questions: numQuestions });
      setQuiz(res.data.quiz); setResources(res.data.resources);
      setCurrentIndex(0); setIsFinished(false); setScore(0);
    } catch (err) { setError(err.response?.data?.detail || "Failed to generate exam quiz"); }
    finally { setLoading(false); }
  };

  const saveAttempt = async (finalScore) => {
    try {
      await api.post("/quiz/save-attempt", {
        topic: activeTab === "youtube" ? "YouTube Video" : activeTab === "exam" ? `${exam} - ${section}` : topic,
        score: finalScore, total: quiz.length, questions_json: JSON.stringify(quiz),
      });
    } catch {}
  };

  const handleNext = (isCorrect) => {
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);
    if (currentIndex < quiz.length - 1) setCurrentIndex(currentIndex + 1);
    else { setIsFinished(true); saveAttempt(newScore); }
  };

  const handleShare = async () => {
    if (resultRef.current) {
      const canvas = await html2canvas(resultRef.current, { scale: 2 });
      const link   = document.createElement("a");
      link.download = "eduai-quiz-result.png";
      link.href     = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const getPerformanceLabel = () => {
    const p = score / quiz.length;
    if (p >= 0.8) return { label: "Excellent", color: "#059669" };
    if (p >= 0.6) return { label: "Good",       color: "#f59e0b" };
    return              { label: "Keep Practicing", color: "#ef4444" };
  };

  /* ── Loading State ── */
  if (loading) return (
    <PageWrapper>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{
            width: 60, height: 60, borderRadius: "50%",
            border: "3px solid rgba(110,72,170,0.15)",
            borderTopColor: "#6E48AA",
          }}
        />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: 15 }}
        >
          {loadingMsg}
        </motion.p>
      </div>
    </PageWrapper>
  );

  /* ── Finished State ── */
  if (isFinished) {
    const pct  = Math.round((score / quiz.length) * 100);
    const perf = getPerformanceLabel();
    return (
      <PageWrapper>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <motion.div
            ref={resultRef}
            className="card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginBottom: 20, padding: 36, position: "relative", overflow: "hidden" }}
          >
            {/* Top gradient bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #6E48AA, #9D50BB, #0099cc)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  Quiz Results
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                  {activeTab === "topic" && `Topic: ${topic}`}
                  {activeTab === "youtube" && "YouTube Video"}
                  {activeTab === "exam" && `${exam} — ${section}`}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>EduAI</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Score circle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                style={{
                  width: 140, height: 140, borderRadius: "50%",
                  background: `conic-gradient(#6E48AA ${pct * 3.6}deg, rgba(110,72,170,0.08) 0deg)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 40px rgba(110,72,170,0.2)",
                  position: "relative",
                }}
              >
                <div style={{
                  width: 110, height: 110, borderRadius: "50%",
                  background: "#F8F9FF",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                    {score}/{quiz.length}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600 }}>{pct}%</span>
                </div>
              </motion.div>
            </div>

            <div style={{ textAlign: "center" }}>
              <span style={{
                padding: "8px 20px", borderRadius: 20,
                background: `${perf.color}18`, color: perf.color,
                fontSize: 14, fontWeight: 700,
                border: `1px solid ${perf.color}30`,
              }}>
                {perf.label}
              </span>
            </div>
          </motion.div>

          {resources?.length > 0 && (
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ marginBottom: 20 }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
                Free Resources to Improve
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                Helpful links based on your exam selection.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {resources.map((res, i) => (
                  <a key={i} href={res.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <motion.div
                      whileHover={{ x: 4, borderColor: "rgba(110,72,170,0.25)" }}
                      style={{
                        padding: "14px 16px", borderRadius: 12,
                        border: "1px solid rgba(110,72,170,0.1)",
                        background: "rgba(255,255,255,0.8)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 3, fontSize: 14 }}>{res.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{res.description}</div>
                    </motion.div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              style={{
                flex: 1, padding: 13, borderRadius: 12,
                background: "rgba(110,72,170,0.06)",
                border: "1px solid rgba(110,72,170,0.15)",
                color: "var(--text-secondary)", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
              }}
            >
              📸 Share Result
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={resetQuizState}
              style={{
                flex: 1, padding: 13, borderRadius: 12,
                background: "linear-gradient(135deg, #6E48AA, #9D50BB)",
                border: "none", color: "#FFFFFF", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
                boxShadow: "0 6px 20px rgba(110,72,170,0.35)",
              }}
            >
              Try Another Quiz →
            </motion.button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  /* ── Active Quiz ── */
  if (quiz && currentIndex < quiz.length) return (
    <PageWrapper>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        {quizNote && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(245,158,11,0.1)", color: "#f59e0b",
              padding: "12px 16px", borderRadius: 10, marginBottom: 20,
              fontSize: 13, fontWeight: 500,
              border: "1px solid rgba(245,158,11,0.3)",
            }}
          >
            {quizNote}
          </motion.div>
        )}
        <div style={{ marginBottom: 20, height: 5, background: "rgba(110,72,170,0.08)", borderRadius: 99, overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${(currentIndex / quiz.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ height: "100%", background: "linear-gradient(135deg, #6E48AA, #9D50BB)", borderRadius: 99 }}
          />
        </div>
        <QuizCard question={quiz[currentIndex]} index={currentIndex} total={quiz.length} onNext={handleNext} />
      </div>
    </PageWrapper>
  );

  /* ── Setup Screen ── */
  return (
    <PageWrapper>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 30, fontWeight: 800, margin: "0 0 8px",
            background: "linear-gradient(135deg, #1A0B42 0%, #6E48AA 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", letterSpacing: "-0.03em",
          }}>
            Quiz Generator
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
            Adaptive quizzes, YouTube-based tests, or real exam simulations.
          </p>
        </motion.div>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "flex", gap: 6, marginBottom: 24,
            padding: 5, background: "rgba(255,255,255,0.7)",
            borderRadius: 16, border: "1px solid rgba(110,72,170,0.12)",
          }}
        >
          {tabs.map(t => (
            <motion.button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "10px 16px", borderRadius: 12, border: "none",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                fontFamily: "'Inter', sans-serif", transition: "all 0.2s ease",
                background: activeTab === t.id
                  ? "linear-gradient(135deg, rgba(110,72,170,0.12), rgba(157,80,187,0.08))"
                  : "transparent",
                color: activeTab === t.id ? "#6E48AA" : "var(--text-secondary)",
                boxShadow: activeTab === t.id ? "0 2px 12px rgba(110,72,170,0.12)" : "none",
                border: activeTab === t.id ? "1px solid rgba(110,72,170,0.22)" : "1px solid transparent",
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                  background: "rgba(220,38,38,0.08)", color: "#dc2626",
                padding: "12px 16px", borderRadius: 10, marginBottom: 20,
                fontSize: 14, fontWeight: 500,
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "topic" && (
              <motion.div key="topic" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>Topic Quiz</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
                  Enter any topic and let AI generate a custom quiz for you.
                </p>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Topic</label>
                  <input style={inputStyle} placeholder="e.g. Data Structures, React, World History..." value={topic} onChange={e => setTopic(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                  <div>
                    <label style={labelStyle}>Questions</label>
                    <select style={inputStyle} value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))}>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Difficulty</label>
                    <select style={inputStyle} value={difficulty} onChange={e => setDifficulty(e.target.value)} disabled={adaptive}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  background: "rgba(110,72,170,0.06)", borderRadius: 12, marginBottom: 24,
                  border: "1px solid rgba(110,72,170,0.15)", cursor: "pointer",
                }} onClick={() => setAdaptive(v => !v)}>
                  <div style={{
                    width: 40, height: 22, borderRadius: 11,
                    background: adaptive ? "linear-gradient(135deg, #6E48AA, #9D50BB)" : "rgba(110,72,170,0.1)",
                    position: "relative", transition: "all 0.25s ease",
                    boxShadow: adaptive ? "0 0 12px rgba(110,72,170,0.4)" : "none",
                  }}>
                    <motion.div
                      animate={{ x: adaptive ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{
                        position: "absolute", top: 3, width: 16, height: 16,
                        borderRadius: "50%", background: "white",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Adaptive Mode</span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", marginLeft: 8 }}>Increases difficulty automatically</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  onClick={() => generateTopicQuiz()}
                  style={{
                    width: "100%", padding: 14, borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #6E48AA, #9D50BB)",
                    color: "#FFFFFF", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    boxShadow: "0 6px 20px rgba(110,72,170,0.35)",
                  }}
                >
                  Generate Topic Quiz →
                </motion.button>
              </motion.div>
            )}

            {activeTab === "youtube" && (
              <motion.div key="youtube" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>YouTube Quiz</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
                  Paste a YouTube link and generate questions based on its transcript.
                </p>
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>YouTube Video URL</label>
                  <input style={inputStyle} placeholder="https://youtube.com/watch?v=..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Video must have captions/subtitles enabled.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  onClick={generateYoutubeQuiz}
                  style={{
                    width: "100%", padding: 14, borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#FFFFFF", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    boxShadow: "0 6px 20px rgba(239,68,68,0.3)",
                  }}
                >
                  ▶ Generate Video Quiz
                </motion.button>
              </motion.div>
            )}

            {activeTab === "exam" && (
              <motion.div key="exam" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>Exam Prep</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
                  Simulate the pattern of real competitive exams.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                  <div>
                    <label style={labelStyle}>Exam</label>
                    <select style={inputStyle} value={exam} onChange={e => setExam(e.target.value)}>
                      <option value="TCS NQT">TCS NQT</option>
                      <option value="Infosys">Infosys</option>
                      <option value="Wipro">Wipro</option>
                      <option value="AMCAT">AMCAT</option>
                      <option value="GATE CS">GATE CS</option>
                      <option value="CAT Quant">CAT</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Section</label>
                    <select style={inputStyle} value={section} onChange={e => setSection(e.target.value)}>
                      <option value="Aptitude">Aptitude</option>
                      <option value="Verbal">Verbal</option>
                      <option value="Reasoning">Reasoning</option>
                      <option value="Coding">Coding</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Questions</label>
                  <select style={inputStyle} value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))}>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  onClick={generateExamQuiz}
                  style={{
                    width: "100%", padding: 14, borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #1A0B42, #2d1b69)",
                    color: "#FFFFFF", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Inter', sans-serif",
                    border: "1px solid rgba(110,72,170,0.3)",
                    boxShadow: "0 6px 20px rgba(110,72,170,0.2)",
                  }}
                >
                  🎓 Simulate Exam
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
