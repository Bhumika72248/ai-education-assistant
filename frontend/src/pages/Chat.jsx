import { motion } from "framer-motion";
import ChatWindow from "../components/ChatWindow";
import EngagementMeter from "../components/EngagementMeter";
import PageWrapper from "../components/ui/PageWrapper";

export default function Chat() {
  return (
    <PageWrapper>
      <div style={{ marginBottom: 24 }}>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 28, fontWeight: 800, margin: "0 0 6px",
            background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", letterSpacing: "-0.03em",
          }}
        >
          AI Tutor Chat
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}
        >
          Ask any question — powered by RAG over your course materials
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <ChatWindow />
      </motion.div>
      <EngagementMeter />
    </PageWrapper>
  );
}
