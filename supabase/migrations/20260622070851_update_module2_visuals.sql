/*
# Update Module 2 — Cloud Market and Where We Fit with visuals

1. Changes
- Add IaaS vs PaaS vs SaaS comparison cards
- Add Cloud Deployment Models cards
- Keep existing infrastructure evolution content
*/

UPDATE lessons
SET video_url = '<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Goal:</strong> Understand how IT infrastructure evolved, why businesses moved to the cloud, and where Leapswitch and CloudPe fit within the cloud ecosystem.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">2.1 HOW INFRASTRUCTURE EVOLVED</h3>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1rem 0 0.5rem;">THE TRADITIONAL ERA</h4>
<p class="text-slate-600 text-base leading-relaxed mb-4">Before cloud computing, businesses had to buy and manage their own servers, kept in company offices or private data centers. While this gave full control, it was expensive, time-consuming, and difficult to scale.</p>
<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Common Challenges:</strong> High hardware costs | Long setup times | Limited flexibility | Ongoing maintenance | Hardware failures and downtime risks</p>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1rem 0 0.5rem;">THE RISE OF VIRTUALIZATION</h4>
<p class="text-slate-600 text-base leading-relaxed mb-4">Virtualization allows multiple virtual servers to run on a single physical machine, improving hardware utilization, reducing costs, and enabling faster server deployment.</p>

<h4 style="color:#1E3A8A;font-size:1rem;font-weight:600;margin:1rem 0 0.5rem;">THE CLOUD REVOLUTION</h4>
<p class="text-slate-600 text-base leading-relaxed mb-4">Cloud computing changed how businesses consume infrastructure. Instead of purchasing hardware, organizations rent computing resources and pay only for what they use. This shifted infrastructure from a capital expense to an operational expense.</p>

<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Key Takeaway:</strong> <span style="color:#1E3A8A;">Infrastructure evolved from owning physical servers → virtualized environments → cloud-based services.</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">2.2 WHY BUSINESSES MOVED TO CLOUD</h3>
<ul class="text-slate-600 text-base leading-relaxed mb-4 space-y-1">
  <li><strong>Faster Deployment</strong> — Provision resources within minutes, not weeks</li>
  <li><strong>Easy Scalability</strong> — Increase or decrease resources as demand changes</li>
  <li><strong>Lower Upfront Costs</strong> — Pay only for resources consumed</li>
  <li><strong>Better Accessibility</strong> — Access from anywhere for distributed teams</li>
  <li><strong>More Focus on Business</strong> — Stop managing infrastructure, start building products</li>
</ul>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">2.3 CLOUD DEPLOYMENT MODELS</h3>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:16px 0;">
  <div style="background:#EFF6FF;border-radius:12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.06);border-top:5px solid #3B82F6;">
    <div style="font-size:2rem;margin-bottom:8px;text-align:center;">🌐</div>
    <div style="font-weight:700;color:#1E40AF;text-align:center;margin-bottom:8px;font-size:1rem;">PUBLIC CLOUD</div>
    <p style="color:#1E3A8A;font-size:0.875rem;line-height:1.5;text-align:center;">Infrastructure shared among multiple customers, managed by the cloud provider. Popular because it is easy to use, scalable, and requires no hardware investment.</p>
  </div>
  <div style="background:#FAF5FF;border-radius:12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.06);border-top:5px solid #A855F7;">
    <div style="font-size:2rem;margin-bottom:8px;text-align:center;">🔒</div>
    <div style="font-weight:700;color:#6B21A8;text-align:center;margin-bottom:8px;font-size:1rem;">PRIVATE CLOUD</div>
    <p style="color:#1E3A8A;font-size:0.875rem;line-height:1.5;text-align:center;">Dedicated to a single organization. Greater control, customization, and security for businesses with strict compliance or performance requirements.</p>
  </div>
  <div style="background:#ECFDF5;border-radius:12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.06);border-top:5px solid #10B981;">
    <div style="font-size:2rem;margin-bottom:8px;text-align:center;">🔀</div>
    <div style="font-weight:700;color:#065F46;text-align:center;margin-bottom:8px;font-size:1rem;">HYBRID CLOUD</div>
    <p style="color:#1E3A8A;font-size:0.875rem;line-height:1.5;text-align:center;">Combines public cloud and private infrastructure. Keep sensitive workloads private while using the public cloud for flexibility and scalability.</p>
  </div>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">2.4 FUTURE OF CLOUD INFRASTRUCTURE</h3>
<ul class="text-slate-600 text-base leading-relaxed mb-4 space-y-1">
  <li><strong>AI & GPU Cloud</strong> — The rise of AI is creating a growing need for GPU-powered infrastructure</li>
  <li><strong>Hybrid Cloud</strong> — Many businesses use both cloud and on-premises together</li>
  <li><strong>Edge Computing</strong> — Brings data processing closer to users and devices</li>
  <li><strong>Sovereign & Local Cloud</strong> — Local providers help meet compliance requirements</li>
  <li><strong>Automation</strong> — Cloud platforms using more automation to reduce manual work</li>
