import { useState, useCallback } from "react";
import api from "../api/client";

export default function useChat(studentId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const send = useCallback(async (text) => {
    if (!text?.trim()) return;
    const userText = text.trim();
    const assistantIndex = Date.now();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
      { id: assistantIndex, role: "assistant", content: "" },
    ]);

    setLoading(true);

    try {
      const baseURL = api.defaults.baseURL || "";
      const sessionId = String(studentId || "default");
      const res = await fetch(`${baseURL}/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
        },
        body: JSON.stringify({ message: userText, session_id: sessionId }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to fetch assistant response.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let assistantText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (!value) continue;

        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantIndex ? { ...m, content: assistantText } : m))
        );
      }

      speak(assistantText);
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantIndex ? { ...m, content: "I couldn't generate a response right now." } : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [speak, studentId]);

  return { messages, send, loading };
}
