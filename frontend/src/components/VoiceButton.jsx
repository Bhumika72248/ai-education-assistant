import useVoice from "../hooks/useVoice";

export default function VoiceButton({ onTranscript }) {
  const { listening, startListening, stopListening } = useVoice(onTranscript);

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      className={`px-3 py-2 rounded border transition-colors ${listening ? "bg-red-100 border-red-400" : "hover:bg-gray-50"}`}
      title={listening ? "Stop listening" : "Click to speak"}
    >
      {listening ? "Listening..." : "🎤"}
    </button>
  );
}
