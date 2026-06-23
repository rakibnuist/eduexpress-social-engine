import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'dashboard.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      delta TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content_calendar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      platform TEXT NOT NULL,
      content_type TEXT DEFAULT '',
      caption TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      assigned_to TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      content_package_id INTEGER DEFAULT NULL,
      post_time TEXT DEFAULT '',
      drive_folder_url TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS competitor_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competitor TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT DEFAULT 'medium',
      source_url TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      resolved INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      opportunity TEXT DEFAULT '',
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_name TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT DEFAULT '',
      status TEXT DEFAULT 'success',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weekly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      summary TEXT DEFAULT '',
      highlights TEXT DEFAULT '',
      issues TEXT DEFAULT '',
      next_steps TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination TEXT DEFAULT '',
      university TEXT DEFAULT '',
      program_type TEXT DEFAULT '',
      program_name TEXT DEFAULT '',
      tuition_fee TEXT DEFAULT '',
      scholarship TEXT DEFAULT '',
      deadline TEXT DEFAULT '',
      requirements TEXT DEFAULT '',
      duration TEXT DEFAULT '',
      language TEXT DEFAULT '',
      accommodation TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS competitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      fb_url TEXT DEFAULT '',
      fb_username TEXT DEFAULT '',
      fb_followers TEXT DEFAULT '',
      ig_url TEXT DEFAULT '',
      target_countries TEXT DEFAULT '',
      active_ads TEXT DEFAULT '',
      last_post_date TEXT DEFAULT '',
      last_post_topic TEXT DEFAULT '',
      monitoring_status TEXT DEFAULT 'active',
      last_scanned TEXT DEFAULT '',
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS content_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      calendar_id INTEGER DEFAULT NULL,
      caption_bangla TEXT DEFAULT '',
      caption_english TEXT DEFAULT '',
      caption_mixed TEXT DEFAULT '',
      hashtags TEXT DEFAULT '',
      post_time TEXT DEFAULT '',
      platform TEXT DEFAULT '',
      content_type TEXT DEFAULT '',
      copy_approved INTEGER DEFAULT 0,
      design_approved INTEGER DEFAULT 0,
      video_approved INTEGER DEFAULT 0,
      ready_to_post INTEGER DEFAULT 0,
      posted INTEGER DEFAULT 0,
      posted_at TEXT DEFAULT '',
      post_url TEXT DEFAULT '',
      engagement_likes TEXT DEFAULT '',
      engagement_comments TEXT DEFAULT '',
      engagement_shares TEXT DEFAULT '',
      performance_score TEXT DEFAULT '',
      poster_guidelines TEXT DEFAULT '',
      video_script TEXT DEFAULT '',
      video_guidelines TEXT DEFAULT '',
      cta TEXT DEFAULT '',
      drive_folder_url TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS engine_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS analytics_weekly (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      total_posts TEXT DEFAULT '0',
      total_reach TEXT DEFAULT '0',
      total_engagement TEXT DEFAULT '0',
      best_post_type TEXT DEFAULT '',
      best_post_time TEXT DEFAULT '',
      worst_post_type TEXT DEFAULT '',
      top_hashtag TEXT DEFAULT '',
      competitor_summary TEXT DEFAULT '',
      learnings TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS engine_run_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_name TEXT DEFAULT '',
      started_at TEXT DEFAULT CURRENT_TIMESTAMP,
      finished_at TEXT DEFAULT '',
      status TEXT DEFAULT 'running',
      details TEXT DEFAULT '',
      error TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS audience_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel TEXT NOT NULL,
      age_18_24 TEXT DEFAULT '',
      age_25_34 TEXT DEFAULT '',
      age_35_44 TEXT DEFAULT '',
      gender_male TEXT DEFAULT '',
      gender_female TEXT DEFAULT '',
      top_cities TEXT DEFAULT '',
      active_hours TEXT DEFAULT '',
      peak_days TEXT DEFAULT '',
      primary_persona TEXT DEFAULT '',
      interests TEXT DEFAULT '',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS design_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_package_id INTEGER DEFAULT NULL,
      asset_type TEXT DEFAULT '',
      file_url TEXT DEFAULT '',
      drive_file_id TEXT DEFAULT '',
      dimensions TEXT DEFAULT '',
      format TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      assigned_to TEXT DEFAULT '',
      feedback TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS post_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_package_id INTEGER DEFAULT NULL,
      calendar_id INTEGER DEFAULT NULL,
      platform TEXT DEFAULT '',
      post_id TEXT DEFAULT '',
      post_url TEXT DEFAULT '',
      posted_at TEXT DEFAULT '',
      reach INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      engagement INTEGER DEFAULT 0,
      engagement_rate TEXT DEFAULT '0',
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      link_clicks INTEGER DEFAULT 0,
      profile_visits INTEGER DEFAULT 0,
      hour1_engagement INTEGER DEFAULT 0,
      hour1_engagement_rate TEXT DEFAULT '0',
      flagged TEXT DEFAULT 'normal',
      captured_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS competitor_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competitor_id INTEGER DEFAULT 0,
      post_content TEXT DEFAULT '',
      post_date TEXT DEFAULT '',
      engagement_likes INTEGER DEFAULT 0,
      engagement_comments INTEGER DEFAULT 0,
      engagement_shares INTEGER DEFAULT 0,
      post_url TEXT DEFAULT '',
      content_type TEXT DEFAULT '',
      topic TEXT DEFAULT '',
      scanned_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_package_id INTEGER DEFAULT NULL,
      field TEXT DEFAULT '',
      original_value TEXT DEFAULT '',
      edited_value TEXT DEFAULT '',
      feedback_note TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content_pillars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#3B82F6',
      target_percentage INTEGER DEFAULT 15,
      current_percentage INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS manual_offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      destination TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      drive_file_id TEXT DEFAULT '',
      drive_file_url TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT DEFAULT ''
    );
  `);

  migrateColumns(db, 'content_calendar', [
    ['content_type', "TEXT DEFAULT ''"],
    ['content_package_id', 'INTEGER DEFAULT NULL'],
    ['post_time', "TEXT DEFAULT ''"],
    ['drive_folder_url', "TEXT DEFAULT ''"],
  ]);

  // Seed content pillars
  const pillarCount = db.prepare('SELECT COUNT(*) as c FROM content_pillars').get() as { c: number };
  if (pillarCount.c === 0) {
    const pillars = [
      ['Destination Intelligence', 'Detailed useful info about each country — specific universities, programs, costs, and clear explanations', '#3B82F6', 15],
      ['Financial Reality', 'Cost breakdowns, scholarship alerts, budget comparisons — money is the primary barrier and concern', '#10B981', 15],
      ['Process Guidance', 'Step-by-step visa, SOP, document explanations — students overwhelmed by process trust whoever explains clearly', '#F59E0B', 10],
      ['Student Voices', 'Real Bangladeshi students who already went — real people, real experiences, specific details', '#8B5CF6', 20],
      ['Urgent Alerts', 'Deadline reminders, scholarship closing dates, new intake announcements — drives immediate action', '#EF4444', 15],
      ['Myth Busting & Fear Addressing', 'Visa rejection fear, cost fear, language barrier fear — truth about what stops students from applying', '#EC4899', 10],
      ['Platform Entertainment', 'TikTok format — entertaining/relatable first, educational second — the reach engine', '#6366F1', 10],
    ];
    const ins = db.prepare('INSERT INTO content_pillars (name, description, color, target_percentage) VALUES (?, ?, ?, ?)');
    db.transaction(() => { for (const p of pillars) ins.run(p[0], p[1], p[2], p[3]); })();
  }
}

function migrateColumns(
  db: Database.Database,
  table: string,
  columns: Array<[string, string]>
) {
  const existing = new Set(
    (db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map((row) => row.name)
  );
  for (const [col, def] of columns) {
    if (!existing.has(col)) {
      try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def};`); } catch { /* ignore */ }
    }
  }
}

