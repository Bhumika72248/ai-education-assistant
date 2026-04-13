import { useEngagement } from "../hooks/useEngagement";

export default function EngagementMeter() {
  const { videoRef, status, score } = useEngagement();

  const color = status === "active" ? "bg-green-500" : "bg-red-400";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <video ref={videoRef} className="hidden" />
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm text-sm w-40">
        <div className="text-gray-500 mb-1">Engagement</div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
          <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
        </div>
        <div className={`font-medium capitalize ${status === "active" ? "text-green-600" : "text-red-500"}`}>
          {status}
        </div>
      </div>
    </div>
  );
}
