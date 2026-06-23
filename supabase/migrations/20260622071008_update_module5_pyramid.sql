/*
# Update Module 5 — Features, Benefits, and Business Value with pyramid visual

1. Changes
- Add Feature → Benefit → Business Value ascending staircase visual
- Keep existing solution mapping table
- Add scenario exercise cards with reveal toggle simulation
*/

UPDATE lessons
SET video_url = '<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Goal:</strong> Learn how to translate technical features into customer benefits and measurable business outcomes.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">5.1 WHY FEATURE SELLING DOES NOT WORK</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">Many new salespeople focus on explaining technical features. Customers are usually more interested in the outcomes those features create.</p>

<div style="background:#FEE2E2;border:1px solid #EF4444;border-radius:10px;padding:16px 18px;margin:12px 0;box-shadow:0 2px 6px rgba(239,68,68,0.08);">
  <span style="color:#EF4444;font-size:1.1rem;">❌</span> <strong style="color:#991B1B;">Feature-Focused:</strong> <span style="color:#7F1D1D;">"We provide Kubernetes clusters and NVMe storage."</span>
</div>
<div style="background:#D1FAE5;border:1px solid #10B981;border-radius:10px;padding:16px 18px;margin:12px 0;box-shadow:0 2px 6px rgba(16,185,129,0.08);">
  <span style="color:#10B981;font-size:1.1rem;">✅</span> <strong style="color:#065F46;">Value-Focused:</strong> <span style="color:#064E3B;">"We help your applications run faster, scale more easily, and deliver a better customer experience."</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">5.2 THE THREE LEVELS — FEATURE, BENEFIT, BUSINESS VALUE</h3>

<div style="display:flex;flex-direction:column;align-items:center;gap:0;margin:24px 0;max-width:480px;margin-left:auto;margin-right:auto;">
  <div style="width:100%;background:#1E3A8A;border-radius:12px 12px 0 0;padding:20px 24px;text-align:center;box-shadow:0 4px 12px rgba(30,58,138,0.2);position:relative;z-index:3;">
    <div style="font-size:0.7rem;color:#93C5FD;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">Step 3</div>
    <div style="font-weight:800;color:#FFFFFF;font-size:1.1rem;">BUSINESS VALUE</div>
    <div style="font-size:0.85rem;color:#BFDBFE;margin-top:6px;">The measurable outcome that helps achieve a business goal</div>
    <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:8px 14px;margin-top:10px;display:inline-block;">
      <span style="color:#FFFFFF;font-size:0.85rem;font-weight:600;">Example: Better user experience, more customers retained</span>
    </div>
  </div>
  <div style="width:90%;background:#3B82F6;border-radius:0;padding:18px 24px;text-align:center;box-shadow:0 4px 12px rgba(59,130,246,0.2);position:relative;z-index:2;">
    <div style="font-size:0.7rem;color:#DBEAFE;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">Step 2</div>
    <div style="font-weight:800;color:#FFFFFF;font-size:1.05rem;">BENEFIT</div>
    <div style="font-size:0.85rem;color:#DBEAFE;margin-top:6px;">The advantage it creates for the customer</div>
    <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:8px 14px;margin-top:10px;display:inline-block;">
      <span style="color:#FFFFFF;font-size:0.85rem;font-weight:600;">Example: Faster application performance</span>
    </div>
  </div>
  <div style="width:80%;background:#DBEAFE;border-radius:0 0 12px 12px;padding:16px 24px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.08);position:relative;z-index:1;">
    <div style="font-size:0.7rem;color:#3B82F6;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:6px;">Step 1</div>
    <div style="font-weight:800;color:#1E3A8A;font-size:1rem;">FEATURE</div>
    <div style="font-size:0.85rem;color:#1E40AF;margin-top:6px;">What the product does</div>
    <div style="background:rgba(59,130,246,0.15);border-radius:8px;padding:8px 14px;margin-top:10px;display:inline-block;">
      <span style="color:#1E3A8A;font-size:0.85rem;font-weight:600;">Example: SSD Storage</span>
    </div>
  </div>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">5.3 REFERENCE TABLE — FULL PRODUCT VALUE MAPPING</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:0.9rem;"><tr style="background:#1E3A8A;color:white;"><th style="padding:10px 14px;text-align:left;">Feature</th><th style="padding:10px 14px;text-align:left;">Benefit</th><th style="padding:10px 14px;text-align:left;">Business Value</th></tr><tr style="background:#f8fafc;"><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">SSD Storage</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Faster application performance</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Better user experience</td></tr><tr><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Auto Scaling</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Handles traffic growth automatically</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Supports business growth</td></tr><tr style="background:#f8fafc;"><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Backup Services</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Protects business data</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Reduced business risk</td></tr><tr><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Managed Support</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Faster issue resolution</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Reduced downtime</td></tr><tr style="background:#f8fafc;"><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">GPU Infrastructure</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Faster model training</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Faster AI product development</td></tr><tr><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Predictable Pricing</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Easier budgeting</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Reduced unexpected cloud expenses</td></tr><tr style="background:#f8fafc;"><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">India-Hosted Infrastructure</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Local compliance</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Better data control</td></tr></table>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">5.4 SOLUTION MAPPING</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:0.9rem;"><tr style="background:#1E3A8A;color:white;"><th style="padding:10px 14px;text-align:left;">Customer Challenge</th><th style="padding:10px 14px;text-align:left;">Recommended Solution</th></tr><tr style="background:#f8fafc;"><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Training AI models is slow</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">GPU Cloud</td></tr><tr><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Traffic spikes during campaigns</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Scalable Cloud Infrastructure</td></tr><tr style="background:#f8fafc;"><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Need reliable data backup</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Backup & Disaster Recovery</td></tr><tr><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Want to deploy apps without managing servers</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">CloudJiffy</td></tr><tr style="background:#f8fafc;"><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Need dedicated, high-performance servers</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Bare Metal Servers</td></tr><tr><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Need flexible cloud resources</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">CloudPe Virtual Machines</td></tr></table>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">5.5 SCENARIO EXERCISES</h3>

