import { useEffect, useState } from 'react';
import  api  from '../api/axios';
import StatCard from '../components/StatCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data1, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    api.get('/admin')
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    api.get('/analytics/admin')
      .then((res) => setData(res.data.data)) 
      .catch((e) => setError(e.response?.data?.message || e.message));
  }, []);
  

  if (loading) return <p className="text-slate-400 light:text-gray-500 p-10">Chargement...</p>;
  return (
    <div>
      <p className="text-[10px] tracking-widest text-blue-400 uppercase mb-1">Overview</p>
      <h1 className="text-2xl font-bold text-slate-100 light:text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-3  gap-3 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} delta="" />
        <StatCard label="Courses" value={stats?.activeCourses ?? '—'} />
        <StatCard label="total quizzes" value={data1?.kpis.totalquiz ? `${data1.kpis.totalquiz}` : '0'} />
      </div>

      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl p-5">
        <h2 className="text-slate-100 light:text-gray-900 font-semibold mb-3">Recent Alerts</h2>
        {stats?.alerts?.length ? (
          stats.alerts.map((a, i) => (
            <p key={i} className="text-sm text-slate-400 light:text-gray-500 py-2 border-b border-slate-800 light:border-gray-200 last:border-0">{a}</p>
          ))
        ) : (
          <p className="text-sm text-slate-500 light:text-gray-400">No alerts</p>
        )}
      </div>
    </div>
  );
}