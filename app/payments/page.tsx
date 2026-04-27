'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Trash2, X, CreditCard, Filter,
  Wallet, TrendingUp, CheckCircle, XCircle, Edit2,
} from 'lucide-react';

interface Payment {
  id: number;
  member_id: number;
  member_name: string;
  plan_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  notes: string;
  subscription_id: number;
}

interface Member {
  id: number;
  name: string;
  phone: string;
}

interface Subscription {
  id: number;
  plan_name: string;
  end_date: string;
}

const methodLabels: Record<string, string> = {
  cash: 'Naqd',
  card: 'Karta',
  transfer: 'O\'tkazma',
  other: 'Boshqa',
};

const emptyForm = {
  member_id: '',
  subscription_id: '',
  amount: '',
  payment_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  status: 'completed',
  notes: '',
};

function formatDate(d: string) {
  if (!d) return '—';
  return (() => { const dt = new Date(d); return String(dt.getDate()).padStart(2,'0') + '.' + String(dt.getMonth()+1).padStart(2,'0') + '.' + dt.getFullYear(); })();
}

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU') + ' so\'m';
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSubs, setMemberSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [summary, setSummary] = useState({ total: 0, completed: 0, count: 0 });

  const fetchPayments = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterMonth) params.set('month', filterMonth);
    if (filterStatus) params.set('status', filterStatus);
    const res = await fetch(`/api/payments?${params}`);
    const data: Payment[] = await res.json();
    setPayments(Array.isArray(data) ? data : []);
    const completed = data.filter((p: Payment) => p.status === 'completed');
    setSummary({
      total: data.reduce((s: number, p: Payment) => s + Number(p.amount), 0),
      completed: completed.reduce((s: number, p: Payment) => s + Number(p.amount), 0),
      count: data.length,
    });
    setLoading(false);
  };

  const fetchMembers = async () => {
    const res = await fetch('/api/members');
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
  };

  const fetchMemberSubs = async (memberId: string) => {
    if (!memberId) return setMemberSubs([]);
    const res = await fetch(`/api/payments?member_id=${memberId}`);
    const res2 = await fetch(`/api/members/${memberId}`);
    const data = await res2.json();
    setMemberSubs(data.subscriptions || []);
  };

  useEffect(() => { fetchPayments(); }, [filterMonth, filterStatus]);
  useEffect(() => { fetchMembers(); }, []);

  const openAdd = () => {
    setEditPayment(null);
    setForm({ ...emptyForm });
    setMemberSubs([]);
    setShowModal(true);
  };

  const openEdit = (p: Payment) => {
    setEditPayment(p);
    setForm({
      member_id: String(p.member_id),
      subscription_id: String(p.subscription_id || ''),
      amount: String(p.amount),
      payment_date: p.payment_date?.split('T')[0] || '',
      payment_method: p.payment_method,
      status: p.status,
      notes: p.notes || '',
    });
    fetchMemberSubs(String(p.member_id));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.member_id || !form.amount) return;
    setSaving(true);
    try {
      const body = {
        member_id: parseInt(form.member_id),
        subscription_id: form.subscription_id ? parseInt(form.subscription_id) : null,
        amount: parseFloat(form.amount),
        payment_date: form.payment_date,
        payment_method: form.payment_method,
        status: form.status,
        notes: form.notes,
      };
      if (editPayment) {
        await fetch(`/api/payments/${editPayment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      setShowModal(false);
      fetchPayments();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/payments/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchPayments();
  };

  return (
    <div className="space-y-5 lg:ml-0 ml-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">To'lovlar</h1>
          <p className="text-slate-500 text-sm mt-0.5">To'lovlarni kuzatish va boshqarish</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
        >
          <Plus size={16} />
          To'lov qo'shish
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-sky-100 p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-sky-100 p-3 rounded-xl">
            <Wallet size={20} className="text-sky-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Jami summa</p>
            <p className="font-bold text-sky-700">{formatMoney(summary.total)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Tasdiqlangan</p>
            <p className="font-bold text-emerald-700">{formatMoney(summary.completed)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-violet-100 p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-violet-100 p-3 rounded-xl">
            <CreditCard size={20} className="text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">To'lovlar soni</p>
            <p className="font-bold text-violet-700">{summary.count} ta</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-sky-100 p-4 flex flex-wrap gap-3 items-center">
        <Filter size={15} className="text-slate-400" />
        <div>
          <label className="text-xs text-slate-500 mr-2">Oy:</label>
          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="border border-sky-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mr-2">Holat:</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-sky-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="">Barchasi</option>
            <option value="completed">Tasdiqlangan</option>
            <option value="cancelled">Bekor qilingan</option>
          </select>
        </div>
        {(filterMonth || filterStatus) && (
          <button
            onClick={() => { setFilterMonth(''); setFilterStatus(''); }}
            className="text-xs text-sky-600 hover:underline flex items-center gap-1"
          >
            <X size={12} />Filtrni tozalash
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-sky-50 rounded-xl animate-pulse" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-14">
              <CreditCard size={36} className="text-sky-200 mx-auto mb-3" />
              <p className="text-slate-400">To'lovlar topilmadi</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sky-50/70 border-b border-sky-100">
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-semibold">A'zo</th>
                  <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold hidden md:table-cell">Reja</th>
                  <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold">Summa</th>
                  <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold hidden sm:table-cell">Usul</th>
                  <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold hidden md:table-cell">Sana</th>
                  <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold">Holat</th>
                  <th className="text-right px-5 py-3 text-xs text-slate-500 font-semibold">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-t border-sky-50 hover:bg-sky-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-700">{p.member_name}</td>
                    <td className="px-3 py-3.5 text-slate-500 hidden md:table-cell">{p.plan_name || '—'}</td>
                    <td className="px-3 py-3.5 font-bold text-sky-700">{formatMoney(p.amount)}</td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-xs rounded-full">
                        {methodLabels[p.payment_method] || p.payment_method}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-400 text-xs hidden md:table-cell">{formatDate(p.payment_date)}</td>
                    <td className="px-3 py-3.5">
                      {p.status === 'completed'
                        ? <span className="flex items-center gap-1 text-emerald-700 text-xs"><CheckCircle size={13} />Tasdiqlangan</span>
                        : <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle size={13} />Bekor</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100">
              <h2 className="text-lg font-bold text-sky-900">
                {editPayment ? 'To\'lovni tahrirlash' : 'Yangi to\'lov'}
              </h2>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">A'zo *</label>
                <select
                  value={form.member_id}
                  onChange={e => { setForm(f => ({ ...f, member_id: e.target.value, subscription_id: '' })); fetchMemberSubs(e.target.value); }}
                  className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="">A'zoni tanlang...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name} {m.phone && `(${m.phone})`}</option>)}
                </select>
              </div>
              {memberSubs.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Obuna (ixtiyoriy)</label>
                  <select value={form.subscription_id} onChange={e => setForm(f => ({ ...f, subscription_id: e.target.value }))}
                    className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                    <option value="">Tanlang...</option>
                    {memberSubs.map((s: Subscription) => (
                      <option key={s.id} value={s.id}>{s.plan_name} (tugaydi: {formatDate(s.end_date)})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Summa (so'm) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="150000"
                    className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sana</label>
                  <input type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
                    className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">To'lov usuli</label>
                  <select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                    className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                    <option value="cash">Naqd</option>
                    <option value="card">Karta</option>
                    <option value="transfer">O'tkazma</option>
                    <option value="other">Boshqa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Holat</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400">
                    <option value="completed">Tasdiqlangan</option>
                    <option value="cancelled">Bekor qilingan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Izoh</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Qo'shimcha ma'lumot..."
                  className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-sky-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm">Bekor</button>
              <button onClick={handleSave} disabled={saving || !form.member_id || !form.amount}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white rounded-xl text-sm font-medium">
                {saving ? 'Saqlanmoqda...' : (editPayment ? 'Saqlash' : 'Qo\'shish')}
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
            <h3 className="font-bold text-slate-800 mb-2">To'lovni o'chirish</h3>
            <p className="text-slate-500 text-sm mb-6">Bu to'lov ma'lumoti o'chib ketadi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm">Bekor</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
