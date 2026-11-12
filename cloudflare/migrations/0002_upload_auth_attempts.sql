CREATE TABLE IF NOT EXISTS upload_auth_attempts (
  attempt_key TEXT PRIMARY KEY,
  window_started_at INTEGER NOT NULL,
  failed_attempts INTEGER NOT NULL
);
