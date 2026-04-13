import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between">
        <Link to="/" className="font-bold text-xl text-indigo-600">EduAI</Link>
        <div className="space-x-4">
          <Link to="/" className="text-gray-600 hover:text-indigo-600">Dashboard</Link>
          <Link to="/chat" className="text-gray-600 hover:text-indigo-600">Chat</Link>
          <Link to="/quiz" className="text-gray-600 hover:text-indigo-600">Quiz</Link>
          <Link to="/analytics" className="text-gray-600 hover:text-indigo-600">Analytics</Link>
          <Link to="/notes" className="text-gray-600 hover:text-indigo-600">Notes</Link>
          <Link to="/assignment" className="text-gray-600 hover:text-indigo-600">Assignment</Link>
          <Link to="/teacher" className="text-gray-600 hover:text-indigo-600">Teacher</Link>
        </div>
      </div>
    </nav>
  );
}
