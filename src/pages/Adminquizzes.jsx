import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminListquizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', duration: '', passingScore: '' });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 10;

function fetchQuizzes() {
  setLoading(true);
  setError(null);

  api.get(`/quizzes/listQuizzes?page=${page}&limit=${limit}`)
    .then((res) => {
      const list = res.data.data;

      setQuizzes(
        list.map((q) => ({
          _id: q._id,
          course: q.course?.title || 'Unknown',
          quiz: q.title,
          description: q.description || '',
          duration: q.duration ?? '',
          passingScore: q.passingScore ?? '',
          isPublished: q.isPublished,
        }))
      );

      // IMPORTANT
      setPages(res.data.pages || 1);
    })
    .catch((err) => {
      console.error(
        'Fetch quizzes failed:',
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        err.response?.status === 401
          ? "Session expirée, reconnectez-vous."
          : "Impossible de charger les quiz."
      );

      setQuizzes([]);
    })
    .finally(() => setLoading(false));
}

useEffect(() => {
  fetchQuizzes();
}, [page]);

  function openEditModal(quiz) {
    setEditingQuiz(quiz);
    setForm({
      title: quiz.quiz || '',
      description: quiz.description || '',
      duration: quiz.duration || '',
      passingScore: quiz.passingScore || '',
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/quizzes/${editingQuiz._id}/modify`, form);
      const updated = res.data?.data ?? res.data;
      setQuizzes((prev) => prev.map((q) => (q._id === editingQuiz._id ? {
        ...q,
        quiz: updated.title,
        description: updated.description,
        duration: updated.duration,
        passingScore: updated.passingScore,
      } : q)));
      setModalOpen(false);
    } catch (err) {
      console.error('Save quiz failed:', err.response?.data || err.message);
      alert("Erreur lors de l'enregistrement du quiz.");
    } finally {
      setSaving(false);
    }
  }
  async function handlePublish(quiz) {
    try {
      const res = await api.patch(`/quizzes/${quiz._id}/publish`);
      const updated = res.data?.data ?? res.data;
      setQuizzes((prev) => prev.map((q) => (q._id === quiz._id ? { ...q, isPublished: updated.isPublished } : q)));
    } catch (err) {
      console.error('Publish quiz failed:', err.response?.data || err.message);
      alert('Erreur lors de la publication.');
    }
  }

  async function handleDelete(quiz) {
    if (!confirm(`Supprimer le quiz "${quiz.quiz}" ?`)) return;
    try {
      await api.delete(`/quizzes/${quiz._id}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id));
    } catch (err) {
      console.error('Delete quiz failed:', err.response?.data || err.message);
      alert('Erreur lors de la suppression.');
    }
  }

  if (loading) return <p className="text-slate-400 light:text-gray-500 p-10">Chargement...</p>;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-widest text-blue-400 uppercase mb-1">All Quizzes</p>
          <h1 className="text-2xl font-bold text-slate-100 light:text-gray-900">Quiz Management</h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-4 py-2 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchQuizzes} className="underline">Réessayer</button>
        </div>
      )}

      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 light:text-gray-400 border-b border-slate-800 light:border-gray-200">
              <th className="p-3">Course</th>
              <th className="p-3">Quiz</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Passing Score</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500 light:text-gray-400">No quizzes yet</td></tr>
            ) : (
              quizzes.map((q) => (
                <tr key={q._id} className="border-b border-slate-800 light:border-gray-200 last:border-0">
                  <td className="p-3 font-medium text-slate-100 light:text-gray-900">{q.course}</td>
                  <td className="p-3 text-blue-400">{q.quiz}</td>
                  <td className="p-3 text-slate-400 light:text-gray-500">{q.duration ? `${q.duration} min` : '—'}</td>
                  <td className="p-3 text-slate-400 light:text-gray-500">{q.passingScore != null ? `${q.passingScore}%` : '—'}</td>
                  <td className="p-3 text-slate-400 light:text-gray-500">{q.isPublished ? 'Publié' : 'Brouillon'}</td>
                  <td className="p-3 space-x-2">
  <button
    onClick={() => handlePublish(q)}
    className={`text-xs rounded-lg px-2 py-1 border ${
      q.isPublished
        ? 'border-yellow-800 text-yellow-400'
        : 'border-green-800 text-green-400'
    }`}
  >
    {q.isPublished ? 'Dépublier' : 'Publier'}
  </button>
  <button
    onClick={() => openEditModal(q)}
    className="text-xs border border-slate-700 light:border-gray-300 text-slate-300 light:text-gray-600 rounded-lg px-2 py-1"
  >
    Edit
  </button>
  <button
    onClick={() => handleDelete(q)}
    className="text-xs border border-red-800 text-red-400 rounded-lg px-2 py-1"
  >
    Del
  </button>
</td>
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
            <span className="font-medium text-slate-300 light:text-gray-700">{page}</span>{" "}
            of{" "}
            <span className="font-medium text-slate-300 light:text-gray-700">{pages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 light:bg-white border border-slate-700 light:border-gray-200 text-slate-300 light:text-gray-700 hover:bg-slate-700 light:hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-slate-100 light:text-gray-900 mb-4">Edit Quiz</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              />
              <input
                type="number"
                placeholder="Duration (min)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              />
              <input
                type="number"
                placeholder="Passing Score (%)"
                value={form.passingScore}
                onChange={(e) => setForm({ ...form, passingScore: e.target.value })}
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-xs border border-slate-700 light:border-gray-300 text-slate-300 light:text-gray-600 rounded-lg px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}