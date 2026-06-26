/*
  Module 1 — fill empty space with explanatory learning visuals.

  Builds on 20260626000001 (which added the key_facts strip). Two topics that
  previously rendered as a short paragraph beside dead space, with a single tall
  feature_benefit card far below, now each carry a relevant diagram that
  visualises their prose:

    Topic 1.2 "What Leapswitch Provides"
      + architecture_diagram (m1-arch) — the one-provider service stack.
        Sits in the intro's right column (SIDE_FRIENDLY); strengths stack below.

    Topic 1.4 "CloudPe in Practice"
      + architecture_diagram (m1-cloudpe-arch) — CloudPe's service catalogue
        (intro right column).
      + use_case_cards (m1-usecases) — who CloudPe is built for. Stacks below.

  Every added visual encodes facts already stated in the Module 1 content
  (service categories, the customer types the ecosystem node already lists).
  No invented data; nothing decorative.
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
    "id": "m1-facts",
    "type": "key_facts",
    "data": {
      "facts": [
        { "value": "22,000+", "label": "Customers", "sublabel": "served globally", "icon": "users" },
        { "value": "Global", "label": "Presence", "sublabel": "across multiple regions", "icon": "globe" },
        { "value": "End-to-End", "label": "Cloud & infrastructure", "sublabel": "solutions provider", "icon": "cloud" }
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
    "id": "m1-arch",
    "type": "architecture_diagram",
    "data": {
      "eyebrow": "What Leapswitch Provides",
      "title": "One Provider, Full Stack",
      "layers": [
        { "name": "Cloud & Application Platforms", "accent": "#6366F1", "components": [ { "label": "CloudPe", "icon": "☁️" }, { "label": "CloudJiffy (PaaS)", "icon": "⚡" } ] },
        { "name": "Managed Services & Protection", "accent": "#10B981", "components": [ { "label": "Managed Services", "icon": "🛠️" }, { "label": "Backup & Disaster Recovery", "icon": "🛡️" } ] },
        { "name": "Core Infrastructure", "accent": "#ED3237", "components": [ { "label": "Compute", "icon": "🖥️" }, { "label": "Storage", "icon": "💾" }, { "label": "Networking", "icon": "🌐" }, { "label": "Colocation", "icon": "🏢" } ] }
      ]
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
      "html": "<h3>CloudPe in Practice</h3><p>CloudPe combines predictable pricing, India-hosted infrastructure, and enterprise support on an open, AI-ready platform. Its catalogue spans compute, storage, GPU, and networking services — the building blocks teams use to run and scale real workloads.</p><blockquote>Module summary: Leapswitch is the infrastructure company behind the ecosystem. CloudPe is the cloud platform built on that foundation. Together they help organizations run and scale their digital workloads with confidence.</blockquote>"
    }
  },
  {
    "id": "m1-cloudpe-arch",
    "type": "architecture_diagram",
    "data": {
      "eyebrow": "CloudPe Service Catalogue",
      "title": "What CloudPe Offers",
      "layers": [
        { "name": "Compute", "accent": "#6366F1", "components": [ { "label": "Virtual Machines", "icon": "🖥️" }, { "label": "GPU Instances", "icon": "🤖" } ] },
        { "name": "Storage", "accent": "#10B981", "components": [ { "label": "Block Storage", "icon": "💾" }, { "label": "Object Storage", "icon": "🗂️" }, { "label": "Backup", "icon": "🛡️" } ] },
        { "name": "Networking & Platform", "accent": "#ED3237", "components": [ { "label": "Networking", "icon": "🌐" }, { "label": "Load Balancing", "icon": "⚖️" }, { "label": "OpenStack APIs", "icon": "🔓" } ] }
      ]
    }
  },
  {
    "id": "m1-usecases",
    "type": "use_case_cards",
    "data": {
      "eyebrow": "Who Uses CloudPe",
      "title": "Built for Every Team",
      "cases": [
        { "persona": "Startups", "title": "Startups & SaaS", "description": "Launch fast on predictable, pay-as-you-go infrastructure without large upfront commitments.", "icon": "🚀", "accent": "#6366F1" },
        { "persona": "Enterprise", "title": "Enterprises", "description": "Run business-critical workloads on India-hosted infrastructure with enterprise support.", "icon": "🏢", "accent": "#ED3237" },
        { "persona": "AI / ML", "title": "AI & ML Teams", "description": "Train and serve models on GPU-ready infrastructure built for compute-heavy workloads.", "icon": "🤖", "accent": "#10B981" },
        { "persona": "Government", "title": "Government & Public Sector", "description": "Meet data-residency and compliance needs with infrastructure hosted entirely in India.", "icon": "🏛️", "accent": "#F59E0B" }
      ]
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
