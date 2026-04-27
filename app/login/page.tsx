'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Lock, User, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ login: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.login || !form.password) {
      setError('Login va parolni kiriting');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Login yoki parol noto\'g\'ri');
      }
    } catch {
      setError('Serverga ulanishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-300 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-sky-100 border border-sky-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <Dumbbell size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">FitPro</h1>
            <p className="text-sky-100 text-sm mt-1">Boshqaruv tizimi</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-sky-900">Kirish</h2>
              <p className="text-slate-400 text-sm mt-1">Tizimga kirish uchun ma'lumot kiriting</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Login */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Login
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={form.login}
                    onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                    placeholder="Loginni kiriting"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 border border-sky-200 rounded-xl text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent
                               text-slate-700 placeholder-slate-300 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Parol
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Parolni kiriting"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 border border-sky-200 rounded-xl text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent
                               text-slate-700 placeholder-slate-300 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white
                           py-3 rounded-xl font-semibold text-sm transition-all
                           flex items-center justify-center gap-2 mt-2 shadow-md shadow-sky-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Kirilmoqda...
                  </span>
                ) : (
                  <>
                    <LogIn size={16} />
                    Kirish
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-6">
              FitPro © {new Date().getFullYear()} — Fitnes markazi boshqaruvi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
