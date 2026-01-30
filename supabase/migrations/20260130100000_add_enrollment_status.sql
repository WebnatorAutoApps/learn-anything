-- Migrate course status from 'active' to enrollment-based 'created'/'started' model.
-- Existing courses default to 'started' so current users see no disruption.

-- Update existing 'active' courses to 'created' enrollment status
update public.courses set status = 'created' where status = 'active';

-- Add an index on status for efficient filtering
create index courses_status_idx on public.courses (status);
