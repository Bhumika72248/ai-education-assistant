import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PathOnboarding from "../components/PathOnboarding";
import SnakePath from "../components/SnakePath";
import NodePanel from "../components/NodePanel";
import PageWrapper from "../components/ui/PageWrapper";
import api from "../api/client";

export default function LearningPath() {
  const [hasPath, setHasPath] = useState(false);
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("eduai_path_view_mode") || "overview";
  });
  
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchMyPath();
  }, []);

  useEffect(() => {
    localStorage.setItem("eduai_path_view_mode", viewMode);
  }, [viewMode]);

  const fetchMyPath = async () => {
    try {
      const res = await api.get("/learning-path/me");
      if (res.data.has_path) {
        setPathData(res.data.path_data);
        setHasPath(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (payload) => {
    setGenerating(true);
    try {
      const res = await api.post("/learning-path/generate", payload);
      setPathData(res.data);
      
      setTimeout(() => {
        setHasPath(true);
        setGenerating(false);
      }, 3000);
      
    } catch (e) {
      console.error(e);
      setGenerating(false);
      alert("Error generating learning path. Please try again.");
    }
  };

  const handleUpdateNode = async (weekIdx, dayIdx, taskId) => {
    if (!pathData) return;
    
    const newPath = JSON.parse(JSON.stringify(pathData));
    const task = newPath.weeks[weekIdx].days[dayIdx].tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = true;
    }
    
    setPathData(newPath);
    
    try {
      await api.put("/learning-path/update", { path_data: JSON.stringify(newPath) });
    } catch (e) {
      console.error("Failed to sync path update", e);
    }
  };

  if (loading) return null;

  if (generating) {
    return <LoadingScreen />;
  }

  if (!hasPath) {
    return <PathOnboarding onGenerate={handleGenerate} />;
  }

  // Calculate dynamic stats
  const calculateStats = () => {
    if (!pathData || !pathData.weeks) return { remainingDays: 0, currentWeek: 1, dailyGoal: '0 hrs' };
    
    let totalDays = 0;
    let completedDays = 0;
    let currentWeekNum = 1;
    let foundCurrentWeek = false;
    let totalMinutes = 0;
    
    pathData.weeks.forEach(week => {
      week.days.forEach(day => {
        totalDays++;
        const allTasksCompleted = day.tasks.every(t => t.completed);
        if (allTasksCompleted) {
          completedDays++;
        } else if (!foundCurrentWeek) {
          currentWeekNum = week.week_number;
          foundCurrentWeek = true;
        }
        
        // Calculate average daily minutes
        day.tasks.forEach(t => {
          totalMinutes += t.estimated_minutes || 0;
        });
      });
    });
    
    const remainingDays = totalDays - completedDays;
    const avgDailyMinutes = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0;
    const dailyGoal = avgDailyMinutes >= 60 
      ? `${Math.round(avgDailyMinutes / 60 * 10) / 10} hrs` 
      : `${avgDailyMinutes} min`;
    
    return { remainingDays, currentWeek: currentWeekNum, dailyGoal };
  };
  
  const stats = calculateStats();

  return (
    <PageWrapper>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 24 }}
      >
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 8px", color: "#1A0B42", letterSpacing: "-0.03em" }}>
          Your Learning Path
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>{pathData.goal}</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}
      >
        <div className="card-solid" style={{ textAlign: "center", border: "1px solid rgba(110,72,170,0.15)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Remaining</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#6E48AA", letterSpacing: "-0.02em" }}>{stats.remainingDays} Days</div>
        </div>
        <div className="card-solid" style={{ textAlign: "center", border: "1px solid rgba(110,72,170,0.15)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Current Week</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#6E48AA", letterSpacing: "-0.02em" }}>Week {stats.currentWeek}</div>
        </div>
        <div className="card-solid" style={{ textAlign: "center", border: "1px solid rgba(110,72,170,0.15)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Daily Goal</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#6E48AA", letterSpacing: "-0.02em" }}>{stats.dailyGoal}</div>
        </div>
      </motion.div>

      {/* View Mode Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ marginBottom: 24 }}
      >
        <div style={{ display: "flex", gap: 8, background: "#FFFFFF", padding: 6, borderRadius: 12, border: "1px solid rgba(110,72,170,0.15)", boxShadow: "0 2px 8px rgba(110,72,170,0.08)", width: "fit-content" }}>
          {["overview", "this-week", "today"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s ease",
                background: viewMode === mode ? "linear-gradient(135deg, #6E48AA, #9D50BB)" : "transparent",
                color: viewMode === mode ? "#FFFFFF" : "var(--text-secondary)",
                boxShadow: viewMode === mode ? "0 4px 12px rgba(110,72,170,0.3)" : "none",
              }}
            >
              {mode.replace("-", " ")}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Content - Path Visualization in Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="card-solid"
        style={{ padding: "32px 24px", minHeight: 400 }}
      >
        {viewMode === "today" ? (
          <DailyTaskView pathData={pathData} onTaskComplete={handleUpdateNode} />
        ) : viewMode === "this-week" ? (
          <WeeklyTaskView pathData={pathData} onNodeClick={setSelectedNode} onTaskComplete={handleUpdateNode} />
        ) : (
          <SnakePathView pathData={pathData} viewMode={viewMode} onNodeClick={setSelectedNode} />
        )}
      </motion.div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodePanel 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)} 
            onComplete={() => {
              handleUpdateNode(selectedNode.weekIdx, selectedNode.dayIdx, selectedNode.task.id);
              setSelectedNode(null);
            }} 
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "Analyzing your situation...",
    "Designing your topic order...",
    "Calculating your daily schedule...",
    "Building your personal roadmap..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 750);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative flex items-center justify-center w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-orbPulse" />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-xl shadow-indigo-500/30 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        </div>
      </div>
      <div className="h-8 relative overflow-hidden w-full max-w-sm text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-medium text-slate-700 absolute inset-0"
          >
            {messages[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SnakePathView({ pathData, viewMode, onNodeClick }) {
  return (
    <div style={{ position: "relative", width: "100%", minHeight: 400 }}>
      <SnakePath pathData={pathData} viewMode={viewMode} onNodeClick={onNodeClick} />
    </div>
  );
}

function DailyTaskView({ pathData, onTaskComplete }) {
  let todayDay = null;
  let wIdx = 0, dIdx = 0;
  for (let w = 0; w < pathData.weeks.length; w++) {
    for (let d = 0; d < pathData.weeks[w].days.length; d++) {
      const day = pathData.weeks[w].days[d];
      if (day.tasks.some(t => !t.completed)) {
        todayDay = day;
        wIdx = w;
        dIdx = d;
        break;
      }
    }
    if (todayDay) break;
  }

  if (!todayDay) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A0B42", marginBottom: 8 }}>Congratulations!</h3>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>You've completed your entire learning path!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A0B42", marginBottom: 20 }}>Today's Focus: Day {todayDay.day_number}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {todayDay.tasks.map(task => (
          <motion.div
            key={task.id}
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(110,72,170,0.15)" }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 16,
              borderRadius: 12,
              border: "1px solid rgba(110,72,170,0.12)",
              background: "#FFFFFF",
              boxShadow: "0 2px 8px rgba(110,72,170,0.06)",
              transition: "all 0.2s ease",
            }}
          >
            <button 
              onClick={() => onTaskComplete(wIdx, dIdx, task.id)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: task.completed ? "none" : "2px solid #D1D5DB",
                background: task.completed ? "linear-gradient(135deg, #6E48AA, #9D50BB)" : "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {task.completed && (
                <svg style={{ width: 14, height: 14, color: "#FFFFFF" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: task.completed ? "#9CA3AF" : "#1A0B42",
                marginBottom: 4,
                textDecoration: task.completed ? "line-through" : "none",
              }}>
                {task.topic_name}
              </h3>
              <p style={{
                margin: 0,
                fontSize: 12,
                color: "var(--text-secondary)",
                textTransform: "capitalize",
              }}>
                {task.task_type} • {task.estimated_minutes} min • {task.difficulty}
              </p>
            </div>
            {!task.completed && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(task.youtube_query)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#dc2626",
                  background: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  borderRadius: 8,
                  textDecoration: "none",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(220,38,38,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(220,38,38,0.08)";
                }}
              >
                Watch
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WeeklyTaskView({ pathData, onNodeClick, onTaskComplete }) {
  // Find current week
  let currentWeek = null;
  let weekIdx = 0;
  
  for (let w = 0; w < pathData.weeks.length; w++) {
    const week = pathData.weeks[w];
    const hasIncomplete = week.days.some(d => d.tasks.some(t => !t.completed));
    if (hasIncomplete) {
      currentWeek = week;
      weekIdx = w;
      break;
    }
  }

  if (!currentWeek) {
    currentWeek = pathData.weeks[pathData.weeks.length - 1];
    weekIdx = pathData.weeks.length - 1;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A0B42", marginBottom: 8 }}>Week {currentWeek.week_number}</h2>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>{currentWeek.milestone}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {currentWeek.days.map((day, dIdx) => {
          const allCompleted = day.tasks.every(t => t.completed);
          const someCompleted = day.tasks.some(t => t.completed);
          
          return (
            <motion.div
              key={day.day_number}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(110,72,170,0.2)" }}
              style={{
                background: allCompleted 
                  ? "linear-gradient(135deg, rgba(110,72,170,0.08) 0%, rgba(157,80,187,0.12) 100%)"
                  : "#FFFFFF",
                border: allCompleted 
                  ? "2px solid rgba(110,72,170,0.3)" 
                  : "1px solid rgba(110,72,170,0.12)",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 2px 8px rgba(110,72,170,0.08)",
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {allCompleted && (
                <div style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
                }}>
                  <svg style={{ width: 18, height: 18, color: "white" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#6E48AA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Day {day.day_number}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {day.tasks.length} task{day.tasks.length > 1 ? 's' : ''} • {day.tasks.reduce((sum, t) => sum + t.estimated_minutes, 0)} min
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {day.tasks.map((task, tIdx) => {
                  const node = {
                    task,
                    weekNumber: currentWeek.week_number,
                    dayNumber: day.day_number,
                    weekIdx,
                    dayIdx: dIdx
                  };
                  
                  return (
                    <div
                      key={task.id}
                      onClick={() => onNodeClick(node)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: 12,
                        background: task.completed ? "rgba(110,72,170,0.05)" : "rgba(255,255,255,0.8)",
                        borderRadius: 10,
                        border: "1px solid rgba(110,72,170,0.1)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = task.completed ? "rgba(110,72,170,0.1)" : "rgba(110,72,170,0.05)";
                        e.currentTarget.style.borderColor = "rgba(110,72,170,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = task.completed ? "rgba(110,72,170,0.05)" : "rgba(255,255,255,0.8)";
                        e.currentTarget.style.borderColor = "rgba(110,72,170,0.1)";
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: task.completed ? "none" : "2px solid #D1D5DB",
                        background: task.completed ? "linear-gradient(135deg, #6E48AA, #9D50BB)" : "#FFFFFF",
                      }}>
                        {task.completed && (
                          <svg style={{ width: 12, height: 12, color: "#FFFFFF" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: task.completed ? "#9CA3AF" : "#1A0B42",
                          textDecoration: task.completed ? "line-through" : "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {task.topic_name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                          {task.task_type} • {task.estimated_minutes}m
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
