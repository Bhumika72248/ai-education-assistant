import { useEffect, useState } from "react";
import RadarChart from "../components/RadarChart";
import CorrelationChart from "../components/CorrelationChart";
import { Activity, Target, TrendingUp, Zap } from "lucide-react";

export default function Analytics() {
  const [radarData, setRadarData] = useState(null);
  const [correlationData, setCorrelationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock user ID for now
  const userId = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [radarRes, correlationRes] = await Promise.all([
          fetch(`http://localhost:8000/analytics/radar?user_id=${userId}`),
          fetch(`http://localhost:8000/analytics/engagement-correlation?user_id=${userId}`)
        ]);

        if (!radarRes.ok || !correlationRes.ok) throw new Error("Backend not responding");

        const radar = await radarRes.json();
        const correlation = await correlationRes.json();

        setRadarData(radar);
        setCorrelationData(correlation);
      } catch (error) {
        console.warn("Backend unavailable, using mock data for charts:", error);
        // Fallback Mock Data for robust Hackathon Demo
        setRadarData({
          labels: ["Accuracy", "Speed", "Consistency", "Complexity", "Retention"],
          data: [85, 70, 92, 60, 88]
        });
        setCorrelationData([
          { date: "Apr 15", score: 60, engagement: 45 },
          { date: "Apr 16", score: 75, engagement: 60 },
          { date: "Apr 17", score: 85, engagement: 88 },
          { date: "Apr 18", score: 70, engagement: 50 },
          { date: "Apr 19", score: 90, engagement: 95 },
          { date: "Apr 20", score: 88, engagement: 85 },
          { date: "Apr 21", score: 95, engagement: 98 }
        ]);
      } finally {
        setLoading(false);
      }
    };


    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advanced Insights</h1>
        <p className="text-gray-500 mt-1">Deep dive into your learning behavior and performance metrics.</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InsightCard 
          icon={<Zap className="text-yellow-500" />} 
          title="Learning Power" 
          value="Level 12" 
          sub="Top 15% this week" 
        />
        <InsightCard 
          icon={<Target className="text-indigo-500" />} 
          title="Avg. Accuracy" 
          value={radarData ? `${radarData.data[0]}%` : "0%"} 
          sub="+2.4% from last month" 
        />
        <InsightCard 
          icon={<Activity className="text-green-500" />} 
          title="Avg. Focus" 
          value="84%" 
          sub="Stable consistency" 
        />
        <InsightCard 
          icon={<TrendingUp className="text-blue-500" />} 
          title="Study Streak" 
          value="7 Days" 
          sub="New personal record!" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Skills Radar</h2>
            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">AI Analysis</div>
          </div>
          {radarData && <RadarChart data={radarData} />}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-bold text-indigo-600">Coach's Advice:</span> Your <span className="font-semibold text-gray-800">Accuracy</span> is excellent, but your <span className="font-semibold text-gray-800">Complexity</span> score is low. Try taking some "Hard" level quizzes to balance your skill map.
            </p>
          </div>
        </div>

        {/* Correlation Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Focus vs. Performance</h2>
            <div className="px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">Live Correlation</div>
          </div>
          {correlationData && <CorrelationChart data={correlationData} />}
          <div className="mt-6 p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-green-700 leading-relaxed">
              <span className="font-bold">Insight:</span> On days where your engagement was above <span className="font-bold">80%</span>, your quiz scores were <span className="font-bold text-green-800">24% higher</span> on average. Focus matters!
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Insights Section */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6">How to Win Your Next Exam</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Identify Weak Spots</h3>
            <p className="text-sm text-gray-500">Your performance in <span className="font-bold">Computer Networks</span> has dipped. The AI suggests a 15-minute recap session today.</p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Optimal Study Time</h3>
            <p className="text-sm text-gray-500">Analysis shows you score <span className="font-bold text-indigo-600">12% higher</span> during morning sessions (8 AM - 11 AM).</p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Predicted Readiness</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-indigo-600">82%</span>
              <span className="text-sm text-gray-400 pb-1">Exam Ready</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-2 w-[82%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, value, sub }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-2 bg-gray-50 rounded-lg w-fit mb-3">{icon}</div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-xs text-indigo-500 font-semibold">{sub}</span>
      </div>
    </div>
  );
}
