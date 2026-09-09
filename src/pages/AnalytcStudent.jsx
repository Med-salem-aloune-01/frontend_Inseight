import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axios";

function ChartCard({ title, children }) {
  return (
    <div className="bg-slate-800 light:bg-white border border-slate-700 light:border-gray-200 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-700 light:border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 light:text-gray-900">
              {title}
            </h2>

            <p className="text-sm text-slate-400 light:text-gray-500 mt-1">
              Track your quiz performance over time
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400 light:text-gray-500">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            Score
          </div>
        </div>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={360}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const score = payload[0].value;

  return (
    <div className="bg-slate-900 light:bg-white border border-slate-700 light:border-gray-200 rounded-xl shadow-2xl px-4 py-3">
      <p className="text-sm text-slate-400 light:text-gray-500 mb-1">
        {label}
      </p>

      
    </div>
  );
}

// Show score directly above every point
function ScoreDot(props) {
  const { cx, cy, value } = props;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#3b82f6"
        stroke="#fff"
        strokeWidth={2}
      />

      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        fill="currentColor"
        fontSize={12}
        fontWeight={600}
      >
        {value}
      </text>
    </g>
  );
}

export default function AnalyticStudent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/analytics/student")
      .then((res) => setData(res.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || e.message)
      );
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-slate-400 light:text-gray-500">
        Loading...
      </div>
    );
  }

  const {
    totalCourses,
    completedCourses,
    averageScore,
    progress,
  } = data;

  // Use DATE instead of attempt number
  const chartData = (progress || []).map((item) => ({
    ...item,
    date: item.date,
  }));

  return (
    <div className="min-h-screen bg-slate-950 light:bg-gray-50 p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 light:text-gray-900">
          Analytics
        </h1>

        <p className="mt-2 text-slate-400 light:text-gray-500">
          Track your learning progress and performance.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        <div className="bg-slate-800 light:bg-white border border-slate-700 light:border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 light:text-gray-500">
                Total Courses
              </p>

              <p className="text-3xl font-bold text-slate-100 light:text-gray-900 mt-2">
                {totalCourses ?? 0}
              </p>
              
            </div>

            
          </div>
        </div>

        <div className="bg-slate-800 light:bg-white border border-slate-700 light:border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 light:text-gray-500">
                Completed Courses
              </p>

              <p className="text-3xl font-bold text-slate-100 light:text-gray-900 mt-2">
                {completedCourses ?? 0}
              </p>

              <p className="text-xs text-slate-500 mt-2">
                Successfully completed
              </p>
            </div>

           
          </div>
        </div>

        <div className="bg-slate-800 light:bg-white border border-slate-700 light:border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 light:text-gray-500">
                Average Score
              </p>

              <p className="text-3xl font-bold text-slate-100 light:text-gray-900 mt-2">
                {averageScore != null
                  ? `${Math.round(averageScore)}%`
                  : "—"}
              </p>

              <p className="text-xs text-slate-500 mt-2">
                Overall quiz performance
              </p>
            </div>

            
          </div>
        </div>

      </div>

      {/* Chart */}
      <ChartCard title="Progress Analysis">

        <LineChart
          data={chartData}
          margin={{
            top: 25,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >

          <CartesianGrid
            strokeDasharray="4 4"
            stroke="currentColor"
            className="text-slate-700/50 light:text-gray-200"
          />

          <XAxis
            dataKey="date"
            stroke="currentColor"
            className="text-slate-400 light:text-gray-500"
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />

          <YAxis
            domain={[0, 100]}
            stroke="currentColor"
            className="text-slate-400 light:text-gray-500"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip
            content={<CustomTooltip />}
          />

          <Legend
            verticalAlign="top"
            align="right"
            height={30}
          />

          <Line
            type="monotone"
            dataKey="score"
            name="Score"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={<ScoreDot />}
            activeDot={{
              r: 8,
              strokeWidth: 3,
              stroke: "#fff",
            }}
          />

        </LineChart>

      </ChartCard>

    </div>
  );
}