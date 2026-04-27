'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users, BadgeCheck, Wallet, AlertTriangle,
  TrendingUp, Clock, RefreshCw,
} from 'lucide-react';

interface DashboardData {
  totalMembers: number;
  allMembers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  expiringSoon: number;
  recentPayments: Payment[];
  expiringMembers: ExpiringMember[];
}

interface Payment {
  id: number;
  member_name: string;
  plan_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
}

interface ExpiringMember {
  name: string;
  phone: string;
  end_date: string;
  plan_name: string;
}

function formatMoney(amount: number) {
  if (!amount || isNaN(amount)) return "0 so'm";
  return Number(amount).toLocaleString('ru-RU') + " so'm";
}

function formatDate(date: string) {
  if (!date) return '—';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function daysLeft(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

const DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [now, setNow] = useState(new Date());

  // Jonli soat
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json && !json.error) {
        setData(json);
        const t = new Date();
        setLastUpdated(`${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`);
      }
    } catch (e) {
      console.error('Dashboard fetch error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Birinchi yuklash
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Har 30 soniyada avtomatik yangilanish
  useEffect(() => {
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const dateStr = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  const stats = [
    {
      label: "Faol A'zolar",
      value: data ? Number(data.totalMembers) : '—',
      suffix: data ? 'ta' : '',
      icon: Users,
      color: 'sky',
      sub: data ? `Jami: ${Number(data.allMembers)} ta` : 'Yuklanmoqda...',
    },
    {
      label: 'Faol Obunalar',
      value: data ? Number(data.activeSubscriptions) : '—',
      suffix: data ? 'ta' : '',
      icon: BadgeCheck,
      color: 'emerald',
      sub: data ? 'Hozir aktiv' : 'Yuklanmoqda...',
    },
    {
      label: 'Oylik Daromad',
      value: data ? formatMoney(data.monthlyRevenue) : '—',
      suffix: '',
      icon: Wallet,
      color: 'violet',
      sub: data ? `${MONTHS[now.getMonth()]} oyi` : 'Yuklanmoqda...',
    },
    {
      label: 'Tugayapti',
      value: data ? Number(data.expiringSoon) : '—',
      suffix: data ? 'ta' : '',
      icon: AlertTriangle,
      color: 'amber',
      sub: data ? '7 kun ichida' : 'Yuklanmoqda...',
    },
  ];

  const colorMap: Record<string, string> = {
    sky: 'bg-sky-500', emerald: 'bg-emerald-500',
    violet: 'bg-violet-500', amber: 'bg-amber-500',
  };
  const colorBg: Record<string, string> = {
    sky: 'bg-sky-50 border-sky-100', emerald: 'bg-emerald-50 border-emerald-100',
    violet: 'bg-violet-50 border-violet-100', amber: 'bg-amber-50 border-amber-100',
  };
  const colorText: Record<string, string> = {
    sky: 'text-sky-600', emerald: 'text-emerald-600',
    violet: 'text-violet-600', amber: 'text-amber-600',
  };

  const recentPayments: Payment[] = data?.recentPayments ?? [];
  const expiringMembers: ExpiringMember[] = data?.expiringMembers ?? [];

  return (
    <div className="space-y-5 lg:ml-0 ml-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">Boshqaruv paneli</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500 text-sm">{dateStr}</p>
            <span className="text-sky-600 font-mono font-semibold text-sm bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
              {timeStr}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Yangilandi: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-sky-200 text-sky-600 px-3 py-2 rounded-xl text-sm hover:bg-sky-50 transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Yangilash
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl p-5 border ${colorBg[s.color]} shadow-sm transition-all`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-500 text-xs font-medium">{s.label}</p>
              <div className={`${colorMap[s.color]} p-2 rounded-xl`}>
                <s.icon size={15} className="text-white" />
              </div>
            </div>
            {loading && !data ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-2xl font-bold ${colorText[s.color]}`}>
                {s.value}
                {s.suffix && <span className="text-base ml-1">{s.suffix}</span>}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-xs text-slate-400">Har 30 soniyada avtomatik yangilanadi</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Payments */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-sky-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={17} className="text-sky-600" />
              <h2 className="font-semibold text-sky-900">So'nggi to'lovlar</h2>
            </div>
            {recentPayments.length > 0 && (
              <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-medium">
                {recentPayments.length} ta
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            {loading && !data ? (
              <div className="p-5 space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-8 bg-sky-50 rounded animate-pulse" />)}
              </div>
            ) : recentPayments.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <TrendingUp size={28} className="mx-auto mb-2 text-sky-100" />
                <p className="text-sm">To'lovlar mavjud emas</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sky-50/60">
                    <th className="text-left px-5 py-3 text-xs text-slate-500 font-medium">A'zo</th>
                    <th className="text-left px-3 py-3 text-xs text-slate-500 font-medium hidden sm:table-cell">Reja</th>
                    <th className="text-left px-3 py-3 text-xs text-slate-500 font-medium">Summa</th>
                    <th className="text-left px-3 py-3 text-xs text-slate-500 font-medium hidden md:table-cell">Sana</th>
                    <th className="text-left px-3 py-3 text-xs text-slate-500 font-medium">Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="border-t border-sky-50 hover:bg-sky-50/40 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-700">{p.member_name}</td>
                      <td className="px-3 py-3 text-slate-500 hidden sm:table-cell">{p.plan_name || '—'}</td>
                      <td className="px-3 py-3 font-semibold text-sky-700">{formatMoney(p.amount)}</td>
                      <td className="px-3 py-3 text-slate-400 hidden md:table-cell">{formatDate(p.payment_date)}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {p.status === 'completed' ? 'Tasdiqlangan' : 'Bekor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-sky-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={17} className="text-amber-500" />
              <h2 className="font-semibold text-sky-900">Tez tugaydigan</h2>
            </div>
            {expiringMembers.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                {expiringMembers.length} ta
              </span>
            )}
          </div>
          <div className="p-4 space-y-2">
            {loading && !data ? (
              [1,2,3].map(i => <div key={i} className="h-14 bg-sky-50 rounded-xl animate-pulse" />)
            ) : expiringMembers.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={28} className="mx-auto mb-2 text-amber-100" />
                <p className="text-slate-400 text-sm">Hech kim tugamaydi</p>
              </div>
            ) : (
              expiringMembers.map((m, i) => {
                const days = daysLeft(m.end_date);
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                    days <= 2
                      ? 'bg-red-50 border-red-100'
                      : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.plan_name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${days <= 2 ? 'text-red-600' : 'text-amber-600'}`}>
                        {days <= 0 ? 'Tugadi!' : `${days} kun`}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(m.end_date)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
