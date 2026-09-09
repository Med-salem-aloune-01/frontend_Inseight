import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyModule = () => ({ title: '', description: '', order: 0, lessons: [] });
const emptyLesson = () => ({ title: '', content: '', videoUrl: '', order: 0 });

export default function Admincourse() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // null = creating
  const [form, setForm] = useState({ 
  title: '', description: '', duration: '', level: 'L1', 
  department: '' 
});
  const [modules, setModules] = useState([emptyModule()]);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 10;

  function fetchCourses() {
    setLoading(true);
    setError(null);
    api.get(`/cours?page=${page}&limit=${limit}`)
      .then((res) => {
        setCourses(Array.isArray(res.data?.data) ? res.data.data : []);
        setPages(res.data?.pages || 1);
      })
      .catch((err) => {
        console.error('Fetch courses failed:', err.response?.status, err.response?.data || err.message);
        setError(err.response?.status === 401
          ? "Session expirée, reconnectez-vous."
          : "Impossible de charger les cours.");
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCourses(); }, [page]);

  useEffect(() => {
    api.get('/departments').then((res) => {
      setDepartments(Array.isArray(res.data?.data) ? res.data.data : res.data || []);
    }).catch((err) => console.error('Fetch departments failed:', err.response?.data || err.message));
  }, []);

  function openCreateModal() {
    setEditingCourse(null);
    setForm({ 
  title: '', description: '', duration: '', level: 'L1', 
  department: departments[0]?._id || '' 
});
      setModules([emptyModule()]);
    setModalOpen(true);
  }

  function openEditModal(course) {
    setEditingCourse(course);
    setForm({ 
      title: course.title || '', 
      description: course.description || '', 
      duration: course.duration || '', 
      level: course.level || 'L1',
      department: course.department?._id || course.department || ''
    });
    setModalOpen(true);
  }

  function updateModule(index, field, value) {
  setModules((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
}

function addModuleRow() {
  setModules((prev) => [...prev, emptyModule()]);
}

function removeModuleRow(index) {
  setModules((prev) => prev.filter((_, i) => i !== index));
}

// --- new: lesson helpers, mirror the module ones ---
function updateLesson(moduleIndex, lessonIndex, field, value) {
  setModules((prev) => prev.map((m, i) => {
    if (i !== moduleIndex) return m;
    const lessons = m.lessons.map((l, j) => (j === lessonIndex ? { ...l, [field]: value } : l));
    return { ...m, lessons };
  }));
}

function addLessonRow(moduleIndex) {
  setModules((prev) => prev.map((m, i) => (i === moduleIndex ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m)));
}

function removeLessonRow(moduleIndex, lessonIndex) {
  setModules((prev) => prev.map((m, i) => {
    if (i !== moduleIndex) return m;
    return { ...m, lessons: m.lessons.filter((_, j) => j !== lessonIndex) };
  }));
}

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCourse) {
        const res = await api.put(`/cours/${editingCourse._id}`, form);
        const updated = res.data?.data ?? res.data;
        setCourses((prev) => prev.map((c) => (c._id === editingCourse._id ? updated : c)));
      } else {
        const res = await api.post('/cours/ajouter', form);
        const created = res.data?.data ?? res.data;

        const validModules = modules.filter((m) => m.title.trim());
        if (validModules.length) {
          for (const [i, m] of validModules.entries()) {
            const modRes = await api.post(`/modules/course/${created._id}`, {
              title: m.title, description: m.description, order: m.order || i
            });
            const createdModule = modRes.data?.data ?? modRes.data;

            const validLessons = m.lessons.filter((l) => l.title.trim());
            if (validLessons.length) {
              await Promise.all(validLessons.map((l, j) =>
                api.post(`/modules/${createdModule._id}/lessons`, {
                title: l.title,
                content: l.content,
                videoUrl: l.videoUrl,
                order: l.order || j
              })
              ));
            }
          }
        }

        setCourses((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Save course failed:', err.response?.data || err.message);
      alert("Erreur lors de l'enregistrement du cours.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course) {
    if (!confirm(`Supprimer le cours "${course.title}" ?`)) return;
    try {
      await api.delete(`/cours/${course._id}`);
      setCourses((prev) => prev.filter((c) => c._id !== course._id));
    } catch (err) {
      console.error('Delete course failed:', err.response?.data || err.message);
      alert('Erreur lors de la suppression.');
    }
  }

  if (loading) return <p className="text-slate-400 light:text-gray-500 p-10">Chargement...</p>;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-widest text-blue-400 uppercase mb-1">All Courses</p>
          <h1 className="text-2xl font-bold text-slate-100 light:text-gray-900">Admin Dashboard</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg px-4 py-2"
        >
          + New Course
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-4 py-2 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchCourses} className="underline">Réessayer</button>
        </div>
      )}

      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 light:text-gray-400 border-b border-slate-800 light:border-gray-200">
              <th className="p-3">Course</th>
              <th className="p-3">Department</th>
              <th className="p-3">Level</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500 light:text-gray-400">No courses yet</td></tr>
            ) : (
              courses.map((c) => (
                <tr key={c._id} className="border-b border-slate-800 light:border-gray-200 last:border-0">
                  <td className="p-3">
                    <div className="font-medium text-slate-100 light:text-gray-900">{c.title}</div>
                    <div className="text-xs text-slate-500 light:text-gray-400">{c.duration} h</div>
                  </td>
                  <td className="p-3 text-slate-400 light:text-gray-500">{c.department?.name}</td>
                  <td className="p-3 text-slate-400 light:text-gray-500">{c.level}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="text-xs border border-slate-700 light:border-gray-300 text-slate-300 light:text-gray-600 rounded-lg px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-100 light:text-gray-900 mb-4">
              {editingCourse ? 'Edit Course' : 'New Course'}
            </h2>
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

              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              >
                <option value="" disabled>Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Duration (hours)"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              />
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              >
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
              </select>

              {!editingCourse && (
                <div className="pt-2 border-t border-slate-800 light:border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500 light:text-gray-400">Modules</p>
                    <button
                      type="button"
                      onClick={addModuleRow}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      + Add module
                    </button>
                  </div>
                  <div className="space-y-2">
                    {modules.map((m, i) => (
  <div key={i} className="border border-slate-800 light:border-gray-200 rounded-lg p-2 space-y-2">
    <div className="flex gap-2">
      <input
        type="text"
        placeholder={`Module ${i + 1} title`}
        value={m.title}
        onChange={(e) => updateModule(i, 'title', e.target.value)}
        className="flex-1 bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
      />
      {modules.length > 1 && (
        <button type="button" onClick={() => removeModuleRow(i)} className="text-xs border border-red-800 text-red-400 rounded-lg px-2">×</button>
      )}
    </div>

    <div className="pl-3 space-y-1">
      {m.lessons.map((l, j) => (
        <div key={j} className="flex gap-2">
          <input
            type="text"
            placeholder={`Lesson ${j + 1} title`}
            value={l.title}
            onChange={(e) => updateLesson(i, j, 'title', e.target.value)}
            className="flex-1 bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-2 py-1 text-slate-100 light:text-gray-900 text-xs"
          />
          
          <button type="button" onClick={() => removeLessonRow(i, j)} className="text-xs border border-red-800 text-red-400 rounded-lg px-2">×</button>
          <input
            type="text"
            placeholder="Video URL"
            value={l.videoUrl}
            onChange={(e) => updateLesson(i, j, 'videoUrl', e.target.value)}
            className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-2 py-1 text-slate-100 light:text-gray-900 text-xs"
          />
          <textarea
  placeholder="Lesson content"
  value={l.content}
  onChange={(e) =>
    updateLesson(i, j, 'content', e.target.value)
  }
  rows={2}
  className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-2 py-1 text-slate-100 light:text-gray-900 text-xs"
/>
        </div>
        
      ))}
        <button type="button" onClick={() => addLessonRow(i)} className="text-xs text-blue-400 hover:underline">+ Add lesson</button>
        
        </div>
      </div>
      ))}
                  </div>
                </div>
              )}

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