const STYLES = {
  active: 'bg-blue-500/10 text-blue-400 border border-blue-800',
  draft: 'bg-amber-500/10 text-amber-400 border border-amber-800',
  upcoming: 'bg-violet-500/10 text-violet-400 border border-violet-800',
  enrolled: 'bg-blue-500/10 text-blue-400 border border-blue-800',
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-800',
};

export default function Tag({ status }) {
  return (
    <span className={`text-[10.5px] uppercase px-2 py-1 rounded-full ${STYLES[status] || ''}`}>
      {status}
    </span>
  );
}