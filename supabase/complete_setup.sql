-- ============================================================
-- DISCIPLINE OS: Complete Database Setup
-- Run this ENTIRE script in Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query > Paste > Run)
-- ============================================================
-- This script is SAFE to run multiple times. It will:
--   ✅ Create tables if they don't exist
--   ✅ Add missing columns without touching existing data
--   ✅ Set up Row Level Security (RLS) policies
--   ✅ Fix column naming issues
-- ============================================================


-- ═══════════════════════════════════════════
-- 1. TODOS TABLE (Kanban Board + To-Do List)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add 'completed' if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='todos' AND column_name='completed') THEN
        ALTER TABLE todos ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add 'urgency' if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='todos' AND column_name='urgency') THEN
        ALTER TABLE todos ADD COLUMN urgency TEXT DEFAULT 'light';
    END IF;
END $$;

-- Add 'completed_at' if missing (used by performance chart)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='todos' AND column_name='completed_at') THEN
        ALTER TABLE todos ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
END $$;

-- Fix: if column is named "task" instead of "title", rename it
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='todos' AND column_name='task')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='todos' AND column_name='title')
    THEN
        ALTER TABLE todos RENAME COLUMN task TO title;
    END IF;
END $$;

-- RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='todos' AND policyname='Users can view their own todos') THEN
        CREATE POLICY "Users can view their own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='todos' AND policyname='Users can insert their own todos') THEN
        CREATE POLICY "Users can insert their own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='todos' AND policyname='Users can update their own todos') THEN
        CREATE POLICY "Users can update their own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='todos' AND policyname='Users can delete their own todos') THEN
        CREATE POLICY "Users can delete their own todos" ON todos FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;


-- ═══════════════════════════════════════════
-- 2. HABITS TABLE
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'boolean',
    goal_value NUMERIC DEFAULT 1,
    current_value NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='habits' AND policyname='Users manage own habits') THEN
        CREATE POLICY "Users manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;


-- ═══════════════════════════════════════════
-- 3. HABIT LOGS TABLE (Daily check-ins)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS habit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    completed_at DATE DEFAULT CURRENT_DATE,
    UNIQUE(habit_id, completed_at)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='habit_logs' AND policyname='Users manage own habit logs') THEN
        CREATE POLICY "Users manage own habit logs" ON habit_logs FOR ALL USING (
            EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid())
        );
    END IF;
END $$;


-- ═══════════════════════════════════════════
-- 4. CALENDAR PLANS TABLE
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS calendar_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add 'urgency' if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='calendar_plans' AND column_name='urgency') THEN
        ALTER TABLE calendar_plans ADD COLUMN urgency TEXT DEFAULT 'medium';
    END IF;
END $$;

ALTER TABLE calendar_plans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='calendar_plans' AND policyname='Users manage own plans') THEN
        CREATE POLICY "Users manage own plans" ON calendar_plans FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;


-- ═══════════════════════════════════════════
-- 5. VISION BOARD ITEMS TABLE
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vision_board_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT DEFAULT '',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE vision_board_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vision_board_items' AND policyname='Users manage own vision items') THEN
        CREATE POLICY "Users manage own vision items" ON vision_board_items FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;


-- ═══════════════════════════════════════════
-- 6. WORK SESSIONS TABLE (if you use it)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS work_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='work_sessions' AND policyname='Users manage own sessions') THEN
        CREATE POLICY "Users manage own sessions" ON work_sessions FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;


-- ═══════════════════════════════════════════
-- VERIFICATION: Print all table schemas
-- ═══════════════════════════════════════════

SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('todos', 'habits', 'habit_logs', 'calendar_plans', 'vision_board_items', 'work_sessions')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
