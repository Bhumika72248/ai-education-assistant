import { useState, useRef } from "react";

const SAMPLE_NOTES = [
  {
    id: 1, title: "Newton's Laws of Motion",
    subject: "Physics",
    content: `1st Law (Inertia): An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external net force.

2nd Law: F = ma
Force equals mass times acceleration.

3rd Law: For every action, there is an equal and opposite reaction.

Applications:
- Seat belts (1st law)
- Rocket propulsion (3rd law)
- F=ma used in engineering design`,
    date: "Apr 14, 2026",
    pages: 3
  },
  {
    id: 2, title: "Photosynthesis Notes",
    subject: "Biology",
    content: `Equation: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂

Stage 1 — Light Reactions (Thylakoid membrane):
- Chlorophyll absorbs sunlight
- Water is split (photolysis)
- ATP and NADPH produced
- O₂ released as byproduct

Stage 2 — Calvin Cycle (Stroma):
- CO₂ fixed using ATP and NADPH
- Glucose synthesised
- RuBisCO enzyme catalyses CO₂ fixation

Key factors: Light intensity, CO₂ concentration, temperature`,
    date: "Apr 12, 2026",
    pages: 5
  },
  {
    id: 3, title: "Quadratic Equations",
    subject: "Mathematics",
    content: `Standard form: ax² + bx + c = 0

Quadratic Formula: x = (-b ± √(b²-4ac)) / 2a

Discriminant (D = b²-4ac):
- D > 0 → Two distinct real roots
- D = 0 → One repeated root
- D < 0 → No real roots (complex)

Methods to solve:
1. Factorisation
2. Completing the square
3. Quadratic formula
4. Graphical method`,
    date: "Apr 10, 2026",
    pages: 4
  },
];

