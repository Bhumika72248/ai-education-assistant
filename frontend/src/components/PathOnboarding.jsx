import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PathOnboarding({ onGenerate }) {
  const [mode, setMode] = useState(null); // 'prompt' or 'guided'

  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Where do you want to go?
          </h1>
          <p className="text-lg text-slate-500 mb-12">
            Let's build a personalized learning roadmap. How would you like to start?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setMode("prompt")}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Describe your situation</h3>
              <p className="text-slate-500 text-sm mt-2">Write freely about your goals, current level, and constraints.</p>
            </button>

            <button
              onClick={() => setMode("guided")}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Answer a few questions</h3>
              <p className="text-slate-500 text-sm mt-2">Follow a guided step-by-step process to build your path.</p>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === "prompt") {
    return <PromptMode onGenerate={onGenerate} onBack={() => setMode(null)} />;
  }

  return <GuidedMode onGenerate={onGenerate} onBack={() => setMode(null)} />;
}

function PromptMode({ onGenerate, onBack }) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-8 font-medium transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back
      </button>
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold text-slate-800 mb-6">Tell me everything.</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="I am a 3rd year CSE student preparing for TCS NQT in 45 days. I know arrays and basic loops but I am weak in aptitude and logical reasoning. I can study only 1.5 hours per day because of college..."
          className="w-full h-64 p-6 rounded-2xl border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none text-lg text-slate-700 bg-white/80 backdrop-blur"
        />
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onGenerate({ mode: "prompt", prompt })}
            disabled={!prompt.trim()}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
          >
            Generate my path
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function GuidedMode({ onGenerate, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    goal: "",
    level: "",
    deadline: "",
    hours: 2,
    topics: [],
    blockers: []
  });

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    else onGenerate({ mode: "guided", answers });
  };

  const updateAnswer = (key, val) => setAnswers({ ...answers, [key]: val });

  const QUESTIONS = [
    {
      title: "What is your main goal?",
      content: (
        <div className="w-full">
          <input 
            type="text" 
            value={answers.goal} 
            onChange={(e) => updateAnswer("goal", e.target.value)}
            className="w-full text-2xl md:text-4xl font-bold text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none pb-4 text-center placeholder-slate-300"
            placeholder="e.g. Master React"
            autoFocus
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["Crack TCS NQT", "Learn DSA from scratch", "Master React", "Prepare for GATE CS"].map(chip => (
              <button key={chip} onClick={() => updateAnswer("goal", chip)} className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors">
                {chip}
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "What is your current level?",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {[
            { id: "Absolute Beginner", desc: "I barely know what a variable is" },
            { id: "Know the Basics", desc: "I can write basic programs but struggle with complex problems" },
            { id: "Intermediate", desc: "I know core concepts, want to master advanced topics" },
            { id: "Advanced", desc: "I am preparing for top tech interviews" }
          ].map(lvl => (
            <button 
              key={lvl.id}
              onClick={() => updateAnswer("level", lvl.id)}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${answers.level === lvl.id ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/10' : 'border-slate-100 bg-white hover:border-slate-300'}`}
            >
              <h4 className="font-bold text-lg text-slate-800">{lvl.id}</h4>
              <p className="text-sm text-slate-500 mt-2">{lvl.desc}</p>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Do you have a deadline?",
      content: (
        <div className="flex flex-col items-center gap-6 w-full">
          <input 
            type="date" 
            value={answers.deadline} 
            onChange={(e) => updateAnswer("deadline", e.target.value)}
            className="px-6 py-4 text-xl rounded-xl border border-slate-200 focus:border-indigo-500 outline-none shadow-sm"
          />
          <button 
            onClick={() => updateAnswer("deadline", "No specific deadline")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${answers.deadline === "No specific deadline" ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            No specific deadline
          </button>
        </div>
      )
    },
    {
      title: "How many hours can you realistically study per day?",
      content: (
        <div className="flex flex-col items-center w-full">
          <div className="text-6xl font-bold text-indigo-600 mb-8">{answers.hours} <span className="text-2xl text-slate-400">hours</span></div>
          <input 
            type="range" min="0.5" max="6" step="0.5" 
            value={answers.hours} 
            onChange={(e) => updateAnswer("hours", parseFloat(e.target.value))}
            className="w-full max-w-md accent-indigo-600"
          />
        </div>
      )
    },
    {
      title: "What topics do you already know?",
      content: (
        <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl">
          {["HTML", "CSS", "JavaScript", "React", "Python", "SQL", "Arrays", "Strings", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "Dynamic Programming"].map(topic => {
            const isSelected = answers.topics.includes(topic);
            return (
              <button 
                key={topic}
                onClick={() => {
                  if (isSelected) updateAnswer("topics", answers.topics.filter(t => t !== topic));
                  else updateAnswer("topics", [...answers.topics, topic]);
                }}
                className={`px-5 py-3 rounded-xl font-medium transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      )
    },
    {
      title: "What is getting in your way?",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {["College schedule", "Job or internship", "Lack of focus", "Concepts feel unclear", "Not enough practice", "No structured plan"].map(blocker => {
            const isSelected = answers.blockers.includes(blocker);
            return (
              <button 
                key={blocker}
                onClick={() => {
                  if (isSelected) updateAnswer("blockers", answers.blockers.filter(b => b !== blocker));
                  else updateAnswer("blockers", [...answers.blockers, blocker]);
                }}
                className={`p-4 rounded-xl text-center text-sm font-medium transition-all ${isSelected ? 'bg-coral-50 border-2 border-coral-400 text-coral-700' : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-slate-300'}`}
                style={isSelected ? { borderColor: '#f43f5e', backgroundColor: '#fff1f2', color: '#be123c' } : {}}
              >
                {blocker}
              </button>
            );
          })}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-[80vh] pt-8">
      <div className="w-full max-w-4xl mx-auto px-4 flex items-center justify-between mb-12">
        <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 font-medium transition-colors">Cancel</button>
        <div className="flex gap-2">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-indigo-600 w-6' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="w-12" /> {/* spacer */}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-12 text-center">{QUESTIONS[step].title}</h2>
            {QUESTIONS[step].content}
          </motion.div>
        </AnimatePresence>

        <div className="mt-16 flex flex-col items-center">
          <button 
            onClick={nextStep}
            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all text-lg"
          >
            {step === QUESTIONS.length - 1 ? "Generate my path" : "Next"}
          </button>
          <button onClick={nextStep} className="mt-4 text-sm text-slate-400 hover:text-slate-600">Skip this question</button>
        </div>
      </div>
    </div>
  );
}
