/*
# Update Module 11 — Discovery, Qualification with BANT framework 2x2 grid

1. Changes
- Replace simple 2x2 grid with styled BANT cards with letter icons
- Keep existing discovery questions and decision drivers content
*/

UPDATE lessons
SET video_url = '<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Goal:</strong> Understand how to conduct effective discovery conversations and qualify opportunities.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">11.1 KEY DISCOVERY QUESTIONS</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">Before recommending a solution, understand the customer''s situation. The goal is to learn, not to sell immediately.</p>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1rem 0 0.5rem;">Areas to Explore</h4>
<ul class="text-slate-600 text-base leading-relaxed mb-4 space-y-1">
  <li><strong>Current Environment</strong> — What infrastructure or provider is the customer using today?</li>
  <li><strong>Business Goals</strong> — What is the customer trying to achieve?</li>
  <li><strong>Challenges</strong> — What problems are they currently facing?</li>
  <li><strong>Future Plans</strong> — Are they planning to scale, migrate, modernize, or adopt AI?</li>
  <li><strong>Decision Process</strong> — Who is involved in evaluating and approving solutions?</li>
</ul>

<div style="background:#F8FAFC;border-radius:10px;padding:16px 20px;margin:12px 0;">
  <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:10px;">Example Discovery Questions:</div>
  <ul style="margin:0;padding-left:18px;color:#475569;font-size:0.85rem;line-height:1.8;">
    <li>"What workloads are you currently running?"</li>
    <li>"What challenges are you facing with your existing environment?"</li>
    <li>"Are you planning any infrastructure changes this year?"</li>
    <li>"What are the most important factors when evaluating providers?"</li>
    <li>"How do you currently manage cloud costs and support requirements?"</li>
  </ul>
</div>

