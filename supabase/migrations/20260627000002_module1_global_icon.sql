-- Module 1 "Global Presence" key-fact used icon "servers" (which rendered empty,
-- and is the wrong meaning anyway). Use the semantic "globe" icon. Surgical text
-- replace of the quoted JSON value (only occurrence in Module 1).
UPDATE lessons
SET video_url = replace(video_url, '"servers"', '"globe"')
WHERE order_index = 0
  AND course_id IN (SELECT id FROM courses WHERE title ILIKE 'Sales Onboarding%');
