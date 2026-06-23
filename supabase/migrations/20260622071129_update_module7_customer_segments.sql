/*
# Update Module 7 — Ideal Customer Profiles with 5-card icon grid visual

1. Changes
- Replace 2x2 grid with 5-card row/grid for customer segments
- Keep existing pain points and buying triggers content
- Add greenfield vs migration project cards
*/

UPDATE lessons
SET video_url = '<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Goal:</strong> Understand who Leapswitch and CloudPe serve, identify ideal customer profiles, and recognize potential customer opportunities.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">7.1 CUSTOMER SEGMENTS</h3>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin:16px 0;">
  <div style="background:linear-gradient(135deg,#EFF6FF 0%,#FFFFFF 100%);border-radius:12px;padding:20px 16px;box-shadow:0 4px 12px rgba(0,0,0,0.06);text-align:center;border-top:4px solid #3B82F6;">
    <div style="font-size:2.5rem;margin-bottom:10px;">🚀</div>
    <div style="font-weight:700;color:#1E40AF;font-size:0.95rem;margin-bottom:8px;">Startups</div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Growing businesses that need affordable infrastructure and the ability to scale quickly.</div>
  </div>
  <div style="background:linear-gradient(135deg,#ECFDF5 0%,#FFFFFF 100%);border-radius:12px;padding:20px 16px;box-shadow:0 4px 12px rgba(0,0,0,0.06);text-align:center;border-top:4px solid #10B981;">
    <div style="font-size:2.5rem;margin-bottom:10px;">🏢</div>
    <div style="font-weight:700;color:#065F46;font-size:0.95rem;margin-bottom:8px;">SMBs</div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Organizations looking for reliable infrastructure, predictable pricing, and managed services.</div>
  </div>
  <div style="background:linear-gradient(135deg,#FEF3C7 0%,#FFFFFF 100%);border-radius:12px;padding:20px 16px;box-shadow:0 4px 12px rgba(0,0,0,0.06);text-align:center;border-top:4px solid #F59E0B;">
    <div style="font-size:2.5rem;margin-bottom:10px;">🏭</div>
    <div style="font-weight:700;color:#92400E;font-size:0.95rem;margin-bottom:8px;">Enterprises</div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Large organizations that require security, compliance, governance, and high availability.</div>
  </div>
  <div style="background:linear-gradient(135deg,#FAF5FF 0%,#FFFFFF 100%);border-radius:12px;padding:20px 16px;box-shadow:0 4px 12px rgba(0,0,0,0.06);text-align:center;border-top:4px solid #A855F7;">
    <div style="font-size:2.5rem;margin-bottom:10px;">🤖</div>
    <div style="font-weight:700;color:#6B21A8;font-size:0.95rem;margin-bottom:8px;">AI & ML Companies</div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Businesses that depend on GPU infrastructure and high-performance computing resources.</div>
  </div>
  <div style="background:linear-gradient(135deg,#FFF1F2 0%,#FFFFFF 100%);border-radius:12px;padding:20px 16px;box-shadow:0 4px 12px rgba(0,0,0,0.06);text-align:center;border-top:4px solid #F43F5E;">
    <div style="font-size:2.5rem;margin-bottom:10px;">🤝</div>
    <div style="font-weight:700;color:#9F1239;font-size:0.95rem;margin-bottom:8px;">Partners & Resellers</div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Organizations that use or resell infrastructure services to support their own customers.</div>
  </div>
