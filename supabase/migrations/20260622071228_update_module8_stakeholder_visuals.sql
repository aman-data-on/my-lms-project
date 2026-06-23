/*
# Update Module 8 — Stakeholder Mapping with full table and buyer comparison cards

1. Changes
- Replace simple table with full 4-column stakeholder priorities table
- Add Technical vs Business Buyers comparison cards
- Keep existing qualified opportunities content
*/

UPDATE lessons
SET video_url = '<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Goal:</strong> Understand how different stakeholders evaluate solutions and how buying behavior impacts the sales process.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">8.1 STAKEHOLDER PRIORITIES & BUYING PSYCHOLOGY</h3>

<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.85rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <tr style="background:#1E3A8A;color:white;">
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Stakeholder</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Focus</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">What They Care About</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Questions They May Ask</th>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">CEO / Founder</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Business growth</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Business outcomes, growth, risk, partnerships</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;font-style:italic;font-size:0.8rem;">Will this help us grow faster? Can we trust this provider? What business value does it create?</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">CTO</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Technology strategy</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Scalability, performance, technical fit, future readiness</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;font-style:italic;font-size:0.8rem;">Can it scale with growth? Does it fit our architecture? Is the platform reliable?</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">CIO</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Governance, security, stability</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Security, compliance, risk management, vendor stability</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;font-style:italic;font-size:0.8rem;">Is the provider secure? Can it meet compliance requirements? How reliable is the vendor?</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Finance Teams</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Costs and ROI</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Cost control, predictable pricing, budget planning, ROI</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;font-style:italic;font-size:0.8rem;">Is the investment justified? Are costs predictable? Can we reduce operational expenses?</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Procurement Teams</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Contracts and vendor evaluation</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Pricing terms, contract flexibility, risk reduction, vendor credibility</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;font-style:italic;font-size:0.8rem;">Are pricing terms competitive? Is the vendor reliable? What risks exist?</td>
  </tr>
</table>

<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Key Takeaway:</strong> <span style="color:#1E3A8A;">Different stakeholders buy for different reasons. Sales teams must understand what matters most to each decision maker.</span>
</div>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1.25rem 0 0.5rem;">TECHNICAL VS BUSINESS BUYERS</h4>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:16px 0;">
  <div style="background:linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%);border-radius:12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.08);border:2px solid #3B82F6;">
    <div style="font-size:1.5rem;margin-bottom:8px;">🔧</div>
    <div style="font-weight:700;color:#1E40AF;font-size:1rem;margin-bottom:10px;">Technical Buyers</div>
    <div style="font-size:0.85rem;color:#1E3A8A;line-height:1.6;">
      <div style="margin-bottom:6px;"><strong>Evaluate:</strong></div>
      <ul style="margin:0;padding-left:18px;">
        <li>Performance</li>
        <li>Security</li>
        <li>Scalability</li>
        <li>Architecture fit</li>
        <li>Integration capabilities</li>
        <li>Uptime and reliability</li>
      </ul>
    </div>
  </div>
  <div style="background:linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 100%);border-radius:12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.08);border:2px solid #F97316;">
    <div style="font-size:1.5rem;margin-bottom:8px;">💼</div>
    <div style="font-weight:700;color:#7C2D12;font-size:1rem;margin-bottom:10px;">Business Buyers</div>
    <div style="font-size:0.85rem;color:#7C2D12;line-height:1.6;">
      <div style="margin-bottom:6px;"><strong>Evaluate:</strong></div>
      <ul style="margin:0;padding-left:18px;">
        <li>Cost and ROI</li>
        <li>Business outcomes</li>
        <li>Growth enablement</li>
        <li>Risk reduction</li>
        <li>Vendor trust</li>
        <li>Time to value</li>
      </ul>
    </div>
  </div>
