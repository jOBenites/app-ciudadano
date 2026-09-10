-- Schema for the citizen reporting app backend.
-- Run this in the Supabase SQL Editor before deploying the Edge Function.

CREATE TABLE IF NOT EXISTS kv_store_1cd2eafa (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
