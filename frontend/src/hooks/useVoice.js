import { useState, useRef } from "react";

export default function useVoice(onTranscript) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  function start() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return console.warn("Speech Recognition not supported");
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.onresult = (e) => onTranscript(e.results[0][0].transcript);
    recognitionRef.current.start();
    setListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return { listening, start, stop };
}
