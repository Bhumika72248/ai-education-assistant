import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import api from "../api/client";

export default function Notes() {
	const [topic, setTopic] = useState("");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const notesRef = useRef(null);

	const hasNotes = useMemo(() => notes.trim().length > 0, [notes]);

	async function generateNotes() {
		const trimmedTopic = topic.trim();
		if (!trimmedTopic) {
			setError("Please enter a topic first.");
			return;
		}
		setLoading(true);
		setError("");
		setNotes("");
		try {
			const baseURL = api.defaults.baseURL || "";
			const response = await fetch(`${baseURL}/chat/notes?topic=${encodeURIComponent(trimmedTopic)}`, {
				method: "POST",
				headers: {
					Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
				},
			});
			if (!response.ok || !response.body) {
				throw new Error("Failed to generate notes.");
			}
			const reader = response.body.getReader();
			const decoder = new TextDecoder("utf-8");
			let done = false;
			while (!done) {
				const { value, done: doneReading } = await reader.read();
				done = doneReading;
				if (value) {
					const chunk = decoder.decode(value, { stream: true });
					setNotes((prev) => prev + chunk);
				}
			}
		} catch (err) {
			setError(err?.message || "Unable to generate notes right now.");
		} finally {
			setLoading(false);
		}
	}

	async function downloadPdf() {
		if (!notesRef.current || !hasNotes) return;
		const canvas = await html2canvas(notesRef.current, {
			scale: 2,
			useCORS: true,
			backgroundColor: "#ffffff",
		});
		const imgData = canvas.toDataURL("image/png");
		const pdf = new jsPDF("p", "mm", "a4");
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const margin = 10;
		const usableWidth = pageWidth - margin * 2;
		const imgHeight = (canvas.height * usableWidth) / canvas.width;
		let renderedHeight = 0;
		let page = 0;
		while (renderedHeight < imgHeight) {
			if (page > 0) pdf.addPage();
			const yOffset = margin - renderedHeight;
			pdf.addImage(imgData, "PNG", margin, yOffset, usableWidth, imgHeight);
			renderedHeight += pageHeight - margin * 2;
			page += 1;
		}
		const safeTopic = topic.trim().replace(/\s+/g, "-").toLowerCase() || "study-notes";
		pdf.save(`${safeTopic}-notes.pdf`);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-gray-800">AI Study Notes Generator</h1>
				<p className="text-sm text-gray-500 mt-1">
					Enter any topic and generate structured notes with headings, key concepts, and practice prompts.
				</p>
			</div>

			<div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
				<div className="flex flex-col md:flex-row gap-2">
					<input
						className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
						placeholder="e.g., Photosynthesis"
						value={topic}
						onChange={(e) => setTopic(e.target.value)}
					/>
					<button
						onClick={generateNotes}
						disabled={loading}
						className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
					>
						{loading ? "Generating..." : "Generate Notes"}
					</button>
					<button
						onClick={downloadPdf}
						disabled={!hasNotes || loading}
						className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black disabled:opacity-50"
					>
						Download PDF
					</button>
				</div>
				{error ? <p className="text-sm text-red-600">{error}</p> : null}
			</div>

			<div className="bg-white border border-gray-200 rounded-xl p-5 min-h-[240px]">
				{!hasNotes && !loading ? (
					<p className="text-sm text-gray-500">Generated notes will appear here.</p>
				) : null}
				<div ref={notesRef} className="prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-700">
					<ReactMarkdown>{notes}</ReactMarkdown>
				</div>
			</div>
		</div>
	);
}
