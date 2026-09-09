import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X } from 'lucide-react';
import { sendMessage } from '../../../services/chatbotService';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Bonjour ! Comment puis-je vous aider ?` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const token = localStorage.getItem('token');

    try {
      const reply = await sendMessage(userMessage.content, token);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition z-50"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 light:border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="font-semibold text-slate-100 light:text-gray-900">Assistant EduInsight</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 light:text-gray-500 hover:text-slate-200">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-blue-600 text-white'
                : 'bg-slate-800 light:bg-gray-100 text-slate-100 light:text-gray-900'
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="bg-slate-800 light:bg-gray-100 text-slate-400 light:text-gray-500 text-sm px-4 py-2 rounded-2xl w-fit">
            ...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-slate-800 light:border-gray-200">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Écrire un message..."
          className="flex-1 bg-slate-800 light:bg-gray-100 text-slate-100 light:text-gray-900 placeholder-slate-500 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          onClick={handleSend}
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}