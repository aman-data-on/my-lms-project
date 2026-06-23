/*
# Update Module 1 — Company Overview with zigzag timeline visual

1. Changes
- Replace the simple lesson content with rich HTML including:
  - Vertical zigzag timeline for Leapswitch Growth Journey
  - Styled callout boxes for key takeaways
  - Proper section structure for Company Overview and CloudPe sections
*/

UPDATE lessons
SET video_url = '<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Goal:</strong> Understand what Leapswitch and CloudPe do, who they serve, and how to explain the company confidently.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">1.1 WHO WE ARE — LEAPSWITCH NETWORKS</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">Leapswitch Networks is an infrastructure and cloud company founded in 2006. Over nearly two decades, it has evolved from a hosting provider into a full-scale infrastructure platform serving startups, enterprises, government organizations, and technology companies across India and international markets.</p>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1rem 0 0.5rem;">THE LEAPSWITCH GROWTH JOURNEY</h4>
<div style="position:relative;padding:0 0 0 0;margin:1.5rem 0;">
  <div style="position:absolute;left:50%;top:0;bottom:0;width:3px;background:linear-gradient(to bottom,#10B981,#F59E0B,#3B82F6,#A855F7,#14B8A6,#6366F1,#F43F5E,#059669);transform:translateX(-50%);border-radius:2px;"></div>

  <div style="display:flex;align-items:center;margin-bottom:1.25rem;position:relative;">
    <div style="flex:1;text-align:right;padding-right:2rem;">
      <div style="display:inline-block;background:#ECFDF5;border-left:5px solid #10B981;border-radius:9999px;padding:0.75rem 1.25rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);max-width:280px;">
        <div style="font-size:1.25rem;margin-bottom:0.25rem;">🌱</div>
        <div style="font-weight:700;color:#065F46;font-size:0.9rem;">2006 — Company Founded</div>
        <div style="font-size:0.8rem;color:#047857;margin-top:0.25rem;">LaceHost started by Ishan Talathi</div>
      </div>
    </div>
    <div style="width:16px;height:16px;background:#10B981;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #10B981;position:relative;z-index:2;flex-shrink:0;"></div>
    <div style="flex:1;padding-left:2rem;"></div>
  </div>

  <div style="display:flex;align-items:center;margin-bottom:1.25rem;position:relative;">
    <div style="flex:1;padding-right:2rem;"></div>
    <div style="width:16px;height:16px;background:#F59E0B;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #F59E0B;position:relative;z-index:2;flex-shrink:0;"></div>
    <div style="flex:1;text-align:left;padding-left:2rem;">
      <div style="display:inline-block;background:#FFFBEB;border-left:5px solid #F59E0B;border-radius:9999px;padding:0.75rem 1.25rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);max-width:280px;">
        <div style="font-size:1.25rem;margin-bottom:0.25rem;">🔄</div>
        <div style="font-weight:700;color:#92400E;font-size:0.9rem;">2009 — Rebranding</div>
        <div style="font-size:0.8rem;color:#B45309;margin-top:0.25rem;">LaceHost integrated with We3Care, became Leapswitch Networks</div>
      </div>
    </div>
  </div>

  <div style="display:flex;align-items:center;margin-bottom:1.25rem;position:relative;">
    <div style="flex:1;text-align:right;padding-right:2rem;">
      <div style="display:inline-block;background:#EFF6FF;border-left:5px solid #3B82F6;border-radius:9999px;padding:0.75rem 1.25rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);max-width:280px;">
        <div style="font-size:1.25rem;margin-bottom:0.25rem;">🌍</div>
        <div style="font-weight:700;color:#1E40AF;font-size:0.9rem;">2010–2014 — Global Expansion</div>
        <div style="font-size:0.8rem;color:#2563EB;margin-top:0.25rem;">Infrastructure expanded across US, Europe, and India</div>
      </div>
    </div>
    <div style="width:16px;height:16px;background:#3B82F6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #3B82F6;position:relative;z-index:2;flex-shrink:0;"></div>
    <div style="flex:1;padding-left:2rem;"></div>
  </div>

  <div style="display:flex;align-items:center;margin-bottom:1.25rem;position:relative;">
    <div style="flex:1;padding-right:2rem;"></div>
    <div style="width:16px;height:16px;background:#A855F7;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #A855F7;position:relative;z-index:2;flex-shrink:0;"></div>
    <div style="flex:1;text-align:left;padding-left:2rem;">
      <div style="display:inline-block;background:#FAF5FF;border-left:5px solid #A855F7;border-radius:9999px;padding:0.75rem 1.25rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);max-width:280px;">
        <div style="font-size:1.25rem;margin-bottom:0.25rem;">⚡</div>
        <div style="font-weight:700;color:#6B21A8;font-size:0.9rem;">2018 — CloudJiffy Launch</div>
        <div style="font-size:0.8rem;color:#9333EA;margin-top:0.25rem;">Introduced Platform-as-a-Service (PaaS) CloudJiffy</div>
      </div>
    </div>
  </div>

  <div style="display:flex;align-items:center;margin-bottom:1.25rem;position:relative;">
    <div style="flex:1;text-align:right;padding-right:2rem;">
      <div style="display:inline-block;background:#F0FDFA;border-left:5px solid #14B8A6;border-radius:9999px;padding:0.75rem 1.25rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);max-width:280px;">
        <div style="font-size:1.25rem;margin-bottom:0.25rem;">🤝</div>
        <div style="font-weight:700;color:#115E59;font-size:0.9rem;">2023–2024 — Strategic Acquisitions</div>
        <div style="font-size:0.8rem;color:#0D9488;margin-top:0.25rem;">Expanded customer base through multiple acquisitions</div>
      </div>
    </div>
    <div style="width:16px;height:16px;background:#14B8A6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #14B8A6;position:relative;z-index:2;flex-shrink:0;"></div>
    <div style="flex:1;padding-left:2rem;"></div>
  </div>

  <div style="display:flex;align-items:center;margin-bottom:1.25rem;position:relative;">
    <div style="flex:1;padding-right:2rem;"></div>
    <div style="width:16px;height:16px;background:#6366F1;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #6366F1;position:relative;z-index:2;flex-shrink:0;"></div>
    <div style="flex:1;text-align:left;padding-left:2rem;">
      <div style="display:inline-block;background:#EEF2FF;border-left:5px solid #6366F1;border-radius:9999px;padding:0.75rem 1.25rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);max-width:280px;">
        <div style="font-size:1.25rem;margin-bottom:0.25rem;">☁️</div>
        <div style="font-weight:700;color:#3730A3;font-size:0.9rem;">2024 — CloudPe Launch</div>
        <div style="font-size:0.8rem;color:#4F46E5;margin-top:0.25rem;">Launched CloudPe cloud platform for modern cloud infrastructure</div>
      </div>
    </div>
  </div>

  <div style="display:flex;align-items:center;margin-bottom:1.25rem;position:relative;">
    <div style="flex:1;text-align:right;padding-right:2rem;">
      <div style="display:inline-block;background:#FFF1F2;border-left:5px solid #F43F5E;border-radius:9999px;padding:0.75rem 1.25rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);max-width:280px;">
        <div style="font-size:1.25rem;margin-bottom:0.25rem;">🗺️</div>
        <div style="font-weight:700;color:#9F1239;font-size:0.9rem;">2025 — India Expansion</div>
        <div style="font-size:0.8rem;color:#E11D48;margin-top:0.25rem;">Opened new offices and expanded operations within India</div>
      </div>
    </div>
    <div style="width:16px;height:16px;background:#F43F5E;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #F43F5E;position:relative;z-index:2;flex-shrink:0;"></div>
    <div style="flex:1;padding-left:2rem;"></div>
  </div>

  <div style="display:flex;align-items:center;position:relative;">
    <div style="flex:1;padding-right:2rem;"></div>
    <div style="width:16px;height:16px;background:#059669;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #059669;position:relative;z-index:2;flex-shrink:0;"></div>
    <div style="flex:1;text-align:left;padding-left:2rem;">
      <div style="display:inline-block;background:#ECFDF5;border-left:5px solid #059669;border-radius:9999px;padding:0.75rem 1.25rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);max-width:280px;">
        <div style="font-size:1.25rem;margin-bottom:0.25rem;">🌐</div>
        <div style="font-weight:700;color:#064E3B;font-size:0.9rem;">Present — Global Presence</div>
        <div style="font-size:0.8rem;color:#047857;margin-top:0.25rem;">Operating across multiple countries, serving 22,000+ customers</div>
      </div>
    </div>
  </div>