</ul>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">2.5 IaaS, PaaS AND SaaS — THE THREE CLOUD SERVICE MODELS</h3>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin:16px 0;">
  <div style="background:#FFFFFF;border-radius:12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.08);border-top:5px solid #3B82F6;">
    <div style="font-weight:700;color:#1E40AF;margin-bottom:12px;font-size:1.05rem;">IaaS — Infrastructure as a Service</div>
    <p style="color:#475569;font-size:0.875rem;line-height:1.5;margin-bottom:12px;"><strong>Definition:</strong> Raw computing resources over the internet</p>
    <div style="background:#EFF6FF;border-radius:8px;padding:12px;margin-bottom:12px;">
      <div style="font-size:0.75rem;color:#3B82F6;font-weight:600;margin-bottom:4px;">✅ PROVIDER MANAGES</div>
      <div style="font-size:0.8rem;color:#1E3A8A;">Hardware, networking, data center</div>
    </div>
    <div style="background:#F1F5F9;border-radius:8px;padding:12px;margin-bottom:12px;">
      <div style="font-size:0.75rem;color:#64748B;font-weight:600;margin-bottom:4px;">👤 CUSTOMER MANAGES</div>
      <div style="font-size:0.8rem;color:#1E3A8A;">OS, applications, data, runtime</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      <span style="background:#DBEAFE;color:#1E40AF;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">CloudPe VMs</span>
      <span style="background:#DBEAFE;color:#1E40AF;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">CloudPe GPU</span>
      <span style="background:#DBEAFE;color:#1E40AF;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">AWS EC2</span>
      <span style="background:#DBEAFE;color:#1E40AF;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">Azure VMs</span>
    </div>
  </div>
  <div style="background:#FFFFFF;border-radius:12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.08);border-top:5px solid #A855F7;">
    <div style="font-weight:700;color:#6B21A8;margin-bottom:12px;font-size:1.05rem;">PaaS — Platform as a Service</div>
    <p style="color:#475569;font-size:0.875rem;line-height:1.5;margin-bottom:12px;"><strong>Definition:</strong> Managed platform for building and deploying apps</p>
    <div style="background:#FAF5FF;border-radius:8px;padding:12px;margin-bottom:12px;">
      <div style="font-size:0.75rem;color:#A855F7;font-weight:600;margin-bottom:4px;">✅ PROVIDER MANAGES</div>
      <div style="font-size:0.8rem;color:#1E3A8A;">Hardware, OS, runtime, middleware</div>
    </div>
    <div style="background:#F1F5F9;border-radius:8px;padding:12px;margin-bottom:12px;">
      <div style="font-size:0.75rem;color:#64748B;font-weight:600;margin-bottom:4px;">👤 CUSTOMER MANAGES</div>
      <div style="font-size:0.8rem;color:#1E3A8A;">Applications and data only</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      <span style="background:#F3E8FF;color:#6B21A8;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">CloudJiffy</span>
      <span style="background:#F3E8FF;color:#6B21A8;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">Heroku</span>
      <span style="background:#F3E8FF;color:#6B21A8;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">Google App Engine</span>
    </div>
  </div>
  <div style="background:#FFFFFF;border-radius:12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.08);border-top:5px solid #14B8A6;">
    <div style="font-weight:700;color:#0F766E;margin-bottom:12px;font-size:1.05rem;">SaaS — Software as a Service</div>
    <p style="color:#475569;font-size:0.875rem;line-height:1.5;margin-bottom:12px;"><strong>Definition:</strong> Ready-to-use software delivered over the internet</p>
    <div style="background:#F0FDFA;border-radius:8px;padding:12px;margin-bottom:12px;">
      <div style="font-size:0.75rem;color:#14B8A6;font-weight:600;margin-bottom:4px;">✅ PROVIDER MANAGES</div>
      <div style="font-size:0.8rem;color:#1E3A8A;">Everything</div>
    </div>
    <div style="background:#F1F5F9;border-radius:8px;padding:12px;margin-bottom:12px;">
      <div style="font-size:0.75rem;color:#64748B;font-weight:600;margin-bottom:4px;">👤 CUSTOMER MANAGES</div>
      <div style="font-size:0.8rem;color:#1E3A8A;">Just uses the software</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      <span style="background:#CCFBF1;color:#0F766E;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">Gmail</span>
      <span style="background:#CCFBF1;color:#0F766E;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">Microsoft 365</span>
      <span style="background:#CCFBF1;color:#0F766E;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">Salesforce</span>
      <span style="background:#CCFBF1;color:#0F766E;font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:9999px;">Zoom</span>
    </div>
  </div>
</div>

<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Key Takeaway:</strong> <span style="color:#1E3A8A;">The main difference is how much of the technology stack is managed by the provider versus the customer. Leapswitch and CloudPe are strongest in the IaaS and PaaS segments.</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">2.6 WHERE LEAPSWITCH & CLOUDPE FIT</h3>
<p class="text-slate-600 text-base leading-relaxed mb-2"><strong>IaaS Solutions:</strong> Bare Metal Servers | CloudPe Virtual Machines | CloudPe GPU Infrastructure | CloudPe Kubernetes</p>
<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>PaaS Solutions:</strong> CloudJiffy</p>
<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Leapswitch and CloudPe are strongest in the IaaS and PaaS segments.</strong>
</div>'
WHERE title = 'Module 2 — Cloud Market and Where We Fit';
