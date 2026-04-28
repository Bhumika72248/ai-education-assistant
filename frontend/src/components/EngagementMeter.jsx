import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEngagement } from "../hooks/useEngagement";

export default function EngagementMeter() {
  const [enabled, setEnabled] = useState(false);
  const { videoRef, status, score, error } = useEngagement(enabled);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", bottom: 20, right: 20, zIndex: 50, width: 160 }}
    >
      <video ref={videoRef} style={{ display: "none" }} />
      <div style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(110,72,170,0.12)",
        borderRadius: 16, padding: "14px",
        boxShadow: "0 8px 32px rgba(110,72,170,0.1)",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Engagement
        </div>

        <motion.button
          type="button"
          onClick={() => setEnabled(v => !v)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%", padding: "6px 10px", borderRadius: 8,
            border: "1px solid",
            borderColor: enabled ? "rgba(220,38,38,0.3)" : "rgba(110,72,170,0.25)",
            background: enabled ? "rgba(220,38,38,0.06)" : "rgba(110,72,170,0.06)",
            color: enabled ? "#dc2626" : "#6E48AA",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Inter', sans-serif", marginBottom: 10,
          }}
        >
          {enabled ? "Stop Camera" : "Start Camera"}
        </motion.button>

        {/* Score bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ height: 5, background: "rgba(110,72,170,0.1)", borderRadius: 99, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.5 }}
              style={{
                height: "100%", borderRadius: 99,
                background: status === "active"
                  ? "linear-gradient(90deg, #059669, #10b981)"
                  : "linear-gradient(90deg, #dc2626, #ef4444)",
              }}
            />
          </div>
        </div>

        <div style={{
          fontSize: 12, fontWeight: 600, textTransform: "capitalize",
          color: enabled ? (status === "active" ? "#059669" : "#dc2626") : "var(--text-muted)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: enabled ? (status === "active" ? "#059669" : "#dc2626") : "var(--text-muted)",
            boxShadow: enabled && status === "active" ? "0 0 6px rgba(5,150,105,0.5)" : "none",
          }} />
          {enabled ? status : "paused"}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ fontSize: 10, color: "#dc2626", marginTop: 6, lineHeight: 1.4 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
