-- Create table auth
CREATE TABLE IF NOT EXISTS auths (
    refresh_token TEXT NOT NULL,
    access_token TEXT NOT NULL,
    user_id UUID DEFAULT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    admin_id UUID DEFAULT NULL REFERENCES admins(id) ON DELETE CASCADE ON UPDATE CASCADE,
    role VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for user_id and admin_id to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_id ON auths USING HASH (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_id ON auths USING HASH (admin_id);