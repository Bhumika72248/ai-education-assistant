import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

export function useEngagement(enabled = false) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("active"); // "active" | "distracted" | "confused"
  const [score, setScore] = useState(100);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    let camera;
    let mounted = true;
    setError("");

    const faceMesh = new FaceMesh({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
    });

    faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });

    faceMesh.onResults((results) => {
      if (!mounted) return;
      if (!results.multiFaceLandmarks?.length) {
        setStatus("distracted");
        setScore((s) => Math.max(0, s - 2));
        return;
      }
      // Simple gaze estimation: check if nose tip is roughly centered
      const nose = results.multiFaceLandmarks[0][1];
      const centered = nose.x > 0.3 && nose.x < 0.7 && nose.y > 0.2 && nose.y < 0.8;
      setStatus(centered ? "active" : "distracted");
      setScore((s) => centered ? Math.min(100, s + 1) : Math.max(0, s - 1));
    });

    camera = new Camera(videoRef.current, {
      onFrame: async () => { await faceMesh.send({ image: videoRef.current }); },
      width: 320, height: 240,
    });
    camera.start().catch(() => {
      if (mounted) {
        setError("Camera access was denied or is unavailable.");
      }
    });

    return () => {
      mounted = false;
      camera?.stop();
    };
  }, [enabled]);

  return { videoRef, status, score, error };
}
