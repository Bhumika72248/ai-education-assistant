import { motion } from "framer-motion";

export default function StatCard({ icon, label, value, color = "var(--accent)", bg, delay = 0 }) {
  return (
    <motion.div
      className="card"
      style={{
        textAlign: "center",
        background: bg || "rgba(255,255,255,0.04)",
        border: `1px solid ${color}22`,
        position: "relative",
        overflow: "hidden",
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.03, y: -3 }}
    >
      {/* Glow blob */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 80, height: 80,
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ fontSize: 28, marginBottom: 8, position: "relative" }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 4, position: "relative", letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", position: "relative", fontWeight: 500 }}>
        {label}
      </div>
    </motion.div>
  );
}
