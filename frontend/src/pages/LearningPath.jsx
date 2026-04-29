import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PathOnboarding from "../components/PathOnboarding";
import SnakePath from "../components/SnakePath";
import PathSettings from "../components/PathSettings";
import NodePanel from "../components/NodePanel";

export default function LearningPath() {
  const [hasPath, setHasPath] = useState(false);
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // "overview", "this-week", "today"
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
      const res = await fetch("http://localhost:8000/learning-path/me", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ""}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.has_path) {
          setPathData(data.path_data);
          setHasPath(true);
        }
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
      const res = await fetch("http://localhost:8000/learning-path/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to generate path");
      
      const data = await res.json();
      setPathData(data);
      
      // Simulate the 3-second substantial loading screen as requested
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
    
    // Create deep copy
    const newPath = JSON.parse(JSON.stringify(pathData));
    const task = newPath.weeks[weekIdx].days[dayIdx].tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = true;
    }
    
    // Optimistic update
    setPathData(newPath);
    
    // Save to backend
    try {
      await fetch("http://localhost:8000/learning-path/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({ path_data: JSON.stringify(newPath) })
      });
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

  return (
    <div className="relative w-full h-full min-h-[85vh]">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Your Learning Path</h1>
          <p className="text-slate-500 text-sm mt-1">{pathData.goal}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/60 p-1 rounded-xl shadow-sm border border-slate-200">
          {["overview", "this-week", "today"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                viewMode === mode 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {mode.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Accordion */}
      <PathSettings onRegenerate={(settings) => handleGenerate({ mode: "prompt", prompt: "Regenerate with new constraints", settings })} />

      {/* Main Path View */}
      <div className="mt-8">
        {viewMode === "today" ? (
          <DailyTaskView pathData={pathData} onTaskComplete={handleUpdateNode} />
        ) : (
          <SnakePath 
            pathData={pathData} 
            viewMode={viewMode} 
            onNodeClick={setSelectedNode} 
          />
        )}
      </div>

      {/* Side Panel Overlay */}
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
    </div>
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

function DailyTaskView({ pathData, onTaskComplete }) {
  // Simplistic daily view implementation
  // Find first uncompleted task day
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

  if (!todayDay) return <div className="text-center p-12 text-slate-500">You've completed your entire path! 🎉</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Today's Focus: Day {todayDay.day_number}</h2>
      <div className="flex flex-col gap-4">
        {todayDay.tasks.map(task => (
          <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <button 
              onClick={() => onTaskComplete(wIdx, dIdx, task.id)}
              className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-colors ${task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 hover:border-indigo-400'}`}
            >
              {task.completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <div className="flex-1">
              <h3 className={`font-semibold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.topic_name}</h3>
              <p className="text-xs text-slate-500 mt-1 capitalize">{task.task_type} • {task.estimated_minutes} min • {task.difficulty}</p>
            </div>
            {!task.completed && (
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(task.youtube_query)}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                Watch
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
