import ChatWindow from "../components/ChatWindow";
import EngagementMeter from "../components/EngagementMeter";

export default function Chat() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">AI Tutor Chat</h1>
      <ChatWindow />
      <EngagementMeter />
    </div>
  );
}
