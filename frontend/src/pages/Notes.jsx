import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import api from "../api/client";
import PageWrapper from "../components/ui/PageWrapper";
import { NotesIcon, FileIcon, BoltIcon } from "../components/ui/Icon";

export default function Notes() {
  const [topic, setTopic]   = useState("");
  const [notes, setNotes]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const notesRef = useRef(null);
  const hasNotes = useMemo(() => notes.trim().length > 0, [notes]);

  async function generateNotes() {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) { setError("Please enter a topic first."); return; }
    setLoading(true); setError(""); setNotes("");
    try {
      const baseURL  = api.defaults.baseURL || "";
      const response = await fetch(`${baseURL}/chat/notes?topic=${encodeURIComponent(trimmedTopic)}`, {
        method: "POST",
        headers: { Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "" },
      });
      if (!response.ok || !response.body) throw new Error("Failed to generate notes.");
      const reader  = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) setNotes(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      setError(err?.message || "Unable to generate notes right now.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!notesRef.current || !hasNotes) return;
    const canvas  = await html2canvas(notesRef.current, { scale: 2, useCORS: true, backgroundColor: "#0a0b14" });
    const imgData = canvas.toDataURL("image/png");
    const pdf     = new jsPDF("p", "mm", "a4");
    const pw      = pdf.internal.pageSize.getWidth();
    const ph      = pdf.internal.pageSize.getHeight();
    const margin  = 10;
    const uw      = pw - margin * 2;
    const ih      = (canvas.height * uw) / canvas.width;
    let rendered  = 0, page = 0;
    while (rendered < ih) {
      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, margin - rendered, uw, ih);
      rendered += ph - margin * 2;
      page++;
    }
    pdf.save(`${topic.trim().replace(/\s+/g, "-").toLowerCase() || "study-notes"}-notes.pdf`);
  }

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, margin: "0 0 6px",
          background: "linear-gradient(135deg, #1A0B42 0%, #6E48AA 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", letterSpacing: "-0.03em",
        }}>
          AI Study Notes
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
          Enter any topic and generate structured notes with headings, key concepts, and practice prompts.
        </p>
      </motion.div>

      {/* Input card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 20 }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            style={{
              flex: 1, minWidth: 200, padding: "12px 16px", borderRadius: 12,
              border: "1px solid rgba(110,72,170,0.15)",
              background: "rgba(255,255,255,0.9)",
              color: "#1A0B42", fontSize: 14,
              fontFamily: "'Inter', sans-serif", outline: "none",
            }}
            placeholder="e.g., Photosynthesis, Quantum Mechanics, React Hooks..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generateNotes()}
            onFocus={e => { e.target.style.borderColor = "rgba(110,72,170,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(110,72,170,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(110,72,170,0.15)"; e.target.style.boxShadow = "none"; }}
          />
            <motion.button
            whileHover={!loading ? { scale: 1.03, y: -2 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            onClick={generateNotes}
            disabled={loading}
            style={{
              padding: "12px 24px", borderRadius: 12, border: "none",
              background: loading ? "rgba(110,72,170,0.4)" : "linear-gradient(135deg, #6E48AA, #9D50BB)",
              color: "#FFFFFF", fontSize: 14, fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              fontFamily: "'Inter', sans-serif",
              boxShadow: loading ? "none" : "0 6px 20px rgba(110,72,170,0.4), 0 0 12px rgba(0,242,255,0.1)",
              display: "flex", alignItems: "center", gap: 8,
              whiteSpace: "nowrap",
            }}
            >
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating...</>
            ) : <><NotesIcon size={16} /> Generate Notes</>}
          </motion.button>
          <motion.button
            whileHover={hasNotes && !loading ? { scale: 1.03, y: -2 } : {}}
            whileTap={hasNotes && !loading ? { scale: 0.97 } : {}}
            onClick={downloadPdf}
            disabled={!hasNotes || loading}
            style={{
              padding: "12px 20px", borderRadius: 12,
              background: "rgba(110,72,170,0.06)",
              border: "1px solid rgba(110,72,170,0.15)",
              color: !hasNotes ? "var(--text-muted)" : "var(--text-secondary)",
              fontSize: 14, fontWeight: 600,
              cursor: !hasNotes || loading ? "not-allowed" : "pointer",
              fontFamily: "'Inter', sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            <FileIcon size={14} /> Download PDF
          </motion.button>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ margin: "12px 0 0", fontSize: 13, color: "#fca5a5" }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>

      {/* Notes output */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ minHeight: 280 }}
      >
        {!hasNotes && !loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 14, textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "rgba(110,72,170,0.08)", border: "1px solid rgba(110,72,170,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: '#6E48AA'
            }}>
              <NotesIcon size={26} />
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
              Generated notes will appear here.
            </p>
          </div>
        ) : null}

        {loading && !hasNotes && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 0" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 16, borderRadius: 8, width: `${85 - i * 5}%` }} />
            ))}
          </div>
        )}

        <div
          ref={notesRef}
          style={{
            color: "var(--text-primary)",
            lineHeight: 1.8,
          }}
        >
          <style>{`
            .notes-content h1, .notes-content h2, .notes-content h3 {
              color: #6E48AA;
              font-weight: 700; letter-spacing: -0.02em; margin: 20px 0 10px;
            }
            .notes-content h1 { font-size: 22px; }
            .notes-content h2 { font-size: 18px; }
            .notes-content h3 { font-size: 15px; color: #9D50BB; }
            .notes-content p  { color: #5a4a7a; font-size: 14px; margin: 8px 0; }
            .notes-content ul, .notes-content ol { padding-left: 20px; color: #5a4a7a; font-size: 14px; }
            .notes-content li { margin: 4px 0; }
            .notes-content strong { color: #1A0B42; font-weight: 600; }
            .notes-content code {
              background: rgba(110,72,170,0.08); color: #6E48AA;
              padding: 2px 8px; border-radius: 6px; font-size: 13px;
            }
            .notes-content blockquote {
              border-left: 3px solid #6E48AA;
              padding-left: 16px; margin: 12px 0; color: #5a4a7a;
            }
          `}</style>
          <div className="notes-content">
            <ReactMarkdown>{notes}</ReactMarkdown>
          </div>
        </div>
      </motion.div>
    </PageWrapper>
  );
}
