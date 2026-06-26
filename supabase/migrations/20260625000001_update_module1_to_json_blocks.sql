/*
  Update Module 1 — Company Overview
  Convert the single HTML blob (zigzag inline-CSS timeline) to structured
  JSON blocks. The timeline block uses the existing "timeline" type which
  BlockRenderer now renders correctly inside VisualPanel's dark card.

  Block layout:
    1. text     — section 1.1 intro paragraph
    2. timeline — 8-milestone company growth timeline
    3. text     — What Leapswitch Provides, Why customers choose,
                  section 1.2 CloudPe, Module Summary
*/

UPDATE lessons
SET video_url = $$[
  {
    "id": "m1-s1",
    "type": "text",
    "data": {
      "html": "<h3>1.1 WHO WE ARE — LEAPSWITCH NETWORKS</h3><p>Leapswitch Networks is an infrastructure and cloud company founded in 2006. Over nearly two decades, it has evolved from a hosting provider into a full-scale infrastructure platform serving startups, enterprises, government organizations, and technology companies across India and international markets.</p><p><strong>Goal:</strong> Understand what Leapswitch and CloudPe do, who they serve, and how to explain the company confidently.</p>"
    }
  },
  {
    "id": "m1-timeline",
    "type": "timeline",
    "data": {
      "steps": [
        {
          "date": "2006",
          "title": "Company Founded",
          "description": "LaceHost started by Ishan Talathi",
          "icon": "🌱",
          "color": "#10B981"
        },
        {
          "date": "2009",
          "title": "Rebranding",
          "description": "LaceHost integrated with We3Care, became Leapswitch Networks",
          "icon": "🔄",
          "color": "#F59E0B"
        },
        {
          "date": "2010–2014",
          "title": "Global Expansion",
          "description": "Infrastructure expanded across US, Europe, and India",
          "icon": "🌍",
          "color": "#3B82F6"
        },
        {
          "date": "2018",
          "title": "CloudJiffy Launch",
          "description": "Introduced Platform-as-a-Service (PaaS) CloudJiffy",
          "icon": "⚡",
          "color": "#A855F7"
        },
        {
          "date": "2023–2024",
          "title": "Strategic Acquisitions",
          "description": "Expanded customer base through multiple acquisitions",
          "icon": "🤝",
          "color": "#14B8A6"
        },
        {
          "date": "2024",
          "title": "CloudPe Launch",
          "description": "Launched CloudPe cloud platform for modern cloud infrastructure",
          "icon": "☁️",
          "color": "#6366F1"
        },
        {
          "date": "2025",
          "title": "India Expansion",
          "description": "Opened new offices and expanded operations within India",
          "icon": "🗺️",
          "color": "#F43F5E"
        },
        {
          "date": "Present",
          "title": "Global Presence",
          "description": "Operating across multiple countries, serving 22,000+ customers",
          "icon": "🌐",
          "color": "#ED3237"
        }
      ]
    }
  },
  {
    "id": "m1-s2",
    "type": "text",
    "data": {
      "html": "<h3>WHAT LEAPSWITCH PROVIDES</h3><p>Leapswitch provides the infrastructure foundation businesses need to run their digital operations. Its offerings cover infrastructure, cloud platforms, application platforms, managed services, backup solutions, and colocation services — allowing businesses to work with a single provider instead of managing multiple vendors.</p><h4>WHY CUSTOMERS CHOOSE LEAPSWITCH</h4><ul><li><strong>Reliability</strong> — Nearly two decades of operational experience supporting business-critical workloads</li><li><strong>Human Support</strong> — Access to experienced engineers and dedicated support teams</li><li><strong>Data Sovereignty</strong> — India-hosted infrastructure helping organizations meet compliance requirements</li><li><strong>Complete Ecosystem</strong> — Infrastructure, cloud services, backup, managed services from one provider</li><li><strong>Transparent Pricing</strong> — Predictable pricing models that help customers avoid unexpected costs</li></ul><blockquote>Customers choose Leapswitch because it combines reliable infrastructure, responsive support, and long-term partnership value.</blockquote><h3>1.2 WHO WE ARE — CLOUDPE</h3><p>CloudPe is an OpenStack-powered cloud platform built for Indian businesses. It offers computing, storage, GPU, and other cloud services with predictable pricing, local support, and infrastructure hosted in India — backed by Leapswitch's infrastructure expertise.</p><h4>HOW CLOUDPE FITS INTO THE ECOSYSTEM</h4><ul><li>Leapswitch builds and operates the infrastructure.</li><li>CloudPe delivers cloud services on top of that infrastructure.</li></ul><h4>WHY CUSTOMERS CHOOSE CLOUDPE</h4><ul><li><strong>Predictable Pricing</strong> — Transparent pricing structures that are easier to understand and manage</li><li><strong>India-Hosted Infrastructure</strong> — Keep workloads and data within India for compliance requirements</li><li><strong>Enterprise Support</strong> — Access to experienced support teams that understand infrastructure</li><li><strong>Open &amp; Flexible Platform</strong> — Built on open technologies, reducing vendor lock-in concerns</li><li><strong>AI-Ready Infrastructure</strong> — Supports AI, machine learning, and GPU-powered applications</li></ul><blockquote>Businesses choose CloudPe because it offers enterprise-grade cloud services with predictable pricing, local infrastructure, and strong support.</blockquote><h3>MODULE SUMMARY</h3><p>Leapswitch is the infrastructure company behind the ecosystem. CloudPe is the cloud platform built on that foundation. Together they help organizations run and scale their digital workloads with confidence.</p>"
    }
  }
]$$
WHERE title = 'Module 1 — Company Overview';
