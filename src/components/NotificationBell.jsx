import { useState, useRef, useEffect } from 'react';
import { Bell, Check, RefreshCw } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return 'just now';
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, loading, loadNotifications, markRead, markAllRead, refresh } = useNotifications();

  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const visibleNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-full hover:bg-slate-800 light:hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-400 light:text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[28rem] flex flex-col rounded-lg border border-slate-800 light:border-gray-200 bg-slate-900 light:bg-white shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 light:border-gray-200">
            <span className="text-sm font-semibold text-slate-100 light:text-gray-900">Notifications</span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-slate-400 light:text-gray-500 hover:text-slate-200 light:hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500 light:text-gray-400">Loading...</div>
            ) : visibleNotifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500 light:text-gray-400">No notifications yet</div>
            ) : (
              visibleNotifications.map(n => (
                <button
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-800 light:border-gray-200 last:border-0 hover:bg-slate-800/50 light:hover:bg-gray-100/50 transition-colors ${
                    !n.isRead ? 'bg-slate-800/30 light:bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-100 light:text-gray-900">{n.title}</p>
                      <p className="text-xs text-slate-400 light:text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-[11px] text-slate-500 light:text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
            
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-slate-800 light:border-gray-200 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-slate-800/50 light:hover:bg-gray-100/50 transition-colors"
            >

              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          )}
        </div>
      )}
    </div>
  );
} 