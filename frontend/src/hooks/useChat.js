import { useState, useCallback } from "react";

export default function useChat(studentId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = useCallback(async (text) => {
    if (!text?.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch(`/chat/ask?question=${encodeURIComponent(text)}&student_id=${studentId}`, {
        method: "POST",
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  return { messages, send, loading };
}
