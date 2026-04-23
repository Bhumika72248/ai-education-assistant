import { useState } from "react";
import { useEngagement } from "../hooks/useEngagement";

export default function EngagementMeter() {
  const [enabled, setEnabled] = useState(false);
  const { videoRef, status, score, error } = useEngagement(enabled);

  const color = status === "active" ? "bg-green-500" : "bg-red-400";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <video ref={videoRef} className="hidden" />
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm text-sm w-40">
        <div className="text-gray-500 mb-1">Engagement</div>
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className={`mb-2 w-full rounded px-2 py-1 text-xs ${enabled ? "bg-red-50 text-red-600 border border-red-200" : "bg-indigo-50 text-indigo-600 border border-indigo-200"}`}
        >
          {enabled ? "Stop camera" : "Start camera"}
        </button>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
          <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
        </div>
        <div className={`font-medium capitalize ${status === "active" ? "text-green-600" : "text-red-500"}`}>
          {enabled ? status : "paused"}
        </div>
        {error ? <div className="text-[11px] text-red-500 mt-1">{error}</div> : null}
      </div>
    </div>
  );
}
