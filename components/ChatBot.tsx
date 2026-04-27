'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Salom! Men FitPro AI yordamchisiman. Fitnes markazi boshqaruvi bo\'yicha savollaringizga javob berishga tayyorman. Qanday yordam kerak?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.message || data.error }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Xatolik yuz berdi. Qayta urinib ko\'ring.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden"
          style={{ height: '480px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">FitPro AI</p>
                <p className="text-sky-100 text-xs">Har doim tayyor</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-sky-50/30">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                    ${msg.role === 'user' ? 'bg-sky-600' : 'bg-white border border-sky-200'}`}
                >
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Bot size={14} className="text-sky-600" />
                  }
                </div>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-700 border border-sky-100 rounded-tl-sm shadow-sm'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-white border border-sky-200 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-sky-600" />
                </div>
                <div className="bg-white border border-sky-100 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                  <Loader2 size={14} className="text-sky-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-sky-100 bg-white">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Savol yozing..."
                rows={1}
                className="flex-1 resize-none border border-sky-200 rounded-xl px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent
                           text-slate-700 placeholder-slate-400 max-h-20"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-sky-600 hover:bg-sky-700 disabled:bg-sky-200 text-white p-2.5
                           rounded-xl transition-colors flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 text-center">Enter — yuborish</p>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg
                   flex items-center justify-center transition-all duration-300
                   ${open
                     ? 'bg-slate-600 hover:bg-slate-700 rotate-0'
                     : 'bg-sky-600 hover:bg-sky-700 scale-100 hover:scale-105'
                   }`}
      >
        {open
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
        )}
      </button>
    </>
  );
}
