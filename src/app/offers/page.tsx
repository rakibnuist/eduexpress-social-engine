'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface Offer {
  id: number;
  destination: string;
  university: string;
  program_type: string;
  program_name: string;
  tuition_fee: string;
  scholarship: string;
  deadline: string;
  requirements: string;
  duration: string;
  language: string;
  accommodation: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
}

type OfferInput = Omit<Offer, 'id' | 'created_at' | 'updated_at' | 'status'>;

const DESTINATIONS = ['China', 'Korea', 'Spain', 'Croatia', 'Hungary', 'Europe'];
const PROGRAM_TYPES = ['Bachelor', 'Masters', 'Diploma', 'Language', 'PhD'];

const EMPTY_FORM: OfferInput = {
  destination: '',
  university: '',
  program_type: '',
  program_name: '',
  tuition_fee: '',
  scholarship: '',
  deadline: '',
  requirements: '',
  duration: '',
  language: '',
  accommodation: '',
  notes: '',
};

const inputCls =
  'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1';

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState('');
  const [form, setForm] = useState<OfferInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterDest, setFilterDest] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/offers');
      if (!res.ok) throw new Error('Failed to load offers');
      const data = await res.json();
      setOffers(data.offers || []);
      setLastRefresh(new Date().toLocaleTimeString());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId !== null) {
        await fetch(`/api/offers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      await fetchData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (o: Offer) => {
    setEditingId(o.id);
    setForm({
      destination: o.destination,
      university: o.university,
      program_type: o.program_type,
      program_name: o.program_name,
      tuition_fee: o.tuition_fee,
      scholarship: o.scholarship,
      deadline: o.deadline,
      requirements: o.requirements,
      duration: o.duration,
      language: o.language,
      accommodation: o.accommodation,
      notes: o.notes,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const filtered = useMemo(() => {
    return offers.filter(
      (o) =>
        (!filterDest || o.destination === filterDest) &&
        (!filterType || o.program_type === filterType)
    );
  }, [offers, filterDest, filterType]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">EduExpress · Offers Database</h1>
              <p className="text-xs text-slate-400">Manage university programs &amp; scholarships</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="text-blue-400 hover:text-blue-300">← Back to Dashboard</a>
            <span className="text-slate-400 text-xs">Refreshed: {lastRefresh || '...'}</span>
            <button
              onClick={fetchData}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 rounded-xl px-4 py-3 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Add / Edit Form */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            {editingId !== null ? `Edit Offer #${editingId}` : 'Add New Offer'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Destination</label>
              <select
                className={inputCls}
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                required
              >
                <option value="">Select…</option>
                {DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>University</label>
              <input className={inputCls} value={form.university}
                onChange={(e) => setForm({ ...form, university: e.target.value })}
                placeholder="e.g. Tsinghua University" />
            </div>
            <div>
              <label className={labelCls}>Program Type</label>
              <select className={inputCls} value={form.program_type}
                onChange={(e) => setForm({ ...form, program_type: e.target.value })} required>
                <option value="">Select…</option>
                {PROGRAM_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Program Name</label>
              <input className={inputCls} value={form.program_name}
                onChange={(e) => setForm({ ...form, program_name: e.target.value })}
                placeholder="e.g. BSc Computer Science" />
            </div>
            <div>
              <label className={labelCls}>Tuition Fee</label>
              <input className={inputCls} value={form.tuition_fee}
                onChange={(e) => setForm({ ...form, tuition_fee: e.target.value })}
                placeholder="e.g. $3,500/yr" />
            </div>
            <div>
              <label className={labelCls}>Scholarship</label>
              <input className={inputCls} value={form.scholarship}
                onChange={(e) => setForm({ ...form, scholarship: e.target.value })}
                placeholder="e.g. 50% merit" />
            </div>
            <div>
              <label className={labelCls}>Deadline</label>
              <input type="date" className={inputCls} value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Duration</label>
              <input className={inputCls} value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 4 years" />
            </div>
            <div>
              <label className={labelCls}>Language</label>
              <input className={inputCls} value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                placeholder="e.g. English / Chinese" />
            </div>
            <div>
              <label className={labelCls}>Accommodation</label>
              <input className={inputCls} value={form.accommodation}
                onChange={(e) => setForm({ ...form, accommodation: e.target.value })}
                placeholder="e.g. On-campus dorm" />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <label className={labelCls}>Requirements</label>
              <textarea className={inputCls} rows={2} value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                placeholder="Academic & language requirements" />
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea className={inputCls} rows={2} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Internal notes" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" disabled={submitting}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-semibold">
                {submitting ? 'Saving…' : editingId !== null ? 'Update Offer' : 'Add Offer'}
              </button>
              {editingId !== null && (
                <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-semibold">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Filters + Table */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              All Offers
              <span className="ml-2 text-slate-500 font-normal normal-case">
                ({filtered.length} of {offers.length})
              </span>
            </h2>
            <div className="flex gap-2">
              <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                value={filterDest} onChange={(e) => setFilterDest(e.target.value)}>
                <option value="">All Destinations</option>
                {DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">All Types</option>
                {PROGRAM_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-400 text-sm py-8 text-center">Loading offers…</p>
          ) : filtered.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No offers found. Add one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-700/50 text-slate-400">
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold">Destination</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold">University</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold">Type</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold">Program</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold">Tuition</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold">Scholarship</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold">Deadline</th>
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                      <td className="px-3 py-2 font-medium">{o.destination || '—'}</td>
                      <td className="px-3 py-2">{o.university || '—'}</td>
                      <td className="px-3 py-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-semibold">
                          {o.program_type || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2 max-w-[200px] truncate text-slate-300">{o.program_name || '—'}</td>
                      <td className="px-3 py-2 text-slate-300">{o.tuition_fee || '—'}</td>
                      <td className="px-3 py-2 text-emerald-400">{o.scholarship || '—'}</td>
                      <td className="px-3 py-2 font-mono text-xs">{o.deadline || '—'}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(o)}
                            className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                          <button onClick={() => handleDelete(o.id)}
                            className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}