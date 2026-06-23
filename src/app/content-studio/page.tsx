'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface CalendarItem {
  id: number;
  date: string;
  platform: string;
  content_type: string;
  caption: string;
  status: string;
  assigned_to: string;
  notes: string;
  content_package_id: number | null;
  post_time: string;
  drive_folder_url: string;
  created_at: string;
  updated_at: string;
}

interface ContentPackage {
  id: number;
  calendar_id: number | null;
  caption_bangla: string;
  caption_english: string;
  caption_mixed: string;
  hashtags: string;
  post_time: string;
  platform: string;
  content_type: string;
  copy_approved: number;
  design_approved: number;
  video_approved: number;
  ready_to_post: number;
  posted: number;
  posted_at: string;
  post_url: string;
  engagement_likes: string;
  engagement_comments: string;
  engagement_shares: string;
  performance_score: string;
  poster_guidelines: string;
  video_script: string;
  video_guidelines: string;
  cta: string;
  drive_folder_url: string;
  created_at: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  Facebook: 'bg-blue-600 text-white',
  Instagram: 'bg-pink-600 text-white',
  TikTok: 'bg-gray-900 text-white border border-slate-500',
  LinkedIn: 'bg-blue-800 text-white',
  Twitter: 'bg-sky-500 text-white',
};

const FLOW_STAGES = ['draft', 'copy_approved', 'design_approved', 'ready', 'posted'] as const;
type Stage = typeof FLOW_STAGES[number];

const STAGE_LABELS: Record<Stage, string> = {
  draft: 'Draft',
  copy_approved: 'Copy ✓',
  design_approved: 'Design ✓',
  ready: 'Ready',
  posted: 'Posted',
};

function currentStage(pkg: ContentPackage | null, calStatus: string): Stage {
  if (!pkg) return 'draft';
  if (pkg.posted) return 'posted';
  if (pkg.ready_to_post) return 'ready';
  if (pkg.design_approved) return 'design_approved';
  if (pkg.copy_approved) return 'copy_approved';
  return 'draft';
}

