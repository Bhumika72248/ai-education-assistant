import { useRef, useState } from "react";

export function useEngagement(enabled = false) {
  const videoRef = useRef(null);
  const [status] = useState("active");
  const [score] = useState(100);
  const [error] = useState("MediaPipe integration disabled for now");

  // TODO: Re-enable MediaPipe when import issue is resolved
  // The MediaPipe packages need special configuration with Vite

  return { videoRef, status, score, error };
}
