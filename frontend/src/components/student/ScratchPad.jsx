import { useState, useRef } from "react";

const TOOLS = [
  { id: "pen",       icon: "✏️", label: "Pen",      cursor: "crosshair" },
  { id: "eraser",    icon: "⬜", label: "Eraser",    cursor: "cell" },
  { id: "text",      icon: "T",  label: "Text",      cursor: "text" },
  { id: "highlight", icon: "🖌️", label: "Highlight", cursor: "crosshair" },
];

const COLORS = ["#1a1d2e","#6366f1","#ef4444","#10b981","#f59e0b","#3b82f6","#ec4899","#8b5cf6"];
const SIZES  = [2, 4, 7, 12];

export default function ScratchPad() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#1a1d2e");
  const [size, setSize] = useState(4);
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState("Quick thoughts, formulas, rough work...");
  const [tab, setTab] = useState("canvas"); // "canvas" | "text"
  const lastPt = useRef(null);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const client = e.touches ? e.touches[0] : e;
    return { x: client.clientX - rect.left, y: client.clientY - rect.top };
  };

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    lastPt.current = pos;
    setDrawing(true);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = size * 4;
    } else if (tool === "highlight") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color + "55";
      ctx.lineWidth = size * 5;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
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
    const ctx = canvas.getContext("2d");
    if (history.length <= 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
      return;
    }
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    const img = new Image();
    img.src = newHistory[newHistory.length - 1];
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  const download = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "scratch-pad.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <p className="section-title">✏️ Scratch Pad</p>
          <p className="section-sub">Rough work, diagrams, quick formulas</p>
        </div>
        {/* Tab switcher */}
        <div style={{ display: "flex", background: "var(--bg)", borderRadius: 9, padding: 3, border: "1px solid var(--border)" }}>
          {[["canvas","🎨 Canvas"],["text","📝 Text"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
              fontSize: 13, fontFamily: "Inter, sans-serif",
              background: tab === id ? "var(--accent)" : "transparent",
              color: tab === id ? "white" : "var(--text-secondary)",
              transition: "all 0.15s"
            }}>{label}</button>
          ))}
        </div>
      </div>

      {tab === "canvas" ? (
        <>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            {/* Tools */}
            <div style={{ display: "flex", gap: 4, background: "var(--bg)", borderRadius: 8, padding: 4, border: "1px solid var(--border)" }}>
              {TOOLS.map(t => (
                <button key={t.id} onClick={() => setTool(t.id)} title={t.label} style={{
                  padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 14, fontFamily: "Inter, sans-serif",
                  background: tool === t.id ? "var(--accent)" : "transparent",
                  color: tool === t.id ? "white" : "var(--text-primary)",
                  transition: "all 0.15s"
                }}>{t.icon}</button>
              ))}
            </div>

            {/* Colors */}
            <div style={{ display: "flex", gap: 4 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{
                  width: 22, height: 22, borderRadius: "50%", border: color === c ? "3px solid var(--accent)" : "2px solid transparent",
                  background: c, cursor: "pointer", transition: "all 0.1s"
                }} />
              ))}
            </div>

            {/* Sizes */}
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {SIZES.map(s => (
                <button key={s} onClick={() => setSize(s)} style={{
                  width: s + 12, height: s + 12, borderRadius: "50%", border: size === s ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: color, cursor: "pointer", transition: "all 0.1s"
                }} />
              ))}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button className="btn-ghost" onClick={undo}>↩ Undo</button>
              <button className="btn-ghost" onClick={clear}>Clear</button>
              <button className="btn-ghost" onClick={download}>⬇ Save</button>
            </div>
          </div>

          {/* Canvas */}
          <div style={{
            borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)",
            background: "white", cursor: TOOLS.find(t => t.id === tool)?.cursor
          }}>
            <canvas
              ref={canvasRef}
              width={900}
              height={500}
              style={{ display: "block", width: "100%", height: "auto", touchAction: "none" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
        </>
      ) : (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{
            width: "100%", minHeight: 480, padding: "16px 18px",
            border: "1px solid var(--border)", borderRadius: 12,
            fontSize: 15, lineHeight: 1.8, fontFamily: "Inter, sans-serif",
            resize: "vertical", background: "#fffdf5", color: "var(--text-primary)"
          }}
          placeholder="Quick rough work, formulas, calculations..."
        />
      )}
    </div>
  );
}
