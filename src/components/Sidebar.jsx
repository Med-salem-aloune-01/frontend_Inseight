import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from "../components/ThemeToggle";

const NAV = {
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/courses', label: 'Courses' },
    { to: '/admin/quizzes', label: 'Quizzes' },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/analytics', label: 'Analytics' },
    { to:'/admin/assign', label: 'Assign'},
    { to: '/admin/settings', label: 'Settings' },
    
  ],
  teacher: [
    { to: '/teacher', label: 'My Courses' },
    { to: '/teacher/quizzes', label: 'Quizzes' },
    { to: '/teacher/students', label: 'Students' },
    { to: '/teacher/settings', label: 'Settings' },
  ],
  student: [
    { to: '/student', label: 'My Courses' },
    { to: '/student/quizzes', label: 'My Quizzes' },
    { to: '/student/progress', label: 'My Progress' },
    { to: '/student/certificates', label: 'Certificates' },
    { to: '/student/settings', label: 'Settings' },
  ],
};

const ROLES = ['admin', 'teacher'];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [viewedRole, setViewedRole] = useState(user?.role);

  const items = NAV[viewedRole] || [];

  function switchRole(role) {
    setViewedRole(role);
    navigate(NAV[role][0].to);
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="w-60 shrink-0 bg-slate-900 light:bg-white border-r border-slate-800 light:border-gray-200 text-slate-300 light:text-gray-600 flex flex-col p-5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] tracking-widest text-blue-400 border border-blue-800 rounded-full px-2 py-1">
          EduInsight
        </span>
        <ThemeToggle />
      </div>
      <p className="text-[10px] tracking-widest text-slate-500 light:text-gray-400 uppercase mb-6">
        Learning Platform
      </p>

      {user?.role === 'admin' && (
        <div className="inline-flex bg-slate-800 light:bg-gray-100 rounded-full p-1 text-xs mb-6">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`flex-1 px-3 py-1.5 rounded-full capitalize transition ${
                viewedRole === role
                  ? 'bg-white text-blue-600 font-semibold shadow-sm'
                  : 'text-slate-400 light:text-gray-500 hover:text-slate-200 light:hover:text-gray-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      )}

      <nav className="flex flex-col gap-1 flex-1">
        {items.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `px-3 py-2 text-sm rounded-lg transition ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-800'
                  : 'text-slate-400 light:text-gray-500 hover:bg-slate-800 light:hover:bg-gray-100 hover:text-slate-100 light:hover:text-gray-900'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 light:border-gray-200 pt-4 mt-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-semibold text-xs flex items-center justify-center">
          {user?.name?.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-100 light:text-gray-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-[11px] text-slate-500 light:text-gray-400">{viewedRole}</p>
        </div>
      </div>

      <button onClick={logout} className="text-xs text-slate-500 light:text-gray-400 hover:text-slate-100 light:hover:text-gray-900 mt-3 text-left">
        Se déconnecter
      </button>
    </aside>
  );
}