const DEFAULT = [
  { month: 'Jan', users: 1200 },
  { month: 'Feb', users: 1500 },
  { month: 'Mar', users: 1800 },
  { month: 'Apr', users: 2100 },
  { month: 'May', users: 2450 },
];

export default function PlatformGrowthChart({ data = DEFAULT }) {
  const max = Math.max(...data.map((d) => d.users));
  const min = Math.min(...data.map((d) => d.users));
  const w = 480, h = 170, pad = 30;
  const x = (i) => pad + (i * (w - pad * 2)) / (data.length - 1);
  const y = (v) => h - pad - ((v - min) / (max - min)) * (h - pad * 1.4);
  const points = data.map((d, i) => `${x(i)},${y(d.users)}`).join(' ');

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-slate-900 font-semibold mb-4">Platform Growth</h2>
      <svg width="100%" height={h + 20} viewBox={`0 0 ${w} ${h + 20}`}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={pad} x2={w - pad} y1={pad + (i * (h - pad * 1.4)) / 3} y2={pad + (i * (h - pad * 1.4)) / 3} stroke="#EEF1F6" />
        ))}
        <polyline points={points} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
        {data.map((d, i) => (
          <circle key={d.month} cx={x(i)} cy={y(d.users)} r="4" fill="#3B82F6" />
        ))}
        {data.map((d, i) => (
          <text key={d.month} x={x(i)} y={h + 12} textAnchor="middle" fontSize="11" fill="#94A3B8">{d.month}</text>
        ))}
      </svg>
    </div>
  );
}