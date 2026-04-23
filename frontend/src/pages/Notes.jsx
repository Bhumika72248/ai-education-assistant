import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

export default function Notes() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const notesRef = useRef(null);

  async function generateNotes() {
    if (!topic.trim()) return;
    setNotes("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/chat/notes?topic=${encodeURIComponent(topic)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setNotes((prev) => prev + decoder.decode(value));
      }
    } finally {
      setLoading(false);
    }
  }

  function downloadPDF() {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(notes.replace(/[#*`]/g, ""), 180);
    doc.setFontSize(12);
    doc.text(lines, 15, 15);
    doc.save(`${topic}-notes.pdf`);
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Study Notes</h1>

      <div className="flex gap-2 mb-6">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Enter topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
          onClick={generateNotes}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Notes"}
        </button>
      </div>

      {notes && (
        <>
          <div ref={notesRef} className="border rounded p-4 bg-white prose max-w-none mb-4">
            <ReactMarkdown>{notes}</ReactMarkdown>
          </div>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={downloadPDF}
          >
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}
