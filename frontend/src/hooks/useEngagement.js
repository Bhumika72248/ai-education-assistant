import { useEffect, useRef, useState } from "react";

export function useEngagement(enabled = false) {
  const videoRef = useRef(null);
  const [status] = useState("active");
  const [score] = useState(100);
  const [error] = useState("MediaPipe integration disabled for now");

  // TODO: Re-enable MediaPipe when import issue is resolved
  // The MediaPipe packages need special configuration with Vite

  // Log engagement to backend every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (score > 0) {
        fetch("http://localhost:8000/analytics/log-engagement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: 1, // Mock user ID
            engagement_score: score / 100,
            emotion: status
          })
        }).catch(err => console.error("Engagement logging failed:", err));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [score, status]);

  return { videoRef, status, score, error };
}
