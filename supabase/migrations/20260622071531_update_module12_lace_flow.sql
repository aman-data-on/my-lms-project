/*
# Update Module 12 — Objection Handling with LACE framework horizontal flow

1. Changes
- Replace simple flex cards with connected horizontal step flow
- Keep existing objection categories table and best practices
*/

UPDATE lessons
SET video_url = '<p class="text-slate-600 text-base leading-relaxed mb-4"><strong>Goal:</strong> Build confidence in handling customer objections and learn how to respond professionally while keeping conversations productive.</p>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">12.1 UNDERSTANDING CUSTOMER OBJECTIONS</h3>
<p class="text-slate-600 text-base leading-relaxed mb-4">Objections are a normal part of the sales process. They usually indicate that customers are evaluating the solution carefully. In many cases, objections indicate interest, not rejection.</p>

<div style="background:#F8FAFC;border-radius:10px;padding:16px 20px;margin:12px 0;">
  <div style="font-weight:700;color:#1E3A8A;font-size:0.9rem;margin-bottom:8px;">Common Reasons Objections Occur:</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    <span style="background:#EFF6FF;color:#1E40AF;font-size:0.8rem;font-weight:600;padding:6px 12px;border-radius:9999px;">Lack of information</span>
    <span style="background:#FEF3C7;color:#92400E;font-size:0.8rem;font-weight:600;padding:6px 12px;border-radius:9999px;">Budget concerns</span>
    <span style="background:#ECFDF5;color:#065F46;font-size:0.8rem;font-weight:600;padding:6px 12px;border-radius:9999px;">Internal approval requirements</span>
    <span style="background:#FFF1F2;color:#9F1239;font-size:0.8rem;font-weight:600;padding:6px 12px;border-radius:9999px;">Risk concerns</span>
    <span style="background:#FAF5FF;color:#6B21A8;font-size:0.8rem;font-weight:600;padding:6px 12px;border-radius:9999px;">Existing provider relationships</span>
    <span style="background:#F0F9FF;color:#0C4A6E;font-size:0.8rem;font-weight:600;padding:6px 12px;border-radius:9999px;">Technical questions</span>
  </div>
</div>

<div style="border-left:4px solid #2563EB;padding:14px 18px;background:#EFF6FF;margin:16px 0;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <strong style="color:#1E3A8A;">💡 Key Takeaway:</strong> <span style="color:#1E3A8A;">An objection is not a "No." It is often a request for more clarity or confidence.</span>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">THE LACE FRAMEWORK</h3>

<div style="display:flex;flex-wrap:wrap;gap:0;margin:24px 0;align-items:stretch;">
  <div style="flex:1;min-width:180px;background:#EFF6FF;border-radius:12px 0 0 12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.06);position:relative;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:40px;height:40px;background:#3B82F6;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-size:1.3rem;">👂</div>
      <div>
        <div style="font-size:0.7rem;color:#3B82F6;font-weight:700;text-transform:uppercase;">Step 1</div>
        <div style="font-weight:700;color:#1E40AF;font-size:1rem;">LISTEN</div>
      </div>
    </div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;flex:1;">Allow the customer to fully explain their concern without interrupting.</div>
  </div>
  <div style="display:flex;align-items:center;justify-content:center;padding:0 4px;">
    <div style="color:#CBD5E1;font-size:1.5rem;">→</div>
  </div>
  <div style="flex:1;min-width:180px;background:#ECFDF5;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.06);position:relative;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:40px;height:40px;background:#10B981;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-size:1.3rem;">🤝</div>
      <div>
        <div style="font-size:0.7rem;color:#10B981;font-weight:700;text-transform:uppercase;">Step 2</div>
        <div style="font-weight:700;color:#065F46;font-size:1rem;">ACKNOWLEDGE</div>
      </div>
    </div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;flex:1;">Show that you understand their perspective.</div>
    <div style="background:#D1FAE5;border-radius:6px;padding:8px 10px;margin-top:8px;">
      <div style="font-size:0.75rem;color:#047857;font-style:italic;">"I understand why that''s important to you."</div>
    </div>
  </div>
  <div style="display:flex;align-items:center;justify-content:center;padding:0 4px;">
    <div style="color:#CBD5E1;font-size:1.5rem;">→</div>
  </div>
  <div style="flex:1;min-width:180px;background:#FEF3C7;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.06);position:relative;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:40px;height:40px;background:#F59E0B;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-size:1.3rem;">❓</div>
      <div>
        <div style="font-size:0.7rem;color:#D97706;font-weight:700;text-transform:uppercase;">Step 3</div>
        <div style="font-weight:700;color:#92400E;font-size:1rem;">CLARIFY</div>
      </div>
    </div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;flex:1;">Ask questions to understand the root concern.</div>
    <div style="background:#FDE68A;border-radius:6px;padding:8px 10px;margin-top:8px;">
      <div style="font-size:0.75rem;color:#B45309;font-style:italic;">"Could you tell me more about what''s driving that concern?"</div>
    </div>
  </div>
  <div style="display:flex;align-items:center;justify-content:center;padding:0 4px;">
    <div style="color:#CBD5E1;font-size:1.5rem;">→</div>
  </div>
  <div style="flex:1;min-width:180px;background:#FAF5FF;border-radius:0 12px 12px 0;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,0.06);position:relative;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:40px;height:40px;background:#A855F7;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-size:1.3rem;">💡</div>
      <div>
        <div style="font-size:0.7rem;color:#A855F7;font-weight:700;text-transform:uppercase;">Step 4</div>
        <div style="font-weight:700;color:#6B21A8;font-size:1rem;">EXPLAIN</div>
      </div>
    </div>
    <div style="font-size:0.85rem;color:#475569;line-height:1.5;flex:1;">Respond with relevant information and business value.</div>
    <div style="background:#F3E8FF;border-radius:6px;padding:8px 10px;margin-top:8px;">
      <div style="font-size:0.75rem;color:#7C3AED;font-style:italic;">"Based on what you''ve shared, here is how we address that..."</div>
    </div>
  </div>
