export default function SkeletonBlock({ height = 80, width = "100%", style = {} }) {
  return (
    <div style={{
      height, width, borderRadius: 14,
      background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s ease-in-out infinite",
      ...style
    }} />
  );
}
