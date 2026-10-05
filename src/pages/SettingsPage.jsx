import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function SettingsPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get('/users/me')
      .then((res) => {
        const u = res.data.data;
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          phone: u.phone || '',
        });
      })
      .catch(() => setMessage({ type: 'error', text: 'Impossible de charger le profil' }))
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = { ...form };
    if (passwords.newPassword) {
      if (passwords.newPassword !== passwords.confirm) {
        setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
        setLoading(false);
        return;
      }
      payload.currentPassword = passwords.currentPassword;
      payload.newPassword = passwords.newPassword;
    }

    try {
      const res = await api.put('/users/me', payload);
      setMessage({ type: 'success', text: res.data.message });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur serveur' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="text-slate-400 light:text-gray-500 p-6">Chargement...</p>;
  }

  const inputClass =
    'w-full px-3 py-2 rounded bg-slate-800 light:bg-gray-100/50 border border-slate-700 light:border-gray-300 text-slate-100 light:text-gray-900';
  const labelClass = 'text-sm text-slate-400 light:text-gray-500';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-100 light:text-gray-900 mb-6">
        Paramètres du compte
      </h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Prénom</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className={`${inputClass} mt-1`}
            />
          </div>
          <div>
            <label className={labelClass}>Nom</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className={`${inputClass} mt-1`}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`${inputClass} mt-1`}
          />
        </div>

        <div>
          <label className={labelClass}>Téléphone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={`${inputClass} mt-1`}
          />
        </div>

        <hr className="border-slate-800 light:border-gray-200" />

        <p className={labelClass}>Changer le mot de passe (optionnel)</p>

        <input
          type="password"
          placeholder="Mot de passe actuel"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={passwords.newPassword}
          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Confirmer le nouveau mot de passe"
          value={passwords.confirm}
          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          className={inputClass}
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
