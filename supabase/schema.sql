-- Habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('boolean', 'numeric')) NOT NULL,
  goal_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habits"
  ON habits FOR ALL USING (auth.uid() = user_id);

-- Calendar Plans table
CREATE TABLE calendar_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE calendar_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plans"
  ON calendar_plans FOR ALL USING (auth.uid() = user_id);

-- Vision Board Items table
CREATE TABLE vision_board_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE vision_board_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vision items"
  ON vision_board_items FOR ALL USING (auth.uid() = user_id);
