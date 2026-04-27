'use client';

import { useEffect, useState } from 'react';
import {
  Users, BadgeCheck, Wallet, AlertTriangle,
  TrendingUp, Clock, RefreshCw, Settings,
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
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function daysLeft(date: string) {
  const diff = new Date(date).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  const initDb = async () => {
    try {
      await fetch('/api/init');
      setDbInitialized(true);
    } catch (e) {
      console.error('DB init error', e);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Dashboard fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initDb().then(fetchDashboard);
  }, []);

  const stats = data ? [
    {
      label: 'Faol A\'zolar',
      value: data.totalMembers,
      suffix: 'ta',
      icon: Users,
      color: 'sky',
      sub: `Jami: ${data.allMembers} ta`,
    },
    {
      label: 'Faol Obunalar',
      value: data.activeSubscriptions,
      suffix: 'ta',
      icon: BadgeCheck,
      color: 'emerald',
      sub: 'Hozir aktiv',
    },
    {
      label: 'Oylik Daromad',
      value: formatMoney(data.monthlyRevenue),
      suffix: '',
      icon: Wallet,
      color: 'violet',
      sub: 'Bu oy',
    },
    {
      label: 'Tugayapti',
      value: data.expiringSoon,
      suffix: 'ta',
      icon: AlertTriangle,
      color: 'amber',
      sub: '7 kun ichida',
    },
  ] : [];

  const colorMap: Record<string, string> = {
    sky: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
  };
  const colorBg: Record<string, string> = {
    sky: 'bg-sky-50 border-sky-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    violet: 'bg-violet-50 border-violet-100',
    amber: 'bg-amber-50 border-amber-100',
  };
  const colorText: Record<string, string> = {
    sky: 'text-sky-600',
    emerald: 'text-emerald-600',
    violet: 'text-violet-600',
    amber: 'text-amber-600',
  };

  return (
    <div className="space-y-6 lg:ml-0 ml-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">Boshqaruv paneli</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          {!dbInitialized && (
            <button
              onClick={initDb}
              className="flex items-center gap-2 bg-sky-100 text-sky-700 px-3 py-2 rounded-lg text-sm hover:bg-sky-200 transition"
            >
              <Settings size={15} />
              DB Sozla
            </button>
          )}
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 bg-white border border-sky-200 text-sky-600 px-3 py-2 rounded-lg text-sm hover:bg-sky-50 transition"
          >
            <RefreshCw size={15} />
            Yangilash
          </button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-sky-100 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl p-5 border ${colorBg[s.color]} shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-500 text-xs font-medium">{s.label}</p>
                <div className={`${colorMap[s.color]} p-2 rounded-xl`}>
                  <s.icon size={15} className="text-white" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${colorText[s.color]}`}>
                {s.value}{s.suffix && <span className="text-base ml-1">{s.suffix}</span>}
              </p>
              <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Payments */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-sky-50 flex items-center gap-2">
            <TrendingUp size={17} className="text-sky-600" />
            <h2 className="font-semibold text-sky-900">So'nggi to'lovlar</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-8 bg-sky-50 rounded animate-pulse" />)}
              </div>
            ) : data?.recentPayments.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-sm">To'lovlar mavjud emas</p>
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
                  {data?.recentPayments.map((p) => (
                    <tr key={p.id} className="border-t border-sky-50 hover:bg-sky-50/40 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-700">{p.member_name}</td>
                      <td className="px-3 py-3 text-slate-500 hidden sm:table-cell">{p.plan_name || '—'}</td>
                      <td className="px-3 py-3 font-semibold text-sky-700">{formatMoney(p.amount)}</td>
                      <td className="px-3 py-3 text-slate-400 hidden md:table-cell">{formatDate(p.payment_date)}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
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
          <div className="px-5 py-4 border-b border-sky-50 flex items-center gap-2">
            <Clock size={17} className="text-amber-500" />
            <h2 className="font-semibold text-sky-900">Tez tugaydigan</h2>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-14 bg-sky-50 rounded-xl animate-pulse" />)
            ) : data?.expiringMembers.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">Hech kim tugamaydi</p>
            ) : (
              data?.expiringMembers.map((m, i) => {
                const days = daysLeft(m.end_date);
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
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
