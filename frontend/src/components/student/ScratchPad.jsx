import { useState, useRef } from "react";
import { motion } from "framer-motion";

const TOOLS  = [
  { id: "pen",       icon: "✏️", label: "Pen",       cursor: "crosshair" },
  { id: "eraser",    icon: "⬜", label: "Eraser",     cursor: "cell"      },
  { id: "text",      icon: "T",  label: "Text",       cursor: "text"      },
  { id: "highlight", icon: "🖌️", label: "Highlight",  cursor: "crosshair" },
];
const COLORS = ["#f0f2ff","#6366f1","#ef4444","#10b981","#f59e0b","#3b82f6","#ec4899","#8b5cf6"];
const SIZES  = [2, 4, 7, 12];

export default function ScratchPad() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool]       = useState("pen");
  const [color, setColor]     = useState("#f0f2ff");
  const [size, setSize]       = useState(4);
  const [history, setHistory] = useState([]);
  const [notes, setNotes]     = useState("Quick thoughts, formulas, rough work...");
  const [tab, setTab]         = useState("canvas");
  const lastPt = useRef(null);

  const getPos = (e, canvas) => {
    const rect   = canvas.getBoundingClientRect();
    const client = e.touches ? e.touches[0] : e;
    return { x: client.clientX - rect.left, y: client.clientY - rect.top };
  };

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e, canvas);
    lastPt.current = pos;
    setDrawing(true);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e, canvas);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = size * 4;
    } else if (tool === "highlight") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color + "55";
      ctx.lineWidth   = size * 5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth   = size;
    }
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPt.current = pos;
  };

  const endDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    const canvas = canvasRef.current;
    setHistory(h => [...h, canvas.toDataURL()]);
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    if (history.length <= 1) { ctx.clearRect(0, 0, canvas.width, canvas.height); setHistory([]); return; }
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    const img = new Image();
    img.src    = newHistory[newHistory.length - 1];
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
  };

  const clear    = () => { canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); setHistory([]); };
  const download = () => { const link = document.createElement("a"); link.download = "scratch-pad.png"; link.href = canvasRef.current.toDataURL(); link.click(); };

  const btnStyle = (active) => ({
    padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer",
    fontSize: 13, fontFamily: "'Inter', sans-serif",
    background: active ? "var(--accent)" : "transparent",
    color: active ? "white" : "var(--text-secondary)",
    transition: "all 0.15s ease",
  });

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>✏️ Scratch Pad</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Rough work, diagrams, quick formulas</p>
        </div>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, border: "1px solid rgba(255,255,255,0.07)" }}>
          {[["canvas","🎨 Canvas"],["text","📝 Text"]].map(([id, label]) => (
            <motion.button key={id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setTab(id)} style={btnStyle(tab === id)}>
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {tab === "canvas" ? (
        <>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            {/* Tools */}
            <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", borderRadius: 9, padding: 4, border: "1px solid rgba(255,255,255,0.07)" }}>
              {TOOLS.map(t => (
                <motion.button key={t.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTool(t.id)} title={t.label}
                  style={{ ...btnStyle(tool === t.id), padding: "6px 10px" }}>
                  {t.icon}
                </motion.button>
              ))}
            </div>

            {/* Colors */}
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {COLORS.map(c => (
                <motion.button key={c} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => setColor(c)}
                  style={{
                    width: 22, height: 22, borderRadius: "50%", border: "none",
                    outline: color === c ? `2px solid ${c}` : "2px solid transparent",
                    outlineOffset: 2,
                    background: c, cursor: "pointer",
                  }}
                />
              ))}
            </div>

            {/* Sizes */}
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {SIZES.map(s => (
                <motion.button key={s} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setSize(s)}
                  style={{
                    width: s + 14, height: s + 14, borderRadius: "50%", border: "none",
                    outline: size === s ? "2px solid var(--accent)" : "1px solid rgba(255,255,255,0.1)",
                    outlineOffset: 1,
                    background: color, cursor: "pointer",
                  }}
                />
              ))}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              {[["↩ Undo", undo], ["Clear", clear], ["⬇ Save", download]].map(([label, fn]) => (
                <motion.button key={label} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={fn}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", cursor: TOOLS.find(t => t.id === tool)?.cursor }}>
            <canvas
              ref={canvasRef} width={900} height={500}
              style={{ display: "block", width: "100%", height: "auto", touchAction: "none" }}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
            />
          </div>
        </>
      ) : (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{
            width: "100%", minHeight: 480, padding: "18px",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14,
            fontSize: 15, lineHeight: 1.8, fontFamily: "'Inter', sans-serif",
            resize: "vertical",
            background: "rgba(255,255,255,0.03)",
            color: "var(--text-primary)", outline: "none",
          }}
          placeholder="Quick rough work, formulas, calculations..."
          onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)"; }}
          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
        />
      )}
    </motion.div>
  );
}
