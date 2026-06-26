/*
  Point Module 1 → 1.1 "Who We Are" at the shipped vector illustration
  (public/illustrations/who-we-are.svg). Targeted text replace — no full rewrite.
  Swap to who-we-are.png here if a raster asset is added later.
*/
UPDATE lessons
SET video_url = replace(video_url, '/illustrations/who-we-are.png', '/illustrations/who-we-are.svg')
WHERE title = 'Module 1 — Company Overview';
