import { useState, useEffect, useCallback } from 'react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationService';

export const useNotifications = (pollMs = 30000) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCount = useCallback(async () => {
    try {
      const res = await fetchUnreadCount();
      const finalCount = typeof res?.data?.data === 'number'
        ? res.data.data
        : typeof res?.data === 'number'
          ? res.data
          : 0;
      setUnreadCount(finalCount);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
  setLoading(true);
  try {
    const res = await fetchNotifications();
    const list = Array.isArray(res?.data?.data)
      ? res.data.data
      : Array.isArray(res?.data)
        ? res.data
        : [];

    // unread first, then by newest within each group
    const sorted = [...list].sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setNotifications(sorted);
    setUnreadCount(sorted.filter(n => !n.isRead).length);
  } catch (err) {
    console.error('Failed to fetch notifications', err);
    setNotifications([]);
  } finally {
    setLoading(false);
  }
}, []);


  const markRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  }, []);

const refresh = useCallback(async () => {
  await loadNotifications(); // this now updates both list AND count together
}, [loadNotifications]);
  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, pollMs);
    return () => clearInterval(interval);
  }, [loadCount, pollMs]);

  return { notifications, unreadCount, loading, loadNotifications, markRead, markAllRead, refresh };
};