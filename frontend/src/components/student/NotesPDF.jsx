import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileIcon, NotesIcon } from "../ui/Icon";

const SAMPLE_NOTES = [
  { id: 1, title: "Newton's Laws of Motion", subject: "Physics",     content: `1st Law (Inertia): An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external net force.\n\n2nd Law: F = ma\nForce equals mass times acceleration.\n\n3rd Law: For every action, there is an equal and opposite reaction.\n\nApplications:\n- Seat belts (1st law)\n- Rocket propulsion (3rd law)\n- F=ma used in engineering design`, date: "Apr 14, 2026", pages: 3 },
  { id: 2, title: "Photosynthesis Notes",    subject: "Biology",     content: `Equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂\n\nStage 1 — Light Reactions (Thylakoid membrane):\n- Chlorophyll absorbs sunlight\n- Water is split (photolysis)\n- ATP and NADPH produced\n- O₂ released as byproduct\n\nStage 2 — Calvin Cycle (Stroma):\n- CO₂ fixed using ATP and NADPH\n- Glucose synthesised\n- RuBisCO enzyme catalyses CO₂ fixation\n\nKey factors: Light intensity, CO₂ concentration, temperature`, date: "Apr 12, 2026", pages: 5 },
  { id: 3, title: "Quadratic Equations",     subject: "Mathematics", content: `Standard form: ax² + bx + c = 0\n\nQuadratic Formula: x = (-b ± √(b²-4ac)) / 2a\n\nDiscriminant (D = b²-4ac):\n- D > 0 → Two distinct real roots\n- D = 0 → One repeated root\n- D < 0 → No real roots (complex)\n\nMethods to solve:\n1. Factorisation\n2. Completing the square\n3. Quadratic formula\n4. Graphical method`, date: "Apr 10, 2026", pages: 4 },
];

const SUBJECT_COLORS = {
  Mathematics: { bg: "rgba(99,102,241,0.08)",  accent: "#6366f1" },
  Physics:     { bg: "rgba(59,130,246,0.08)",  accent: "#3b82f6" },
  Chemistry:   { bg: "rgba(16,185,129,0.08)",  accent: "#10b981" },
  Biology:     { bg: "rgba(132,204,22,0.08)",  accent: "#84cc16" },
  English:     { bg: "rgba(249,115,22,0.08)",  accent: "#f97316" },
  "Computer Sc.": { bg: "rgba(34,197,94,0.08)", accent: "#22c55e" },
};

