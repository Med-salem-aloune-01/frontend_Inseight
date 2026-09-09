import { useEffect, useState } from 'react';
import api from '../api/axios';

let idCounter = 0;
const nextId = () => `n${++idCounter}_${Date.now()}`;

function makeChoice(text = '') {
  return { id: nextId(), text };
}

function makeQuestion() {
  const c1 = makeChoice();
  const c2 = makeChoice();
  return { id: nextId(), text: '', points: 1, choices: [c1, c2], correctChoiceId: c1.id };
}

export default function TeacherListQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', duration: '', passingScore: '' });
  const [saving, setSaving] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '', description: '', duration: '', passingScore: '', course: '',
    questions: [makeQuestion()],
  });
  const [creating, setCreating] = useState(false);

  function fetchQuizzes() {
    setLoading(true);
    setError(null);
    api.get('/quizzes/listQuizzes?page=${page}&limit=${limit}')
      .then((res) => {
        const list = res.data.data;
        setQuizzes(
          list.map((q) => ({
            _id: q._id,
            course: q.course?.title || 'Unknown', // nécessite .populate('course', 'title') côté backend
            quiz: q.title,
            description: q.description || '',
            duration: q.duration ?? '',
            passingScore: q.passingScore ?? '',
            isPublished: q.isPublished,
          }))
        );
      })
      .catch((err) => {
        console.error('Fetch quizzes failed:', err.response?.status, err.response?.data || err.message);
        setError(err.response?.status === 401
          ? "Session expirée, reconnectez-vous."
          : "Impossible de charger vos quiz.");
        setQuizzes([]);
      })
      .finally(() => setLoading(false));
  }

  function fetchCourses() {
    api.get('/cours/')
      .then((res) => setCourses(res.data.data || res.data))
      .catch((err) => {
        console.error('Fetch courses failed:', err.response?.data || err.message);
        setCourses([]);
      });
  }

  useEffect(() => { fetchQuizzes(); fetchCourses(); }, []);
  function openCreateModal() {
    setCreateForm({ title: '', description: '', duration: '', passingScore: '', course: '', questions: [makeQuestion()] });
    setCreateModalOpen(true);
  }
  function addQuestion() {
    setCreateForm((f) => ({ ...f, questions: [...f.questions, makeQuestion()] }));
  }

  function removeQuestion(qId) {
    setCreateForm((f) => ({ ...f, questions: f.questions.filter((q) => q.id !== qId) }));
  }

  function updateQuestionText(qId, text) {
    setCreateForm((f) => ({
      ...f,
      questions: f.questions.map((q) => (q.id === qId ? { ...q, text } : q)),
    }));
  }

  function updateQuestionPoints(qId, points) {
    setCreateForm((f) => ({
      ...f,
      questions: f.questions.map((q) => (q.id === qId ? { ...q, points } : q)),
    }));
  }

  function addChoice(qId) {
    setCreateForm((f) => ({
      ...f,
      questions: f.questions.map((q) =>
        q.id === qId ? { ...q, choices: [...q.choices, makeChoice()] } : q
      ),
    }));
  }

  function removeChoice(qId, cId) {
    setCreateForm((f) => ({
      ...f,
      questions: f.questions.map((q) => {
        if (q.id !== qId) return q;
        const choices = q.choices.filter((c) => c.id !== cId);
        const correctChoiceId = q.correctChoiceId === cId ? choices[0]?.id : q.correctChoiceId;
        return { ...q, choices, correctChoiceId };
      }),
    }));
  }

  function updateChoiceText(qId, cId, text) {
    setCreateForm((f) => ({
      ...f,
      questions: f.questions.map((q) =>
        q.id === qId
          ? { ...q, choices: q.choices.map((c) => (c.id === cId ? { ...c, text } : c)) }
          : q
      ),
    }));
  }

  function setCorrectChoice(qId, cId) {
    setCreateForm((f) => ({
      ...f,
      questions: f.questions.map((q) => (q.id === qId ? { ...q, correctChoiceId: cId } : q)),
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();

    for (const q of createForm.questions) {
      if (!q.points || q.points <= 0) {
        alert('Chaque question doit avoir un score supérieur à 0.');
        return;
      }
      if (q.choices.length < 2) {
        alert('Chaque question doit avoir au moins 2 choix.');
        return;
      }
      if (q.choices.some((c) => !c.text.trim())) {
        alert('Tous les choix doivent avoir un texte.');
        return;
      }
    }

    setCreating(true);
    try {
      const quizRes = await api.post(`/quizzes/${createForm.course}`, {
        title: createForm.title,
        description: createForm.description,
        duration: createForm.duration,
        passingScore: createForm.passingScore,
      });
      const createdQuiz = quizRes.data?.data ?? quizRes.data;
      for (let qIndex = 0; qIndex < createForm.questions.length; qIndex++) {
        const q = createForm.questions[qIndex];
        await api.post(`/quizzes/${createdQuiz._id}/questions`, {
          statement: q.text,
          type: 'MCQ',
          points: q.points || 1,
          order: qIndex,
          choices: q.choices.map((c, cIndex) => ({
            text: c.text,
            isCorrect: c.id === q.correctChoiceId,
            order: cIndex,
          })),
        });
      }
      setQuizzes((prev) => [
        ...prev,
        {
          _id: createdQuiz._id,
          course: courses.find((c) => c._id === createForm.course)?.title || 'Unknown',
          quiz: createdQuiz.title,
          description: createdQuiz.description || '',
          duration: createdQuiz.duration ?? '',
          passingScore: createdQuiz.passingScore ?? '',
          isPublished: createdQuiz.isPublished,
        },
      ]);
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Create quiz failed:', err.response?.data || err.message);
      alert("Erreur lors de la création du quiz.");
    } finally {
      setCreating(false);
    }
  }

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
          <p className="text-[10px] tracking-widest text-blue-400 uppercase mb-1">My Quizzes</p>
          <h1 className="text-2xl font-bold text-slate-100 light:text-gray-900">Teacher Dashboard</h1>
        </div>
        <button
          onClick={openCreateModal}
          className="text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2"
        >
          + Add Quiz
        </button>
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
                  <td className="p-3 text-slate-400 light:text-gray-500">
                    <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${
                          q.isPublished
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-800 light:bg-gray-100 text-slate-400 light:text-gray-600'
                        }`}
                      >
                        {q.isPublished ? 'publié' : 'Dépublier'}
                      </span></td>
                  <td className="p-3 space-x-2">
                    <div className="flex  items-center gap-2">

                        <button
                          onClick={() => handlePublish(q)}
                          className={`text-xs rounded-lg px-2 py-1 border ${
                            q.isPublished
                              ? 'border-yellow-800 text-yellow-400'
                              : 'border-green-800 text-green-400'
                          }`}
                        >
                          {q.isPublished ? 'Dépublier' : 'publié'}
                        </button>

                        <button
                          onClick={() => openEditModal(q)}
                          className="text-xs border border-slate-700 light:border-gray-300
                          text-slate-300 light:text-gray-600
                          hover:bg-slate-800 light:hover:bg-gray-100
                          rounded-lg px-3 py-2 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(q)}
                          className="text-xs border border-red-800
                          text-red-400 hover:bg-red-950/30
                          rounded-lg px-3 py-2 transition"
                        >
                          Delete
                        </button>

                      </div>
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

      {createModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-100 light:text-gray-900 mb-4">Add Quiz</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <select
                value={createForm.course}
                onChange={(e) => setCreateForm({ ...createForm, course: e.target.value })}
                required
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Title"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                required
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              />
              <textarea
                placeholder="Description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={2}
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={createForm.duration}
                  onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })}
                  className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
                />
                <input
                  type="number"
                  placeholder="Passing Score (%)"
                  value={createForm.passingScore}
                  onChange={(e) => setCreateForm({ ...createForm, passingScore: e.target.value })}
                  className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 light:border-gray-200">
                <div className="flex items-center justify-between mb-2 mt-2">
                  <h3 className="text-sm font-semibold text-slate-200 light:text-gray-800">Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-xs border border-blue-800 text-blue-400 rounded-lg px-2 py-1"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {createForm.questions.map((q, qIndex) => (
                    <div key={q.id} className="bg-slate-800/50 light:bg-gray-50 border border-slate-700 light:border-gray-200 rounded-lg p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs text-slate-500 light:text-gray-400 mt-2">{qIndex + 1}.</span>
                        <input
                          type="text"
                          placeholder="Question text"
                          value={q.text}
                          onChange={(e) => updateQuestionText(q.id, e.target.value)}
                          required
                          className="flex-1 bg-slate-800 light:bg-white border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Pts"
                          value={q.points}
                          onChange={(e) => updateQuestionPoints(q.id, e.target.value)}
                          className="w-16 bg-slate-800 light:bg-white border border-slate-700 light:border-gray-300 rounded-lg px-2 py-2 text-slate-100 light:text-gray-900 text-sm"
                        />
                        {createForm.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(q.id)}
                            className="text-xs border border-red-800 text-red-400 rounded-lg px-2 py-2"
                          >
                            Del
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 pl-6">
                        {q.choices.map((c, cIndex) => (
                          <div key={c.id} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctChoiceId === c.id}
                              onChange={() => setCorrectChoice(q.id, c.id)}
                              title="Correct answer"
                            />
                            <input
                              type="text"
                              placeholder={`Choice ${cIndex + 1}`}
                              value={c.text}
                              onChange={(e) => updateChoiceText(q.id, c.id, e.target.value)}
                              required
                              className="flex-1 bg-slate-800 light:bg-white border border-slate-700 light:border-gray-300 rounded-lg px-3 py-1.5 text-slate-100 light:text-gray-900 text-sm"
                            />
                            {q.choices.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeChoice(q.id, c.id)}
                                className="text-xs text-red-400 px-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addChoice(q.id)}
                          className="text-xs text-blue-400 underline"
                        >
                          + Add choice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="text-xs border border-slate-700 light:border-gray-300 text-slate-300 light:text-gray-600 rounded-lg px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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