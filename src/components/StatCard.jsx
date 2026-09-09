export default function StatCard({ label, value, delta }) {
  return (
    <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl p-5">
      <p className="text-xs text-slate-500 light:text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-bold text-slate-100 light:text-gray-900">{value}</p>
      {delta && <p className="text-xs text-blue-400 mt-2">{delta}</p>}
    </div>
  );
}