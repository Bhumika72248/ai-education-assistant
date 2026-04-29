import { motion } from "framer-motion";

export default function PathNode({ node, onClick, index }) {
  const isComplete = node.task.completed;
  // A simplistic way to find if it's the "current" active node: 
  // It's the first incomplete node. This should ideally be passed down.
  const isCurrent = node.isCurrent; 

  const typeColors = {
    learn: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", solid: "bg-indigo-600" },
    practice: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", solid: "bg-teal-500" },
    revise: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", solid: "bg-amber-500" },
    quiz: { bg: "bg-coral-100", text: "text-coral-700", border: "border-coral-200", solid: "bg-coral-500" },
  };

  const colors = typeColors[node.task.task_type] || typeColors.learn;

  return (
    <motion.button
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: index * 0.04, type: "spring", bounce: 0.4 }}
      onClick={() => onClick(node)}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 outline-none group z-10"
      style={{ left: node.x, top: node.y }}
    >
      {/* Node Circle */}
      <div 
        className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${
          isCurrent ? 'w-14 h-14 z-20' : 'w-12 h-12'
        }`}
      >
        {/* Pulsing Orb for Current Node */}
        {isCurrent && (
          <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-md animate-orbPulse" />
        )}
        
        {/* Main Background */}
        <div 
          className={`absolute inset-0 rounded-full border-4 flex items-center justify-center transition-colors duration-500 ${
            isComplete ? `${colors.solid} border-white shadow-lg` : 
            isCurrent ? 'bg-indigo-500 border-white shadow-xl shadow-indigo-500/40' : 
            'bg-slate-50 border-indigo-200 hover:border-indigo-400 hover:bg-white'
          }`}
        >
          {isComplete && (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          )}
          {isCurrent && !isComplete && (
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
          )}
        </div>
      </div>

      {/* Label underneath */}
      <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap transition-all duration-300 ${isCurrent ? 'text-indigo-800 font-bold text-sm' : 'text-slate-500 font-medium text-xs group-hover:text-slate-800'}`}>
        {node.task.topic_name.length > 15 ? node.task.topic_name.substring(0, 15) + '...' : node.task.topic_name}
      </div>
    </motion.button>
  );
}