</div>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1.25rem 0 0.5rem;">LEAPSWITCH ICP (Ideal Customer Profile)</h4>
<p class="text-slate-600 text-base leading-relaxed mb-4">Leapswitch primarily serves infrastructure-focused organizations such as MSPs, hosting providers, IT resellers, system integrators, and web agencies. These customers rely on dependable infrastructure to support their own services and customers.</p>
<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>They value:</strong> Reliable infrastructure | High uptime | Responsive support | Long-term technology partnerships</p>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1.25rem 0 0.5rem;">CLOUDPE ICP</h4>
<p class="text-slate-600 text-base leading-relaxed mb-4">CloudPe primarily serves growing businesses, technology companies, enterprises, and AI-focused organizations. They look for: Scalable cloud services | Cost-efficient computing | Storage and networking capabilities | GPU resources for advanced workloads</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">7.2 PAIN POINTS BY SEGMENT</h3>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:16px 0;">
  <div style="background:#FFFBEB;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #EAB308;">
    <div style="font-weight:700;color:#713F12;font-size:0.95rem;margin-bottom:6px;">💰 Cost & Billing Challenges</div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;">Customers struggle to understand and control infrastructure spending. Unexpected charges, complex pricing models, and poor visibility make budgeting difficult.</div>
    <div style="font-size:0.75rem;color:#A16207;margin-top:8px;font-style:italic;">Key Signal: "Our cloud bills keep increasing."</div>
  </div>
  <div style="background:#EFF6FF;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #3B82F6;">
    <div style="font-weight:700;color:#1E40AF;font-size:0.95rem;margin-bottom:6px;">🛠️ Support & Operational Challenges</div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;">Many organizations become frustrated when support responses are slow or problems take too long to resolve.</div>
    <div style="font-size:0.75rem;color:#1D4ED8;margin-top:8px;font-style:italic;">Key Signal: "Support takes too long."</div>
  </div>
  <div style="background:#ECFDF5;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #10B981;">
    <div style="font-weight:700;color:#065F46;font-size:0.95rem;margin-bottom:6px;">📈 Performance & Scalability Challenges</div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;">As businesses grow, applications may become slower, workloads may increase, and existing infrastructure may struggle to keep up.</div>
    <div style="font-size:0.75rem;color:#047857;margin-top:8px;font-style:italic;">Key Signal: "Our applications are slowing down."</div>
  </div>
  <div style="background:#FAF5FF;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #A855F7;">
    <div style="font-weight:700;color:#6B21A8;font-size:0.95rem;margin-bottom:6px;">🔒 Security & Compliance Challenges</div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;">Organizations are increasingly concerned about protecting data and meeting regulations. Commonly affects: Financial Services | Healthcare | Government | Enterprise</div>
    <div style="font-size:0.75rem;color:#7C3AED;margin-top:8px;font-style:italic;">Key Signal: "We have compliance requirements."</div>
  </div>
  <div style="background:#FFF7ED;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #F97316;">
    <div style="font-weight:700;color:#7C2D12;font-size:0.95rem;margin-bottom:6px;">🤖 AI & Modern Infrastructure Challenges</div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;">Many organizations want to adopt AI but struggle to access the resources required. Typical scenarios: Training ML models | Running AI applications | Processing large datasets</div>
    <div style="font-size:0.75rem;color:#C2410C;margin-top:8px;font-style:italic;">Key Signal: "We''re exploring AI projects."</div>
  </div>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">7.3 BUYING TRIGGERS</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">Most customers don''t start looking for a new provider without a reason. A specific event, challenge, or business requirement usually triggers the buying journey.</p>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1rem 0 0.5rem;">CUSTOMER SITUATION TYPES</h4>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:16px 0;">
  <div style="background:#ECFDF5;border-radius:12px;padding:18px;box-shadow:0 4px 12px rgba(0,0,0,0.06);border:2px solid #10B981;">
    <div style="font-size:1.5rem;margin-bottom:8px;">🆕</div>
    <div style="font-weight:700;color:#065F46;font-size:1rem;margin-bottom:6px;">GREENFIELD PROJECTS</div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;">A completely new initiative where infrastructure is being built from scratch. Examples: New application launch | New business initiative | New AI project</div>
    <div style="font-size:0.8rem;color:#059669;margin-top:10px;font-weight:600;">Customers compare multiple providers before deciding.</div>
  </div>
  <div style="background:#FEF3C7;border-radius:12px;padding:18px;box-shadow:0 4px 12px rgba(0,0,0,0.06);border:2px solid #F59E0B;">
    <div style="font-size:1.5rem;margin-bottom:8px;">🔄</div>
    <div style="font-weight:700;color:#92400E;font-size:1rem;margin-bottom:6px;">MIGRATION PROJECTS</div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;">A customer is already using another provider but wants to move due to existing challenges. Common reasons: High costs | Poor support | Reliability issues</div>
    <div style="font-size:0.8rem;color:#D97706;margin-top:10px;font-weight:600;">Migration opportunities provide strong sales opportunities because the customer already has a problem.</div>
  </div>
</div>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1rem 0 0.5rem;">RECOGNIZING SERIOUS BUYING INTENT</h4>
<div style="background:#F8FAFC;border-radius:10px;padding:16px 20px;margin:12px 0;">
  <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:10px;">Questions to Ask:</div>
  <ul style="margin:0;padding-left:18px;color:#475569;font-size:0.85rem;line-height:1.8;">
    <li>What problem are you trying to solve?</li>
    <li>What is your timeline?</li>
    <li>Have you evaluated other providers?</li>
    <li>Do you have an approved budget?</li>
    <li>Is this a new project or a migration?</li>
  </ul>
</div>

<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Key Takeaway:</strong> <span style="color:#1E3A8A;">The combination of requirement clarity, urgency, budget, and stakeholder involvement usually indicates a genuine opportunity.</span>
</div>'
WHERE title = 'Module 7 — Ideal Customer Profiles and Pain Points';
