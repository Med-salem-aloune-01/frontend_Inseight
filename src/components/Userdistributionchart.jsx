const DEFAULT = { students: 82, teachers: 12, admins: 6 };
const COLORS = { students: '#3B82F6', teachers: '#7EA6F0', admins: '#C3D6F7' };

export default function UserDistributionChart({ data = DEFAULT }) {
  const total = data.students + data.teachers + data.admins;
  const r = 62, circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = Object.entries(data).map(([key, val]) => {
    const len = (val / total) * circ;
    const seg = { key, len, offset };
    offset += len;
    return seg;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-slate-900 font-semibold">User Distribution</h2>
        <div className="flex gap-3 text-xs text-slate-500 ml-auto">
          {Object.keys(data).map((k) => (
            <span key={k} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: COLORS[k] }} />
              {k[0].toUpperCase() + k.slice(1)}
            </span>
          ))}
        </div>
      </div>
      <svg width="100%" height="180" viewBox="0 0 180 180">
        <g transform="rotate(-90 90 90)">
          {segments.map((s) => (
            <circle
              key={s.key}
              cx="90" cy="90" r={r}
              fill="none"
              stroke={COLORS[s.key]}
              strokeWidth="20"
              strokeDasharray={`${s.len} ${circ - s.len}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}