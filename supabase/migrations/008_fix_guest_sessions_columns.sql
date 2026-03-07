-- ============================================================
-- Migration 008: Fix guest_sessions missing columns
-- ============================================================
-- PROBLEM:
-- Migration 001 creates guest_sessions with 5 columns:
--   id, event_id, display_name, session_token, created_at
--
-- Migration 006 attempted to add ip_address and last_active_at
-- using CREATE TABLE IF NOT EXISTS — which is a no-op when the
-- table already exists. The columns were never actually added.
--
-- The API route (POST /api/guest/session) tries to insert
-- ip_address, causing a "column does not exist" error from
-- Postgres and returning "Failed to create guest session".
--
-- FIX:
-- Use ALTER TABLE ... ADD COLUMN IF NOT EXISTS to properly
-- add the missing columns to the existing table.
-- ============================================================

ALTER TABLE public.guest_sessions
  ADD COLUMN IF NOT EXISTS ip_address INET;

ALTER TABLE public.guest_sessions
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ NOT NULL DEFAULT now();
