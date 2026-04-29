import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PathSettings({ onRegenerate }) {
  const [expanded, setExpanded] = useState(false);
  const [settings, setSettings] = useState({
    hours: 2,
    deadline: "",
    difficulty: "Balanced",
    restDays: []
  });

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleRegenerate = () => {
    setExpanded(false);
    onRegenerate(settings);
  };

  const toggleRestDay = (day) => {
    if (settings.restDays.includes(day)) {
      setSettings({ ...settings, restDays: settings.restDays.filter(d => d !== day) });
    } else {
      setSettings({ ...settings, restDays: [...settings.restDays, day] });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
            <span className="text-lg font-bold text-slate-800">30 Days</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Week</span>
            <span className="text-lg font-bold text-indigo-600">Week 2</span>
          </div>
          <div className="w-px h-8 bg-slate-200 hidden sm:block" />
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Goal</span>
            <span className="text-lg font-bold text-slate-800">{settings.hours} hrs</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 hidden md:block">Adjust Path Settings</span>
          <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Daily Hours */}
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-700 mb-4">Daily Study Hours</label>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-indigo-600 w-12">{settings.hours}</span>
                  <input 
                    type="range" min="0.5" max="6" step="0.5" 
                    value={settings.hours} 
                    onChange={(e) => setSettings({...settings, hours: parseFloat(e.target.value)})}
                    className="flex-1 accent-indigo-600"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-700 mb-4">Target Deadline</label>
                <input 
                  type="date" 
                  value={settings.deadline} 
                  onChange={(e) => setSettings({...settings, deadline: e.target.value})}
                  className="px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none w-full"
                />
              </div>

              {/* Difficulty */}
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-700 mb-4">Pacing Preference</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {["Comfortable", "Balanced", "Aggressive"].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSettings({...settings, difficulty: diff})}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${settings.difficulty === diff ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rest Days */}
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-700 mb-4">Rest Days</label>
                <div className="flex gap-1.5">
                  {DAYS.map(day => {
                    const isRest = settings.restDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleRestDay(day)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isRest ? 'bg-coral-100 text-coral-600 border border-coral-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-200'}`}
                        title={isRest ? "Rest day" : "Study day"}
                      >
                        {day.charAt(0)}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleRegenerate}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Regenerate Path
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