function seedData(db: Database.Database) {
  // Original seed data preserved
  const metrics = [
    ['overview', 'Total Followers', '30,169', 'FB + Instagram real data', '👥'],
    ['overview', 'Engagement Rate', '4.8%', '+0.3% vs last week', '📊'],
    ['overview', 'Posts This Week', '0', 'Connect content planner', '📝'],
    ['overview', 'Messages Received', '—', 'Needs messaging API', '💬'],
    ['overview', 'Leads Generated', '23', '+5 vs last week', '🎯'],
    ['overview', 'Visa Inquiries', '31', '+8 vs last week', '✈️'],
    ['facebook-bd', 'Page Followers', '16,919', 'EduExpress Bangladesh', '👍'],
    ['facebook-bd', 'Page Likes', '16,919', 'Real from Meta API', '❤️'],
    ['facebook-bd', 'Recent Posts (10)', '10', 'Latest: 2026-06-17', '📋'],
    ['facebook-cn', 'Page Followers', '13,185', 'EduExpress China', '🇨🇳'],
    ['facebook-cn', 'Page Likes', '13,185', 'Real from Meta API', '❤️'],
    ['facebook-cn', 'Recent Posts (10)', '10', 'Latest: 2026-06-17', '📋'],
    ['instagram', 'Followers', '65', '@eduexpressint', '📸'],
    ['instagram', 'Media Count', '230', 'Total posts', '🖼️'],
    ['instagram', 'Recent Likes (10)', '14', 'Recent engagement', '💜'],
  ];
  const insertMetric = db.prepare('INSERT INTO metrics (category, name, value, delta, icon) VALUES (?, ?, ?, ?, ?)');
  db.transaction(() => { for (const m of metrics) insertMetric.run(m[0], m[1], m[2], m[3], m[4]); })();
}

