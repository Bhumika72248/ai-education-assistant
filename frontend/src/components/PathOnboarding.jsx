import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PathOnboarding({ onGenerate }) {
  const [mode, setMode] = useState(null); // 'prompt' or 'guided'

  if (!mode) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "0 20px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", maxWidth: 900 }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "linear-gradient(135deg, #6E48AA 0%, #9D50BB 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              boxShadow: "0 12px 40px rgba(110,72,170,0.4)"
            }}
          >
            <svg style={{ width: 40, height: 40, color: "white" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              fontSize: 42,
              fontWeight: 800,
              marginBottom: 16,
              background: "linear-gradient(135deg, #1A0B42 0%, #6E48AA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.03em"
            }}
          >
            Where do you want to go?
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 48, lineHeight: 1.6 }}
          >
            Let's build a personalized learning roadmap tailored just for you.
          </motion.p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, maxWidth: 800, margin: "0 auto" }}>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode("prompt")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 32px",
                background: "white",
                borderRadius: 20,
                border: "2px solid rgba(110,72,170,0.15)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 16px rgba(110,72,170,0.08)",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(110,72,170,0.4)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(110,72,170,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(110,72,170,0.15)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(110,72,170,0.08)";
              }}
            >
              <div style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: "radial-gradient(circle, rgba(110,72,170,0.08) 0%, transparent 70%)",
                pointerEvents: "none"
              }} />
              
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(110,72,170,0.1) 0%, rgba(157,80,187,0.15) 100%)",
                color: "#6E48AA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                transition: "transform 0.3s ease"
              }}>
                <svg style={{ width: 32, height: 32 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A0B42", marginBottom: 8 }}>Describe your situation</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>Write freely about your goals, current level, and constraints.</p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode("guided")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 32px",
                background: "white",
                borderRadius: 20,
                border: "2px solid rgba(110,72,170,0.15)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 16px rgba(110,72,170,0.08)",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(110,72,170,0.4)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(110,72,170,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(110,72,170,0.15)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(110,72,170,0.08)";
              }}
            >
              <div style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: "radial-gradient(circle, rgba(110,72,170,0.08) 0%, transparent 70%)",
                pointerEvents: "none"
              }} />
              
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(110,72,170,0.1) 0%, rgba(157,80,187,0.15) 100%)",
                color: "#6E48AA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                transition: "transform 0.3s ease"
              }}>
                <svg style={{ width: 32, height: 32 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A0B42", marginBottom: 8 }}>Answer a few questions</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>Follow a guided step-by-step process to build your path.</p>
            </motion.button>
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
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px" }}>
      <motion.button 
        onClick={onBack}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 40,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-secondary)",
          transition: "color 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#6E48AA"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
      >
        <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </motion.button>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #6E48AA 0%, #9D50BB 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 24px rgba(110,72,170,0.3)"
            }}
          >
            <svg style={{ width: 32, height: 32, color: "white" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 12,
              background: "linear-gradient(135deg, #1A0B42 0%, #6E48AA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em"
            }}
          >
            Tell me everything.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}
          >
            Share your goals, current knowledge, time constraints, and any challenges you're facing.
          </motion.p>
        </div>

        {/* Textarea Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            background: "white",
            borderRadius: 20,
            padding: 32,
            border: "2px solid rgba(110,72,170,0.12)",
            boxShadow: "0 4px 20px rgba(110,72,170,0.08)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            background: "radial-gradient(circle, rgba(110,72,170,0.06) 0%, transparent 70%)",
            pointerEvents: "none"
          }} />
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="I am a 3rd year CSE student preparing for TCS NQT in 45 days. I know arrays and basic loops but I am weak in aptitude and logical reasoning. I can study only 1.5 hours per day because of college..."
            style={{
              width: "100%",
              height: 280,
              padding: 20,
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              fontSize: 15,
              color: "#1A0B42",
              resize: "none",
              outline: "none",
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.7,
              background: "rgba(248,249,250,0.5)",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#9D50BB";
              e.target.style.boxShadow = "0 0 0 3px rgba(157,80,187,0.1)";
              e.target.style.background = "white";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
              e.target.style.background = "rgba(248,249,250,0.5)";
            }}
          />
          
          {/* Character count */}
          <div style={{
            marginTop: 12,
            fontSize: 12,
            color: "var(--text-muted)",
            textAlign: "right"
          }}>
            {prompt.length} characters
          </div>
        </motion.div>
        
        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            marginTop: 24,
            padding: 20,
            background: "linear-gradient(135deg, rgba(110,72,170,0.05) 0%, rgba(157,80,187,0.08) 100%)",
            borderRadius: 16,
            border: "1px solid rgba(110,72,170,0.15)"
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6E48AA", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            💡 Pro Tips
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              "Mention your deadline or timeline",
              "Share your current skill level",
              "Include daily study hours available",
              "List topics you already know"
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6E48AA", flexShrink: 0 }} />
                {tip}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ marginTop: 32, display: "flex", justifyContent: "center" }}
        >
          <motion.button
            onClick={() => onGenerate({ mode: "prompt", prompt })}
            disabled={!prompt.trim()}
            whileHover={prompt.trim() ? { y: -3, scale: 1.02 } : {}}
            whileTap={prompt.trim() ? { scale: 0.98 } : {}}
            style={{
              padding: "16px 48px",
              fontSize: 16,
              fontWeight: 700,
              color: "white",
              background: prompt.trim() 
                ? "linear-gradient(135deg, #6E48AA 0%, #9D50BB 100%)" 
                : "#cbd5e1",
              border: "none",
              borderRadius: 14,
              cursor: prompt.trim() ? "pointer" : "not-allowed",
              boxShadow: prompt.trim() 
                ? "0 8px 24px rgba(110,72,170,0.35)" 
                : "none",
              transition: "all 0.2s",
              fontFamily: "'Inter', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            Generate my path
            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </motion.div>
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
        <div style={{ width: "100%" }}>
          <input 
            type="text" 
            value={answers.goal} 
            onChange={(e) => updateAnswer("goal", e.target.value)}
            style={{
              width: "100%",
              fontSize: 32,
              fontWeight: 700,
              color: "#1A0B42",
              background: "transparent",
              borderBottom: "2px solid #e2e8f0",
              outline: "none",
              paddingBottom: 16,
              textAlign: "center",
              fontFamily: "'Inter', sans-serif",
              transition: "border-color 0.2s"
            }}
            placeholder="e.g. Master React"
            autoFocus
            onFocus={(e) => e.target.style.borderColor = "#6E48AA"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          />
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            {["Crack TCS NQT", "Learn DSA from scratch", "Master React", "Prepare for GATE CS"].map(chip => (
              <motion.button 
                key={chip} 
                onClick={() => updateAnswer("goal", chip)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 20,
                  background: "rgba(110,72,170,0.08)",
                  border: "1px solid rgba(110,72,170,0.2)",
                  color: "#6E48AA",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'Inter', sans-serif"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(110,72,170,0.15)";
                  e.target.style.borderColor = "rgba(110,72,170,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(110,72,170,0.08)";
                  e.target.style.borderColor = "rgba(110,72,170,0.2)";
                }}
              >
                {chip}
              </motion.button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "What is your current level?",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, width: "100%" }}>
          {[
            { id: "Absolute Beginner", desc: "I barely know what a variable is" },
            { id: "Know the Basics", desc: "I can write basic programs but struggle with complex problems" },
            { id: "Intermediate", desc: "I know core concepts, want to master advanced topics" },
            { id: "Advanced", desc: "I am preparing for top tech interviews" }
          ].map(lvl => (
            <motion.button 
              key={lvl.id}
              onClick={() => updateAnswer("level", lvl.id)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: 24,
                borderRadius: 16,
                border: answers.level === lvl.id ? "2px solid #6E48AA" : "2px solid rgba(110,72,170,0.12)",
                background: answers.level === lvl.id ? "rgba(110,72,170,0.08)" : "#FFFFFF",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: answers.level === lvl.id ? "0 8px 24px rgba(110,72,170,0.2)" : "0 2px 8px rgba(110,72,170,0.06)"
              }}
            >
              <h4 style={{ fontWeight: 700, fontSize: 16, color: "#1A0B42", marginBottom: 8 }}>{lvl.id}</h4>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{lvl.desc}</p>
            </motion.button>
          ))}
        </div>
      )
    },
    {
      title: "Do you have a deadline?",
      content: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}>
          <input 
            type="date" 
            value={answers.deadline} 
            onChange={(e) => updateAnswer("deadline", e.target.value)}
            style={{
              padding: "16px 24px",
              fontSize: 18,
              borderRadius: 12,
              border: "1px solid rgba(110,72,170,0.2)",
              outline: "none",
              boxShadow: "0 2px 8px rgba(110,72,170,0.08)",
              fontFamily: "'Inter', sans-serif",
              color: "#1A0B42",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#6E48AA";
              e.target.style.boxShadow = "0 0 0 3px rgba(110,72,170,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(110,72,170,0.2)";
              e.target.style.boxShadow = "0 2px 8px rgba(110,72,170,0.08)";
            }}
          />
          <motion.button 
            onClick={() => updateAnswer("deadline", "No specific deadline")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              background: answers.deadline === "No specific deadline" ? "rgba(110,72,170,0.15)" : "rgba(110,72,170,0.05)",
              color: answers.deadline === "No specific deadline" ? "#6E48AA" : "var(--text-secondary)",
              border: "1px solid rgba(110,72,170,0.2)",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'Inter', sans-serif"
            }}
          >
            No specific deadline
          </motion.button>
        </div>
      )
    },
    {
      title: "How many hours can you realistically study per day?",
      content: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#6E48AA", marginBottom: 32, letterSpacing: "-0.02em" }}>
            {answers.hours} <span style={{ fontSize: 24, color: "var(--text-secondary)" }}>hours</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="6" 
            step="0.5" 
            value={answers.hours} 
            onChange={(e) => updateAnswer("hours", parseFloat(e.target.value))}
            style={{
              width: "100%",
              maxWidth: 500,
              height: 8,
              borderRadius: 4,
              outline: "none",
              background: "linear-gradient(to right, #6E48AA 0%, #9D50BB 100%)",
              cursor: "pointer"
            }}
          />
        </div>
      )
    },
    {
      title: "What topics do you already know?",
      content: (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, width: "100%", maxWidth: 800 }}>
          {["HTML", "CSS", "JavaScript", "React", "Python", "SQL", "Arrays", "Strings", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "Dynamic Programming"].map(topic => {
            const isSelected = answers.topics.includes(topic);
            return (
              <motion.button 
                key={topic}
                onClick={() => {
                  if (isSelected) updateAnswer("topics", answers.topics.filter(t => t !== topic));
                  else updateAnswer("topics", [...answers.topics, topic]);
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: "12px 20px",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  background: isSelected ? "linear-gradient(135deg, #6E48AA, #9D50BB)" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#6E48AA",
                  border: isSelected ? "none" : "1px solid rgba(110,72,170,0.25)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isSelected ? "0 4px 12px rgba(110,72,170,0.3)" : "0 2px 8px rgba(110,72,170,0.08)",
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {topic}
              </motion.button>
            );
          })}
        </div>
      )
    },
    {
      title: "What is getting in your way?",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, width: "100%" }}>
          {["College schedule", "Job or internship", "Lack of focus", "Concepts feel unclear", "Not enough practice", "No structured plan"].map(blocker => {
            const isSelected = answers.blockers.includes(blocker);
            return (
              <motion.button 
                key={blocker}
                onClick={() => {
                  if (isSelected) updateAnswer("blockers", answers.blockers.filter(b => b !== blocker));
                  else updateAnswer("blockers", [...answers.blockers, blocker]);
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  background: isSelected ? "#fff1f2" : "#FFFFFF",
                  color: isSelected ? "#be123c" : "var(--text-secondary)",
                  border: isSelected ? "2px solid #f43f5e" : "2px solid rgba(110,72,170,0.12)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {blocker}
              </motion.button>
            );
          })}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "80vh", paddingTop: 32 }}>
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48 }}>
        <motion.button 
          onClick={onBack}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "color 0.2s",
            fontFamily: "'Inter', sans-serif"
          }}
          onMouseEnter={(e) => e.target.style.color = "#6E48AA"}
          onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}
        >
          Cancel
        </motion.button>
        <div style={{ display: "flex", gap: 8 }}>
          {QUESTIONS.map((_, i) => (
            <div 
              key={i} 
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? "#6E48AA" : "#e2e8f0",
                transition: "all 0.3s ease"
              }} 
            />
          ))}
        </div>
        <div style={{ width: 48 }} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth: 900, margin: "0 auto", width: "100%", padding: "0 20px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <h2 style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#1A0B42",
              marginBottom: 48,
              textAlign: "center",
              letterSpacing: "-0.02em"
            }}>
              {QUESTIONS[step].title}
            </h2>
            {QUESTIONS[step].content}
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: 64, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <motion.button 
            onClick={nextStep}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "16px 48px",
              background: "linear-gradient(135deg, #6E48AA 0%, #9D50BB 100%)",
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(110,72,170,0.35)",
              transition: "all 0.2s",
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {step === QUESTIONS.length - 1 ? "Generate my path" : "Next"}
          </motion.button>
          <motion.button 
            onClick={nextStep}
            whileHover={{ scale: 1.05 }}
            style={{
              marginTop: 16,
              fontSize: 13,
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.2s",
              fontFamily: "'Inter', sans-serif"
            }}
            onMouseEnter={(e) => e.target.style.color = "var(--text-secondary)"}
            onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
          >
            Skip this question
          </motion.button>
        </div>
      </div>
    </div>
  );
}
