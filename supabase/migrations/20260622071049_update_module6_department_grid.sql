/*
# Update Module 6 — Internal Team Structure with department grid visual

1. Changes
- Replace simple table with 14-card department grid
- Keep existing customer priorities content
*/

UPDATE lessons
SET video_url = '<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Goal:</strong> Know the internal teams, their responsibilities, and when to involve them during the sales cycle.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">6.1 DEPARTMENT RESPONSIBILITIES</h3>

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin:16px 0;">
  <div style="background:#EFF6FF;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #3B82F6;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#DBEAFE;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">🎯</div>
      <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;">Demand Generation</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Prospect identification, lead generation, LinkedIn outreach, cold calling, and meeting scheduling</div>
  </div>

  <div style="background:#ECFDF5;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #10B981;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#D1FAE5;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">📞</div>
      <div style="font-weight:700;color:#064E3B;font-size:0.9rem;">Inside Sales (ISR)</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Handles website inquiries, inbound leads, existing customer requests, and solution recommendations</div>
  </div>

  <div style="background:#FEF3C7;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #F59E0B;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#FDE68A;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">💼</div>
      <div style="font-weight:700;color:#92400E;font-size:0.9rem;">Business Development (BDM)</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Conducts discovery meetings, manages opportunities, understands requirements, and drives deal closure</div>
  </div>

  <div style="background:#FAF5FF;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #A855F7;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#F3E8FF;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">🔧</div>
      <div style="font-weight:700;color:#6B21A8;font-size:0.9rem;">Presales Team</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Technical solution design, requirement analysis, architecture recommendations, and quotation support</div>
  </div>

  <div style="background:#FFF1F2;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #F43F5E;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#FFE4E6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">📡</div>
      <div style="font-weight:700;color:#9F1239;font-size:0.9rem;">Monitoring & Backup</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Monitors infrastructure, tracks performance, identifies issues proactively, manages backup operations</div>
  </div>

  <div style="background:#F0F9FF;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #0EA5E9;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#E0F2FE;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">🌐</div>
      <div style="font-weight:700;color:#0C4A6E;font-size:0.9rem;">Network Team</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Network management, IP allocation, connectivity, and coordination with data centers</div>
  </div>

  <div style="background:#F5F3FF;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #8B5CF6;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#EDE9FE;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">🖥️</div>
      <div style="font-weight:700;color:#5B21B6;font-size:0.9rem;">Infrastructure Team</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Server provisioning, deployment, hardware maintenance, and rack management</div>
  </div>

  <div style="background:#FFFBEB;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #EAB308;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#FEF9C3;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">🛟</div>
      <div style="font-weight:700;color:#713F12;font-size:0.9rem;">Support L1/L2/L3</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Resolves technical issues based on escalation levels and complexity</div>
  </div>

  <div style="background:#ECFDF5;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #22C55E;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#DCFCE7;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">☁️</div>
      <div style="font-weight:700;color:#14532D;font-size:0.9rem;">CloudPe Support</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Supports CloudPe-specific customers and platform services</div>
  </div>

  <div style="background:#FFF7ED;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #F97316;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#FFEDD5;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">🤝</div>
      <div style="font-weight:700;color:#7C2D12;font-size:0.9rem;">Customer Success</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Customer onboarding, retention, CRM management, customer experience, and relationship management</div>
  </div>

  <div style="background:#F0FDF4;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #14B8A6;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#CCFBF1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">💳</div>
      <div style="font-weight:700;color:#134E4A;font-size:0.9rem;">Accounting & Billing</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Invoices, payments, collections, and billing-related activities</div>
  </div>

  <div style="background:#FDF2F8;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #EC4899;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#FCE7F3;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">📣</div>
      <div style="font-weight:700;color:#831843;font-size:0.9rem;">Marketing Team</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Content creation, branding, campaigns, digital marketing, and market awareness</div>
  </div>

  <div style="background:#F8FAFC;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #64748B;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#E2E8F0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">📊</div>
      <div style="font-weight:700;color:#334155;font-size:0.9rem;">Data / Business Analyst</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Reporting, analytics, dashboards, and business insights</div>
  </div>

  <div style="background:#EEF2FF;border-radius:10px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #6366F1;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:36px;height:36px;background:#E0E7FF;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">⚙️</div>
      <div style="font-weight:700;color:#312E81;font-size:0.9rem;">Development Team</div>
    </div>
    <div style="font-size:0.8rem;color:#475569;line-height:1.4;">Product development, platform improvements, and feature enhancements</div>
  </div>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">6.2 WHAT CUSTOMERS ACTUALLY CARE ABOUT</h3>
<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Remember:</strong> <span style="color:#1E3A8A;">Customers buy business outcomes, not technical specifications.</span>
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:16px 0;">
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">🔒 Reliability</div>
    <div style="font-size:0.8rem;color:#475569;">Applications and services remain available without unexpected downtime</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">⚡ Performance</div>
    <div style="font-size:0.8rem;color:#475569;">Applications, websites, and workloads run smoothly and efficiently</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">💰 Cost Control</div>
    <div style="font-size:0.8rem;color:#475569;">Predictable infrastructure costs and better visibility into spending</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">🛡️ Security & Compliance</div>
    <div style="font-size:0.8rem;color:#475569;">Solutions that help protect data and meet industry regulations</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">📈 Scalability</div>
    <div style="font-size:0.8rem;color:#475569;">Infrastructure that can grow alongside the business</div>
  </div>
  <div style="background:#F8FAFC;border-radius:8px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:4px;">🤝 Support</div>
    <div style="font-size:0.8rem;color:#475569;">Providers who can help when issues arise and understand business needs</div>
  </div>
</div>'
WHERE title = 'Module 6 — Internal Team Structure';
