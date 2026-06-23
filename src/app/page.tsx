'use client';

import { useState, useEffect, useCallback } from 'react';

// Types
interface Metric {
  id: number;
  category: string;
  name: string;
  value: string;
  delta: string;
  icon: string;
  updated_at: string;
}

interface CalendarItem {
  id: number;
  date: string;
  platform: string;
  content_type: string;
  caption: string;
  status: string;
  assigned_to: string;
  notes: string;
  updated_at: string;
}

interface Alert {
  id: number;
  competitor: string;
  alert_type: string;
  description: string;
  severity: string;
  source_url: string;
  created_at: string;
  resolved: number;
}

interface Trend {
  id: number;
  title: string;
  description: string;
  opportunity: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AgentLog {
  id: number;
  agent_name: string;
  action: string;
  details: string;
  status: string;
  created_at: string;
}

type Tab = 'overview' | 'calendar' | 'alerts' | 'trends' | 'logs';

const STATUS_COLORS: Record<string, string> = {
  ready: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-amber-100 text-amber-800',
  pending: 'bg-red-100 text-red-800',
  posted: 'bg-blue-100 text-blue-800',
};

const SEVERITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-sky-100 text-sky-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-sky-100 text-sky-800',
};

const PLATFORM_COLORS: Record<string, string> = {
  Facebook: 'bg-blue-600 text-white',
  Instagram: 'bg-pink-600 text-white',
  TikTok: 'bg-gray-900 text-white',
  LinkedIn: 'bg-blue-800 text-white',
  Twitter: 'bg-sky-500 text-white',
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [m, c, a, t, l] = await Promise.all([
        fetch('/api/metrics').then(r => r.json()),
        fetch('/api/calendar').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/trends').then(r => r.json()),
        fetch('/api/agent-logs').then(r => r.json()),
      ]);
      setMetrics(m.metrics || []);
      setCalendar(c.calendar || []);
      setAlerts(a.alerts || []);
      setTrends(t.trends || []);
      setAgentLogs(l.logs || []);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Fetch error:', e);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateCalendarStatus = async (id: number, status: string) => {
    await fetch('/api/calendar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const resolveAlert = async (id: number) => {
    await fetch('/api/alerts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, resolved: 1 }),
    });
    fetchData();
  };

  const updateTrendStatus = async (id: number, status: string) => {
    await fetch('/api/trends', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  // Group metrics by category
  const metricsByCategory = metrics.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {} as Record<string, Metric[]>);

  const overviewMetrics = metricsByCategory['overview'] || [];
  const platformMetrics = Object.entries(metricsByCategory).filter(([k]) => k !== 'overview');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'calendar', label: 'Content Calendar', icon: '📅' },
    { key: 'alerts', label: 'Competitor Alerts', icon: '🚨' },
    { key: 'trends', label: 'Trends', icon: '🔥' },
    { key: 'logs', label: 'Agent Logs', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#15857A] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">EduExpress Social Dashboard</h1>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">LIVE</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <nav className="hidden md:flex items-center gap-1.5">
              <a href="/offers" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold">🎓 Offers</a>
              <a href="/competitors" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold">🕵️ Competitors</a>
              <a href="/content-studio" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold">🎬 Studio</a>
              <a href="/analytics" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold">📈 Analytics</a>
            </nav>
            <span className="opacity-80">Last refresh: {lastRefresh || '...'}</span>
            <button
              onClick={fetchData}
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
        {/* Mobile nav row */}
        <div className="md:hidden flex items-center gap-1.5 pb-2">
          <a href="/offers" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold">🎓 Offers</a>
          <a href="/competitors" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold">🕵️ Competitors</a>
          <a href="/content-studio" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold">🎬 Studio</a>
          <a href="/analytics" className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold">📈 Analytics</a>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {overviewMetrics.map(m => (
                <div key={m.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{m.name}</span>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">{m.value}</div>
                  <div className="text-xs text-emerald-600 mt-1">{m.delta}</div>
                </div>
              ))}
            </div>

            {/* Platform Breakdown */}
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Platform Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformMetrics.map(([platform, pMetrics]) => (
                <div key={platform} className="bg-white rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${PLATFORM_COLORS[platform] || 'bg-gray-200 text-gray-700'}`}>
                      {platform}
                    </span>
                  </div>
                  {pMetrics.map((m: Metric) => (
                    <div key={m.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{m.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold">{m.value}</span>
                        <div className="text-[10px] text-emerald-600">{m.delta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Quick Stats Row */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Agent Activity */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Agent Activity</h3>
                {agentLogs.length === 0 ? (
                  <p className="text-sm text-gray-400">No agent activity yet</p>
                ) : (
                  <div className="space-y-2">
                    {agentLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-center gap-2 text-sm">
                        <span className={log.status === 'success' ? 'text-emerald-500' : 'text-red-500'}>
                          {log.status === 'success' ? '✓' : '✗'}
                        </span>
                        <span className="font-medium">{log.agent_name}</span>
                        <span className="text-gray-500">— {log.action}</span>
                        <span className="text-gray-400 text-xs ml-auto">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unresolved Alerts */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Active Alerts</h3>
                {alerts.filter(a => !a.resolved).length === 0 ? (
                  <p className="text-sm text-gray-400">No active alerts</p>
                ) : (
                  <div className="space-y-2">
                    {alerts.filter(a => !a.resolved).slice(0, 5).map(alert => (
                      <div key={alert.id} className="flex items-start gap-2 text-sm">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${SEVERITY_COLORS[alert.severity]}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <div>
                          <span className="font-medium">{alert.competitor}</span>
                          <span className="text-gray-500"> — {alert.description.slice(0, 60)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Content Schedule</h2>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold">Ready</span>
                <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-semibold">Draft</span>
                <span className="px-2 py-1 rounded bg-red-100 text-red-800 font-semibold">Pending</span>
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold">Posted</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Date</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Platform</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Type</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Caption</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Assigned</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {calendar.map(item => (
                    <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{item.date}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${PLATFORM_COLORS[item.platform] || 'bg-gray-200 text-gray-700'}`}>
                          {item.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.content_type}</td>
                      <td className="px-4 py-3 max-w-xs truncate text-gray-600">{item.caption}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-600'}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.assigned_to || '—'}</td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value)}
                              className="text-xs border rounded px-1 py-0.5"
                            >
                              <option value="draft">Draft</option>
                              <option value="ready">Ready</option>
                              <option value="pending">Pending</option>
                              <option value="posted">Posted</option>
                            </select>
                            <button
                              onClick={() => { updateCalendarStatus(item.id, editStatus); setEditingId(null); }}
                              className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs text-gray-400"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(item.id); setEditStatus(item.status); }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Competitor Intelligence</h2>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`bg-white rounded-xl p-5 border border-gray-200 ${alert.resolved ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${SEVERITY_COLORS[alert.severity]}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="font-bold text-gray-900">{alert.competitor}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{alert.alert_type}</span>
                        {alert.resolved && <span className="text-xs text-emerald-600 font-bold">✓ Resolved</span>}
                      </div>
                      <p className="text-sm text-gray-700">{alert.description}</p>
                      {alert.source_url && (
                        <a href={alert.source_url} className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                          Source →
                        </a>
                      )}
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors ml-4"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2">{new Date(alert.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Trending Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trends.map(trend => (
                <div key={trend.id} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${PRIORITY_COLORS[trend.priority]}`}>
                      {trend.priority.toUpperCase()}
                    </span>
                    <select
                      value={trend.status}
                      onChange={e => updateTrendStatus(trend.id, e.target.value)}
                      className="text-[10px] border rounded px-2 py-0.5 font-semibold"
                    >
                      <option value="new">New</option>
                      <option value="researching">Researching</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{trend.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{trend.description}</p>
                  {trend.opportunity && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Opportunity</span>
                      <p className="text-sm text-emerald-800 mt-1">{trend.opportunity}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Agent Activity Log</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Time</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Agent</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Action</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Details</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        No agent activity yet. Agents will log here when they run.
                      </td>
                    </tr>
                  ) : (
                    agentLogs.map(log => (
                      <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3 font-medium">{log.agent_name}</td>
                        <td className="px-4 py-3 text-gray-700">{log.action}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{log.details}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
        EduExpress International — Social Dashboard v2.0 — Auto-refreshes every 15s
      </footer>
    </div>
  );
}
