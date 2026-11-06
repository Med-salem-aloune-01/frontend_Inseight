import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/messages")
      .then((res) => setMessages(res.data.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = async (m) => {
    setOpenId(openId === m._id ? null : m._id);

    if (!m.isRead) {
      try {
        await api.patch(`/messages/${m._id}/read`);
        setMessages((prev) =>
          prev.map((x) => (x._id === m._id ? { ...x, isRead: true } : x))
        );
      } catch (err) {
        console.error(err.response?.data?.message || "Update failed");
      }
    }
  };

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div className="min-h-screen bg-slate-950 light:bg-gray-50 p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] text-blue-400 uppercase mb-2">
          Inbox
        </p>
        <h1 className="text-3xl font-bold text-slate-100 light:text-gray-900">
          Messages
        </h1>
        <p className="mt-2 text-sm text-slate-400 light:text-gray-500">
          {unread} unread message{unread !== 1 ? "s" : ""}
        </p>
      </div>

      {/* LIST */}
      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-2xl overflow-hidden">

        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500 light:text-gray-400">
            Loading...
          </p>
        ) : messages.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500 light:text-gray-400">
            No messages yet
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m._id}
              onClick={() => handleOpen(m)}
              className="px-6 py-4 border-b border-slate-800 light:border-gray-200 last:border-0 cursor-pointer hover:bg-slate-800/50 light:hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {!m.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                  <p
                    className={`text-slate-100 light:text-gray-900 ${
                      m.isRead ? "font-normal" : "font-semibold"
                    }`}
                  >
                    {m.subject}
                  </p>
                </div>

                <span className="text-xs text-slate-500 light:text-gray-400">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-500 light:text-gray-400 mt-1">
                From: {m.sender?.firstName} {m.sender?.lastName}
              </p>

              {openId === m._id && (
                <p className="text-sm text-slate-400 light:text-gray-600 mt-3 whitespace-pre-wrap">
                  {m.body}
                </p>
              )}
            </div>
          ))
        )}

      </div>
    </div>
  );
}