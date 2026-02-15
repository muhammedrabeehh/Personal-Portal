-- Discipline OS Schema Initialization

-- 1. TODOS: Add urgency if not exists, or create table if missing
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'general',
  urgency TEXT CHECK (urgency IN ('light', 'medium', 'urgent')) DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Safely add urgency column if table exists without it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'urgency') THEN 
        ALTER TABLE todos ADD COLUMN urgency TEXT CHECK (urgency IN ('light', 'medium', 'urgent')) DEFAULT 'light'; 
    END IF; 
END $$;

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" ON todos FOR DELETE USING (auth.uid() = user_id);


-- 2. HABITS: Ensure table exists
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);


-- 3. HABIT LOGS: Track daily completions
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  completed_at DATE DEFAULT CURRENT_DATE,
  UNIQUE(habit_id, completed_at) -- Prevent duplicate logs for same day
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to access logs linked to their habits
CREATE POLICY "Users manage own habit logs" ON habit_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid())
);


-- 4. CALENDAR PLANS: Ensure table exists
CREATE TABLE IF NOT EXISTS calendar_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  category TEXT DEFAULT 'general',
  urgency TEXT CHECK (urgency IN ('light', 'medium', 'urgent')) DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE calendar_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own plans" ON calendar_plans FOR ALL USING (auth.uid() = user_id);


-- 5. VISION BOARD ITEMS
CREATE TABLE IF NOT EXISTS vision_board_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE vision_board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own vision items" ON vision_board_items FOR ALL USING (auth.uid() = user_id);
