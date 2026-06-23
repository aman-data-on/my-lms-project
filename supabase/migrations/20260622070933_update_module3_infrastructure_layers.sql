/*
# Update Module 3 — Leapswitch Infrastructure Portfolio with layers diagram

1. Changes
- Add vertical stacked infrastructure layers diagram
- Enhance product portfolio content
- Add current sales focus priority list
*/

UPDATE lessons
SET video_url = '<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Goal:</strong> Understand Leapswitch''s core offerings, how they are grouped, and which solutions should receive the highest sales focus.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">PRODUCT PORTFOLIO OVERVIEW</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">Leapswitch offers a complete ecosystem of infrastructure, cloud, platform, and supporting services. Rather than providing a single solution, the company enables businesses to run, manage, protect, and scale workloads through a unified portfolio of products.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">INFRASTRUCTURE BASICS — WHY IT MATTERS</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">Every cloud platform and digital service ultimately runs on physical infrastructure. Here is how the layers stack:</p>

<div style="display:flex;flex-direction:column;gap:0;margin:20px 0;max-width:500px;">
  <div style="background:#DBEAFE;border-radius:12px 12px 0 0;padding:16px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-align:center;">
    <div style="font-size:1.5rem;margin-bottom:4px;">🚀</div>
    <div style="font-weight:700;color:#1E40AF;font-size:0.95rem;">Customer Applications</div>
    <div style="font-size:0.8rem;color:#3B82F6;margin-top:4px;">Websites, databases, and business systems run here</div>
  </div>
  <div style="background:#93C5FD;padding:16px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-align:center;">
    <div style="font-size:1.5rem;margin-bottom:4px;">☁️</div>
    <div style="font-weight:700;color:#1E3A8A;font-size:0.95rem;">Cloud Platform</div>
    <div style="font-size:0.8rem;color:#1E3A8A;margin-top:4px;">Manages resources and makes them available on demand</div>
  </div>
  <div style="background:#60A5FA;padding:16px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-align:center;">
    <div style="font-size:1.5rem;margin-bottom:4px;">💻</div>
    <div style="font-weight:700;color:#0F172A;font-size:0.95rem;">Physical Servers</div>
    <div style="font-size:0.8rem;color:#1E3A8A;margin-top:4px;">Provide computing, storage, and networking resources</div>
  </div>
  <div style="background:#3B82F6;padding:16px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-align:center;">
    <div style="font-size:1.5rem;margin-bottom:4px;">🗄️</div>
    <div style="font-weight:700;color:#FFFFFF;font-size:0.95rem;">Server Racks</div>
    <div style="font-size:0.8rem;color:#DBEAFE;margin-top:4px;">Contains physical servers inside the data center</div>
  </div>
  <div style="background:#1E3A8A;border-radius:0 0 12px 12px;padding:16px 20px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;">
    <div style="font-size:1.5rem;margin-bottom:4px;">🏢</div>
    <div style="font-weight:700;color:#FFFFFF;font-size:0.95rem;">Data Center</div>
    <div style="font-size:0.8rem;color:#93C5FD;margin-top:4px;">Houses the physical infrastructure</div>
  </div>
</div>

<p class="text-slate-600 text-base leading-relaxed mb-4">An SLA (Service Level Agreement) defines the availability commitment. Higher uptime means lower chances of service interruption.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">3.1 BARE METAL SERVERS</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">Dedicated physical servers assigned exclusively to a single customer. All hardware resources are reserved for one organization, providing maximum performance, control, and isolation.</p>
<p class="text-slate-600 text-base leading-relaxed mb-2"><strong>Best For:</strong> Large databases | ERP systems | High-traffic applications | Gaming platforms | AI workloads</p>
<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Why Customers Choose Bare Metal:</strong> Dedicated resources | Consistent performance | Greater control | Compliance requirements</p>
<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Key Takeaway:</strong> <span style="color:#1E3A8A;">Bare Metal is ideal for customers who need dedicated infrastructure and maximum control.</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">3.2 GPU CLOUD</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">Scalable, on-demand GPU infrastructure without the need to purchase physical hardware.</p>
<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Who Uses GPU Cloud:</strong> AI organizations | Startups | Software companies | Enterprises | Digital businesses</p>
<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Key Takeaway:</strong> <span style="color:#1E3A8A;">GPU Cloud enables businesses to scale infrastructure quickly while maintaining flexibility and cost efficiency.</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">3.3 PRIVATE CLOUD</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">A private cloud is dedicated to a single organization. Provides greater control, customization, and security for businesses with strict compliance or performance requirements.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">3.4 BACKUP AND DISASTER RECOVERY</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:0.9rem;"><tr style="background:#1E3A8A;color:white;"><th style="padding:10px 14px;text-align:left;">Service</th><th style="padding:10px 14px;text-align:left;">Purpose</th></tr><tr style="background:#f8fafc;"><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Backup Services</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Protect critical data</td></tr><tr><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Disaster Recovery</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Recover from major failures</td></tr></table>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">3.5 NETWORK AND IP SERVICES</h3>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:0.9rem;"><tr style="background:#1E3A8A;color:white;"><th style="padding:10px 14px;text-align:left;">Service</th><th style="padding:10px 14px;text-align:left;">Purpose</th></tr><tr style="background:#f8fafc;"><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Colocation</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Host customer-owned hardware</td></tr><tr><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Managed Services</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Operational support</td></tr><tr style="background:#f8fafc;"><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Hosting</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Website and application hosting</td></tr><tr><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Domains & SSL</td><td style="padding:10px 14px;border-bottom:1px solid #E2E8F0;">Online identity and security</td></tr></table>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">CURRENT SALES FOCUS</h3>
<div style="background:linear-gradient(135deg,#FEF3C7 0%,#FFFBEB 100%);border:2px solid #F59E0B;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 4px 12px rgba(245,158,11,0.15);">
  <div style="font-weight:700;color:#92400E;font-size:1.05rem;margin-bottom:12px;">🎯 Priority Products for Sales Conversations:</div>
  <ol style="margin:0;padding-left:20px;color:#78350F;font-size:0.95rem;line-height:1.8;">
    <li><strong>CloudPe Virtual Machines</strong></li>
    <li><strong>GPU Infrastructure</strong></li>
    <li><strong>Bare Metal Servers</strong></li>
    <li><strong>Kubernetes</strong></li>
    <li><strong>CloudJiffy</strong></li>
  </ol>
  <p style="color:#B45309;font-size:0.85rem;margin-top:12px;margin-bottom:0;">Supporting services should be positioned as additional value.</p>
</div>'
WHERE title = 'Module 3 — Leapswitch Infrastructure Portfolio';
