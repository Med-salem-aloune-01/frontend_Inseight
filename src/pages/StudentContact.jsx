import { useEffect, useState } from "react";
import api from "../api/axios";

const inputClass =
  "w-full rounded-xl px-4 py-2.5 text-sm bg-slate-800 light:bg-gray-100 border border-slate-700 light:border-gray-300 text-slate-100 light:text-gray-900 focus:outline-none focus:border-blue-500";

export default function StudentContact() {
  const [contacts, setContacts] = useState({ teachers: [], admins: [] });
  const [sent, setSent] = useState([]);
  const [form, setForm] = useState({ recipient: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadData = () =>
    Promise.all([api.get("/messages/contacts"), api.get("/messages?box=sent")])
      .then(([c, m]) => {
        setContacts(c.data.data);
        setSent(m.data.data);
      })
      .catch(() => {});

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const requestLevel = () =>
    setForm({
      recipient: contacts.admins[0]?._id || "",
      subject: "Level assignment request",
      body: "Hello, I would like to be assigned to my level. Thank you.",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setFeedback(null);

    try {
      await api.post("/messages", form);
      setForm({ recipient: "", subject: "", body: "" });
      setFeedback({ ok: true, text: "Message sent" });
      await loadData();
    } catch (err) {
      setFeedback({
        ok: false,
        text: err.response?.data?.message || "Sending failed",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 light:bg-gray-50 p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] text-blue-400 uppercase mb-2">
          Support
        </p>
        <h1 className="text-3xl font-bold text-slate-100 light:text-gray-900">
          Contact
        </h1>
        <p className="mt-2 text-sm text-slate-400 light:text-gray-500">
          Write to your teachers or to the administration.
        </p>
      </div>

      {/* FORM */}
      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-2xl p-6 mb-8">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100 light:text-gray-900">
            New message
          </h2>

          <button
            type="button"
            onClick={requestLevel}
            className="text-xs font-medium text-blue-400 hover:text-blue-300"
          >
            Request level assignment
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <select
            name="recipient"
            value={form.recipient}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Choose a recipient</option>

            <optgroup label="Administration">
              {contacts.admins.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.firstName} {a.lastName} (Admin)
                </option>
              ))}
            </optgroup>

            <optgroup label="My department teachers">
              {contacts.teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </optgroup>
          </select>

          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Subject"
            required
            className={inputClass}
          />

          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            placeholder="Your message"
            rows={5}
            required
            className={inputClass}
          />

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={sending}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-xl px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {sending ? "Sending..." : "Send"}
            </button>

            {feedback && (
              <span
                className={`text-xs ${
                  feedback.ok ? "text-green-400" : "text-red-400"
                }`}
              >
                {feedback.text}
              </span>
            )}
          </div>

        </form>
      </div>

      {/* SENT MESSAGES */}
      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 light:border-gray-200">
          <h2 className="text-lg font-semibold text-slate-100 light:text-gray-900">
            Sent messages
          </h2>
        </div>

        {sent.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500 light:text-gray-400">
            No messages yet
          </p>
        ) : (
          sent.map((m) => (
            <div
              key={m._id}
              className="px-6 py-4 border-b border-slate-800 light:border-gray-200 last:border-0"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-100 light:text-gray-900">
                  {m.subject}
                </p>
                <span className="text-xs text-slate-500 light:text-gray-400">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-500 light:text-gray-400 mt-1">
                To: {m.recipient?.firstName} {m.recipient?.lastName}
              </p>

              <p className="text-sm text-slate-400 light:text-gray-600 mt-2">
                {m.body}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}