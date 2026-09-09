import api from '../src/api/axios';

export const fetchNotifications = () => api.get('/notifications/noti', {
  headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
});

export const fetchUnreadCount = () => api.get('/notifications/unread-count', {
  headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
});

export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');