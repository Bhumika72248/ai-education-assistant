import { useRef, useEffect } from "react";
import { useState } from "react";
import useChat from "../hooks/useChat";
import VoiceButton from "./VoiceButton";

export default function ChatWindow({ studentId }) {
  const { messages, send, loading } = useChat(studentId);
  const bottomRef = useRef(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function submitMessage(text) {
    const value = text?.trim();
    if (!value) return;
    await send(value);
    setInput("");
  }

  return (
    <div className="flex flex-col h-[600px] border rounded">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded max-w-[75%] ${m.role === "user" ? "ml-auto bg-blue-100" : "bg-gray-100"}`}>
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 p-2 border-t">
        <VoiceButton onTranscript={submitMessage} />
        <input
          className="flex-1 border rounded p-2"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitMessage(input)}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          disabled={loading}
          onClick={() => submitMessage(input)}
        >
          Send
        </button>
      </div>
    </div>
  );
}
