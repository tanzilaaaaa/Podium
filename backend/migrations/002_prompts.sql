-- Prompts table (optional — prompts also live in frontend seedData.js)
CREATE TABLE IF NOT EXISTS prompts (
    id                BIGSERIAL PRIMARY KEY,
    text              TEXT NOT NULL,
    category          TEXT NOT NULL,
    difficulty        INT  NOT NULL DEFAULT 1,
    estimated_seconds INT  NOT NULL DEFAULT 60,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (text)
);

CREATE INDEX IF NOT EXISTS prompts_category ON prompts(category);