</div>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">12.2 OBJECTION CATEGORIES — SIX TYPES</h3>

<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:0.85rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <tr style="background:#1E3A8A;color:white;">
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Objection Category</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Example Concern</th>
    <th style="padding:12px 14px;text-align:left;font-weight:700;">Response Approach</th>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Pricing</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">"This seems expensive."</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Focus on total value, ROI, and cost predictability</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Trust & Credibility</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">"We''ve never heard of your company."</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Share experience, customer references, and track record</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Migration</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">"Migration sounds risky."</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Explain migration support, proven process, and timelines</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Support</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">"What happens if something goes wrong?"</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Detail SLA commitments, support levels, and response times</td>
  </tr>
  <tr style="background:#f8fafc;">
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Performance</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">"Will it handle our workloads?"</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Share technical specs, uptime history, and customer cases</td>
  </tr>
  <tr>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:600;color:#1E3A8A;">Timing</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">"We''re not ready yet."</td>
    <td style="padding:12px 14px;border-bottom:1px solid #E2E8F0;color:#475569;">Understand the reason, offer a follow-up plan, keep the door open</td>
  </tr>
</table>

<h3 style="color:#1E3A8A;font-size:1.125rem;font-weight:600;margin:1.5rem 0 0.75rem;">12.3 BEST PRACTICES</h3>

<div style="background:#D1FAE5;border:1px solid #10B981;border-radius:10px;padding:16px 18px;margin:12px 0;box-shadow:0 2px 6px rgba(16,185,129,0.08);">
  <div style="font-weight:700;color:#065F46;font-size:0.95rem;margin-bottom:10px;">✅ DO</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;">
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#064E3B;">Listen fully before responding</div>
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#064E3B;">Acknowledge the concern first</div>
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#064E3B;">Ask clarifying questions</div>
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#064E3B;">Focus on business value</div>
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#064E3B;">Stay calm and professional</div>
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#064E3B;">Use customer language</div>
  </div>
</div>

<div style="background:#FEE2E2;border:1px solid #EF4444;border-radius:10px;padding:16px 18px;margin:12px 0;box-shadow:0 2px 6px rgba(239,68,68,0.08);">
  <div style="font-weight:700;color:#991B1B;font-size:0.95rem;margin-bottom:10px;">❌ DON''T</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;">
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#7F1D1D;">Interrupt the customer</div>
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#7F1D1D;">Dismiss concerns</div>
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#7F1D1D;">Argue or debate</div>
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#7F1D1D;">Immediately offer discounts</div>
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#7F1D1D;">Make promises you can''t keep</div>
    <div style="background:rgba(255,255,255,0.5);border-radius:6px;padding:8px 10px;font-size:0.8rem;color:#7F1D1D;">Criticize competitors</div>
  </div>
</div>'
WHERE title = 'Module 12 — Objection Handling — LACE Framework';
