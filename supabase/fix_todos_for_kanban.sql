-- ============================================
-- DISCIPLINE OS: Fix todos table for Kanban
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check what columns currently exist (for debugging)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'todos'
ORDER BY ordinal_position;

-- Step 2: Add missing columns safely (won't error if they already exist)

-- Add 'completed' column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'todos' AND column_name = 'completed'
    ) THEN
        ALTER TABLE todos ADD COLUMN completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added "completed" column';
    ELSE
        RAISE NOTICE '"completed" column already exists';
    END IF;
END $$;

-- Add 'urgency' column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'todos' AND column_name = 'urgency'
    ) THEN
        ALTER TABLE todos ADD COLUMN urgency TEXT DEFAULT 'light'
            CHECK (urgency IN ('light', 'medium', 'urgent'));
        RAISE NOTICE 'Added "urgency" column';
    ELSE
        RAISE NOTICE '"urgency" column already exists';
    END IF;
END $$;

-- Step 3: Rename "task" to "title" if your table uses "task" instead
-- (Skip this if your column is already named "title")
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'todos' AND column_name = 'task'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'todos' AND column_name = 'title'
    ) THEN
        ALTER TABLE todos RENAME COLUMN task TO title;
        RAISE NOTICE 'Renamed "task" column to "title"';
    ELSE
        RAISE NOTICE 'Column naming is correct (title exists or task does not exist)';
    END IF;
END $$;

-- Step 4: Verify final schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'todos'
ORDER BY ordinal_position;