</div>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1.25rem 0 0.5rem;">WHAT LEAPSWITCH PROVIDES</h4>
<p class="text-slate-600 text-base leading-relaxed mb-4">Leapswitch provides the infrastructure foundation businesses need to run their digital operations. Its offerings cover infrastructure, cloud platforms, application platforms, managed services, backup solutions, and colocation services. This allows businesses to work with a single provider instead of managing multiple vendors.</p>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1rem 0 0.5rem;">WHY CUSTOMERS CHOOSE LEAPSWITCH</h4>
<ul class="text-slate-600 text-base leading-relaxed mb-4 space-y-1">
  <li><strong>Reliability</strong> — Nearly two decades of operational experience supporting business-critical workloads</li>
  <li><strong>Human Support</strong> — Access to experienced engineers and dedicated support teams</li>
  <li><strong>Data Sovereignty</strong> — India-hosted infrastructure helping organizations meet compliance requirements</li>
  <li><strong>Complete Ecosystem</strong> — Infrastructure, cloud services, backup, managed services from one provider</li>
  <li><strong>Transparent Pricing</strong> — Predictable pricing models that help customers avoid unexpected costs</li>
</ul>

<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Key Takeaway:</strong> <span style="color:#1E3A8A;">Customers choose Leapswitch because it combines reliable infrastructure, responsive support, and long-term partnership value.</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">1.2 WHO WE ARE — CLOUDPE</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">CloudPe is an OpenStack-powered cloud platform built for Indian businesses. It offers computing, storage, GPU, and other cloud services with predictable pricing, local support, and infrastructure hosted in India. Backed by Leapswitch''s infrastructure expertise.</p>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1rem 0 0.5rem;">HOW CLOUDPE FITS INTO THE ECOSYSTEM</h4>
<ul class="text-slate-600 text-base leading-relaxed mb-4 space-y-1">
  <li>Leapswitch builds and operates the infrastructure.</li>
  <li>CloudPe delivers cloud services on top of that infrastructure.</li>
</ul>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1rem 0 0.5rem;">WHY CUSTOMERS CHOOSE CLOUDPE</h4>
<ul class="text-slate-600 text-base leading-relaxed mb-4 space-y-1">
  <li><strong>Predictable Pricing</strong> — Transparent pricing structures that are easier to understand and manage</li>
  <li><strong>India-Hosted Infrastructure</strong> — Keep workloads and data within India for compliance requirements</li>
  <li><strong>Enterprise Support</strong> — Access to experienced support teams that understand infrastructure</li>
  <li><strong>Open & Flexible Platform</strong> — Built on open technologies, reducing vendor lock-in concerns</li>
  <li><strong>AI-Ready Infrastructure</strong> — Supports AI, machine learning, and GPU-powered applications</li>
</ul>

<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Key Takeaway:</strong> <span style="color:#1E3A8A;">Businesses choose CloudPe because it offers enterprise-grade cloud services with predictable pricing, local infrastructure, and strong support.</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">MODULE SUMMARY</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">Leapswitch is the infrastructure company behind the ecosystem. CloudPe is the cloud platform built on that foundation. Together they help organizations run and scale their digital workloads with confidence.</p>'
WHERE title = 'Module 1 — Company Overview';
