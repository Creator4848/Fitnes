'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, User, Phone, Mail, X, CheckCircle, XCircle, Filter } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  birth_date: string;
  join_date: string;
  status: string;
  notes: string;
  subscription_end: string;
  subscription_status: string;
  plan_name: string;
}

const emptyForm = {
  name: '', phone: '', email: '', address: '', birth_date: '', notes: '', status: 'active',
};

function formatDate(d: string) {
  if (!d) return '—';
  return (() => { const dt = new Date(d); return String(dt.getDate()).padStart(2,'0') + '.' + String(dt.getMonth()+1).padStart(2,'0') + '.' + dt.getFullYear(); })();
}

function daysLeft(d: string) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/members?${params}`);
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, [search, statusFilter]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (m: Member) => {
    setEditId(m.id);
    setForm({
      name: m.name || '',
      phone: m.phone || '',
      email: m.email || '',
      address: m.address || '',
      birth_date: m.birth_date ? m.birth_date.split('T')[0] : '',
      notes: m.notes || '',
      status: m.status || 'active',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await fetch(`/api/members/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setShowModal(false);
      fetchMembers();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/members/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchMembers();
  };

  const subBadge = (m: Member) => {
    if (!m.subscription_status || m.subscription_status !== 'active') {
      return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">Obuna yo'q</span>;
    }
    const days = daysLeft(m.subscription_end);
    if (days !== null && days <= 0) {
      return <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Tugagan</span>;
    }
    if (days !== null && days <= 7) {
      return <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs rounded-full">{days} kun qoldi</span>;
    }
    return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">{m.plan_name || 'Aktiv'}</span>;
  };

  return (
    <div className="space-y-5 lg:ml-0 ml-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">A'zolar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Fitnes markazi a'zolari ro'yxati</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Yangi a'zo
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-sky-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ism, telefon yoki email bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2 border border-sky-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-sky-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 text-slate-600"
          >
            <option value="">Barchasi</option>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </select>
        </div>
        <span className="text-sm text-slate-400">{members.length} ta a'zo</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-sky-50 rounded-xl animate-pulse" />)}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-16">
              <User size={40} className="text-sky-200 mx-auto mb-3" />
              <p className="text-slate-400">A'zolar topilmadi</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sky-50/70 border-b border-sky-100">
                  <th className="text-left px-5 py-3 text-xs text-slate-500 font-semibold">A'zo</th>
                  <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold hidden md:table-cell">Telefon</th>
                  <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold hidden lg:table-cell">Email</th>
                  <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold">Obuna</th>
                  <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold">Holat</th>
                  <th className="text-left px-3 py-3 text-xs text-slate-500 font-semibold hidden md:table-cell">Qo'shilgan</th>
                  <th className="text-right px-5 py-3 text-xs text-slate-500 font-semibold">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} className="border-t border-sky-50 hover:bg-sky-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sky-700 text-xs font-bold">{m.name[0].toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-slate-700">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-500 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" />
                        {m.phone || '—'}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-500 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        {m.email || '—'}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">{subBadge(m)}</td>
                    <td className="px-3 py-3.5">
                      {m.status === 'active'
                        ? <span className="flex items-center gap-1 text-emerald-700"><CheckCircle size={13} />Faol</span>
                        : <span className="flex items-center gap-1 text-slate-400"><XCircle size={13} />Nofaol</span>
                      }
                    </td>
                    <td className="px-3 py-3.5 text-slate-400 text-xs hidden md:table-cell">{formatDate(m.join_date)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(m)} className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(m.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
                {editId ? 'A\'zoni tahrirlash' : 'Yangi a\'zo qo\'shish'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ism Familiya *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Abdullayev Jasur"
                  className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Telefon</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+998 90 123 45 67"
                    className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                  <input
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tug'ilgan sana</label>
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))}
                    className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Holat</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Manzil</label>
                <input
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Toshkent, Yunusobod tumani"
                  className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Izoh</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Qo'shimcha ma'lumotlar..."
                  className="w-full border border-sky-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-sky-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm transition-colors">
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {saving ? 'Saqlanmoqda...' : (editId ? 'Saqlash' : 'Qo\'shish')}
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
            <h3 className="font-bold text-slate-800 mb-2">A'zoni o'chirish</h3>
            <p className="text-slate-500 text-sm mb-6">Bu amalni qaytarib bo'lmaydi. Barcha obunalar va to'lovlar ham o'chib ketadi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition">
                Bekor
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition font-medium">
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