<div style="background:#FFFFFF;border:2px solid #E2E8F0;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
  <div style="font-weight:700;color:#1E3A8A;font-size:1rem;margin-bottom:10px;">📋 SCENARIO 1</div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;margin-bottom:12px;">
    <div style="font-style:italic;color:#475569;font-size:0.95rem;">"Training our AI models is taking too long."</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;">
    <div style="background:#EFF6FF;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#3B82F6;font-weight:700;text-transform:uppercase;">Need</div>
      <div style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">Faster AI Training</div>
    </div>
    <div style="background:#ECFDF5;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#10B981;font-weight:700;text-transform:uppercase;">Solution</div>
      <div style="font-size:0.85rem;color:#064E3B;font-weight:600;">GPU Cloud</div>
    </div>
    <div style="background:#FEF3C7;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#D97706;font-weight:700;text-transform:uppercase;">Business Value</div>
      <div style="font-size:0.85rem;color:#92400E;font-weight:600;">Faster Product Development</div>
    </div>
  </div>
</div>

<div style="background:#FFFFFF;border:2px solid #E2E8F0;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
  <div style="font-weight:700;color:#1E3A8A;font-size:1rem;margin-bottom:10px;">📋 SCENARIO 2</div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;margin-bottom:12px;">
    <div style="font-style:italic;color:#475569;font-size:0.95rem;">"Traffic spikes during seasonal campaigns are affecting our website."</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;">
    <div style="background:#EFF6FF;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#3B82F6;font-weight:700;text-transform:uppercase;">Need</div>
      <div style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">Scalability</div>
    </div>
    <div style="background:#ECFDF5;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#10B981;font-weight:700;text-transform:uppercase;">Solution</div>
      <div style="font-size:0.85rem;color:#064E3B;font-weight:600;">Cloud Infrastructure</div>
    </div>
    <div style="background:#FEF3C7;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#D97706;font-weight:700;text-transform:uppercase;">Business Value</div>
      <div style="font-size:0.85rem;color:#92400E;font-weight:600;">Better Customer Experience</div>
    </div>
  </div>
</div>

<div style="background:#FFFFFF;border:2px solid #E2E8F0;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
  <div style="font-weight:700;color:#1E3A8A;font-size:1rem;margin-bottom:10px;">📋 SCENARIO 3</div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;margin-bottom:12px;">
    <div style="font-style:italic;color:#475569;font-size:0.95rem;">"We need a reliable backup strategy for business-critical data."</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;">
    <div style="background:#EFF6FF;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#3B82F6;font-weight:700;text-transform:uppercase;">Need</div>
      <div style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">Data Protection</div>
    </div>
    <div style="background:#ECFDF5;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#10B981;font-weight:700;text-transform:uppercase;">Solution</div>
      <div style="font-size:0.85rem;color:#064E3B;font-weight:600;">Backup & Disaster Recovery</div>
    </div>
    <div style="background:#FEF3C7;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#D97706;font-weight:700;text-transform:uppercase;">Business Value</div>
      <div style="font-size:0.85rem;color:#92400E;font-weight:600;">Reduced Business Risk</div>
    </div>
  </div>
</div>'
WHERE title = 'Module 5 — Features, Benefits, and Business Value';
