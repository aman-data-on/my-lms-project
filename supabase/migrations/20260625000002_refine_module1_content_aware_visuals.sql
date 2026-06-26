/*
  Module 1 — Company Overview — content-aware visual pass

  Supersedes 20260625000001. Restructures the single big trailing text block
  into focused topics, each paired with the visual that best serves its
  learning objective:

    Topic                              Block type            Why
    ─────────────────────────────────────────────────────────────────────────
    1.1 Who we are (Leapswitch)        text + timeline       history is chronological → timeline
    What Leapswitch provides           text + feature_benefit value props = capability → why it matters
    1.2 Who we are (CloudPe)           text + ecosystem_diagram the Leapswitch→CloudPe→customer relationship
    CloudPe in practice                text + feature_benefit value props; module summary folds in as the
                                                             closing Key Takeaway (not a full-page topic)

  buildSteps pairs each text block with the following non-text block into a
  two-panel (text_with_visual) step, so block order below = on-screen pairing.
  Headings are single <h3> per block (sub-points use <h4>) so each block stays
  one step. No fabricated data or filler visuals were added.
*/

UPDATE lessons
SET video_url = $$[
  {
    "id": "m1-s1",
    "type": "text",
    "data": {
      "html": "<h3>1.1 Who We Are — Leapswitch Networks</h3><p>Leapswitch Networks is an infrastructure and cloud company founded in 2006. Over nearly two decades, it has evolved from a hosting provider into a full-scale infrastructure platform serving startups, enterprises, government organizations, and technology companies across India and international markets.</p><p><strong>Your goal:</strong> understand what Leapswitch and CloudPe do, who they serve, and how to explain the company confidently.</p>"
    }
  },
  {
    "id": "m1-timeline",
    "type": "timeline",
    "data": {
      "eyebrow": "Company History",
      "title": "Growth Timeline",
      "steps": [
        { "date": "2006", "title": "Company Founded", "description": "LaceHost started by Ishan Talathi", "icon": "🌱", "color": "#10B981" },
        { "date": "2009", "title": "Rebranding", "description": "LaceHost integrated with We3Care, became Leapswitch Networks", "icon": "🔄", "color": "#F59E0B" },
        { "date": "2010–2014", "title": "Global Expansion", "description": "Infrastructure expanded across US, Europe, and India", "icon": "🌍", "color": "#3B82F6" },
        { "date": "2018", "title": "CloudJiffy Launch", "description": "Introduced Platform-as-a-Service (PaaS) CloudJiffy", "icon": "⚡", "color": "#A855F7" },
        { "date": "2023–2024", "title": "Strategic Acquisitions", "description": "Expanded customer base through multiple acquisitions", "icon": "🤝", "color": "#14B8A6" },
        { "date": "2024", "title": "CloudPe Launch", "description": "Launched CloudPe cloud platform for modern cloud infrastructure", "icon": "☁️", "color": "#6366F1" },
        { "date": "2025", "title": "India Expansion", "description": "Opened new offices and expanded operations within India", "icon": "🗺️", "color": "#F43F5E" },
        { "date": "Present", "title": "Global Presence", "description": "Operating across multiple countries, serving 22,000+ customers", "icon": "🌐", "color": "#ED3237" }
      ]
    }
  },
  {
    "id": "m1-s2",
    "type": "text",
    "data": {
      "html": "<h3>What Leapswitch Provides</h3><p>Leapswitch provides the infrastructure foundation businesses need to run their digital operations — covering infrastructure, cloud platforms, application platforms, managed services, backup solutions, and colocation. This lets businesses work with a single provider instead of managing multiple vendors.</p>"
    }
  },
  {
    "id": "m1-fb-leapswitch",
    "type": "feature_benefit",
    "data": {
      "eyebrow": "Why Customers Choose Leapswitch",
      "title": "Strengths That Win Trust",
      "pairs": [
        { "feature": "Reliability", "benefit": "Nearly two decades of operational experience supporting business-critical workloads.", "icon": "🛡️" },
        { "feature": "Human Support", "benefit": "Direct access to experienced engineers and dedicated support teams.", "icon": "🤝" },
        { "feature": "Data Sovereignty", "benefit": "India-hosted infrastructure that helps organizations meet compliance requirements.", "icon": "🇮🇳" },
        { "feature": "Complete Ecosystem", "benefit": "Infrastructure, cloud, backup, and managed services from one provider.", "icon": "🧩" },
        { "feature": "Transparent Pricing", "benefit": "Predictable pricing models that help customers avoid unexpected costs.", "icon": "💰" }
      ]
    }
  },
  {
    "id": "m1-s3",
    "type": "text",
    "data": {
      "html": "<h3>1.2 Who We Are — CloudPe</h3><p>CloudPe is an OpenStack-powered cloud platform built for Indian businesses. It offers computing, storage, GPU, and other cloud services with predictable pricing, local support, and infrastructure hosted in India — backed by Leapswitch's infrastructure expertise.</p><p>The diagram shows how the two fit together: Leapswitch is the foundation, and CloudPe is the platform customers actually consume.</p>"
    }
  },
  {
    "id": "m1-eco",
    "type": "ecosystem_diagram",
    "data": {
      "eyebrow": "Leapswitch + CloudPe",
      "title": "How CloudPe Fits the Ecosystem",
      "layout": "stack",
      "nodes": [
        { "label": "Leapswitch Networks", "sublabel": "Infrastructure & operations", "icon": "🏗️", "accent": "#ED3237", "caption": "Builds and operates the underlying infrastructure — data centres, network, and hardware." },
        { "label": "CloudPe", "sublabel": "Cloud platform", "icon": "☁️", "accent": "#6366F1", "caption": "Delivers compute, storage, and GPU services on top of that infrastructure." },
        { "label": "Customers", "sublabel": "Startups, enterprises, AI & government", "icon": "👥", "accent": "#10B981", "caption": "Consume CloudPe services to run and scale their digital workloads." }
      ],
      "relationship": "Leapswitch builds and operates the infrastructure; CloudPe delivers cloud services on top of it; customers consume those services to run and scale their workloads."
    }
  },
  {
    "id": "m1-s4",
    "type": "text",
    "data": {
      "html": "<h3>CloudPe in Practice</h3><p>CloudPe combines predictable pricing, India-hosted infrastructure, and enterprise support on an open, AI-ready platform — the reasons customers choose it over generic global clouds.</p><blockquote>Module summary: Leapswitch is the infrastructure company behind the ecosystem. CloudPe is the cloud platform built on that foundation. Together they help organizations run and scale their digital workloads with confidence.</blockquote>"
    }
  },
  {
    "id": "m1-fb-cloudpe",
    "type": "feature_benefit",
    "data": {
      "eyebrow": "Why Customers Choose CloudPe",
      "title": "What Sets CloudPe Apart",
      "pairs": [
        { "feature": "Predictable Pricing", "benefit": "Transparent pricing structures that are easier to understand and manage.", "icon": "💰" },
        { "feature": "India-Hosted Infrastructure", "benefit": "Keeps workloads and data within India for compliance requirements.", "icon": "🇮🇳" },
        { "feature": "Enterprise Support", "benefit": "Experienced support teams that genuinely understand infrastructure.", "icon": "🎧" },
        { "feature": "Open & Flexible Platform", "benefit": "Built on open technologies, reducing vendor lock-in concerns.", "icon": "🔓" },
        { "feature": "AI-Ready Infrastructure", "benefit": "Supports AI, machine learning, and GPU-powered applications.", "icon": "🤖" }
      ]
    }
  }
]$$
WHERE title = 'Module 1 — Company Overview';