</div>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1.25rem 0 0.5rem;">FACTORS THAT BUILD TRUST</h4>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:12px 0;">
  <div style="background:#F8FAFC;border-radius:8px;padding:12px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-size:1.3rem;margin-bottom:4px;">🏆</div>
    <div style="font-weight:600;color:#1E3A8A;font-size:0.85rem;">Experience</div>
    <div style="font-size:0.75rem;color:#475569;">Proven track record</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:12px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-size:1.3rem;margin-bottom:4px;">🛡️</div>
    <div style="font-weight:600;color:#1E3A8A;font-size:0.85rem;">Reliability</div>
    <div style="font-size:0.75rem;color:#475569;">Consistent uptime</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:12px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-size:1.3rem;margin-bottom:4px;">🤝</div>
    <div style="font-weight:600;color:#1E3A8A;font-size:0.85rem;">Customer Success</div>
    <div style="font-size:0.75rem;color:#475569;">Case studies and references</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:12px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-size:1.3rem;margin-bottom:4px;">📞</div>
    <div style="font-weight:600;color:#1E3A8A;font-size:0.85rem;">Support</div>
    <div style="font-size:0.75rem;color:#475569;">Responsive teams</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:12px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-size:1.3rem;margin-bottom:4px;">🔍</div>
    <div style="font-weight:600;color:#1E3A8A;font-size:0.85rem;">Transparency</div>
    <div style="font-size:0.75rem;color:#475569;">Clear communication</div>
  </div>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">8.2 IDENTIFYING QUALIFIED OPPORTUNITIES</h3>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin:12px 0;">
  <div style="background:#ECFDF5;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#10B981;font-size:1.1rem;">✅</span>
    <span style="font-size:0.85rem;color:#064E3B;font-weight:600;">Infrastructure Growth</span>
  </div>
  <div style="background:#ECFDF5;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#10B981;font-size:1.1rem;">✅</span>
    <span style="font-size:0.85rem;color:#064E3B;font-weight:600;">Cloud Adoption</span>
  </div>
  <div style="background:#ECFDF5;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#10B981;font-size:1.1rem;">✅</span>
    <span style="font-size:0.85rem;color:#064E3B;font-weight:600;">Technology Expansion</span>
  </div>
  <div style="background:#ECFDF5;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#10B981;font-size:1.1rem;">✅</span>
    <span style="font-size:0.85rem;color:#064E3B;font-weight:600;">AI Initiatives</span>
  </div>
  <div style="background:#ECFDF5;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#10B981;font-size:1.1rem;">✅</span>
    <span style="font-size:0.85rem;color:#064E3B;font-weight:600;">Business Expansion</span>
  </div>
  <div style="background:#ECFDF5;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#10B981;font-size:1.1rem;">✅</span>
    <span style="font-size:0.85rem;color:#064E3B;font-weight:600;">Modernization Projects</span>
  </div>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">8.3 SCENARIO EXERCISES</h3>

<div style="background:#FFFFFF;border:2px solid #E2E8F0;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
  <div style="font-weight:700;color:#1E3A8A;font-size:1rem;margin-bottom:10px;">📋 SCENARIO 1</div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;margin-bottom:12px;">
    <div style="font-style:italic;color:#475569;font-size:0.95rem;">"We are training machine learning models and need GPU infrastructure."</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
    <div style="background:#EFF6FF;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#3B82F6;font-weight:700;text-transform:uppercase;">Industry</div>
      <div style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">AI & Machine Learning</div>
    </div>
    <div style="background:#ECFDF5;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#10B981;font-weight:700;text-transform:uppercase;">Priority</div>
      <div style="font-size:0.85rem;color:#064E3B;font-weight:600;">GPU Performance</div>
    </div>
    <div style="background:#FEF3C7;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#D97706;font-weight:700;text-transform:uppercase;">Solution</div>
      <div style="font-size:0.85rem;color:#92400E;font-weight:600;">GPU Cloud</div>
    </div>
  </div>
</div>

<div style="background:#FFFFFF;border:2px solid #E2E8F0;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
  <div style="font-weight:700;color:#1E3A8A;font-size:1rem;margin-bottom:10px;">📋 SCENARIO 2</div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;margin-bottom:12px;">
    <div style="font-style:italic;color:#475569;font-size:0.95rem;">"We need infrastructure that meets regulatory and compliance requirements."</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
    <div style="background:#EFF6FF;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#3B82F6;font-weight:700;text-transform:uppercase;">Industry</div>
      <div style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">FinTech or Enterprise</div>
    </div>
    <div style="background:#ECFDF5;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#10B981;font-weight:700;text-transform:uppercase;">Priority</div>
      <div style="font-size:0.85rem;color:#064E3B;font-weight:600;">Compliance & Security</div>
    </div>
    <div style="background:#FEF3C7;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#D97706;font-weight:700;text-transform:uppercase;">Solution</div>
      <div style="font-size:0.85rem;color:#92400E;font-weight:600;">Secure Cloud Infrastructure</div>
    </div>
  </div>
</div>

<div style="background:#FFFFFF;border:2px solid #E2E8F0;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
  <div style="font-weight:700;color:#1E3A8A;font-size:1rem;margin-bottom:10px;">📋 SCENARIO 3</div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;margin-bottom:12px;">
    <div style="font-style:italic;color:#475569;font-size:0.95rem;">"Traffic increases dramatically during sales campaigns and festivals."</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
    <div style="background:#EFF6FF;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#3B82F6;font-weight:700;text-transform:uppercase;">Industry</div>
      <div style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">E-commerce & Digital</div>
    </div>
    <div style="background:#ECFDF5;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#10B981;font-weight:700;text-transform:uppercase;">Priority</div>
      <div style="font-size:0.85rem;color:#064E3B;font-weight:600;">Performance & Availability</div>
    </div>
    <div style="background:#FEF3C7;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#D97706;font-weight:700;text-transform:uppercase;">Solution</div>
      <div style="font-size:0.85rem;color:#92400E;font-weight:600;">Scalable Cloud Infrastructure</div>
    </div>
  </div>
</div>'
WHERE title = 'Module 8 — Stakeholder Mapping and Customer Matching';
