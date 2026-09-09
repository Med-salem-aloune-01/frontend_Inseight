// src/components/RoleSwitcher.jsx
import { useNavigate, useLocation } from 'react-router-dom';

export default function RoleSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const roles = [
    { label: 'Admin', path: '/admin' },
    { label: 'Teacher', path: '/teacher' },
    { label: 'Student', path: '/student' },
  ];

  return (
    <div className="inline-flex bg-slate-800 dark :bg-bleu-100 rounded-full p-1 text-sm w-full">
      {roles.map((r) => {
        const active = location.pathname === r.path;
        return (
          <button
            key={r.path}
            onClick={() => navigate(r.path)}
            className={`flex-1 px-3 py-1.5 rounded-full transition ${
              active
                ? 'bg-bleu text-blue-600 font-semibold'
                : 'text-slate-400 light:text-bleu-500 hover:text-slate-200 light:hover:text-gray-700'
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}