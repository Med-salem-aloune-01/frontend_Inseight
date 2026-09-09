import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatbotWidget from './Chatbot/ChatbotWidget';
import NotificationBell from './NotificationBell';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 light:bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-10 max-w-6xl">
        <div className="flex justify-end mb-6">
          <NotificationBell />
        </div>
        <Outlet />
      </main>

      <ChatbotWidget />
    </div>
  );
}