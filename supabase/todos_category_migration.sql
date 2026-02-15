-- Migration to add category to todos

ALTER TABLE todos 
ADD COLUMN category TEXT DEFAULT 'general';

-- Update existing todos to have 'general' category (already covered by default, but good for clarity)
UPDATE todos SET category = 'general' WHERE category IS NULL;