function NotePreview({ note, onClose }) {
  const [page, setPage] = useState(1);
  const wordsPerPage = 80;
  const words = note.content.split(/\s+/);
  const totalPages = Math.ceil(words.length / wordsPerPage);
  const pageContent = words.slice((page - 1) * wordsPerPage, page * wordsPerPage).join(" ");

  const printNote = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>${note.title}</title>
      <style>
        body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1d2e; }
        h1 { font-size: 24px; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
        .meta { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
        pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 15px; line-height: 1.8; }
        .page-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; }
      </style>
      </head><body>
      <h1>${note.title}</h1>
      <div class="meta">${note.subject} &nbsp;•&nbsp; ${note.date}</div>
      <pre>${note.content}</pre>
      <div class="page-footer">EduAI Student Notes — ${note.date}</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 16, width: "min(720px, 95vw)",
          maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{note.title}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>{note.subject} · {note.date}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn-primary" style={{ fontSize: 13 }} onClick={printNote}>🖨️ Print / Export PDF</button>
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={onClose}>✕ Close</button>
          </div>
        </div>

        {/* Page content */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "28px 32px",
          background: "#fffdf6",
          fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.85,
          color: "var(--text-primary)", whiteSpace: "pre-wrap"
        }}>
          {pageContent}
          {page < totalPages && <span style={{ color: "var(--text-secondary)" }}> ...</span>}
        </div>

        {/* Page nav */}
        {totalPages > 1 && (
          <div style={{
            padding: "12px 24px", borderTop: "1px solid var(--border)",
            display: "flex", justifyContent: "center", alignItems: "center", gap: 12
          }}>
            <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Page {page} of {totalPages}</span>
            <button className="btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotesPDF() {
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: "", subject: "Mathematics", content: "" });
  let nextId = useRef(4);

  const subjects = ["Mathematics","Physics","Chemistry","Biology","English","Computer Sc."];
  const subjectColors = {
    Mathematics: "#eef2ff", Physics: "#eff6ff", Chemistry: "#ecfdf5",
    Biology: "#fef9c3", English: "#fff7ed", "Computer Sc.": "#f0fdf4"
  };
  const subjectBorder = {
    Mathematics: "#6366f1", Physics: "#3b82f6", Chemistry: "#10b981",
    Biology: "#84cc16", English: "#f97316", "Computer Sc.": "#22c55e"
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  );

  const saveNote = () => {
    if (!draft.title.trim() || !draft.content.trim()) return;
    const pages = Math.ceil(draft.content.split(/\s+/).length / 80);
    setNotes(prev => [{
      id: nextId.current++,
      title: draft.title,
      subject: draft.subject,
      content: draft.content,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      pages
    }, ...prev]);
    setDraft({ title: "", subject: "Mathematics", content: "" });
    setCreating(false);
  };

  const exportAll = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>All Notes — EduAI</title>
      <style>
        body { font-family: Georgia, serif; max-width: 760px; margin: 40px auto; padding: 0 24px; }
        h1 { font-size: 28px; text-align: center; color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 12px; }
        .note { margin-bottom: 40px; page-break-after: always; }
        .note h2 { font-size: 20px; color: #1a1d2e; margin-bottom: 4px; }
        .meta { color: #6b7280; font-size: 13px; margin-bottom: 16px; }
        pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 14px; line-height: 1.8; }
      </style></head><body>
      <h1>📚 My Study Notes — EduAI</h1>
      ${notes.map(n => `
        <div class="note">
          <h2>${n.title}</h2>
          <div class="meta">${n.subject} · ${n.date}</div>
          <pre>${n.content}</pre>
        </div>
      `).join("")}
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search notes..."
          style={{
            flex: 1, minWidth: 200, padding: "8px 14px", borderRadius: 9,
            border: "1px solid var(--border)", fontSize: 14
          }}
        />
        <button className="btn-ghost" onClick={exportAll}>📥 Export All as PDF</button>
        <button className="btn-primary" onClick={() => setCreating(true)}>+ New Note</button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="card fade-in" style={{ marginBottom: 16 }}>
          <p className="section-title" style={{ marginBottom: 12 }}>Create New Note</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={draft.title}
                onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
                placeholder="Note title..."
                style={{ flex: 2, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14 }}
              />
              <select
                value={draft.subject}
                onChange={e => setDraft(p => ({ ...p, subject: e.target.value }))}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 14 }}
              >
                {subjects.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <textarea
              value={draft.content}
              onChange={e => setDraft(p => ({ ...p, content: e.target.value }))}
              placeholder="Write note content here..."
              rows={8}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                border: "1px solid var(--border)", fontSize: 14, lineHeight: 1.7,
                fontFamily: "Inter, sans-serif", resize: "vertical"
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" onClick={saveNote}>💾 Save Note</button>
              <button className="btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Notes grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {filtered.map(note => (
          <div
            key={note.id}
            className="fade-in"
            style={{
              background: subjectColors[note.subject] || "white",
              borderRadius: 13, padding: "18px",
              border: `1px solid ${subjectBorder[note.subject]}22`,
              cursor: "pointer", transition: "all 0.15s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
            }}
            onClick={() => setPreview(note)}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
          >
            {/* Doc icon */}
            <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>{note.title}</h3>
            <div style={{ fontSize: 12, color: subjectBorder[note.subject], fontWeight: 500, marginBottom: 8 }}>{note.subject}</div>
            <p style={{
              fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
            }}>
              {note.content}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
              <span>{note.date}</span>
              <span>{note.pages} pages</span>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              <button
                onClick={e => { e.stopPropagation(); setPreview(note); }}
                className="btn-ghost"
                style={{ flex: 1, fontSize: 12, padding: "5px 8px" }}
              >
                👁 View
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  const w = window.open("", "_blank");
                  w.document.write(`<html><head><title>${note.title}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1d2e}h1{font-size:24px;border-bottom:2px solid #6366f1;padding-bottom:10px}.meta{color:#6b7280;font-size:14px;margin-bottom:20px}pre{white-space:pre-wrap;font-size:15px;line-height:1.8}</style></head><body><h1>${note.title}</h1><div class="meta">${note.subject} · ${note.date}</div><pre>${note.content}</pre></body></html>`);
                  w.document.close();
                  w.print();
                }}
                className="btn-ghost"
                style={{ flex: 1, fontSize: 12, padding: "5px 8px" }}
              >
                🖨️ PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-secondary)" }}>
          No notes found. Create your first one!
        </div>
      )}

      {/* Preview modal */}
      {preview && <NotePreview note={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
