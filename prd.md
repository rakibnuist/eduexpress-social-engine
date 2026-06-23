# EduExpress Social Media Engine — Build PRD

## Database Schema (SQLite)

### Table: offers
- id, destination, university, program_type, program_name, tuition_fee, scholarship, deadline, requirements, duration, language, accommodation, notes, status, created_at, updated_at

### Table: competitors
- id, name, fb_url, fb_username, fb_followers, ig_url, target_countries, active_ads, last_post_date, last_post_topic, monitoring_status, last_scanned, notes

### Table: content_packages
- id, calendar_id, caption_bangla, caption_english, caption_mixed, hashtags, post_time, platform, copy_approved, design_approved, video_approved, ready_to_post, posted, posted_at, post_url, engagement_likes, engagement_comments, engagement_shares, performance_score, poster_guidelines, video_script, video_guidelines, cta, content_type, drive_folder_url

### Table: content_calendar (existing — expand)
- Add columns: content_type, content_package_id, drive_folder_url, post_time, status

### Table: engine_settings
- id, key, value — for engine configuration (auto_post_enabled, posting_schedule, content_mix, etc.)

### Table: analytics_weekly
- id, week_start, week_end, total_posts, total_reach, total_engagement, best_post_type, best_post_time, worst_post_type, top_hashtag, competitor_summary, learnings, created_at

### Table: drive_folders
- id, folder_name, drive_id, purpose (content_ready, content_draft, videos, images, approved), parent_folder_id

## API Routes

### /api/offers
- GET: List all offers
- POST: Create new offer
- PUT: Update offer
- DELETE: Delete offer

### /api/competitors
- GET: List all competitors
- POST: Add competitor manually
- PUT: Update competitor
- POST /sync: Sync from Google Sheet

### /api/content-packages
- GET: List content packages (filter by calendar_id, status)
- POST: Create content package (full content generation)
- PUT: Update package status (copy_approved, design_approved, etc.)
- POST /generate/:calendar_id: Generate full content package for a calendar item

### /api/engine-settings
- GET: Get engine settings
- PUT: Update engine settings

### /api/analytics
- GET: Weekly analytics report
- POST: Record post engagement data

## Dashboard Pages

### / (Overview)
- Live metrics from all channels
- Engine status (running/paused)
- This week's content summary
- Competitor alerts feed
- Trend opportunities

### /calendar
- Content calendar grid (week view)
- Click any post to expand full content package
- Status workflow: draft → copy_approved → design_approved → ready → scheduled → posted
- Inline editing

### /competitors
- Table of 50 competitors with live data
- Gap analysis: what they post, you don't
- Add new competitor form
- Sync from Google Sheet button

### /offers
- Form to add new offer/program manually
- Table of all offers
- Filter by destination, program type

### /content-studio
- For each calendar item, show full content package:
  - Copy (editable)
  - Poster design guidelines
  - Video script (if video)
  - Hashtags
  - Best posting time
  - CTA
- Approval buttons per component
- "Generate Package" button per calendar item

### /analytics
- Weekly performance charts
- Content type performance
- Best posting times
- Hashtag performance
- Competitor comparison
- Self-learning insights

### /settings
- Engine settings (auto-posting toggle, content mix, posting schedule)
- Connected platforms (FB, IG, TikTok)
- Google Drive folder mapping
- Cron job status