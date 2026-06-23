'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface Competitor {
  id: number;
  name: string;
  fb_url: string;
  fb_username: string;
  fb_followers: string;
  ig_url: string;
  target_countries: string;
  active_ads: string;
  last_post_date: string;
  last_post_topic: string;
  monitoring_status: string;
  last_scanned: string;
  notes: string;
}

const EDUEXPRESS_DESTINATIONS = ['China', 'Korea', 'Spain', 'Croatia', 'Hungary', 'Europe'];

const inputCls =
  'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1';

type SortKey = 'name' | 'fb_followers' | 'last_post_date' | 'last_post_topic' | 'target_countries' | 'active_ads';

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', fb_url: '', ig_url: '', target_countries: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/competitors');
      if (!res.ok) throw new Error('Failed to load competitors');
      const data = await res.json();
      setCompetitors(data.competitors || []);
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

  const parseFollowers = (s: string): number => {
    if (!s) return 0;
    const m = s.toLowerCase().replace(/,/g, '');
    const num = parseFloat(m);
    if (isNaN(num)) return 0;
    if (m.includes('k')) return num * 1_000;
    if (m.includes('m')) return num * 1_000_000;
    return num;
  };

  const isDirect = (c: Competitor): boolean => {
    const countries = (c.target_countries || '').toLowerCase();
    return EDUEXPRESS_DESTINATIONS.some((d) => countries.includes(d.toLowerCase()));
  };

  const sorted = useMemo(() => {
    const filtered = competitors.filter((c) => {
      const q = search.toLowerCase();
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.target_countries.toLowerCase().includes(q) ||
        c.last_post_topic.toLowerCase().includes(q)
      );
    });
    const cmp = (a: Competitor, b: Competitor) => {
      let av: string | number = a[sortKey];
      let bv: string | number = b[sortKey];
      if (sortKey === 'fb_followers') {
        av = parseFollowers(a.fb_followers);
        bv = parseFollowers(b.fb_followers);
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return av.localeCompare(bv) * (sortAsc ? 1 : -1);
      }
      return ((av as number) - (bv as number)) * (sortAsc ? 1 : -1);
    };
    return [...filtered].sort(cmp);
  }, [competitors, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ name: '', fb_url: '', ig_url: '', target_countries: '' });
      setShowForm(false);
      await fetchData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const directCount = competitors.filter(isDirect).length;

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      onClick={() => toggleSort(k)}
      className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold cursor-pointer hover:text-slate-200 select-none"
    >
      {label} {sortKey === k ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕵️</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">EduExpress · Competitor Intelligence</h1>
              <p className="text-xs text-slate-400">Track rival agencies &amp; content</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="text-blue-400 hover:text-blue-300">← Back to Dashboard</a>
            <span className="text-slate-400 text-xs">Refreshed: {lastRefresh || '...'}</span>
            <button onClick={fetchData}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-sm font-medium">
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

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Tracked</div>
            <div className="text-2xl font-extrabold text-white">{competitors.length}</div>
          </div>
          <div className="bg-red-900/30 rounded-xl border border-red-700/50 p-4">
            <div className="text-[10px] uppercase tracking-wider text-red-300 font-semibold">Direct Competitors</div>
            <div className="text-2xl font-extrabold text-red-300">{directCount}</div>
          </div>
          <div className="bg-amber-900/30 rounded-xl border border-amber-700/50 p-4">
            <div className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">Indirect</div>
            <div className="text-2xl font-extrabold text-amber-300">{competitors.length - directCount}</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center justify-center">
            <button onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold w-full">
              {showForm ? 'Close Form' : '+ Add Competitor'}
            </button>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <section className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Add New Competitor</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Name *</label>
                <input className={inputCls} required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Agency name" />
              </div>
              <div>
                <label className={labelCls}>Facebook URL</label>
                <input className={inputCls} value={form.fb_url}
                  onChange={(e) => setForm({ ...form, fb_url: e.target.value })}
                  placeholder="https://facebook.com/…" />
              </div>
              <div>
                <label className={labelCls}>Instagram URL</label>
                <input className={inputCls} value={form.ig_url}
                  onChange={(e) => setForm({ ...form, ig_url: e.target.value })}
                  placeholder="https://instagram.com/…" />
              </div>
              <div>
                <label className={labelCls}>Target Countries</label>
                <input className={inputCls} value={form.target_countries}
                  onChange={(e) => setForm({ ...form, target_countries: e.target.value })}
                  placeholder="China, Korea, …" />
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <button type="submit" disabled={submitting}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-semibold">
                  {submitting ? 'Adding…' : 'Add Competitor'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Search + Table */}
        <section className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Competitor Table</h2>
            <input
              type="text"
              placeholder="🔍 Search name / country / topic…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <p className="text-slate-400 text-sm py-8 text-center">Loading competitors…</p>
          ) : sorted.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No competitors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-700/50 text-slate-400">
                    <SortHeader k="name" label="Name" />
                    <SortHeader k="fb_followers" label="FB Followers" />
                    <SortHeader k="target_countries" label="Target Countries" />
                    <SortHeader k="active_ads" label="Active Ads" />
                    <SortHeader k="last_post_date" label="Last Post" />
                    <SortHeader k="last_post_topic" label="Last Topic" />
                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-bold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c) => {
                    const direct = isDirect(c);
                    return (
                      <tr key={c.id}
                        className={`border-t border-slate-700 ${
                          direct
                            ? 'bg-red-900/30 hover:bg-red-900/40'
                            : 'bg-amber-900/20 hover:bg-amber-900/30'
                        }`}>
                        <td className="px-3 py-2 font-medium text-white">
                          {c.name}
                          {c.fb_url && (
                            <a href={c.fb_url} target="_blank" rel="noreferrer"
                              className="ml-2 text-xs text-blue-400 hover:underline">FB↗</a>
                          )}
                          {c.ig_url && (
                            <a href={c.ig_url} target="_blank" rel="noreferrer"
                              className="ml-1 text-xs text-pink-400 hover:underline">IG↗</a>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-300">{c.fb_followers || '—'}</td>
                        <td className="px-3 py-2 text-slate-300">{c.target_countries || '—'}</td>
                        <td className="px-3 py-2 text-slate-300">{c.active_ads || '—'}</td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-300">{c.last_post_date || '—'}</td>
                        <td className="px-3 py-2 max-w-[260px] truncate text-slate-300">{c.last_post_topic || '—'}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            direct ? 'bg-red-700 text-red-100' : 'bg-amber-700 text-amber-100'
                          }`}>
                            {direct ? 'DIRECT' : 'INDIRECT'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}