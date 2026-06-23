/*
# Update Module 9 — Competitive Landscape with battle card 5-step chevron flow

1. Changes
- Add 5-step horizontal chevron flow for battle card process
- Keep existing comparison tables
- Enhance CloudPe vs Hyperscalers and Regional providers tables
*/

UPDATE lessons
SET video_url = '<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Goal:</strong> Understand the competitive landscape and how to confidently respond when customers compare Leapswitch and CloudPe with competing providers.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">9.1 UNDERSTANDING THE COMPETITIVE LANDSCAPE</h3>

<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.85rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <tr style="background:#1E3A8A;color:white;">
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Provider Type</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Examples</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Why Customers Choose Them</th>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Hyperscalers</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">AWS, Azure, Google Cloud</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Large service portfolio, global presence, extensive ecosystem</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Regional Providers</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">DigitalOcean, Vultr, Utho</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Simplicity, predictable pricing, easier onboarding</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Infrastructure Partners</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">MSPs, Hosting Providers, IT Resellers</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Managed services, specialized expertise, customer-focused support</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Leapswitch & CloudPe</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">CloudPe, Leapswitch Infrastructure</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Flexible solutions, personalized support, competitive pricing, AI & GPU capabilities</td>
  </tr>
</table>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">9.2 CLOUDPE VS HYPERSCALERS (AWS, AZURE, GOOGLE CLOUD)</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>What are Battle Cards?</strong> Battle cards are quick-reference guides that help sales teams respond when customers compare Leapswitch or CloudPe with other providers. They highlight key discussion points, customer concerns, and solution positioning.</p>

<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.85rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <tr style="background:#1E3A8A;color:white;">
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Evaluation Factor</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Hyperscalers (AWS/Azure/GCP)</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">CloudPe</th>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Pricing Model</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Complex, variable pricing that''s hard to predict</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Transparent, predictable pricing</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Support</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Tiered paid support; basic support is limited</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Dedicated support included</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Data Location</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Global infrastructure; data may leave India</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">India-hosted; data stays in India</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Complexity</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Hundreds of services; steep learning curve</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Focused services; easier to manage</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Customization</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Standard offerings; limited flexibility</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Flexible, customized solutions</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Local Compliance</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Requires additional configuration</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Built for Indian compliance requirements</td>
  </tr>
</table>

<div style="background:#EFF6FF;border-radius:8px;padding:14px 18px;margin:12px 0;">
  <strong style="color:#1E40AF;font-size:0.9rem;">📌 Positioning Guidance:</strong> <span style="color:#1E3A8A;font-size:0.9rem;">Focus on support, flexibility, predictable pricing, and customer engagement rather than comparing feature lists.</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">9.3 CLOUDPE VS REGIONAL PROVIDERS (DIGITALOCEAN, VULTR, UTHO)</h3>

<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.85rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <tr style="background:#1E3A8A;color:white;">
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Evaluation Factor</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Regional Providers</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">CloudPe</th>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">AI & GPU Capability</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Limited or no GPU infrastructure</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Strong GPU infrastructure for AI workloads</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Support Depth</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Self-service focused</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Enterprise-level support with dedicated teams</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">India Infrastructure</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Not India-specific</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">India-hosted with local compliance focus</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Customization</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Standard plans</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Flexible, customizable solutions</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Partner Programs</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Limited</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Strong partner and reseller ecosystem</td>
  </tr>
</table>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">9.4 WHY PARTNERS CHOOSE LEAPSWITCH</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">A significant portion of Leapswitch business comes through partners such as hosting providers, MSPs, IT resellers, and infrastructure providers.</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:16px 0;">
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:600;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">🏗️ Reliable Infrastructure</div>
    <div style="font-size:0.8rem;color:#475569;">Build and support their own customer services</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:600;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">📞 Dedicated Partner Support</div>
    <div style="font-size:0.8rem;color:#475569;">Partner support and escalation pathways</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:600;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">💰 Competitive Partner Pricing</div>
    <div style="font-size:0.8rem;color:#475569;">Partner pricing and commercial terms</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:600;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">🤝 Long-term Partnership</div>
    <div style="font-size:0.8rem;color:#475569;">Technology partnership approach</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:600;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">⚡ Full Portfolio Access</div>
    <div style="font-size:0.8rem;color:#475569;">GPU and Bare Metal included</div>
  </div>
</div>

<div style="background:#EFF6FF;border-radius:8px;padding:14px 18px;margin:12px 0;">
  <strong style="color:#1E40AF;font-size:0.9rem;">📌 Positioning Guidance:</strong> <span style="color:#1E3A8A;font-size:0.9rem;">Position Leapswitch as a long-term infrastructure partner, not just a service provider.</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">9.5 USING BATTLE CARDS — FIVE-STEP PROCESS</h3>

<div style="display:flex;flex-wrap:wrap;gap:0;margin:24px 0;position:relative;">
  <div style="flex:1;min-width:160px;background:#DBEAFE;padding:18px 16px;position:relative;clip-path:polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%);padding-left:24px;">
    <div style="font-weight:800;color:#1E40AF;font-size:0.85rem;margin-bottom:6px;">STEP 1</div>
    <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">Understand Customer Requirement</div>
    <div style="font-size:0.75rem;color:#475569;">Gather information about customer needs</div>
  </div>
  <div style="flex:1;min-width:160px;background:#BFDBFE;padding:18px 16px;position:relative;clip-path:polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%);padding-left:24px;margin-left:-6px;">
    <div style="font-weight:800;color:#1E40AF;font-size:0.85rem;margin-bottom:6px;">STEP 2</div>
    <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">Identify Evaluation Criteria</div>
    <div style="font-size:0.75rem;color:#475569;">Determine key factors for evaluation</div>
  </div>
  <div style="flex:1;min-width:160px;background:#93C5FD;padding:18px 16px;position:relative;clip-path:polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%);padding-left:24px;margin-left:-6px;">
    <div style="font-weight:800;color:#1E3A8A;font-size:0.85rem;margin-bottom:6px;">STEP 3</div>
    <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">Use Relevant Battle Card</div>
    <div style="font-size:0.75rem;color:#1E3A8A;">Employ battle card for comparison</div>
  </div>
  <div style="flex:1;min-width:160px;background:#60A5FA;padding:18px 16px;position:relative;clip-path:polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%);padding-left:24px;margin-left:-6px;">
    <div style="font-weight:800;color:#FFFFFF;font-size:0.85rem;margin-bottom:6px;">STEP 4</div>
    <div style="font-weight:700;color:#FFFFFF;font-size:0.9rem;margin-bottom:4px;">Position Differentiators</div>
    <div style="font-size:0.75rem;color:#DBEAFE;">Highlight unique selling points</div>
  </div>
  <div style="flex:1;min-width:160px;background:#3B82F6;padding:18px 16px;position:relative;clip-path:polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%);padding-left:24px;margin-left:-6px;">
    <div style="font-weight:800;color:#FFFFFF;font-size:0.85rem;margin-bottom:6px;">STEP 5</div>
    <div style="font-weight:700;color:#FFFFFF;font-size:0.9rem;margin-bottom:4px;">Connect to Business Value</div>
    <div style="font-size:0.75rem;color:#DBEAFE;">Demonstrate how differentiators benefit the customer</div>
  </div>
</div>

<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Key Takeaway:</strong> <span style="color:#1E3A8A;">The objective of a battle card is not to prove a competitor is wrong. The objective is to help customers understand which solution best fits their requirements.</span>
</div>'
WHERE title = 'Module 9 — Competitive Landscape and Battle Cards';
