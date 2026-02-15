alter table todos 
add column completed_at timestamp with time zone;

-- Optional: Backfill existing completed items with now() or created_at
update todos 
set completed_at = created_at 
where completed = true and completed_at is null;
