import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../api/axios"; // adjust path to wherever your axios instance lives

const PIE_COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#e5e7eb"];

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-800 light:bg-gray-100/50 border border-slate-700 light:border-gray-300 rounded-xl p-4">
      <p className="text-sm text-slate-400 light:text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-slate-100 light:text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-slate-800 light:bg-white border border-slate-700 light:border-gray-200 rounded-xl p-6">
      <h3 className="text-slate-100 light:text-gray-900 font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>{children}</ResponsiveContainer>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/analytics/admin')
      .then((res) => setData(res.data.data)) // controller wraps in { success, data }
      .catch((e) => setError(e.response?.data?.message || e.message));
  }, []);

  if (error) return <p className="text-red-400 p-6">{error}</p>;
  if (!data) return <p className="text-slate-400 light:text-gray-500 p-6">Loading…</p>;

  const { kpis, platformGrowth, userDistribution, gradeDistribution, courseCompletion } = data;

  return (
    <div className="p-6 space-y-6 bg-slate-950 light:bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-100 light:text-gray-900">
        Analytics <span className="text-slate-400 light:text-gray-500 font-normal">· Detailed reports</span>
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Completion Rate" value={`${kpis.completionRate}%`} />
        <StatCard label="Avg Quiz Score" value={`${kpis.avgQuizScore}%`} />
        <StatCard label="Active Students" value={kpis.activeStudents} />
        <StatCard label="Courses" value={kpis.activeCourses} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Platform Growth">
          <LineChart data={platformGrowth}>
            <CartesianGrid strokeDasharray="3 3" className="text-slate-700 light:text-gray-200" stroke="currentColor" />
            <XAxis dataKey="month" stroke="currentColor" className="text-slate-400 light:text-gray-500" />
            <YAxis stroke="currentColor" className="text-slate-400 light:text-gray-500" />
            <Tooltip /><Legend />
            <Line type="monotone" dataKey="users" name="Users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="User Distribution">
          <PieChart>
            <Pie data={userDistribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={2}>
              {userDistribution.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Legend /><Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Grade Distribution">
          <BarChart data={gradeDistribution}>
            <CartesianGrid strokeDasharray="3 3" className="text-slate-700 light:text-gray-200" stroke="currentColor" />
            <XAxis dataKey="grade" stroke="currentColor" className="text-slate-400 light:text-gray-500" />
            <YAxis stroke="currentColor" className="text-slate-400 light:text-gray-500" />
            <Tooltip /><Legend />
            <Bar dataKey="count" name="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Course Completion">
          <PieChart>
            <Pie data={courseCompletion} dataKey="value" nameKey="name" outerRadius={100}>
              {courseCompletion.map((e, i) => <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Legend /><Tooltip />
          </PieChart>
        </ChartCard>
      </div>
    </div>
  );
}