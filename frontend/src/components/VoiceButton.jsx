import { motion } from "framer-motion";
import useVoice from "../hooks/useVoice";

export default function VoiceButton({ onTranscript }) {
  const { listening, startListening, stopListening } = useVoice(onTranscript);

  return (
    <motion.button
      type="button"
      onClick={listening ? stopListening : startListening}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={listening ? "Stop listening" : "Click to speak"}
      style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        border: listening ? "1px solid rgba(220,38,38,0.35)" : "1px solid rgba(110,72,170,0.15)",
        background: listening ? "rgba(220,38,38,0.08)" : "rgba(110,72,170,0.06)",
        color: listening ? "#dc2626" : "var(--text-secondary)",
        cursor: "pointer", fontSize: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s ease",
        position: "relative",
      }}
    >
      {listening && (
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: "absolute", inset: -4, borderRadius: 16,
            border: "1px solid rgba(220,38,38,0.3)",
            pointerEvents: "none",
          }}
        />
      )}
      {listening ? "🔴" : "🎤"}
    </motion.button>
  );
}