/* ---------------------------------------------------------------------------- * Engine Run Logs ------------------------------------------------------------------------- */

export function createEngineLog(data: { job_name?: string; status?: string; details?: string; error?: string; finished_at?: string }): { id: number } {
  const result = getDb()
    .prepare('INSERT INTO engine_run_logs (job_name, status, details, error, finished_at) VALUES (?, ?, ?, ?, ?)')
    .run(data.job_name ?? '', data.status ?? 'running', data.details ?? '', data.error ?? '', data.finished_at ?? '');
  return { id: result.lastInsertRowid as number };
}

export function getEngineLogs(limit = 20) {
  return getDb().prepare('SELECT * FROM engine_run_logs ORDER BY id DESC LIMIT ?').all(limit) as Array<{ id: number; job_name: string; status: string; details: string; error: string; started_at: string; finished_at: string }>;
}

/* ---------------------------------------------------------------------------- * Audience Profiles ------------------------------------------------------------------------- */

export function getAudienceProfiles() {
  return getDb().prepare('SELECT * FROM audience_profiles').all() as AudienceProfile[];
}

export function setAudienceProfile(data: Partial<AudienceProfile> & { channel: string }) {
  const existing = getDb().prepare('SELECT id FROM audience_profiles WHERE channel = ?').get(data.channel) as { id: number } | undefined;
  const db = getDb();
  if (existing) {
    const keys = ['age_18_24', 'age_25_34', 'age_35_44', 'gender_male', 'gender_female', 'top_cities', 'active_hours', 'peak_days', 'primary_persona', 'interests'];
    const updates = keys.map(k => `${k}=?`).join(', ');
    db.prepare(`UPDATE audience_profiles SET ${updates}, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(...keys.map(k => data[k as keyof AudienceProfile] ?? ''), existing.id);
  } else {
    db.prepare(`INSERT INTO audience_profiles (channel, age_18_24, age_25_34, age_35_44, gender_male, gender_female, top_cities, active_hours, peak_days, primary_persona, interests) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(data.channel, data.age_18_24 ?? '', data.age_25_34 ?? '', data.age_35_44 ?? '', data.gender_male ?? '', data.gender_female ?? '', data.top_cities ?? '', data.active_hours ?? '', data.peak_days ?? '', data.primary_persona ?? '', data.interests ?? '');
  }
}

/* ---------------------------------------------------------------------------- * Design Assets ------------------------------------------------------------------------- */

export function getDesignAssets(packageId?: number) {
  if (packageId) return getDb().prepare('SELECT * FROM design_assets WHERE content_package_id = ?').all(packageId) as DesignAsset[];
  return getDb().prepare('SELECT * FROM design_assets ORDER BY id DESC').all() as DesignAsset[];
}

export function createDesignAsset(data: Partial<DesignAsset>) {
  const result = getDb()
    .prepare(`INSERT INTO design_assets (content_package_id, asset_type, file_url, drive_file_id, dimensions, format, status, assigned_to, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(data.content_package_id ?? null, data.asset_type ?? '', data.file_url ?? '', data.drive_file_id ?? '', data.dimensions ?? '', data.format ?? '', data.status ?? 'pending', data.assigned_to ?? '', data.feedback ?? '');
  return getDb().prepare('SELECT * FROM design_assets WHERE id = ?').get(result.lastInsertRowid) as unknown as Record<string, unknown>;
}

export function updateDesignAsset(id: number, data: Partial<DesignAsset>) {
  const db = getDb();
  const keys = ['content_package_id', 'asset_type', 'file_url', 'drive_file_id', 'dimensions', 'format', 'status', 'assigned_to', 'feedback'];
  const updates = keys.filter(k => data[k as keyof DesignAsset] !== undefined).map(k => `${k}=?`);
  const values: (string | number | null)[] = [];
  for (const k of keys) {
    if (data[k as keyof DesignAsset] !== undefined) {
      const v = data[k as keyof DesignAsset];
      values.push(k === 'content_package_id' ? (v ?? null) : v as string);
    }
  }
  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE design_assets SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
}

/* ---------------------------------------------------------------------------- * Post Performance ------------------------------------------------------------------------- */

export function getPostPerformance(packageId?: number) {
  if (packageId) return getDb().prepare('SELECT * FROM post_performance WHERE content_package_id = ?').all(packageId) as PostPerformance[];
  return getDb().prepare('SELECT * FROM post_performance ORDER BY id DESC LIMIT 100').all() as PostPerformance[];
}

export function createPostPerformance(data: Partial<PostPerformance>) {
  const result = getDb()
    .prepare(`INSERT INTO post_performance (content_package_id, calendar_id, platform, post_id, post_url, posted_at, reach, impressions, engagement, engagement_rate, likes, comments, shares, saves, link_clicks, profile_visits, hour1_engagement, hour1_engagement_rate, flagged) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(data.content_package_id ?? null, data.calendar_id ?? null, data.platform ?? '', data.post_id ?? '', data.post_url ?? '', data.posted_at ?? '', data.reach ?? 0, data.impressions ?? 0, data.engagement ?? 0, data.engagement_rate ?? '0', data.likes ?? 0, data.comments ?? 0, data.shares ?? 0, data.saves ?? 0, data.link_clicks ?? 0, data.profile_visits ?? 0, data.hour1_engagement ?? 0, data.hour1_engagement_rate ?? '0', data.flagged ?? 'normal');
  return getDb().prepare('SELECT * FROM post_performance WHERE id = ?').get(result.lastInsertRowid) as unknown as Record<string, unknown>;
}

export function updatePostPerformance(id: number, data: Partial<PostPerformance>) {
  const db = getDb();
  const keys = ['reach', 'impressions', 'engagement', 'engagement_rate', 'likes', 'comments', 'shares', 'saves', 'link_clicks', 'profile_visits', 'hour1_engagement', 'hour1_engagement_rate', 'flagged'];
  const updates = keys.filter(k => data[k as keyof PostPerformance] !== undefined).map(k => `${k}=?`);
  const values: (string | number)[] = [];
  for (const k of keys) {
    if (data[k as keyof PostPerformance] !== undefined) {
      values.push(data[k as keyof PostPerformance] as string | number);
    }
  }
  if (updates.length > 0) { values.push(id); db.prepare(`UPDATE post_performance SET ${updates.join(', ')} WHERE id = ?`).run(...values); }
}

/* ---------------------------------------------------------------------------- * Competitor History ------------------------------------------------------------------------- */

export function addCompetitorHistory(data: Partial<{ competitor_id: number; post_content: string; post_date: string; engagement_likes: number; engagement_comments: number; engagement_shares: number; post_url: string; content_type: string; topic: string }>) {
  const result = getDb()
    .prepare(`INSERT INTO competitor_history (competitor_id, post_content, post_date, engagement_likes, engagement_comments, engagement_shares, post_url, content_type, topic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(data.competitor_id ?? 0, data.post_content ?? '', data.post_date ?? '', data.engagement_likes ?? 0, data.engagement_comments ?? 0, data.engagement_shares ?? 0, data.post_url ?? '', data.content_type ?? '', data.topic ?? '');
  return getDb().prepare('SELECT * FROM competitor_history WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
}

export function getCompetitorHistory(competitorId: number, limit = 20) {
  return getDb().prepare('SELECT * FROM competitor_history WHERE competitor_id = ? ORDER BY id DESC LIMIT ?').all(competitorId, limit);
}

/* ---------------------------------------------------------------------------- * Content Feedback (Self-Learning) ------------------------------------------------------------------------- */

export function getContentFeedback(packageId: number) {
  return getDb().prepare('SELECT * FROM content_feedback WHERE content_package_id = ?').all(packageId) as ContentFeedback[];
}

export function createContentFeedback(data: { content_package_id: number; field?: string; original_value?: string; edited_value?: string; feedback_note?: string }) {
  const result = getDb()
    .prepare(`INSERT INTO content_feedback (content_package_id, field, original_value, edited_value, feedback_note) VALUES (?, ?, ?, ?, ?)`)
    .run(data.content_package_id, data.field ?? '', data.original_value ?? '', data.edited_value ?? '', data.feedback_note ?? '');
  return getDb().prepare('SELECT * FROM content_feedback WHERE id = ?').get(result.lastInsertRowid) as unknown as Record<string, unknown>;
}

export function getContentPatternLearnings() {
  const db = getDb();
  const feedback = db.prepare('SELECT field, original_value, edited_value FROM content_feedback').all() as Array<{ field: string; original_value: string; edited_value: string }>;
  const patterns: Record<string, { count: number; original_pattern: string; edited_pattern: string }> = {};
  for (const f of feedback) {
    if (!patterns[f.field]) patterns[f.field] = { count: 0, original_pattern: '', edited_pattern: '' };
    patterns[f.field].count++;
    patterns[f.field].original_pattern = f.original_value;
    patterns[f.field].edited_pattern = f.edited_value;
  }
  return Object.entries(patterns).map(([field, p]) => ({ field, ...p }));
}

/* ---------------------------------------------------------------------------- * Content Pillars ------------------------------------------------------------------------- */

export function getContentPillars() {
  return getDb().prepare('SELECT * FROM content_pillars ORDER BY id').all() as ContentPillar[];
}

export function updateContentPillar(id: number, data: Record<string, unknown>) {
  const db = getDb();
  const keys = ['name', 'description', 'color', 'target_percentage', 'current_percentage', 'active'];
  const updates = keys.filter(k => (data as Record<string, unknown>)[k] !== undefined).map(k => `${k}=?`);
  const values: (string | number)[] = [];
  for (const k of keys) {
    if ((data as Record<string, unknown>)[k] !== undefined) {
      values.push((data as Record<string, unknown>)[k] as string | number);
    }
  }
  if (updates.length > 0) { values.push(id); db.prepare(`UPDATE content_pillars SET ${updates.join(', ')} WHERE id = ?`).run(...values); }
}

/* ---------------------------------------------------------------------------- * Manual Offers ------------------------------------------------------------------------- */

export function getManualOffers() {
  return getDb().prepare('SELECT * FROM manual_offers ORDER BY id DESC').all() as ManualOffer[];
}

export function createManualOffer(data: Partial<ManualOffer>) {
  const result = getDb()
    .prepare(`INSERT INTO manual_offers (title, destination, description, image_url, drive_file_id, drive_file_url, status, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(data.title ?? '', data.destination ?? '', data.description ?? '', data.image_url ?? '', data.drive_file_id ?? '', data.drive_file_url ?? '', data.status ?? 'active', data.expires_at ?? '');
  return getDb().prepare('SELECT * FROM manual_offers WHERE id = ?').get(result.lastInsertRowid) as unknown as Record<string, unknown>;
}

export function updateManualOffer(id: number, data: Partial<ManualOffer>) {
  const db = getDb();
  const keys = ['title', 'destination', 'description', 'image_url', 'drive_file_id', 'drive_file_url', 'status', 'expires_at'];
  const updates = keys.filter(k => data[k as keyof ManualOffer] !== undefined).map(k => `${k}=?`);
  const values: (string | number)[] = [];
  for (const k of keys) {
    if (data[k as keyof ManualOffer] !== undefined) values.push(data[k as keyof ManualOffer] as string);
  }
  if (updates.length > 0) { values.push(id); db.prepare(`UPDATE manual_offers SET ${updates.join(', ')} WHERE id = ?`).run(...values); }
}

export function deleteManualOffer(id: number): void {
  getDb().prepare('DELETE FROM manual_offers WHERE id = ?').run(Number(id));
}

/* ---------------------------------------------------------------------------- * Offers CRUD ------------------------------------------------------------------------- */

export function getOffers(): Array<Record<string, unknown>> {
  return getDb().prepare('SELECT * FROM offers ORDER BY id DESC').all() as Array<Record<string, unknown>>;
}

export function createOffer(data: Record<string, unknown>): Record<string, unknown> {
  const result = getDb()
    .prepare(`INSERT INTO offers (destination, university, program_type, program_name, tuition_fee, scholarship, deadline, requirements, duration, language, accommodation, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      data.destination ?? '', data.university ?? '', data.program_type ?? '', data.program_name ?? '',
      data.tuition_fee ?? '', data.scholarship ?? '', data.deadline ?? '', data.requirements ?? '',
      data.duration ?? '', data.language ?? '', data.accommodation ?? '', data.notes ?? '', data.status ?? 'active'
    );
  return getDb().prepare('SELECT * FROM offers WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
}

export function updateOffer(id: number, data: Record<string, unknown>) {
  const db = getDb();
  const fields = ['destination', 'university', 'program_type', 'program_name', 'tuition_fee', 'scholarship', 'deadline', 'requirements', 'duration', 'language', 'accommodation', 'notes', 'status'];
  const updates = fields.filter(f => data[f] !== undefined).map(f => `${f}=?`);
  const values: (string | number)[] = [];
  for (const f of fields) {
    if (data[f] !== undefined) values.push(data[f] as string);
  }
  if (updates.length > 0) {
    updates.push('updated_at=CURRENT_TIMESTAMP');
    values.push(id);
    db.prepare(`UPDATE offers SET ${updates.join(', ')} WHERE id=?`).run(...values);
  }
}

export function deleteOffer(id: number): void {
  getDb().prepare('DELETE FROM offers WHERE id=?').run(Number(id));
}

/* ---------------------------------------------------------------------------- * Competitors CRUD ------------------------------------------------------------------------- */

export function getCompetitors(): Array<Record<string, unknown>> {
  return getDb().prepare('SELECT * FROM competitors ORDER BY id DESC').all() as Array<Record<string, unknown>>;
}

export function createCompetitor(data: Record<string, unknown>): Record<string, unknown> {
  const result = getDb()
    .prepare(`INSERT INTO competitors (name, fb_url, fb_username, fb_followers, ig_url, target_countries, active_ads, last_post_date, last_post_topic, monitoring_status, last_scanned, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      data.name ?? '', data.fb_url ?? '', data.fb_username ?? '', data.fb_followers ?? '',
      data.ig_url ?? '', data.target_countries ?? '', data.active_ads ?? '',
      data.last_post_date ?? '', data.last_post_topic ?? '', data.monitoring_status ?? 'active',
      data.last_scanned ?? '', data.notes ?? ''
    );
  return getDb().prepare('SELECT * FROM competitors WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>;
}

export function updateCompetitor(id: number, data: Record<string, unknown>) {
  const db = getDb();
  const fields = ['name', 'fb_url', 'fb_username', 'fb_followers', 'ig_url', 'target_countries', 'active_ads', 'last_post_date', 'last_post_topic', 'monitoring_status', 'last_scanned', 'notes'];
  const updates = fields.filter(f => data[f] !== undefined).map(f => `${f}=?`);
  const values: (string | number)[] = [];
  for (const f of fields) {
    if (data[f] !== undefined) values.push(data[f] as string);
  }
  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE competitors SET ${updates.join(', ')} WHERE id=?`).run(...values);
  }
}

/* ---------------------------------------------------------------------------- * Content Packages CRUD ------------------------------------------------------------------------- */

export function getContentPackages(calendarId?: number): Array<Record<string, unknown>> {
  const db = getDb();
  if (calendarId) {
    return db.prepare('SELECT * FROM content_packages WHERE calendar_id=? ORDER BY id DESC').all(calendarId) as Array<Record<string, unknown>>;
  }
  return db.prepare('SELECT * FROM content_packages ORDER BY id DESC').all() as Array<Record<string, unknown>>;
}

export function createContentPackage(data: Record<string, unknown>): Record<string, unknown> {
  const result = getDb()
    .prepare(`INSERT INTO content_packages (calendar_id, caption_bangla, caption_english, caption_mixed, hashtags, post_time, platform, content_type, copy_approved, design_approved, video_approved, ready_to_post, posted, posted_at, post_url, engagement_likes, engagement_comments, engagement_shares, performance_score, poster_guidelines, video_script, video_guidelines, cta, drive_folder_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      data.calendar_id ?? null, data.caption_bangla ?? '', data.caption_english ?? '', data.caption_mixed ?? '',
      data.hashtags ?? '', data.post_time ?? '', data.platform ?? '', data.content_type ?? '',
      data.copy_approved ?? 0, data.design_approved ?? 0, data.video_approved ?? 0,
      data.ready_to_post ?? 0, data.posted ?? 0, data.posted_at ?? '', data.post_url ?? '',
      data.engagement_likes ?? '', data.engagement_comments ?? '', data.engagement_shares ?? '',
      data.performance_score ?? '', data.poster_guidelines ?? '', data.video_script ?? '',
      data.video_guidelines ?? '', data.cta ?? '', data.drive_folder_url ?? ''
    );
  return getDb().prepare('SELECT * FROM content_packages WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>;
}

export function updateContentPackage(id: number, data: Record<string, unknown>) {
  const db = getDb();
  const fields = ['calendar_id', 'caption_bangla', 'caption_english', 'caption_mixed', 'hashtags', 'post_time', 'platform', 'content_type', 'copy_approved', 'design_approved', 'video_approved', 'ready_to_post', 'posted', 'posted_at', 'post_url', 'engagement_likes', 'engagement_comments', 'engagement_shares', 'performance_score', 'poster_guidelines', 'video_script', 'video_guidelines', 'cta', 'drive_folder_url'];
  const updates = fields.filter(f => data[f] !== undefined).map(f => `${f}=?`);
  const values: (string | number | null)[] = [];
  for (const f of fields) {
    if (data[f] !== undefined) {
      values.push(f === "calendar_id" ? (data[f] as string | number | null) : (data[f] as string | number));
    }
  }
  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE content_packages SET ${updates.join(', ')} WHERE id=?`).run(...values);
  }
}

export function updateEngineLog(id: number, data: Record<string, unknown>) {
  const db = getDb();
  const fields = ['status', 'details', 'error', 'finished_at'];
  const updates = fields.filter(f => data[f] !== undefined).map(f => `${f}=?`);
  const values: (string | number)[] = [];
  for (const f of fields) {
    if (data[f] !== undefined) values.push(data[f] as string);
  }
  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE engine_run_logs SET ${updates.join(', ')} WHERE id=?`).run(...values);
  }
}
/* ---------------------------------------------------------------------------- * Analytics Weekly (was in original - re-adding missing) ------------------------------------------------------------------------- */

export function getAnalyticsWeekly(): Array<Record<string, unknown>> {
  return getDb().prepare('SELECT * FROM analytics_weekly ORDER BY week_start DESC').all() as Array<Record<string, unknown>>;
}

export function createAnalyticsWeekly(data: Record<string, unknown>): Record<string, unknown> {
  const fields = ['week_start', 'week_end', 'total_posts', 'total_reach', 'total_engagement', 'best_post_type', 'best_post_time', 'worst_post_type', 'top_hashtag', 'competitor_summary', 'learnings'];
  const cols = fields.join(', ');
  const placeholders = fields.map(() => '?').join(', ');
  const values = fields.map(f => (data[f] ?? '') as string);
  const result = getDb().prepare(`INSERT INTO analytics_weekly (${cols}) VALUES (${placeholders})`).run(...values);
  return getDb().prepare('SELECT * FROM analytics_weekly WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>;
}



/* ---------------------------------------------------------------------------- * Engine Settings (key/value) ------------------------------------------------------------------------- */

export function getSetting(key: string): string | null {
  const row = getDb().prepare('SELECT value FROM engine_settings WHERE key=?').get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setSetting(key: string, value: string): void {
  getDb().prepare('INSERT INTO engine_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, value);
}


export interface AudienceProfile {
  id: number;
  channel: string;
  age_18_24: string;
  age_25_34: string;
  age_35_44: string;
  gender_male: string;
  gender_female: string;
  top_cities: string;
  active_hours: string;
  peak_days: string;
  primary_persona: string;
  interests: string;
  updated_at: string;
}

export interface DesignAsset {
  id: number;
  content_package_id: number | null;
  asset_type: string;
  file_url: string;
  drive_file_id: string;
  dimensions: string;
  format: string;
  status: string;
  assigned_to: string;
  feedback: string;
  created_at: string;
  updated_at: string;
}

export interface PostPerformance {
  id: number;
  content_package_id: number | null;
  calendar_id: number | null;
  platform: string;
  post_id: string;
  post_url: string;
  posted_at: string;
  reach: number;
  impressions: number;
  engagement: number;
  engagement_rate: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  link_clicks: number;
  profile_visits: number;
  hour1_engagement: number;
  hour1_engagement_rate: string;
  flagged: string;
  captured_at: string;
}

export interface ContentFeedback {
  id: number;
  content_package_id: number | null;
  field: string;
  original_value: string;
  edited_value: string;
  feedback_note: string;
  created_at: string;
}

export interface ContentPillar {
  id: number;
  name: string;
  description: string;
  color: string;
  target_percentage: number;
  current_percentage: number;
  active: number;
  created_at: string;
}

export interface ManualOffer {
  id: number;
  title: string;
  destination: string;
  description: string;
  image_url: string;
  drive_file_id: string;
  drive_file_url: string;
  status: string;
  created_at: string;
  expires_at: string;
}