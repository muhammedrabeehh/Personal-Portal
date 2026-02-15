-- Add status column to todos table for Kanban board
alter table todos
add column status text not null default 'todo'
check (status in ('todo', 'progress', 'done'));

-- Backfill existing rows based on completed boolean
update todos set status = 'done' where completed = true;
update todos set status = 'todo' where completed = false or completed is null;
