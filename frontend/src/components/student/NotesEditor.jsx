import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL_NOTES = [
  { id: 1, title: "Newton's Laws of Motion", subject: "Physics",     content: "1st Law: An object at rest stays at rest...\n2nd Law: F = ma\n3rd Law: For every action there is an equal and opposite reaction.", tags: ["physics","laws"],    pinned: true,  date: "Apr 14" },
  { id: 2, title: "Quadratic Formula",       subject: "Mathematics", content: "x = (-b ± √(b²-4ac)) / 2a\n\nDiscriminant:\n- b²-4ac > 0 → two real roots\n- b²-4ac = 0 → one real root\n- b²-4ac < 0 → no real roots", tags: ["math","formula"], pinned: false, date: "Apr 12" },
  { id: 3, title: "Photosynthesis",          subject: "Biology",     content: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\nStages:\n1. Light-dependent reactions (thylakoid)\n2. Calvin cycle (stroma)", tags: ["biology","cell"],  pinned: false, date: "Apr 10" },
];

const SUBJECTS = ["All","Mathematics","Physics","Chemistry","Biology","History","English","Computer Sc."];
const SUBJECT_COLORS = {
  Mathematics: { bg: "rgba(99,102,241,0.1)",  accent: "#6366f1" },
  Physics:     { bg: "rgba(59,130,246,0.1)",  accent: "#3b82f6" },
  Chemistry:   { bg: "rgba(16,185,129,0.1)",  accent: "#10b981" },
  Biology:     { bg: "rgba(132,204,22,0.1)",  accent: "#84cc16" },
  History:     { bg: "rgba(236,72,153,0.1)",  accent: "#ec4899" },
  English:     { bg: "rgba(249,115,22,0.1)",  accent: "#f97316" },
  "Computer Sc.": { bg: "rgba(34,197,94,0.1)", accent: "#22c55e" },
};

let nextId = 4;

const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1px solid rgba(110,72,170,0.15)",
  background: "#fff",
  color: "#1A0B42", fontSize: 14,
  fontFamily: "'Inter', sans-serif", outline: "none",
};

export default function NotesEditor() {
  const [notes, setNotes]               = useState(INITIAL_NOTES);
  const [filterSubject, setFilterSubject] = useState("All");
  const [search, setSearch]             = useState("");
  const [editing, setEditing]           = useState(null);
  const [draft, setDraft]               = useState({ title: "", subject: "Mathematics", content: "", tags: "" });

  const filtered = notes
    .filter(n => filterSubject === "All" || n.subject === filterSubject)
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.pinned - a.pinned);

  const startNew  = () => { setDraft({ title: "", subject: "Mathematics", content: "", tags: "" }); setEditing("new"); };
  const startEdit = (note) => { setDraft({ title: note.title, subject: note.subject, content: note.content, tags: note.tags.join(", ") }); setEditing(note.id); };

  const save = () => {
    if (!draft.title.trim()) return;
    const tagsArr = draft.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (editing === "new") setNotes(prev => [{ id: nextId++, ...draft, tags: tagsArr, pinned: false, date: "Today" }, ...prev]);
    else setNotes(prev => prev.map(n => n.id === editing ? { ...n, ...draft, tags: tagsArr } : n));
    setEditing(null);
  };

  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));
  const togglePin  = (id) => setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));

  if (editing !== null) return (
    <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          {editing === "new" ? "New Note" : "Edit Note"}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={save}
            style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            💾 Save
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setEditing(null)}
            style={{ padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            Cancel
          </motion.button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} placeholder="Note title..." style={{ ...inputStyle, fontSize: 16, fontWeight: 700 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <select value={draft.subject} onChange={e => setDraft(p => ({ ...p, subject: e.target.value }))} style={{ ...inputStyle, flex: 1 }}>
            {SUBJECTS.slice(1).map(s => <option key={s}>{s}</option>)}
          </select>
          <input value={draft.tags} onChange={e => setDraft(p => ({ ...p, tags: e.target.value }))} placeholder="tags (comma separated)" style={{ ...inputStyle, flex: 2 }} />
        </div>
        <textarea value={draft.content} onChange={e => setDraft(p => ({ ...p, content: e.target.value }))} placeholder="Write your notes here..." rows={16}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
      </div>
    </motion.div>
  );

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search notes..."
          style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={startNew}
          style={{ padding: "11px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
          + New Note
        </motion.button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          No notes found. Create your first note!
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}
        >
          {filtered.map(note => {
            const sc = SUBJECT_COLORS[note.subject] || { bg: "rgba(255,255,255,0.04)", accent: "#6366f1" };
            return (
              <motion.div
                key={note.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16,1,0.3,1] } } }}
                whileHover={{ y: -5, boxShadow: `0 12px 32px rgba(0,0,0,0.3)` }}
                style={{
                  background: sc.bg, borderRadius: 16, padding: "18px",
                  border: `1px solid ${note.pinned ? sc.accent + "40" : "rgba(255,255,255,0.06)"}`,
                  cursor: "pointer", transition: "box-shadow 0.2s ease",
                  boxShadow: note.pinned ? `0 0 0 1px ${sc.accent}30` : "none",
                }}
                onClick={() => startEdit(note)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, flex: 1, color: "var(--text-primary)", lineHeight: 1.4 }}>{note.title}</h3>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                      onClick={e => { e.stopPropagation(); togglePin(note.id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 2 }}>
                      {note.pinned ? "📌" : "📍"}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                      onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 2, color: "#ef4444" }}>
                      ✕
                    </motion.button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: sc.accent, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {note.subject}
                </div>
                <p style={{
                  fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px",
                  display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {note.content}
                </p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                  {note.tags.map(tag => (
                    <span key={tag} style={{
                      padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                      background: "rgba(255,255,255,0.06)", color: "var(--text-muted)",
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{note.date}</div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