<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Remember:</strong> <span style="color:#1E3A8A;">Good sales conversations begin with understanding, not pitching.</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">11.2 QUALIFYING AN OPPORTUNITY — THE BANT FRAMEWORK</h3>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin:20px 0;">
  <div style="background:linear-gradient(135deg,#ECFDF5 0%,#FFFFFF 100%);border-radius:14px;padding:22px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border:2px solid #10B981;position:relative;overflow:hidden;">
    <div style="position:absolute;top:10px;right:14px;font-size:2.5rem;font-weight:800;color:#10B981;opacity:0.15;">B</div>
    <div style="font-size:1.6rem;margin-bottom:8px;">💰</div>
    <div style="font-weight:700;color:#065F46;font-size:1.05rem;margin-bottom:8px;">BUDGET</div>
    <div style="font-size:0.9rem;color:#475569;line-height:1.5;margin-bottom:12px;">Does the customer have an approved or estimated budget?</div>
    <div style="background:#D1FAE5;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#059669;font-weight:700;text-transform:uppercase;margin-bottom:3px;">Question to Ask</div>
      <div style="font-size:0.85rem;color:#064E3B;font-style:italic;">"Do you have an approved budget for this project?"</div>
    </div>
  </div>

  <div style="background:linear-gradient(135deg,#EFF6FF 0%,#FFFFFF 100%);border-radius:14px;padding:22px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border:2px solid #3B82F6;position:relative;overflow:hidden;">
    <div style="position:absolute;top:10px;right:14px;font-size:2.5rem;font-weight:800;color:#3B82F6;opacity:0.15;">A</div>
    <div style="font-size:1.6rem;margin-bottom:8px;">👤</div>
    <div style="font-weight:700;color:#1E40AF;font-size:1.05rem;margin-bottom:8px;">AUTHORITY</div>
    <div style="font-size:0.9rem;color:#475569;line-height:1.5;margin-bottom:12px;">Are you speaking with the right decision maker?</div>
    <div style="background:#DBEAFE;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#2563EB;font-weight:700;text-transform:uppercase;margin-bottom:3px;">Question to Ask</div>
      <div style="font-size:0.85rem;color:#1E3A8A;font-style:italic;">"Who else is involved in evaluating and approving this decision?"</div>
    </div>
  </div>

  <div style="background:linear-gradient(135deg,#FAF5FF 0%,#FFFFFF 100%);border-radius:14px;padding:22px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border:2px solid #A855F7;position:relative;overflow:hidden;">
    <div style="position:absolute;top:10px;right:14px;font-size:2.5rem;font-weight:800;color:#A855F7;opacity:0.15;">N</div>
    <div style="font-size:1.6rem;margin-bottom:8px;">📋</div>
    <div style="font-weight:700;color:#6B21A8;font-size:1.05rem;margin-bottom:8px;">NEED</div>
    <div style="font-size:0.9rem;color:#475569;line-height:1.5;margin-bottom:12px;">Is there a clear, genuine business requirement?</div>
    <div style="background:#F3E8FF;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#9333EA;font-weight:700;text-transform:uppercase;margin-bottom:3px;">Question to Ask</div>
      <div style="font-size:0.85rem;color:#581C87;font-style:italic;">"What problem are you trying to solve? What happens if you don''t address it?"</div>
    </div>
  </div>

  <div style="background:linear-gradient(135deg,#FFF7ED 0%,#FFFFFF 100%);border-radius:14px;padding:22px;box-shadow:0 4px 16px rgba(0,0,0,0.08);border:2px solid #F97316;position:relative;overflow:hidden;">
    <div style="position:absolute;top:10px;right:14px;font-size:2.5rem;font-weight:800;color:#F97316;opacity:0.15;">T</div>
    <div style="font-size:1.6rem;margin-bottom:8px;">⏰</div>
    <div style="font-weight:700;color:#7C2D12;font-size:1.05rem;margin-bottom:8px;">TIMELINE</div>
    <div style="font-size:0.9rem;color:#475569;line-height:1.5;margin-bottom:12px;">Is there urgency or a defined implementation timeline?</div>
    <div style="background:#FFEDD5;border-radius:8px;padding:10px 12px;">
      <div style="font-size:0.7rem;color:#EA580C;font-weight:700;text-transform:uppercase;margin-bottom:3px;">Question to Ask</div>
      <div style="font-size:0.85rem;color:#7C2D12;font-style:italic;">"What is your timeline? When are you looking to have this in place?"</div>
    </div>
  </div>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">11.3 DECISION DRIVERS</h3>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:12px 0;">
  <div style="background:#F8FAFC;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#3B82F6;font-size:1.1rem;">💎</span>
    <span style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">Price & Value</span>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#10B981;font-size:1.1rem;">🎧</span>
    <span style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">Support Quality</span>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#A855F7;font-size:1.1rem;">⏱️</span>
    <span style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">Reliability & Uptime</span>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#F59E0B;font-size:1.1rem;">🔧</span>
    <span style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">Flexibility</span>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <span style="color:#F43F5E;font-size:1.1rem;">🤝</span>
    <span style="font-size:0.85rem;color:#1E3A8A;font-weight:600;">Trust</span>
  </div>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">11.4 BUSINESS VALUE EXAMPLES</h3>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:16px 0;">
  <div style="background:#ECFDF5;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #10B981;">
    <div style="font-weight:700;color:#065F46;font-size:0.9rem;margin-bottom:4px;">⚡ GPU Infrastructure</div>
    <div style="font-size:0.8rem;color:#475569;">Supports AI initiatives without requiring major hardware investments</div>
  </div>
  <div style="background:#EFF6FF;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #3B82F6;">
    <div style="font-weight:700;color:#1E40AF;font-size:0.9rem;margin-bottom:4px;">💰 Predictable Pricing</div>
    <div style="font-size:0.8rem;color:#475569;">Improves budgeting and reduces unexpected cloud expenses</div>
  </div>
  <div style="background:#FEF3C7;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #F59E0B;">
    <div style="font-weight:700;color:#92400E;font-size:0.9rem;margin-bottom:4px;">🗺️ India-Hosted Infrastructure</div>
    <div style="font-size:0.8rem;color:#475569;">Helps meet compliance requirements and improve data control</div>
  </div>
  <div style="background:#FAF5FF;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #A855F7;">
    <div style="font-weight:700;color:#6B21A8;font-size:0.9rem;margin-bottom:4px;">🎧 Enterprise Support</div>
    <div style="font-size:0.8rem;color:#475569;">Provides faster issue resolution and reduces operational risk</div>
  </div>
</div>

<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Remember:</strong> <span style="color:#1E3A8A;">Features explain what a product does. Business value explains why it matters.</span>
</div>'
WHERE title = 'Module 11 — Discovery, Qualification and Probing';
