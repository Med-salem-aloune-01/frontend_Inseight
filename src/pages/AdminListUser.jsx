import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AdminlistUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 15;
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: ''});
  const roles = [...new Set(users.map((u) => u.role))].sort((a, b) => a.localeCompare(b));
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const filteredUsers = users.filter((u) => {
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'actif' && u.isActive) ||
      (statusFilter === 'inactif' && !u.isActive);
    return matchesRole && matchesStatus;
  });

  function fetchUsers() {
    setLoading(true);
    setError(null);
    api.get(`/users/list?page=${page}&limit=${limit}`)
      .then((res) => {
        setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
        setPages(res.data?.pages || 1);
      })
      .catch((err) => {
        console.error('Fetch Users failed:', err.response?.status, err.response?.data || err.message);
        setError(err.response?.status === 401
          ? "Session expirée, reconnectez-vous."
          : "Impossible de charger les utilisateurs.");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchUsers(); }, [page]);

  async function handleDelete(user) {
    if (!confirm(`Supprimer l'utilisateur "${user.prenom} ${user.nom}" ?`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      console.error('Delete user failed:', err.response?.data || err.message);
      alert('Erreur lors de la suppression.');
    }
  }
  function openEditModal(user) {
    setEditingUser(user);
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    });
    setModalOpen(true);
  }
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/users/${editingUser._id}`, form);
      const updated = res.data?.data ?? res.data;
      setUsers((prev) => prev.map((q) => (q._id === editingUser._id ? {
        ...q,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
      } : q)));
      setModalOpen(false);
    } catch (err) {
      console.error('Save user failed:', err.response?.data || err.message);
      alert("Erreur lors de l'enregistrement du user.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-400 light:text-gray-500 p-10">Chargement...</p>;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-widest text-blue-400 uppercase mb-1">All Users</p>
          <h1 className="text-2xl font-bold text-slate-100 light:text-gray-900">User Management</h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-4 py-2 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchUsers} className="underline">Réessayer</button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs bg-slate-800 light:bg-gray-100 border border-slate-700 light:border-gray-300 text-slate-200 light:text-gray-700 rounded-lg px-2 py-1.5"
        >
          <option value="">Tous les rôles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-800 light:bg-gray-100 border border-slate-700 light:border-gray-300 text-slate-200 light:text-gray-700 rounded-lg px-2 py-1.5"
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 light:text-gray-400 border-b border-slate-800 light:border-gray-200">
              <th className="p-3">Prénom</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500 light:text-gray-400">No user yet</td></tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id} className="border-b border-slate-800 light:border-gray-200 last:border-0">
                  <td className="p-3 font-medium text-slate-100 light:text-gray-900">{u.firstName}</td>
                  <td className="p-3 font-medium text-slate-100 light:text-gray-900">{u.lastName}</td>
                  <td className="p-3 text-slate-400 light:text-gray-500">{u.role}</td>
                  <td className="p-3 text-slate-400 light:text-gray-500">{u.isActive ? 'Actif' : 'Inactif'}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(u)}
                      className="text-xs border border-red-800 text-red-400 rounded-lg px-2 py-1"
                    >
                      Del
                    </button>
                    <button
                    onClick={() => openEditModal(u)}
                    className="text-xs border border-slate-700 light:border-gray-300 text-slate-300 light:text-gray-600 rounded-lg px-2 py-1"
                  >
                    Edit
                  </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
            {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-slate-100 light:text-gray-900 mb-4">Edit Quiz</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <input
                type="text"
                placeholder="firstName"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              />
              <input
                type='text'
                placeholder="lastName"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                rows={3}
                className="w-full bg-slate-800 light:bg-gray-50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900 text-sm"
              />
              <input
                type="email"
                placeholder="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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