'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Edit2, Trash2, X, BadgeCheck, Users,
  Calendar, DollarSign, Tag,
} from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  price: number;
  duration_days: number;
  description: string;
  is_active: boolean;
}

interface Subscription {
  id: number;
  member_name: string;
  member_phone: string;
  plan_name: string;
  plan_price: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface Member {
  id: number;
  name: string;
  phone: string;
}

const emptyPlanForm = { name: '', price: '', duration_days: '', description: '' };
const emptySubForm = { member_id: '', plan_id: '', start_date: new Date().toISOString().split('T')[0] };

function formatDate(d: string) {
  if (!d) return '—';
  return (() => { const dt = new Date(d); return String(dt.getDate()).padStart(2,'0') + '.' + String(dt.getMonth()+1).padStart(2,'0') + '.' + dt.getFullYear(); })();
}

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU') + ' so\'m';
}

function daysLeft(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tab, setTab] = useState<'plans' | 'active'>('active');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({ ...emptyPlanForm });
  const [subForm, setSubForm] = useState({ ...emptySubForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<{ id: number; type: 'plan' | 'sub' } | null>(null);

  const fetchAll = async () => {
    const [plansRes, subsRes, membersRes] = await Promise.all([
      fetch('/api/subscriptions?type=plans'),
      fetch('/api/subscriptions'),
      fetch('/api/members'),
    ]);
    setPlans(await plansRes.json());
    setSubscriptions(await subsRes.json());
    const allMembers = await membersRes.json();
    setMembers(Array.isArray(allMembers) ? allMembers : []);
  };

  useEffect(() => { fetchAll(); }, []);

  const openAddPlan = () => {
    setEditPlan(null);
    setPlanForm({ ...emptyPlanForm });
    setShowPlanModal(true);
  };

  const openEditPlan = (p: Plan) => {
    setEditPlan(p);
    setPlanForm({ name: p.name, price: String(p.price), duration_days: String(p.duration_days), description: p.description || '' });
    setShowPlanModal(true);
  };

  const savePlan = async () => {
    if (!planForm.name || !planForm.price || !planForm.duration_days) return;
    setSaving(true);
    try {
      if (editPlan) {
        await fetch(`/api/subscriptions/${editPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...planForm, price: parseFloat(planForm.price), duration_days: parseInt(planForm.duration_days) }),
        });
      } else {
        await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'plan', ...planForm, price: parseFloat(planForm.price), duration_days: parseInt(planForm.duration_days) }),
        });
      }
      setShowPlanModal(false);
      fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const saveSub = async () => {
    if (!subForm.member_id || !subForm.plan_id || !subForm.start_date) return;
    setSaving(true);
    try {
      await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: parseInt(subForm.member_id), plan_id: parseInt(subForm.plan_id), start_date: subForm.start_date }),
      });
      setShowSubModal(false);
      setSubForm({ ...emptySubForm });
      fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    if (deleteId.type === 'plan') {
      await fetch(`/api/subscriptions/${deleteId.id}?type=plan`, { method: 'DELETE' });
    } else {
      await fetch(`/api/subscriptions/${deleteId.id}`, { method: 'DELETE' });
    }
    setDeleteId(null);
    fetchAll();
  };

  const subStatusBadge = (s: Subscription) => {
    if (s.status !== 'active') return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">Tugagan</span>;
    const days = daysLeft(s.end_date);
    if (days <= 0) return <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Muddati o'tgan</span>;
    if (days <= 7) return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">{days} kun qoldi</span>;
    return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">Aktiv ({days} kun)</span>;
  };

  return (
    <div className="space-y-5 lg:ml-0 ml-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">Obunalar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Obuna rejalari va a'zo obunalari</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAddPlan}
            className="flex items-center gap-2 bg-white border border-sky-200 text-sky-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-sky-50 transition shadow-sm"
          >
            <Tag size={15} />
            Yangi reja
          </button>
          <button
            onClick={() => setShowSubModal(true)}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
          >
            <Plus size={16} />
            Obuna berish
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white border border-sky-100 rounded-xl p-1 w-fit">
        {(['active', 'plans'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-sky-700'
            }`}
          >
            {t === 'active' ? (
              <span className="flex items-center gap-1.5"><Users size={14} />Faol obunalar</span>
            ) : (
              <span className="flex items-center gap-1.5"><Tag size={14} />Rejalar</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plans.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-sky-100 p-2.5 rounded-xl">
                  <BadgeCheck size={18} className="text-sky-600" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditPlan(p)} className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-lg">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteId({ id: p.id, type: 'plan' })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-sky-900 mb-1">{p.name}</h3>
              {p.description && <p className="text-xs text-slate-500 mb-3">{p.description}</p>}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-sky-50">
                <div className="flex items-center gap-1 text-sky-700 font-bold">
                  <DollarSign size={14} />
                  {formatMoney(p.price)}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />
                  {p.duration_days} kun
                </div>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <Tag size={36} className="mx-auto mb-3 text-sky-200" />
              <p>Rejalar mavjud emas</p>
            </div>
          )}
        </div>
      )}

      {tab === 'active' && (
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {subscriptions.length === 0 ? (
              <div className="text-center py-14 text-slate-400">
                <BadgeCheck size={36} className="mx-auto mb-3 text-sky-200" />
                <p>Faol obunalar mavjud emas</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sky-50/70 border-b border-sky-100">
                    <th className="text-left px-5 py-3 text-xs text-slate-500 font-semibold">A'zo</th>
                    <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold hidden md:table-cell">Reja</th>
                    <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold hidden sm:table-cell">Boshlandi</th>
                    <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold">Tugaydi</th>
                    <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold">Holat</th>
                    <th className="text-right px-5 py-3 text-xs text-slate-500 font-semibold">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(s => (
                    <tr key={s.id} className="border-t border-sky-50 hover:bg-sky-50/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-700">{s.member_name}</p>
                        <p className="text-xs text-slate-400">{s.member_phone}</p>
                      </td>
                      <td className="px-3 py-3.5 hidden md:table-cell">
                        <span className="text-slate-600">{s.plan_name}</span>
                        <p className="text-xs text-sky-600 font-medium">{formatMoney(s.plan_price)}</p>
                      </td>
                      <td className="px-3 py-3.5 text-slate-500 hidden sm:table-cell">{formatDate(s.start_date)}</td>
                      <td className="px-3 py-3.5 text-slate-600">{formatDate(s.end_date)}</td>
                      <td className="px-3 py-3.5">{subStatusBadge(s)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setDeleteId({ id: s.id, type: 'sub' })}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100">
              <h2 className="text-lg font-bold text-sky-900">{editPlan ? 'Rejani tahrirlash' : 'Yangi reja'}</h2>
              <button onClick={() => setShowPlanModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reja nomi *</label>
                <input value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Oylik Premium" className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Narx (so'm) *</label>
                  <input type="number" value={planForm.price} onChange={e => setPlanForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="250000" className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Muddat (kun) *</label>
                  <input type="number" value={planForm.duration_days} onChange={e => setPlanForm(f => ({ ...f, duration_days: e.target.value }))}
                    placeholder="30" className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tavsif</label>
                <textarea value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Reja haqida qisqacha..."
                  className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-sky-100 flex gap-3 justify-end">
              <button onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm">Bekor</button>
              <button onClick={savePlan} disabled={saving}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white rounded-xl text-sm font-medium">
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Sub Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100">
              <h2 className="text-lg font-bold text-sky-900">A'zoga obuna berish</h2>
              <button onClick={() => setShowSubModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">A'zo *</label>
                <select value={subForm.member_id} onChange={e => setSubForm(f => ({ ...f, member_id: e.target.value }))}
                  className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                  <option value="">A'zoni tanlang...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name} {m.phone && `(${m.phone})`}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Obuna rejasi *</label>
                <select value={subForm.plan_id} onChange={e => setSubForm(f => ({ ...f, plan_id: e.target.value }))}
                  className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                  <option value="">Rejani tanlang...</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} — {formatMoney(p.price)} ({p.duration_days} kun)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Boshlanish sanasi *</label>
                <input type="date" value={subForm.start_date} onChange={e => setSubForm(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-sky-100 flex gap-3 justify-end">
              <button onClick={() => setShowSubModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm">Bekor</button>
              <button onClick={saveSub} disabled={saving || !subForm.member_id || !subForm.plan_id}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white rounded-xl text-sm font-medium">
                {saving ? 'Saqlanmoqda...' : 'Tayinlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="font-bold text-slate-800 mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-slate-500 text-sm mb-6">
              {deleteId.type === 'plan' ? 'Bu rejani o\'chirasizmi?' : 'Bu obunani o\'chirasizmi?'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm">Bekor</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
