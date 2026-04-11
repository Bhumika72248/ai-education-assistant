import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/chat" className="p-4 border rounded hover:bg-gray-50">Chat with Tutor</Link>
        <Link to="/quiz" className="p-4 border rounded hover:bg-gray-50">Take a Quiz</Link>
        <Link to="/analytics" className="p-4 border rounded hover:bg-gray-50">View Analytics</Link>
      </div>
    </div>
  );
}
