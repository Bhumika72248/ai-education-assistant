import useVoice from "../hooks/useVoice";

export default function VoiceButton({ onTranscript }) {
  const { listening, start, stop } = useVoice(onTranscript);

  return (
    <button
      onMouseDown={start}
      onMouseUp={stop}
      className={`px-3 py-2 rounded border ${listening ? "bg-red-100 border-red-400" : "hover:bg-gray-50"}`}
      title="Hold to speak"
    >
      🎤
    </button>
  );
}
