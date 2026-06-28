-- Phase 1 content additions — verbatim from docs/lmscontent.md (nothing invented).
-- 1) M1 §1.1  — "Leadership Team" line in the company intro.
-- 2) M2 §1.3.3 — Current Cloud Landscape narrative (AWS / Microsoft Azure / Google Cloud
--                as major providers; regional & sovereign providers gaining importance;
--                businesses use multiple infrastructure environments).
-- 3) M2 §1.3.5 — add the missing IaaS/PaaS/SaaS examples to the existing comparison:
--                IaaS → Google Compute Engine · PaaS → Azure App Service · SaaS → Slack.
-- Targeted, idempotent replace() edits scoped to the live course; no block restructuring.

DO $$
DECLARE cid uuid := '6c3c352c-5e76-498d-895c-4975084e3ab7';
BEGIN

  -- 1) M1 — Leadership Team line, inserted before the "Your goal" paragraph (intro section).
  UPDATE lessons SET video_url = replace(
    video_url,
    '</p><p><strong>Your goal:</strong> understand what Leapswitch and CloudPe do',
    '</p><p><strong>Leadership Team</strong> — drives the company’s vision and growth.</p><p><strong>Your goal:</strong> understand what Leapswitch and CloudPe do'
  )
  WHERE course_id = cid
    AND video_url LIKE '%<strong>Your goal:</strong> understand what Leapswitch and CloudPe do%'
    AND video_url NOT LIKE '%Leadership Team%';

  -- 2) M2 — Current Cloud Landscape narrative, prepended to the "Cloud Deployment Models" text.
  UPDATE lessons SET video_url = replace(
    video_url,
    '<h3>Cloud Deployment Models</h3><p>Cloud can be deployed three ways',
    '<h3>Cloud Deployment Models</h3><p>Today, cloud computing has become a core part of business operations across almost every industry. Organizations use cloud services for websites, applications, databases, backups, analytics, AI workloads, and much more. The market is dominated by large global providers such as Amazon Web Services (AWS), Microsoft Azure, and Google Cloud. At the same time, regional providers and sovereign cloud platforms are gaining importance due to pricing, support, compliance, and data residency requirements. Modern businesses often use multiple infrastructure environments rather than relying on a single provider.</p><p>Cloud can be deployed three ways'
  )
  WHERE course_id = cid
    AND video_url LIKE '%<h3>Cloud Deployment Models</h3>%'
    AND video_url NOT LIKE '%dominated by large global providers%';

  -- 3a) M2 — IaaS example: Google Compute Engine.
  UPDATE lessons SET video_url = replace(
    video_url,
    'Examples: CloudPe VMs, CloudPe GPU, AWS EC2, Azure VMs',
    'Examples: CloudPe VMs, CloudPe GPU, AWS EC2, Azure VMs, Google Compute Engine'
  )
  WHERE course_id = cid AND video_url NOT LIKE '%Google Compute Engine%';

  -- 3b) M2 — PaaS example: Azure App Service.
  UPDATE lessons SET video_url = replace(
    video_url,
    'Examples: CloudJiffy, Heroku, Google App Engine',
    'Examples: CloudJiffy, Heroku, Google App Engine, Azure App Service'
  )
  WHERE course_id = cid AND video_url NOT LIKE '%Azure App Service%';

  -- 3c) M2 — SaaS example: Slack.
  UPDATE lessons SET video_url = replace(
    video_url,
    'Examples: Gmail, Microsoft 365, Salesforce, Zoom',
    'Examples: Gmail, Microsoft 365, Salesforce, Zoom, Slack'
  )
  WHERE course_id = cid AND video_url NOT LIKE '%Zoom, Slack%';

END $$;
