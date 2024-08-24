-- Create table payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    amount NUMERIC NOT NULL,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for order_id and user_id to improve query performance
CREATE INDEX IF NOT EXISTS idx_order_id ON payments USING HASH (order_id);
CREATE INDEX IF NOT EXISTS idx_user_id ON payments USING HASH (user_id);