function NotePreview({ note, onClose }) {
  const [page, setPage] = useState(1);
  const wordsPerPage    = 80;
  const words           = note.content.split(/\s+/);
  const totalPages      = Math.ceil(words.length / wordsPerPage);
  const pageContent     = words.slice((page - 1) * wordsPerPage, page * wordsPerPage).join(" ");
  const sc              = SUBJECT_COLORS[note.subject] || { bg: "rgba(99,102,241,0.08)", accent: "#6366f1" };

  const printNote = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>${note.title}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1d2e}h1{font-size:24px;border-bottom:2px solid #6366f1;padding-bottom:10px}.meta{color:#6b7280;font-size:14px;margin-bottom:20px}pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:15px;line-height:1.8}.page-footer{margin-top:40px;text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:10px}</style></head><body><h1>${note.title}</h1><div class="meta">${note.subject} &nbsp;•&nbsp; ${note.date}</div><pre>${note.content}</pre><div class="page-footer">EduAI Student Notes — ${note.date}</div></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(15,17,32,0.98)", backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24, width: "min(720px, 95vw)", maxHeight: "90vh",
          overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>{note.title}</h2>
            <p style={{ margin: 0, fontSize: 12, color: sc.accent, fontWeight: 600 }}>{note.subject} · {note.date}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={printNote}
              style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              <FileIcon size={14} /> Print / PDF
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
              ✕
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "rgba(255,255,255,0.01)", fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.85, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
          {pageContent}
          {page < totalPages && <span style={{ color: "var(--text-muted)" }}> ...</span>}
        </div>

        {/* Page nav */}
        {totalPages > 1 && (
          <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={page === 1} onClick={() => setPage(p => p - 1)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: page === 1 ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
              ‹ Prev
            </motion.button>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Page {page} of {totalPages}</span>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: page === totalPages ? "var(--text-muted)" : "var(--text-secondary)", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
              Next ›
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function NotesPDF() {
  const [notes, setNotes]     = useState(SAMPLE_NOTES);
  const [preview, setPreview] = useState(null);
  const [search, setSearch]   = useState("");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft]     = useState({ title: "", subject: "Mathematics", content: "" });
  const nextId = useRef(4);

  const subjects = ["Mathematics","Physics","Chemistry","Biology","English","Computer Sc."];
  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()));

  const saveNote = () => {
    if (!draft.title.trim() || !draft.content.trim()) return;
    const pages = Math.ceil(draft.content.split(/\s+/).length / 80);
    setNotes(prev => [{ id: nextId.current++, ...draft, content: draft.content, date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), pages }, ...prev]);
    setDraft({ title: "", subject: "Mathematics", content: "" });
    setCreating(false);
  };

  const exportAll = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>All Notes — EduAI</title><style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;padding:0 24px}h1{font-size:28px;text-align:center;color:#6366f1;border-bottom:2px solid #6366f1;padding-bottom:12px}.note{margin-bottom:40px;page-break-after:always}.note h2{font-size:20px;color:#1a1d2e;margin-bottom:4px}.meta{color:#6b7280;font-size:13px;margin-bottom:16px}pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:14px;line-height:1.8}</style></head><body><h1>My Study Notes — EduAI</h1>${notes.map(n => `<div class="note"><h2>${n.title}</h2><div class="meta">${n.subject} · ${n.date}</div><pre>${n.content}</pre></div>`).join("")}</body></html>`);
    w.document.close();
    w.print();
  };

  const inputStyle = {
    padding: "10px 14px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    color: "var(--text-primary)", fontSize: 14,
    fontFamily: "'Inter', sans-serif", outline: "none",
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
          style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
        <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={exportAll}
          style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>
          <FileIcon size={14} /> Export All PDF
        </motion.button>
        <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={() => setCreating(true)}
          style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
          + New Note
        </motion.button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {creating && (
          <motion.div className="card" initial={{ opacity: 0, y: -12, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 16, overflow: "hidden" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Create New Note</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} placeholder="Note title..." style={{ ...inputStyle, flex: 2 }} />
                <select value={draft.subject} onChange={e => setDraft(p => ({ ...p, subject: e.target.value }))} style={{ ...inputStyle, flex: 1 }}>
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <textarea value={draft.content} onChange={e => setDraft(p => ({ ...p, content: e.target.value }))} placeholder="Write note content here..." rows={8}
                style={{ ...inputStyle, width: "100%", resize: "vertical", lineHeight: 1.7 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveNote}
                  style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  Save Note
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setCreating(false)}
                  style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}
      >
        {filtered.map(note => {
          const sc = SUBJECT_COLORS[note.subject] || { bg: "rgba(99,102,241,0.08)", accent: "#6366f1" };
          return (
            <motion.div
              key={note.id}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16,1,0.3,1] } } }}
              whileHover={{ y: -5 }}
              style={{
                background: sc.bg, borderRadius: 16, padding: "18px",
                border: `1px solid ${sc.accent}18`,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                transition: "box-shadow 0.2s ease",
              }}
              onClick={() => setPreview(note)}
            >
              <div style={{ fontSize: 30, marginBottom: 10, display: 'inline-flex', alignItems: 'center' }}><FileIcon size={30} /></div>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 5px", color: "var(--text-primary)", lineHeight: 1.4 }}>{note.title}</h3>
              <div style={{ fontSize: 11, color: sc.accent, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>{note.subject}</div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {note.content}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
                <span>{note.date}</span>
                <span>{note.pages} pages</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={e => { e.stopPropagation(); setPreview(note); }}
                  style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  View
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={e => {
                    e.stopPropagation();
                    const w = window.open("", "_blank");
                    w.document.write(`<html><head><title>${note.title}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1d2e}h1{font-size:24px;border-bottom:2px solid #6366f1;padding-bottom:10px}.meta{color:#6b7280;font-size:14px;margin-bottom:20px}pre{white-space:pre-wrap;font-size:15px;line-height:1.8}</style></head><body><h1>${note.title}</h1><div class="meta">${note.subject} · ${note.date}</div><pre>${note.content}</pre></body></html>`);
                    w.document.close();
                    w.print();
                  }}
                  style={{ flex: 1, padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  <FileIcon size={14} /> PDF
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          No notes found. Create your first one!
        </div>
      )}

      <AnimatePresence>
        {preview && <NotePreview note={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </div>
  );
}
