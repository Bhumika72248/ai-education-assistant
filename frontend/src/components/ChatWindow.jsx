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
    <div className="flex h-[70vh] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-700">Live Conversation</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-slate-100/30 p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 backdrop-blur-sm p-6 text-center shadow-sm">
              <div className="mb-2 text-2xl">💬</div>
              <p className="text-sm font-medium text-slate-700">Start a conversation</p>
              <p className="mt-1 text-xs text-slate-500">Type a question or use the microphone</p>
            </div>
          </div>
        ) : null}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all duration-200 hover:shadow-md ${
              m.role === "user"
                ? "ml-auto border border-indigo-200 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-800"
            }`}
          >
            {m.content || (m.role === "assistant" ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">●</span> Thinking...
              </span>
            ) : "")}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 bg-gradient-to-r from-white to-slate-50 p-3">
        <VoiceButton onTranscript={submitMessage} />
        <input
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:shadow-sm"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitMessage(input)}
        />
        <button
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:from-indigo-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          disabled={loading}
          onClick={() => submitMessage(input)}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
