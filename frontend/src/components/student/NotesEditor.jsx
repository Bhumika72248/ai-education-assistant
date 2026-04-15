import { useState } from "react";

const INITIAL_NOTES = [
  { id: 1, title: "Newton's Laws of Motion", subject: "Physics", content: "1st Law: An object at rest stays at rest...\n2nd Law: F = ma\n3rd Law: For every action there is an equal and opposite reaction.", tags: ["physics","laws"], pinned: true, date: "Apr 14" },
  { id: 2, title: "Quadratic Formula", subject: "Mathematics", content: "x = (-b ± √(b²-4ac)) / 2a\n\nDiscriminant:\n- b²-4ac > 0 → two real roots\n- b²-4ac = 0 → one real root\n- b²-4ac < 0 → no real roots", tags: ["math","formula"], pinned: false, date: "Apr 12" },
  { id: 3, title: "Photosynthesis", subject: "Biology", content: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n\nStages:\n1. Light-dependent reactions (thylakoid)\n2. Calvin cycle (stroma)", tags: ["biology","cell"], pinned: false, date: "Apr 10" },
];

const SUBJECTS = ["All","Mathematics","Physics","Chemistry","Biology","History","English","Computer Sc."];
const COLORS = { Mathematics: "#eef2ff", Physics: "#eff6ff", Chemistry: "#ecfdf5", Biology: "#fef9c3", History: "#fdf2f8", English: "#fff7ed", "Computer Sc.": "#f0fdf4" };
const BORDER_COLORS = { Mathematics: "#6366f1", Physics: "#3b82f6", Chemistry: "#10b981", Biology: "#84cc16", History: "#ec4899", English: "#f97316", "Computer Sc.": "#22c55e" };

let nextId = 4;

export default function NotesEditor() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [filterSubject, setFilterSubject] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = list view, number = editing id, "new" = new
  const [draft, setDraft] = useState({ title: "", subject: "Mathematics", content: "", tags: "" });

  const filtered = notes
    .filter(n => filterSubject === "All" || n.subject === filterSubject)
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.pinned - a.pinned);

  const startNew = () => {
    setDraft({ title: "", subject: "Mathematics", content: "", tags: "" });
    setEditing("new");
  };

  const startEdit = (note) => {
    setDraft({ title: note.title, subject: note.subject, content: note.content, tags: note.tags.join(", ") });
    setEditing(note.id);
  };

  const save = () => {
    if (!draft.title.trim()) return;
    const tagsArr = draft.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (editing === "new") {
      setNotes(prev => [{ id: nextId++, ...draft, tags: tagsArr, pinned: false, date: "Today" }, ...prev]);
    } else {
      setNotes(prev => prev.map(n => n.id === editing ? { ...n, ...draft, tags: tagsArr } : n));
    }
    setEditing(null);
  };

  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));
  const togglePin = (id) => setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));

  if (editing !== null) {
    return (
      <div className="card fade-in" style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>{editing === "new" ? "New Note" : "Edit Note"}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={save}>💾 Save</button>
            <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            value={draft.title}
            onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
            placeholder="Note title..."
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 9,
              border: "1px solid var(--border)", fontSize: 16, fontWeight: 600
            }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={draft.subject}
              onChange={e => setDraft(p => ({ ...p, subject: e.target.value }))}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14 }}
            >
              {SUBJECTS.slice(1).map(s => <option key={s}>{s}</option>)}
            </select>
            <input
              value={draft.tags}
              onChange={e => setDraft(p => ({ ...p, tags: e.target.value }))}
              placeholder="tags (comma separated)"
              style={{ flex: 2, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14 }}
            />
          </div>
          <textarea
            value={draft.content}
            onChange={e => setDraft(p => ({ ...p, content: e.target.value }))}
            placeholder="Write your notes here..."
            rows={16}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 9,
              border: "1px solid var(--border)", fontSize: 14, lineHeight: 1.7,
              resize: "vertical", fontFamily: "Inter, sans-serif"
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search notes..."
          style={{
            flex: 1, minWidth: 200, padding: "8px 14px", borderRadius: 9,
            border: "1px solid var(--border)", fontSize: 14
          }}
        />
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14 }}
        >
          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-primary" onClick={startNew}>+ New Note</button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-secondary)" }}>
          No notes found. Create your first note!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map(note => (
            <div
              key={note.id}
              className="fade-in"
              style={{
                background: COLORS[note.subject] || "var(--surface)",
                borderRadius: 12, padding: "16px",
                border: `2px solid ${note.pinned ? BORDER_COLORS[note.subject] : "transparent"}`,
                cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onClick={() => startEdit(note)}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, flex: 1 }}>{note.title}</h3>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                  <button
                    onClick={e => { e.stopPropagation(); togglePin(note.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 2 }}
                    title={note.pinned ? "Unpin" : "Pin"}
                  >
                    {note.pinned ? "📌" : "📍"}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 2, color: "#ef4444" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: BORDER_COLORS[note.subject], fontWeight: 500, marginBottom: 8 }}>{note.subject}</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0,
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {note.content}
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {note.tags.map(tag => (
                  <span key={tag} className="tag" style={{ background: "rgba(255,255,255,0.7)", color: "#6b7280", fontSize: 11 }}>#{tag}</span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 8 }}>{note.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
