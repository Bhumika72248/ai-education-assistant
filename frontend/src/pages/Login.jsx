export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Login to EduAI</h1>
        <button 
          onClick={() => { localStorage.setItem("token", "dummy_token"); window.location.href = "/"; }}
          className="bg-indigo-600 text-white w-full py-2 rounded">
          Mock Login
        </button>
      </div>
    </div>
  );
}
