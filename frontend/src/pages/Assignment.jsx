import { useEffect, useState } from "react";
import api from "../api/client";

export default function Assignment() {
	const [title, setTitle] = useState("");
	const [studentAnswer, setStudentAnswer] = useState("");
	const [rubric, setRubric] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [result, setResult] = useState(null);
	const [history, setHistory] = useState([]);

	async function fetchHistory() {
		try {
			const response = await api.get("/assignment/history");
			setHistory(response.data?.history || []);
		} catch {
			setHistory([]);
		}
	}

	useEffect(() => {
		fetchHistory();
	}, []);

	async function handleEvaluate() {
		if (!title.trim() || !studentAnswer.trim()) {
			setError("Please fill in title and answer before evaluating.");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const response = await api.post("/assignment/evaluate", {
				title: title.trim(),
				student_answer: studentAnswer.trim(),
				rubric: rubric.trim() || null,
			}, { timeout: 30000 });
			setResult(response.data?.evaluation || null);
			await fetchHistory();
		} catch (err) {
			const message = err?.response?.data?.detail
				|| (err?.code === "ECONNABORTED"
					? "Evaluation request timed out. Please try again."
					: "Evaluation failed. Please try again.");
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-gray-800">Assignment Evaluator</h1>
				<p className="text-sm text-gray-500 mt-1">
					Submit your answer to get AI scoring, strengths, and improvement suggestions.
				</p>
			</div>

			<div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
					<input
						className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
						placeholder="e.g., Explain Newton's 3 Laws"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Student Answer</label>
					<textarea
						rows={8}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
						placeholder="Paste your assignment answer here..."
						value={studentAnswer}
						onChange={(e) => setStudentAnswer(e.target.value)}
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Rubric (Optional)</label>
					<textarea
						rows={3}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
						placeholder="Provide expected points, marking scheme, or grading criteria"
						value={rubric}
						onChange={(e) => setRubric(e.target.value)}
					/>
				</div>

				{error && <div className="text-sm text-red-600">{error}</div>}

				<button
					onClick={handleEvaluate}
					disabled={loading}
					className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
				>
					{loading ? "Evaluating..." : "Evaluate Assignment"}
				</button>
			</div>

			{result && (
				<div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
					<h2 className="text-lg font-semibold text-gray-800">Evaluation Result</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<div className="rounded-lg bg-gray-50 p-3">
							<div className="text-xs text-gray-500">Score</div>
							<div className="text-xl font-semibold text-indigo-600">{result.score ?? "-"}</div>
						</div>
						<div className="rounded-lg bg-gray-50 p-3">
							<div className="text-xs text-gray-500">Max Score</div>
							<div className="text-xl font-semibold text-gray-800">{result.max_score ?? "-"}</div>
						</div>
						<div className="rounded-lg bg-gray-50 p-3">
							<div className="text-xs text-gray-500">Grade</div>
							<div className="text-xl font-semibold text-gray-800">{result.grade ?? "-"}</div>
						</div>
					</div>

					<div>
						<h3 className="text-sm font-semibold text-gray-700 mb-2">Strengths</h3>
						<ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
							{(result.strengths || []).map((item, idx) => <li key={`s-${idx}`}>{item}</li>)}
						</ul>
					</div>

					<div>
						<h3 className="text-sm font-semibold text-gray-700 mb-2">Improvements</h3>
						<ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
							{(result.improvements || []).map((item, idx) => <li key={`i-${idx}`}>{item}</li>)}
						</ul>
					</div>

					<div>
						<h3 className="text-sm font-semibold text-gray-700 mb-1">Detailed Feedback</h3>
						<p className="text-sm text-gray-700 whitespace-pre-wrap">{result.detailed_feedback || "-"}</p>
					</div>

					<div>
						<h3 className="text-sm font-semibold text-gray-700 mb-1">Rewrite Suggestion</h3>
						<p className="text-sm text-gray-700 whitespace-pre-wrap">{result.rewrite_suggestion || "-"}</p>
					</div>
				</div>
			)}

			<div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
				<h2 className="text-lg font-semibold text-gray-800">Past Evaluations</h2>
				{history.length === 0 ? (
					<p className="text-sm text-gray-500">No assignment history yet.</p>
				) : (
					<div className="space-y-2">
						{history.map((item) => (
							<div key={item.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
								<div className="flex items-center justify-between gap-2">
									<p className="font-medium text-gray-800">{item.title}</p>
									<p className="text-sm font-semibold text-indigo-600">{item.score ?? "-"}</p>
								</div>
								<p className="text-xs text-gray-500 mt-1">
									{item.created_at ? new Date(item.created_at).toLocaleString() : ""}
								</p>
								<p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{item.feedback || "-"}</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
