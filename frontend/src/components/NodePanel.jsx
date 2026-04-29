import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NodePanel({ node, onClose, onComplete }) {
  if (!node) return null;
  const { task } = node;

  const typeColors = {
    learn: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Learn" },
    practice: { bg: "bg-teal-100", text: "text-teal-700", label: "Practice" },
    revise: { bg: "bg-amber-100", text: "text-amber-700", label: "Revise" },
    quiz: { bg: "bg-coral-100", text: "text-coral-700", label: "Quiz" },
  };

  const colors = typeColors[task.task_type] || typeColors.learn;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
      />

      {/* Side Panel */}
      <motion.div
        initial={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
        animate={{ x: 0, boxShadow: "-10px 0 30px rgba(0,0,0,0.1)" }}
        exit={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[420px] bg-white z-50 flex flex-col border-l border-slate-200"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs">
            Week {node.weekNumber} • Day {node.dayNumber}
          </h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors.bg} ${colors.text}`}>
                {colors.label}
              </span>
              <span className="flex items-center gap-1 text-sm font-medium text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {task.estimated_minutes} min
              </span>
              <span className="flex items-center gap-1 text-sm font-medium text-slate-500 capitalize">
                <div className={`w-2 h-2 rounded-full ${task.difficulty === 'hard' ? 'bg-red-500' : task.difficulty === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                {task.difficulty}
              </span>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 leading-tight">
              {task.topic_name}
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(task.youtube_query)}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">Watch Tutorials</span>
                <span className="text-xs text-slate-500">Search YouTube for best videos</span>
              </div>
            </a>

            <Link 
              to={`/quiz?topic=${encodeURIComponent(task.topic_name)}`}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800">Take a Quiz</span>
                <span className="text-xs text-slate-500">Test your knowledge right now</span>
              </div>
            </Link>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-700 mb-2">Personal Notes</label>
            <textarea 
              className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none text-sm text-slate-600"
              placeholder="Jot down key takeaways, commands, or concepts here..."
            />
          </div>

        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={onComplete}
            disabled={task.completed}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
              task.completed 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-1'
            }`}
          >
            {task.completed ? (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Completed
              </>
            ) : (
              "Mark as complete"
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
