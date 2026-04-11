import { useEffect, useState } from "react";
import PerformanceChart from "../components/PerformanceChart";

export default function Analytics({ studentId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/analytics/student/${studentId}`)
      .then((r) => r.json())
      .then((d) => setData(d.analytics));
  }, [studentId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      {data ? <PerformanceChart data={data} /> : <p>Loading...</p>}
    </div>
  );
}
