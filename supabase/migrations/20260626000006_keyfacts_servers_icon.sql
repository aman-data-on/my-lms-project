/*
  Module 1 → 1.1 key facts: the middle fact ("Global Presence") now uses the
  server-stack icon (matching the approved facts-strip design) instead of a
  globe. Targeted replace on the unique key_facts substring so the timeline's
  own globe icons are untouched. Content text is unchanged.
*/
UPDATE lessons
SET video_url = replace(
  video_url,
  '"sublabel": "across multiple regions", "icon": "globe"',
  '"sublabel": "across multiple regions", "icon": "servers"'
)
WHERE title = 'Module 1 — Company Overview';