const cardCls = 'bg-slate-800 rounded-xl border border-slate-700 p-5';
const inputCls =
  'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function ContentStudioPage() {
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);
  const [packages, setPackages] = useState<ContentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([
        fetch('/api/calendar').then((r) => r.json()),
        fetch('/api/content-packages').then((r) => r.json()),
      ]);
      setCalendar(c.calendar || []);
      setPackages(p.packages || []);
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

  const packageByCalendarId = useMemo(() => {
    const map = new Map<number, ContentPackage>();
    for (const p of packages) {
      if (p.calendar_id != null && !map.has(p.calendar_id)) map.set(p.calendar_id, p);
    }
    return map;
  }, [packages]);

  const packageById = useMemo(() => {
    const m = new Map<number, ContentPackage>();
    for (const p of packages) m.set(p.id, p);
    return m;
  }, [packages]);

  const generatePackage = async (item: CalendarItem) => {
    setBusy(item.id);
    try {
      // Create an initial draft package seeded from the calendar item.
      const payload: Partial<ContentPackage> = {
        calendar_id: item.id,
        platform: item.platform,
        content_type: item.content_type,
        caption_english: item.caption,
        caption_bangla: '',
        caption_mixed: item.caption,
        hashtags: '',
        post_time: item.post_time || '',
        poster_guidelines: '',
        video_script: '',
        video_guidelines: '',
        cta: '',
        copy_approved: 0,
        design_approved: 0,
        video_approved: 0,
        ready_to_post: 0,
        posted: 0,
      };
      const res = await fetch('/api/content-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create package');
      // Link calendar to package.
      const data = await res.json();
      const pkgId = data.package?.id;
      if (pkgId) {
        await fetch('/api/calendar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, notes: `Package #${pkgId} generated` }),
        });
      }
      setExpandedId(item.id);
      await fetchData();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const toggleApproval = async (pkg: ContentPackage, field: 'copy_approved' | 'design_approved' | 'video_approved' | 'ready_to_post') => {
    try {
      const newVal = pkg[field] ? 0 : 1;
      let body: any = { [field]: newVal };
      // If marking ready, also ensure advanced stages clear posted flags? keep posted as-is.
      await fetch(`/api/content-packages/${pkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await fetchData();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const markPosted = async (pkg: ContentPackage) => {
    try {
      await fetch(`/api/content-packages/${pkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posted: 1, posted_at: new Date().toISOString() }),
      });
      await fetchData();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const needsPackage = (item: CalendarItem): boolean => {
    return !packageByCalendarId.has(item.id) && item.content_package_id == null;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">EduExpress · Content Studio</h1>
              <p className="text-xs text-slate-400">Generate packages &amp; approve content</p>
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

        {/* Status flow legend */}
        <section className={cardCls}>
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Approval Flow</h2>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {FLOW_STAGES.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full font-semibold bg-slate-700 text-slate-200">{STAGE_LABELS[s]}</span>
                {i < FLOW_STAGES.length - 1 && <span className="text-slate-500">→</span>}
              </div>
            ))}
          </div>
        </section>

        {loading ? (
          <p className="text-slate-400 text-sm py-8 text-center">Loading calendar…</p>
        ) : calendar.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No calendar items yet.</p>
        ) : (
          <div className="space-y-3">
            {calendar.map((item) => {
              const pkg = packageByCalendarId.get(item.id) || (item.content_package_id ? packageById.get(item.content_package_id) : undefined) || null;
              const stage = currentStage(pkg, item.status);
              const stageIdx = FLOW_STAGES.indexOf(stage);
              const isOpen = expandedId === item.id;
              const needsPkg = needsPackage(item);
              return (
                <div key={item.id} className={`${cardCls} ${needsPkg ? 'border-amber-600/60' : ''}`}>
                  {/* Calendar item header */}
                  <div className="flex flex-wrap items-start gap-3 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${PLATFORM_COLORS[item.platform] || 'bg-slate-700 text-slate-200'}`}>
                          {item.platform}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{item.date}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">{item.content_type}</span>
                        {needsPkg && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 font-bold">NEEDS PACKAGE</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-200 mt-2 line-clamp-2">{item.caption}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {needsPkg ? (
                        <button
                          disabled={busy === item.id}
                          onClick={() => generatePackage(item)}
                          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          {busy === item.id ? 'Generating…' : '⚡ Generate Package'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setExpandedId(isOpen ? null : item.id)}
                          className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          {isOpen ? 'Hide' : 'View Package'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Flow visualization */}
                  {pkg && (
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      {FLOW_STAGES.map((s, i) => {
                        const active = i <= stageIdx;
                        return (
                          <div key={s} className="flex items-center gap-2">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                              active
                                ? s === 'posted' ? 'bg-blue-600 text-white'
                                  : s === 'ready' ? 'bg-green-600 text-white'
                                  : 'bg-blue-700 text-white'
                                : 'bg-slate-700 text-slate-400'
                            }`}>
                              {STAGE_LABELS[s]}
                            </span>
                            {i < FLOW_STAGES.length - 1 && <span className="text-slate-600">→</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Expanded package */}
                  {pkg && isOpen && (
                    <div className="mt-5 pt-5 border-t border-slate-700 space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <PackageField label="Caption (English)" value={pkg.caption_english} />
                        <PackageField label="Caption (Bangla)" value={pkg.caption_bangla} />
                        <PackageField label="Caption (Mixed)" value={pkg.caption_mixed} />
                        <PackageField label="Hashtags" value={pkg.hashtags} mono />
                        <PackageField label="CTA" value={pkg.cta} />
                        <PackageField label="Post Time" value={pkg.post_time} mono />
                        <PackageField label="Poster Guidelines" value={pkg.poster_guidelines} full />
                        <PackageField label="Video Script" value={pkg.video_script} full />
                        <PackageField label="Video Guidelines" value={pkg.video_guidelines} full />
                      </div>

                      {/* Approval checkboxes */}
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Approvals</h3>
                        <div className="flex flex-wrap gap-5">
                          {(['copy_approved', 'design_approved', 'video_approved', 'ready_to_post'] as const).map((f) => (
                            <label key={f} className="flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={!!pkg[f]}
                                onChange={() => toggleApproval(pkg, f)}
                                className="w-4 h-4 accent-blue-500"
                              />
                              <span className="capitalize text-slate-200">{f.replace(/_/g, ' ')}</span>
                            </label>
                          ))}
                        </div>
                        {!pkg.posted ? (
                          <button
                            onClick={() => markPosted(pkg)}
                            disabled={!pkg.ready_to_post}
                            className="mt-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-4 py-2 rounded-lg text-xs font-semibold"
                          >
                            ✓ Mark as Posted
                          </button>
                        ) : (
                          <div className="mt-3 text-xs text-green-400 font-semibold">✓ Posted {pkg.posted_at && `on ${new Date(pkg.posted_at).toLocaleString()}`}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function PackageField({ label, value, mono, full }: { label: string; value: string; mono?: boolean; full?: boolean }) {
  return (
    <div className={full ? 'lg:col-span-2' : ''}>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`bg-slate-900/40 rounded-lg border border-slate-700/60 p-3 text-sm text-slate-200 min-h-[44px] whitespace-pre-wrap ${mono ? 'font-mono text-xs' : ''}`}>
        {value || <span className="text-slate-500 italic">—</span>}
      </div>
    </div>
  );
}