import { motion } from "framer-motion";

export default function AnimatedButton({
  children,
  onClick,
  disabled = false,
  variant = "primary", // "primary" | "ghost" | "danger" | "success"
  className = "",
  style = {},
  type = "button",
  fullWidth = false,
  size = "md", // "sm" | "md" | "lg"
}) {
  const sizeMap = {
    sm: { padding: "6px 14px", fontSize: "12px" },
    md: { padding: "10px 20px", fontSize: "14px" },
    lg: { padding: "14px 28px", fontSize: "15px" },
  };

  const variantStyles = {
    primary: {
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
      color: "white",
      border: "none",
      boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
    },
    ghost: {
      background: "rgba(255,255,255,0.05)",
      color: "var(--text-secondary)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "none",
    },
    danger: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "white",
      border: "none",
      boxShadow: "0 4px 15px rgba(239,68,68,0.3)",
    },
    success: {
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      border: "none",
      boxShadow: "0 4px 15px rgba(16,185,129,0.3)",
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...variantStyles[variant],
        ...sizeMap[size],
        borderRadius: "10px",
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? "100%" : "auto",
        position: "relative",
        overflow: "hidden",
        letterSpacing: "0.01em",
        transition: "box-shadow 0.2s ease",
        ...style,
      }}
      whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
}
