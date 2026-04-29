import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useChat from "../hooks/useChat";
import VoiceButton from "./VoiceButton";
import { BotIcon, MessageIcon } from "./ui/Icon";

export default function ChatWindow({ studentId }) {
  const { messages, send, loading } = useChat(studentId);
  const bottomRef = useRef(null);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  function stopSpeaking() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  async function speakText(text) {
    if (!text) return;
    
    stopSpeaking();
    
    try {
      const response = await fetch("http://localhost:8000/chat/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) throw new Error("TTS failed");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        setIsSpeaking(false);
      };
      
      await audio.play();
    } catch (e) {
      console.error("TTS Fetch/Playback Error:", e);
      // Fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === "assistant" && last.content && !loading) {
        setTimeout(() => speakText(last.content), 300);
      }
    }
  }, [messages, loading]);

  async function submitMessage(text) {
    const value = text?.trim();
    if (!value) return;
    await send(value);
    setInput("");
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "72vh", minHeight: 520, borderRadius: 24, overflow: "hidden",
      border: "1px solid rgba(110,72,170,0.12)",
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 40px rgba(110,72,170,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(110,72,170,0.08)",
        background: "rgba(248,249,255,0.9)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div className={isSpeaking ? "animate-aiSpeak" : ""} style={{
          width: 36, height: 36, borderRadius: 12,
          background: "linear-gradient(135deg, #6E48AA, #9D50BB)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, boxShadow: "0 4px 12px rgba(110,72,170,0.3)", color: '#fff',
          transition: "all 0.3s ease"
        }}><BotIcon size={18} /></div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1A0B42" }}>EduAI Tutor</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#059669", boxShadow: "0 0 8px rgba(5,150,105,0.5)",
              animation: "cyanPulse 2s infinite",
            }} />
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 500 }}>Online · RAG-powered</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px",
        display: "flex", flexDirection: "column", gap: 14,
        background: "rgba(248,249,255,0.5)",
      }}>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100%", gap: 16, textAlign: "center",
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: "linear-gradient(135deg, rgba(110,72,170,0.12), rgba(0,153,204,0.08))",
              border: "1px solid rgba(110,72,170,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, animation: "float 3s ease-in-out infinite",
            }}><MessageIcon size={30} /></div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1A0B42", margin: "0 0 6px" }}>
                Start a conversation
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                Ask anything — type or use the microphone
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
              {["Explain photosynthesis", "Solve quadratic equations", "What is Newton's 3rd law?"].map(s => (
                <motion.button
                  key={s} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => submitMessage(s)}
                  style={{
                    padding: "7px 14px", borderRadius: 20,
                    background: "rgba(110,72,170,0.08)",
                    border: "1px solid rgba(110,72,170,0.18)",
                    color: "#6E48AA", fontSize: 12, fontWeight: 500,
                    cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  }}
                >{s}</motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end", gap: 8,
              }}
            >
              {m.role === "assistant" && (
                <div className={isSpeaking && i === messages.length - 1 ? "animate-aiSpeak" : ""} style={{
                  width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                  background: "linear-gradient(135deg, #6E48AA, #9D50BB)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: '#fff',
                  transition: "all 0.3s ease"
                }}><BotIcon size={14} /></div>
              )}
              <div style={{
                maxWidth: "78%", padding: "12px 16px",
                fontSize: m.role === "assistant" ? 18 : 14, lineHeight: 1.65,
                fontFamily: m.role === "assistant" ? "'Caveat', cursive" : "'Inter', sans-serif",
                ...(m.role === "user"
                  ? {
                      background: "linear-gradient(135deg, #6E48AA, #9D50BB)",
                      color: "#FFFFFF",
                      borderRadius: "18px 18px 4px 18px",
                      boxShadow: "0 4px 20px rgba(110,72,170,0.3)",
                    }
                  : {
                      background: "rgba(255,255,255,0.95)",
                      border: "1px solid rgba(110,72,170,0.1)",
                      color: "#1A0B42",
                      borderRadius: "18px 18px 18px 4px",
                      boxShadow: "0 2px 8px rgba(110,72,170,0.06)",
                    }
                ),
              }}>
                {m.content || (m.role === "assistant" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
                    <span style={{ display: "flex", gap: 3 }}>
                      {[0, 1, 2].map(j => (
                        <motion.span
                          key={j}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, delay: j * 0.15, repeat: Infinity }}
                          style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#6E48AA" }}
                        />
                      ))}
                    </span>
                    Thinking...
                  </span>
                ) : "")}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: "14px 16px",
        borderTop: "1px solid rgba(110,72,170,0.08)",
        background: "rgba(248,249,255,0.9)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <VoiceButton onTranscript={submitMessage} />
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopSpeaking}
            style={{
              padding: "11px 16px", borderRadius: 14, border: "none",
              background: isSpeaking ? "linear-gradient(135deg, #dc2626, #ef4444)" : "rgba(220,38,38,0.15)",
              color: isSpeaking ? "#FFFFFF" : "#dc2626",
              fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Inter', sans-serif",
              boxShadow: isSpeaking ? "0 4px 16px rgba(220,38,38,0.35)" : "none",
              transition: "all 0.2s ease", whiteSpace: "nowrap",
            }}
          >⏹ Stop</motion.button>
        <input
          style={{
            flex: 1, padding: "11px 16px", borderRadius: 14,
            border: "1px solid rgba(110,72,170,0.15)",
            background: "rgba(255,255,255,0.9)",
            color: "#1A0B42", fontSize: 14,
            fontFamily: "'Inter', sans-serif", outline: "none",
            transition: "all 0.2s ease",
          }}
          placeholder="Ask anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submitMessage(input)}
          onFocus={e => {
            e.target.style.borderColor = "rgba(110,72,170,0.45)";
            e.target.style.boxShadow = "0 0 0 3px rgba(110,72,170,0.1)";
          }}
          onBlur={e => {
            e.target.style.borderColor = "rgba(110,72,170,0.15)";
            e.target.style.boxShadow = "none";
          }}
        />
        <motion.button
          whileHover={!loading ? { scale: 1.05, y: -2 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
          disabled={loading}
          onClick={() => submitMessage(input)}
          style={{
            padding: "11px 20px", borderRadius: 14, border: "none",
            background: loading ? "rgba(110,72,170,0.3)" : "linear-gradient(135deg, #6E48AA, #9D50BB)",
            color: "#FFFFFF", fontSize: 13, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'Inter', sans-serif",
            boxShadow: loading ? "none" : "0 4px 16px rgba(110,72,170,0.35)",
            transition: "all 0.2s ease", whiteSpace: "nowrap",
          }}
        >{loading ? "..." : "Send →"}</motion.button>
      </div>
    </div>
  );
}
