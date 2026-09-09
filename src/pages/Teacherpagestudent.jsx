import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function TeacherpageStudent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 10;

  function fetchStudents() {
    setLoading(true);
    setError(null);
    api.get(`/users/students/mylists?page=${page}&limit=${limit}`)
      .then((res) => {
        setStudents(Array.isArray(res.data?.users) ? res.data.users : []);
        setPages(res.data?.pages || 1);
      })
      .catch((err) => {
        console.error('Fetch Students failed:', err.response?.status, err.response?.data || err.message);
        setError(err.response?.status === 401
          ? "Session expirée, reconnectez-vous."
          : "Impossible de charger les étudiants.");
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchStudents(); }, [page]);

  if (loading) return <p className="text-slate-400 light:text-gray-500 p-10">Chargement...</p>;

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-6">
        <h1 className="text-2xl font-bold text-slate-100 light:text-gray-800">My Students</h1>
        <span className="text-slate-400 light:text-gray-400">·</span>
        <span className="text-slate-500 light:text-gray-500">Learner management</span>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchStudents} className="underline">Réessayer</button>
        </div>
      )}

      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 light:text-gray-400 border-b border-slate-800 light:border-gray-200">
              <th className="p-4">Student</th>
              <th className="p-4">Email</th>
              <th className="p-4">Enrolled</th>
              <th className="p-4">Avg Grade</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-slate-500 light:text-gray-400">No student yet</td></tr>
            ) : (
              students.map((s) => (
                <tr key={s._id} className="border-b border-slate-800 light:border-gray-200 last:border-0">
                  <td className="p-3 font-medium text-slate-100 light:text-gray-900">{s.firstName} {s.lastName}</td>
                  <td className="p-4 text-slate-500 light:text-gray-500">{s.email}</td>
                  <td className="p-4 text-slate-500 light:text-gray-500">{s.enrolledCount ?? '-'}</td>
                  <td className="p-4 text-slate-500 light:text-gray-500">{s.averageGrade != null ? `${Math.round(s.averageGrade)}%` : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4
          border-t border-slate-800 light:border-gray-200
          bg-slate-950/30 light:bg-gray-50/50"
        >

          <p className="text-xs text-slate-500 light:text-gray-400">
            Page{" "}
            <span className="font-medium text-slate-300 light:text-gray-700">
              {page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-300 light:text-gray-700">
              {pages}
            </span>
          </p>

          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              disabled={page === 1}
              className="px-4 py-2 rounded-lg
                text-xs font-medium
                bg-slate-800 light:bg-white
                border border-slate-700 light:border-gray-200
                text-slate-300 light:text-gray-700
                hover:bg-slate-700 light:hover:bg-gray-100
                disabled:opacity-30
                disabled:cursor-not-allowed
                transition"
            >
              Previous
            </button>

            <button
              onClick={() =>
                setPage((p) => Math.min(pages, p + 1))
              }
              disabled={page === pages}
              className="px-4 py-2 rounded-lg
                text-xs font-medium
                bg-blue-500 hover:bg-blue-600
                text-white
                disabled:opacity-30
                disabled:cursor-not-allowed
                transition"
            >
              Next 
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}