import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import api from "../api/client";
import QuizCard from "../components/QuizCard";

const tabs = [
  { id: 'topic', label: 'By Topic', icon: '📝' },
  { id: 'youtube', label: 'From YouTube', icon: '▶️' },
  { id: 'exam', label: 'Exam Prep', icon: '🎓' }
];

export default function Quiz() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("topic");
  
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [adaptive, setAdaptive] = useState(false);

  const [youtubeUrl, setYoutubeUrl] = useState("");
  
  const [exam, setExam] = useState("TCS NQT");
  const [section, setSection] = useState("Aptitude");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [resources, setResources] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const resultRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
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
    setQuiz(null);
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setError(null);
    setResources(null);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    resetQuizState();
  };

  const generateTopicQuiz = async (t = topic, n = numQuestions, d = difficulty, a = adaptive) => {
    if (!t) return setError("Please enter a topic.");
    setLoading(true);
    setError(null);
    setLoadingMsg("Generating questions...");
    try {
      const res = await api.post("/quiz/generate", { topic: t, num_questions: n, difficulty: d, adaptive: a });
      setQuiz(res.data.quiz);
      setCurrentIndex(0);
      setIsFinished(false);
      setScore(0);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const generateYoutubeQuiz = async () => {
    if (!youtubeUrl) return setError("Please enter a YouTube URL.");
    setLoading(true);
    setError(null);
    setLoadingMsg("Reading video transcript...");
    try {
      const res = await api.post("/quiz/from-youtube", { url: youtubeUrl });
      setQuiz(res.data.quiz);
      setCurrentIndex(0);
      setIsFinished(false);
      setScore(0);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate from YouTube");
    } finally {
      setLoading(false);
    }
  };

  const generateExamQuiz = async () => {
    setLoading(true);
    setError(null);
    setLoadingMsg("Simulating exam pattern...");
    try {
      const res = await api.post("/quiz/exam-prep", { exam, section, num_questions: numQuestions });
      setQuiz(res.data.quiz);
      setResources(res.data.resources);
      setCurrentIndex(0);
      setIsFinished(false);
      setScore(0);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate exam quiz");
    } finally {
      setLoading(false);
    }
  };

  const saveAttempt = async (finalScore) => {
    try {
      await api.post("/quiz/save-attempt", {
        topic: activeTab === 'youtube' ? 'YouTube Video' : activeTab === 'exam' ? `${exam} - ${section}` : topic,
        score: finalScore,
        total: quiz.length,
        questions_json: JSON.stringify(quiz)
      });
    } catch (err) {
      console.error("Failed to save attempt", err);
    }
  };

  const handleNext = (isCorrect) => {
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
      saveAttempt(newScore);
    }
  };

  const handleShare = async () => {
    if (resultRef.current) {
      const canvas = await html2canvas(resultRef.current, { scale: 2 });
      const link = document.createElement("a");
      link.download = "eduai-quiz-result.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const getPerformanceLabel = () => {
    const p = score / quiz.length;
    if (p >= 0.8) return "Excellent";
    if (p >= 0.6) return "Good";
    return "Needs Practice";
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid var(--border)", outline: "none",
    fontSize: 14, fontFamily: "Inter, sans-serif"
  };

  const labelStyle = {
    display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6
  };

  if (loading) {
    return (
      <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div style={{ fontSize: 40, marginBottom: 16, animation: "pulse 1.5s infinite" }}>⏳</div>
        <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{loadingMsg}</p>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: "0 auto" }}>
        <div ref={resultRef} className="card" style={{ marginBottom: 24, padding: "32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 6, background: "var(--accent)" }}></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Quiz Results</h2>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>
                {activeTab === 'topic' && `Topic: ${topic}`}
                {activeTab === 'youtube' && `YouTube Video`}
                {activeTab === 'exam' && `${exam} - ${section}`}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>EduAI</div>
              <div style={{ fontSize: 11, color: "var(--border)" }}>{new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0 40px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: "var(--accent)" }}>{score}/{quiz.length}</div>
              <div style={{ fontSize: 18, color: "var(--text-secondary)", fontWeight: 500 }}>{percentage}%</div>
            </div>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <span className="tag" style={{ 
              fontSize: 14, padding: "6px 16px",
              background: percentage >= 80 ? "var(--green-light)" : percentage >= 60 ? "var(--amber-light)" : "var(--red-light)",
              color: percentage >= 80 ? "var(--green)" : percentage >= 60 ? "var(--amber)" : "var(--red)",
            }}>
              {getPerformanceLabel()}
            </span>
          </div>
        </div>

        {resources && resources.length > 0 && (
          <div className="card fade-in" style={{ marginBottom: 24 }}>
            <h3 className="section-title">Free Resources to Improve</h3>
            <p className="section-sub">We found these helpful links based on your exam selection.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {resources.map((res, i) => (
                <a key={i} href={res.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", transition: "all 0.15s" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{res.name}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{res.description}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleShare} className="btn-ghost" style={{ flex: 1, padding: 12 }}>
            📸 Share your result
          </button>
          <button onClick={resetQuizState} className="btn-primary" style={{ flex: 1, padding: 12 }}>
            Try Another Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quiz && currentIndex < quiz.length) {
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ width: "100%", background: "var(--border)", borderRadius: 10, height: 6, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ background: "var(--accent)", height: 6, width: `${((currentIndex) / quiz.length) * 100}%`, transition: "width 0.3s ease" }}></div>
        </div>
        <QuizCard 
          question={quiz[currentIndex]} 
          index={currentIndex} 
          total={quiz.length}
          onNext={handleNext} 
        />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>Quiz Generator</h1>
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>Generate adaptive quizzes, test knowledge from YouTube, or prep for exams.</p>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, padding: "4px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "Inter, sans-serif", transition: "all 0.15s ease", background: activeTab === t.id ? "var(--accent)" : "transparent", color: activeTab === t.id ? "white" : "var(--text-secondary)" }}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="card">
        {error && (
          <div style={{ background: "var(--red-light)", color: "var(--red)", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 500 }}>
            ⚠️ {error}
          </div>
        )}

        {activeTab === "topic" && (
          <div className="fade-in">
            <h2 className="section-title">Topic Quiz</h2>
            <p className="section-sub">Enter any topic and let AI generate a custom quiz for you.</p>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Topic</label>
              <input style={inputStyle} placeholder="e.g. Data Structures, React, World History..." value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Questions</label>
                <select style={inputStyle} value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))}>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Difficulty</label>
                <select style={inputStyle} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={adaptive}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "var(--bg)", borderRadius: 8, marginBottom: 24, border: "1px solid var(--border)" }}>
              <input type="checkbox" id="adaptive" checked={adaptive} onChange={(e) => setAdaptive(e.target.checked)} style={{ cursor: "pointer" }} />
              <label htmlFor="adaptive" style={{ fontSize: 14, fontWeight: 500, cursor: "pointer", color: "var(--text-primary)" }}>
                Adaptive Mode <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(Increases difficulty automatically)</span>
              </label>
            </div>
            <button className="btn-primary" onClick={() => generateTopicQuiz()} style={{ width: "100%", padding: 12 }}>
              Generate Topic Quiz
            </button>
          </div>
        )}

        {activeTab === "youtube" && (
          <div className="fade-in">
            <h2 className="section-title">YouTube Quiz</h2>
            <p className="section-sub">Paste a YouTube link and generate questions based on its transcript.</p>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>YouTube Video URL</label>
              <input style={inputStyle} placeholder="https://youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>Video must have captions/subtitles enabled.</p>
            </div>
            <button className="btn-primary" onClick={generateYoutubeQuiz} style={{ width: "100%", padding: 12, background: "#ef4444" }}>
              ▶ Generate Video Quiz
            </button>
          </div>
        )}

        {activeTab === "exam" && (
          <div className="fade-in">
            <h2 className="section-title">Exam Prep</h2>
            <p className="section-sub">Simulate the pattern of real competitive exams.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Exam</label>
                <select style={inputStyle} value={exam} onChange={(e) => setExam(e.target.value)}>
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
                <select style={inputStyle} value={section} onChange={(e) => setSection(e.target.value)}>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Verbal">Verbal</option>
                  <option value="Reasoning">Reasoning</option>
                  <option value="Coding">Coding</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Questions</label>
              <select style={inputStyle} value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))}>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>
            <button className="btn-primary" onClick={generateExamQuiz} style={{ width: "100%", padding: 12, background: "var(--text-primary)" }}>
              🎓 Simulate Exam
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
