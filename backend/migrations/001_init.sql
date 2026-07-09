-- Podium schema — run this against your Postgres database once
-- psql $DATABASE_URL -f migrations/001_init.sql

CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,          -- Firebase UID
    email           TEXT NOT NULL UNIQUE,
    display_name    TEXT NOT NULL DEFAULT '',
    xp              INT  NOT NULL DEFAULT 0,
    level           INT  NOT NULL DEFAULT 1,
    streak_count    INT  NOT NULL DEFAULT 0,
    last_rep_date   DATE,
    streak_freezes  INT  NOT NULL DEFAULT 1,
    onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
    goals           TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reps (
    id              BIGSERIAL PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_id       TEXT NOT NULL DEFAULT '',
    prompt_text     TEXT NOT NULL DEFAULT '',
    category        TEXT NOT NULL DEFAULT '',
    duration_sec    INT  NOT NULL DEFAULT 0,
    transcript      TEXT NOT NULL DEFAULT '',
    wpm             INT  NOT NULL DEFAULT 0,
    filler_count    INT  NOT NULL DEFAULT 0,
    filler_words    JSONB NOT NULL DEFAULT '[]',
    clarity_score   INT  NOT NULL DEFAULT 0,
    pace_score      INT  NOT NULL DEFAULT 0,
    filler_score    INT  NOT NULL DEFAULT 0,
    total_score     INT  NOT NULL DEFAULT 0,
    xp_earned       INT  NOT NULL DEFAULT 0,
    feedback        TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reps_user_id_created_at ON reps(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS badges (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    category    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id    TEXT NOT NULL REFERENCES badges(id),
    earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- Seed badge definitions
INSERT INTO badges (id, name, description, category) VALUES
  ('streak_3',   'On Fire',        '3-day streak',             'Streaks'),
  ('streak_7',   'Week Warrior',   '7-day streak',             'Streaks'),
  ('streak_14',  'Two Weeks In',   '14-day streak',            'Streaks'),
  ('streak_30',  'Monthly Master', '30-day streak',            'Streaks'),
  ('reps_1',     'First Words',    'Complete your first rep',  'Reps'),
  ('reps_10',    'Ten Reps',       'Complete 10 reps',         'Reps'),
  ('reps_25',    'Rising Voice',   'Complete 25 reps',         'Reps'),
  ('reps_50',    'Podium Regular', 'Complete 50 reps',         'Reps'),
  ('score_80',   'Sharp',          'Score 80+ on a rep',       'Performance'),
  ('score_90',   'Diamond',        'Score 90+ on a rep',       'Performance'),
  ('no_fillers', 'Crisp',          'Zero filler words',        'Performance'),
  ('pace_ace',   'Pace Ace',       'Perfect pace score',       'Performance'),
  ('xp_100',     'Sparked',        'Earn 100 XP',              'XP'),
  ('xp_500',     'Glowing',        'Earn 500 XP',              'XP'),
  ('xp_1000',    'Leveled Up',     'Earn 1,000 XP',            'XP'),
  ('xp_3000',    'Orator',         'Earn 3,000 XP',            'XP')
ON CONFLICT (id) DO NOTHING;
