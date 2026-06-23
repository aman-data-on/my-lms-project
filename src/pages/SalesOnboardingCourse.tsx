import { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { pushLessonCompletion, markLessonCompleteInProgress } from '../lib/reportData';
import { CourseAppendix } from '../components/CourseAppendix';
import { CourseIndex } from '../components/CourseIndex';
import {
  ChevronLeft, Play, CheckCircle2, Lock, Award,
  BookOpen, Check, ArrowRight, Trophy, XCircle, Timer,
  ClipboardCheck, Sparkles, Download, FileText, HelpCircle,
  PlayCircle, X, ChevronRight, Circle, Star, Clock,
  ChevronDown, Menu
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface Lesson {
  id: string;
  title: string;
  type: string;
  video_url: string | null;
  duration: string | null;
  order_index: number;
  section: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string;
  department: string;
  thumbnail_url: string | null;
  duration: string;
}

interface Assessment {
  id: string;
  title: string;
  course_id: string | null;
  time_limit: number;
  passing_score: number;
}

interface Question {
  id: string;
  assessment_id: string;
  type: string;
  question_text: string;
  options: any;
  correct_answer: string | null;
  matching_pairs: any;
  manual_grading: boolean;
  order_index: number;
}

interface PhaseProgress {
  phase_number: number;
  status: string;
  assessment_passed: boolean;
  assessment_score: number | null;
}

interface TaskSubmission {
  task_type: string;
  status: string;
}

// ─── Slide Types ─────────────────────────────────────────────────────
interface Slide {
  id: string;
  type: 'intro' | 'concept' | 'list' | 'summary';
  leftContent: {
    label?: string;
    title: string;
    subtitle?: string;
    content?: string;
    callout?: { label: string; text: string };
  };
  rightContent: {
    type: 'objectives' | 'visual' | 'takeaways' | 'custom';
    title?: string;
    items?: string[];
    customContent?: React.ReactNode;
  };
}

// ─── Constants ──────────────────────────────────────────────────────
const SALES_COURSE_ID = 'cdbf91e9-7a4a-430d-8def-7a119a90e4b4';

const PHASES = [
  {
    number: 1,
    name: 'Product and Business Foundations',
    description: 'Learn about Leapswitch, CloudPe, our products, the cloud market, and our internal team structure.',
    modules: [0, 1, 2, 3, 4, 5],
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#3B82F6',
    assessmentTitle: 'Phase 1 Assessment — Company & Products',
  },
  {
    number: 2,
    name: 'Customer and Market Intelligence',
    description: 'Understand who our customers are, their pain points, buying triggers, and stakeholder mapping.',
    modules: [6, 7],
    color: '#A855F7',
    bgColor: '#FAF5FF',
    borderColor: '#A855F7',
    assessmentTitle: 'Phase 2 Assessment — Customers & Market',
  },
  {
    number: 3,
    name: 'Competitive Positioning',
    description: 'Learn how to handle competitor comparisons and use battle cards effectively.',
    modules: [8],
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#F59E0B',
    assessmentTitle: 'Phase 3 Assessment — Competitive Positioning',
  },
  {
    number: 4,
    name: 'Sales Execution and Communication',
    description: 'Master the full sales cycle, discovery, objection handling, and professional communication.',
    modules: [9, 10, 11, 12],
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#10B981',
    assessmentTitle: 'Phase 4 Assessment — Sales Skills',
  },
  {
    number: 5,
    name: 'Field Readiness and Certification',
    description: 'Complete your shadow call log, mock sales flow, and pitch video submission.',
    modules: [13, 14],
    color: '#F43F5E',
    bgColor: '#FFF1F2',
    borderColor: '#F43F5E',
    assessmentTitle: 'Scenario-Based Final Assessment',
  },
];

// ─── Module Slide Definitions ───────────────────────────────────────
const MODULE_SLIDES: Record<number, Slide[]> = {
  0: [ // Module 1 — Company Overview
    {
      id: 'm1-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Company Overview',
        subtitle: 'Who we are, and why it matters in a sales conversation',
        content: 'Understand what Leapswitch and CloudPe do, who they serve, and how to explain the company confidently. This module lays the foundation for all your sales conversations.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Describe Leapswitch and CloudPe in one or two clear sentences',
          'Explain our core differentiators in customer language',
          'Position us with confidence and credibility',
        ],
      },
    },
    {
      id: 'm1-concept1',
      type: 'concept',
      leftContent: {
        label: 'CORE CONCEPT',
        title: 'Who We Are — Leapswitch Networks',
        content: `<p class="mb-4">Leapswitch Networks is an infrastructure and cloud company founded in 2006. Over nearly two decades, it has evolved from a hosting provider into a full-scale infrastructure platform serving startups, enterprises, government organizations, and technology companies across India and international markets.</p>
<p class="mb-4">Customers choose Leapswitch because it combines reliable infrastructure, responsive support, and long-term partnership value.</p>`,
        callout: { label: 'KEY INSIGHT', text: 'Customers choose Leapswitch because it combines reliable infrastructure, responsive support, and long-term partnership value.' },
      },
      rightContent: {
        type: 'visual',
        title: 'Leadership Team',
        items: ['CEO: Ishan Talathi', 'Director: Karan Jaju', 'CSO: Chandrashekhar Talathi', 'CFO: Priyen Sangoi'],
      },
    },
    {
      id: 'm1-concept2',
      type: 'concept',
      leftContent: {
        label: 'CORE CONCEPT',
        title: 'Who We Are — CloudPe',
        content: `<p class="mb-4">CloudPe is an OpenStack-powered cloud platform built for Indian businesses. It offers computing, storage, GPU, and other cloud services with predictable pricing, local support, and infrastructure hosted in India.</p>
<p class="mb-4">Backed by Leapswitch's infrastructure expertise, CloudPe provides enterprise-grade services with transparent pricing.</p>`,
        callout: { label: 'KEY INSIGHT', text: 'Businesses choose CloudPe because it offers enterprise-grade cloud services with predictable pricing, local infrastructure, and strong support.' },
      },
      rightContent: {
        type: 'visual',
        title: 'Leapswitch Growth Journey',
        items: ['2006 — Founded', '2010 — Data Center Expansion', '2015 — Cloud Services Launch', '2020 — GPU Infrastructure', 'Present — Full-Stack Platform'],
      },
    },
    {
      id: 'm1-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand who Leapswitch and CloudPe are, what makes us different, and how to articulate our value in customer conversations. This foundation is essential for every sales interaction.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Leapswitch is an established infrastructure company (2006)',
          'CloudPe is our India-focused cloud platform',
          'Key differentiators: support, pricing transparency, local infrastructure',
        ],
      },
    },
  ],
  1: [ // Module 2 — Cloud Market
    {
      id: 'm2-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Cloud Market and Where We Fit',
        subtitle: 'Understanding the infrastructure evolution',
        content: 'Understand how IT infrastructure evolved, why businesses moved to the cloud, and where Leapswitch and CloudPe fit within the cloud ecosystem.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Explain how infrastructure evolved from physical servers to cloud',
          'Differentiate between IaaS, PaaS, and SaaS',
          'Position Leapswitch and CloudPe in the market',
        ],
      },
    },
    {
      id: 'm2-concept1',
      type: 'concept',
      leftContent: {
        label: 'CORE CONCEPT',
        title: 'How Infrastructure Evolved',
        content: `<p class="mb-4">Before cloud computing, businesses had to buy and manage their own servers. Virtualization allowed multiple virtual servers on one physical machine. Cloud computing changed everything — organizations rent resources and pay only for what they use.</p>
<p class="mb-4">Infrastructure evolved from owning physical servers → virtualized environments → cloud-based services.</p>`,
        callout: { label: 'KEY INSIGHT', text: 'Infrastructure evolved from owning physical servers → virtualized environments → cloud-based services.' },
      },
      rightContent: {
        type: 'visual',
        title: 'Evolution Timeline',
        items: ['On-Premise → Own & Manage', 'Virtualization → Share Resources', 'Cloud → Rent & Scale', 'Our Focus → IaaS & PaaS'],
      },
    },
    {
      id: 'm2-list1',
      type: 'list',
      leftContent: {
        label: 'SERVICE MODELS',
        title: 'Cloud Deployment & Service Models',
        content: 'Cloud services are delivered in different models, each serving different customer needs.',
      },
      rightContent: {
        type: 'visual',
        title: 'IaaS, PaaS, SaaS Comparison',
        items: [
          'IaaS — Infrastructure as a Service (CloudPe VMs, AWS EC2)',
          'PaaS — Platform as a Service (CloudJiffy, Heroku)',
          'SaaS — Software as a Service (Gmail, Salesforce)',
        ],
      },
    },
    {
      id: 'm2-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand the evolution of IT infrastructure and can position our offerings within the IaaS and PaaS segments.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Leapswitch and CloudPe are strongest in IaaS and PaaS',
          'Cloud deployment: public, private, or hybrid',
          'Focus on what customers need, not just technology',
        ],
      },
    },
  ],
  2: [ // Module 3 — Leapswitch Portfolio
    {
      id: 'm3-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Leapswitch Infrastructure Portfolio',
        subtitle: 'Core offerings and sales focus',
        content: 'Understand Leapswitch\'s core offerings and which solutions should receive the highest sales focus.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Explain Bare Metal, GPU Cloud, and Private Cloud',
          'Identify the right solution for customer needs',
          'Prioritize products based on sales focus',
        ],
      },
    },
    {
      id: 'm3-concept1',
      type: 'concept',
      leftContent: {
        label: 'CORE CONCEPT',
        title: 'Bare Metal Servers',
        content: `<p class="mb-4">Dedicated physical servers assigned exclusively to a single customer. All hardware resources are reserved for one organization.</p>
<p class="mb-4"><strong>Best For:</strong> Large databases, ERP systems, high-traffic applications, gaming platforms, AI workloads</p>`,
        callout: { label: 'KEY INSIGHT', text: 'Bare Metal is ideal for customers who need dedicated infrastructure and maximum control.' },
      },
      rightContent: {
        type: 'visual',
        title: 'Bare Metal Use Cases',
        items: ['Large Databases', 'ERP Systems', 'Gaming Platforms', 'AI/ML Workloads', 'High-Traffic Apps'],
      },
    },
    {
      id: 'm3-list1',
      type: 'list',
      leftContent: {
        label: 'SALES PRIORITIES',
        title: 'Current Sales Focus',
        content: 'These products should receive the highest sales attention.',
      },
      rightContent: {
        type: 'visual',
        title: 'Priority Products',
        items: [
          '1. CloudPe Virtual Machines',
          '2. GPU Infrastructure',
          '3. Bare Metal Servers',
          '4. Kubernetes',
          '5. CloudJiffy',
        ],
      },
    },
    {
      id: 'm3-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand Leapswitch\'s infrastructure portfolio and can prioritize sales conversations around the most important products.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Bare Metal for maximum control',
          'GPU for AI/ML workloads',
          'Focus on priority products first',
        ],
      },
    },
  ],
  3: [ // Module 4 — CloudPe Portfolio
    {
      id: 'm4-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'CloudPe Portfolio',
        subtitle: 'Cloud platform offerings and use cases',
        content: 'Understand the CloudPe product portfolio and how each solution fits customer needs.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Explain CloudPe VPS and its value proposition',
          'Position CloudJiffy for developer audiences',
          'Identify add-on service opportunities',
        ],
      },
    },
    {
      id: 'm4-concept1',
      type: 'concept',
      leftContent: {
        label: 'CORE CONCEPT',
        title: 'CloudPe VPS',
        content: `<p class="mb-4">CloudPe is Leapswitch's cloud platform that provides scalable, on-demand infrastructure without purchasing physical hardware.</p>
<p class="mb-4"><strong>Who Uses CloudPe:</strong> Startups, software companies, enterprises, AI organizations, digital businesses</p>`,
        callout: { label: 'KEY INSIGHT', text: 'CloudPe enables businesses to scale infrastructure quickly while maintaining flexibility and cost efficiency.' },
      },
      rightContent: {
        type: 'visual',
        title: 'CloudPe Target Customers',
        items: ['Startups — Scale quickly', 'Software Companies — Flexibility', 'Enterprises — Reliability', 'AI Organizations — Performance'],
      },
    },
    {
      id: 'm4-list1',
      type: 'list',
      leftContent: {
        label: 'ADD-ON SERVICES',
        title: 'Managed Services Add-Ons',
        content: 'Additional services that enhance customer relationships and increase deal value.',
      },
      rightContent: {
        type: 'visual',
        title: 'Add-On Services',
        items: [
          'Colocation — Host customer hardware',
          'Backup Services — Protect critical data',
          'Managed Services — Operational support',
          'Domains & SSL — Identity & security',
        ],
      },
    },
    {
      id: 'm4-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand the CloudPe portfolio and can match solutions to customer requirements.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'CloudPe for scalable infrastructure',
          'CloudJiffy for developer simplicity',
          'Add-ons increase deal value',
        ],
      },
    },
  ],
  4: [ // Module 5 — Features, Benefits, Value
    {
      id: 'm5-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Features, Benefits, and Business Value',
        subtitle: 'Translating features into outcomes',
        content: 'Learn how to translate technical features into customer benefits and measurable business outcomes.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Differentiate features, benefits, and business value',
          'Frame solutions around customer outcomes',
          'Avoid feature-focused selling',
        ],
      },
    },
    {
      id: 'm5-concept1',
      type: 'concept',
      leftContent: {
        label: 'CORE CONCEPT',
        title: 'Why Feature Selling Doesn\'t Work',
        content: `<p class="mb-4">Many new salespeople focus on explaining technical features. Customers are usually more interested in the outcomes.</p>
<div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm"><strong>❌ Feature-Focused:</strong> "We provide Kubernetes clusters and NVMe storage."</div>
<div class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm"><strong>✅ Value-Focused:</strong> "We help your applications run faster, scale more easily, and deliver a better customer experience."</div>`,
        callout: { label: 'SALES RELEVANCE', text: 'Customers buy outcomes, not specifications. Focus on what the feature enables.' },
      },
      rightContent: {
        type: 'visual',
        title: 'The Three Levels',
        items: [
          'Feature — What it does (SSD Storage)',
          'Benefit — The advantage (Faster performance)',
          'Value — The outcome (Better user experience)',
        ],
      },
    },
    {
      id: 'm5-list1',
      type: 'list',
      leftContent: {
        label: 'SOLUTION MAPPING',
        title: 'Matching Challenges to Solutions',
        content: 'Use this mapping to quickly identify the right solution for common customer challenges.',
      },
      rightContent: {
        type: 'visual',
        title: 'Challenge → Solution',
        items: [
          'Training AI models slow → GPU Cloud',
          'Traffic spikes → Scalable Infrastructure',
          'Need reliable backup → Backup & DR',
          'Deploy apps without servers → CloudJiffy',
          'Dedicated performance → Bare Metal',
        ],
      },
    },
    {
      id: 'm5-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand how to translate features into benefits and business value, making your sales conversations more customer-focused.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Always speak in outcomes, not features',
          'Use Feature → Benefit → Value hierarchy',
          'Match solutions to stated challenges',
        ],
      },
    },
  ],
  5: [ // Module 6 — Internal Team
    {
      id: 'm6-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Internal Team Structure',
        subtitle: 'Who does what and when to involve them',
        content: 'Know the internal teams, their responsibilities, and when to involve them during the sales cycle.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Identify each team\'s role in the sales process',
          'Know when to involve Presales, Support, and CS',
          'Understand the customer journey',
        ],
      },
    },
    {
      id: 'm6-list1',
      type: 'list',
      leftContent: {
        label: 'DEPARTMENTS',
        title: 'Department Responsibilities',
        content: 'Each team plays a specific role in delivering customer success.',
      },
      rightContent: {
        type: 'visual',
        title: 'Team Functions',
        items: [
          'DG — Lead generation & outreach',
          'ISR — Inbound inquiries & requests',
          'BDM — Discovery & deal closure',
          'Presales — Solution design',
          'Support — L1/L2/L3 resolution',
          'CS — Onboarding & retention',
        ],
      },
    },
    {
      id: 'm6-list2',
      type: 'list',
      leftContent: {
        label: 'CUSTOMER FOCUS',
        title: 'What Customers Actually Care About',
        content: 'Keep these priorities in mind during every customer conversation.',
      },
      rightContent: {
        type: 'visual',
        title: 'Customer Priorities',
        items: [
          'Reliability — Applications stay available',
          'Performance — Workloads run smoothly',
          'Cost Control — Predictable pricing',
          'Security — Meet compliance needs',
          'Scalability — Grow with business',
          'Support — Help when needed',
        ],
      },
    },
    {
      id: 'm6-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand the internal structure and when to involve each team. Remember: customers buy business outcomes, not technical specifications.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Know when to escalate to each team',
          'Focus on customer outcomes',
          'Collaboration drives success',
        ],
      },
    },
  ],
  6: [ // Module 7 — ICP and Pain Points
    {
      id: 'm7-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Ideal Customer Profiles and Pain Points',
        subtitle: 'Understanding who we serve',
        content: 'Understand who Leapswitch and CloudPe serve, identify ideal customer profiles, and recognize potential customer opportunities.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Identify our four main customer segments',
          'Recognize common pain points by segment',
          'Spot buying triggers in conversations',
        ],
      },
    },
    {
      id: 'm7-list1',
      type: 'list',
      leftContent: {
        label: 'CUSTOMER SEGMENTS',
        title: 'Four Key Customer Segments',
        content: 'Each segment has different needs, budgets, and decision drivers.',
      },
      rightContent: {
        type: 'visual',
        title: 'Customer Segments',
        items: [
          'Startups — Scale quickly, affordable',
          'SMBs — Reliable, predictable pricing',
          'Enterprises — Security, compliance',
          'AI/ML Companies — GPU, performance',
        ],
      },
    },
    {
      id: 'm7-list2',
      type: 'list',
      leftContent: {
        label: 'PAIN POINTS',
        title: 'Common Pain Points by Category',
        content: 'Customers experience these challenges — match them to our solutions.',
      },
      rightContent: {
        type: 'visual',
        title: 'Pain Point Categories',
        items: [
          'Cost & Billing — Unexpected charges',
          'Support — Slow response times',
          'Performance — Scaling issues',
          'Security — Compliance concerns',
          'AI Infrastructure — GPU access',
        ],
      },
    },
    {
      id: 'm7-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand our ideal customer profiles and can recognize buying triggers in conversations.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Four segments: Startups, SMBs, Enterprises, AI/ML',
          'Pain points reveal opportunity',
          'Buying triggers signal urgency',
        ],
      },
    },
  ],
  7: [ // Module 8 — Stakeholder Mapping
    {
      id: 'm8-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Stakeholder Mapping and Customer Matching',
        subtitle: 'Decision makers and their priorities',
        content: 'Understand how different stakeholders evaluate solutions and how buying behavior impacts the sales process.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Tailor messaging to different stakeholders',
          'Identify qualified opportunities',
          'Navigate multi-stakeholder deals',
        ],
      },
    },
    {
      id: 'm8-list1',
      type: 'list',
      leftContent: {
        label: 'STAKEHOLDERS',
        title: 'Stakeholder Priorities',
        content: 'Different stakeholders care about different things. Know your audience.',
      },
      rightContent: {
        type: 'visual',
        title: 'Decision Maker Focus',
        items: [
          'CEO/Founder — Growth & risk',
          'CTO — Scalability, performance',
          'CIO — Security, compliance',
          'Finance — Cost control, ROI',
          'Procurement — Terms, credibility',
        ],
      },
    },
    {
      id: 'm8-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand how to identify and engage different stakeholders with tailored messaging.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Different stakeholders = different priorities',
          'Map the decision-making process',
          'Tailor value proposition to audience',
        ],
      },
    },
  ],
  8: [ // Module 9 — Competitive Landscape
    {
      id: 'm9-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Competitive Landscape and Battle Cards',
        subtitle: 'Handling competitor comparisons',
        content: 'Understand the competitive landscape and how to confidently respond when customers compare us with competing providers.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Position against hyperscalers',
          'Use battle cards effectively',
          'Turn comparisons into opportunities',
        ],
      },
    },
    {
      id: 'm9-list1',
      type: 'list',
      leftContent: {
        label: 'COMPETITIVE POSITIONING',
        title: 'CloudPe vs Hyperscalers',
        content: 'How we compare to the major cloud providers.',
      },
      rightContent: {
        type: 'visual',
        title: 'Key Differentiators',
        items: [
          'Pricing — Transparent vs Complex',
          'Support — Included vs Tiered',
          'Data Location — India vs Global',
          'Complexity — Focused vs Hundreds',
        ],
      },
    },
    {
      id: 'm9-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand the competitive landscape and can respond to comparisons confidently.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Battle cards help, don\'t attack',
          'Focus on customer fit, not competitors',
          'Our strengths: pricing, support, local',
        ],
      },
    },
  ],
  9: [ // Module 10 — Sales Cycle
    {
      id: 'm10-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'The Sales Cycle',
        subtitle: 'From lead to successful customer',
        content: 'Understand how opportunities move through the sales process and how different teams work together.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Explain the nine-stage journey',
          'Know your role at each stage',
          'Collaborate with other teams',
        ],
      },
    },
    {
      id: 'm10-list1',
      type: 'list',
      leftContent: {
        label: 'THE JOURNEY',
        title: 'Nine-Stage Customer Journey',
        content: 'Every customer follows this path from prospect to success.',
      },
      rightContent: {
        type: 'visual',
        title: 'Journey Stages',
        items: [
          '1. Lead Generation',
          '2. Lead Qualification',
          '3. Discovery Meeting',
          '4. Solution Design',
          '5. Proposal',
          '6. Negotiation',
          '7. Customer Approval',
          '8. Activation',
          '9. Ongoing Support',
        ],
      },
    },
    {
      id: 'm10-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand the complete sales cycle and how teams collaborate for customer success.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Nine stages from lead to success',
          'Collaboration is essential',
          'Support structure: L1 → L2 → L3',
        ],
      },
    },
  ],
  10: [ // Module 11 — Discovery and BANT
    {
      id: 'm11-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Discovery, Qualification and Probing',
        subtitle: 'Asking the right questions',
        content: 'Understand how to conduct effective discovery conversations and qualify opportunities.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Ask effective discovery questions',
          'Apply the BANT framework',
          'Identify decision drivers',
        ],
      },
    },
    {
      id: 'm11-list1',
      type: 'list',
      leftContent: {
        label: 'BANT FRAMEWORK',
        title: 'Qualification with BANT',
        content: 'Use these four criteria to qualify opportunities.',
      },
      rightContent: {
        type: 'visual',
        title: 'BANT Criteria',
        items: [
          'Budget — Approved funding?',
          'Authority — Decision maker?',
          'Need — Clear requirement?',
          'Timeline — Defined urgency?',
        ],
      },
    },
    {
      id: 'm11-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand discovery techniques and the BANT framework for qualification.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Listen first, pitch second',
          'BANT for quick qualification',
          'Decision drivers guide positioning',
        ],
      },
    },
  ],
  11: [ // Module 12 — Objections LACE
    {
      id: 'm12-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Objection Handling — LACE Framework',
        subtitle: 'Turning objections into confidence',
        content: 'Build confidence in handling customer objections and learn how to respond professionally.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Apply the LACE framework',
          'Handle pricing and trust objections',
          'Keep conversations productive',
        ],
      },
    },
    {
      id: 'm12-list1',
      type: 'list',
      leftContent: {
        label: 'THE FRAMEWORK',
        title: 'LACE Objection Handling',
        content: 'Follow these four steps when handling any objection.',
      },
      rightContent: {
        type: 'visual',
        title: 'LACE Steps',
        items: [
          'L — Listen fully',
          'A — Acknowledge concern',
          'C — Clarify the issue',
          'E — Explain the solution',
        ],
      },
    },
    {
      id: 'm12-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand how to handle objections professionally using the LACE framework.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Objections = interest, not rejection',
          'Listen before responding',
          'Stay calm and professional',
        ],
      },
    },
  ],
  12: [ // Module 13 — Communication
    {
      id: 'm13-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Communication and Professionalism',
        subtitle: 'Clear and confident messaging',
        content: 'Understand how to communicate Leapswitch and CloudPe value clearly and confidently.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Position CloudPe effectively',
          'Use the simple messaging formula',
          'Apply communication best practices',
        ],
      },
    },
    {
      id: 'm13-concept1',
      type: 'concept',
      leftContent: {
        label: 'MESSAGING',
        title: 'Simple Sales Messaging Formula',
        content: `<p class="mb-4"><strong>Customer Challenge → Solution → Business Benefit</strong></p>
<div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm"><strong>❌ Instead of:</strong> "We provide virtualized cloud infrastructure with scalable compute resources."</div>
<div class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm"><strong>✅ Say:</strong> "You can deploy infrastructure quickly and scale resources as your business grows."</div>`,
        callout: { label: 'REMEMBER', text: 'Successful sales conversations are customer-focused, not product-focused.' },
      },
      rightContent: {
        type: 'visual',
        title: 'Communication Tips',
        items: [
          'Listen more than you speak',
          'Avoid unnecessary jargon',
          'Be clear and concise',
          'Ask questions',
          'Focus on the customer',
        ],
      },
    },
    {
      id: 'm13-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now understand how to communicate value clearly and professionally.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Key Takeaways',
        items: [
          'Challenge → Solution → Benefit',
          'Customer-focused language',
          'Clear, not clever',
        ],
      },
    },
  ],
  13: [ // Module 14 — Shadow Calls
    {
      id: 'm14-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Shadow Calls',
        subtitle: 'Learning from experienced professionals',
        content: 'Observe experienced sales professionals during real customer interactions.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Complete 20 valid shadow calls',
          'Document observations effectively',
          'Apply learned techniques',
        ],
      },
    },
    {
      id: 'm14-list1',
      type: 'list',
      leftContent: {
        label: 'REQUIREMENTS',
        title: 'Valid Call Criteria',
        content: 'Not all calls count. Make sure your 20 calls meet these criteria.',
      },
      rightContent: {
        type: 'visual',
        title: 'What Counts',
        items: [
          'Genuine customer interaction',
          'Minimum 60 seconds',
          'No wrong numbers',
          'No ring-no-response',
        ],
      },
    },
    {
      id: 'm14-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'Complete the shadow call assignment as part of Phase 5 requirements.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Deliverable',
        items: [
          '20 valid calls documented',
          'Observe opening, discovery, positioning',
          'Submit observations for review',
        ],
      },
    },
  ],
  14: [ // Module 15 — Mock Sales Flow
    {
      id: 'm15-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Mock Sales Flow and Pitch Video',
        subtitle: 'Demonstrating your skills',
        content: 'Practice a complete sales conversation demonstrating all learned skills.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Complete a mock sales flow',
          'Record and submit a pitch video',
          'Demonstrate all key skills',
        ],
      },
    },
    {
      id: 'm15-list1',
      type: 'list',
      leftContent: {
        label: 'REQUIREMENTS',
        title: 'What You Must Demonstrate',
        content: 'Your mock sales flow should include all of these elements.',
      },
      rightContent: {
        type: 'visual',
        title: 'Evaluation Criteria',
        items: [
          'Ask discovery questions',
          'Identify pain points',
          'Recommend solutions',
          'Explain business value',
          'Handle objections',
          'Define next steps',
        ],
      },
    },
    {
      id: 'm15-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'Complete the mock sales flow and pitch video as part of Phase 5 requirements.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Deliverables',
        items: [
          'Written mock sales flow',
          '2-5 minute pitch video',
          'Include all 6 evaluation areas',
        ],
      },
    },
  ],
  15: [ // Module 16 — Toolkit
    {
      id: 'm16-intro',
      type: 'intro',
      leftContent: {
        label: 'MODULE OVERVIEW',
        title: 'Quick Reference Toolkit & Technical Glossary',
        subtitle: 'Resources for sales conversations',
        content: 'Access official resources, product brochures, and a technical glossary for quick reference.',
      },
      rightContent: {
        type: 'objectives',
        title: 'By the end of this module you\'ll be able to:',
        items: [
          'Find official resources quickly',
          'Use the technical glossary',
          'Reference SLA and policy documents',
        ],
      },
    },
    {
      id: 'm16-list1',
      type: 'list',
      leftContent: {
        label: 'RESOURCES',
        title: 'Official Websites & Documents',
        content: 'Keep these resources handy for customer conversations.',
      },
      rightContent: {
        type: 'visual',
        title: 'Key Resources',
        items: [
          'cloudpe.com — Product info',
          'leapswitch.com — Services',
          'Knowledge bases — Documentation',
          'SLA documents — Guarantees',
          'Product brochures — Sales aids',
        ],
      },
    },
    {
      id: 'm16-summary',
      type: 'summary',
      leftContent: {
        label: 'MODULE SUMMARY',
        title: 'What You\'ve Learned',
        content: 'You now have access to all key resources for effective sales conversations.',
      },
      rightContent: {
        type: 'takeaways',
        title: 'Resource Highlights',
        items: [
          'CloudPe & Leapswitch websites',
          '25-term technical glossary',
          'SLA and policy documents',
        ],
      },
    },
  ],
};

// ─── Component ──────────────────────────────────────────────────────
export default function SalesOnboardingCourse({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const { user, isAdmin } = useAuth();
  const [view, setView] = useState<'overview' | 'lesson' | 'phase5' | 'assessment' | 'result' | 'complete' | 'certificate'>('overview');
  const [activePhase, setActivePhase] = useState(1);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState<PhaseProgress[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<number>>(() => {
    // Expand only the phase containing the current module on load
    const currentPhase = PHASES.find(p => p.modules.includes(0))?.number || 1;
    const collapsed = new Set<number>();
    for (let i = 1; i <= 5; i++) {
      if (i !== currentPhase) collapsed.add(i);
    }
    return collapsed;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const activeModuleRef = useRef<HTMLButtonElement>(null);
  const [pillDismissed, setPillDismissed] = useState(() => {
    try { return localStorage.getItem(`pill-dismissed-${SALES_COURSE_ID}`) === 'true'; } catch { return false; }
  });

  // Assessment state
  const [takingAssessment, setTakingAssessment] = useState<Assessment | null>(null);
  const [takingQuestions, setTakingQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Task submission state
  const [shadowCallsContent, setShadowCallsContent] = useState('');
  const [mockSalesContent, setMockSalesContent] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!takingAssessment || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmitAssessment(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [takingAssessment, submitted]);

  // Scroll active module into view when lesson view is active
  useEffect(() => {
    if (view === 'lesson' && activeModuleRef.current) {
      activeModuleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [view, currentLessonIndex]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: courseData } = await supabase.from('courses').select('*').eq('id', SALES_COURSE_ID).single();
    const { data: lessonData } = await supabase.from('lessons').select('*').eq('course_id', SALES_COURSE_ID).order('order_index');
    const { data: progressData } = await supabase.from('lesson_progress').select('lesson_id').eq('user_id', user.id).eq('completed', true);
    const { data: phaseData } = await supabase.from('phase_progress').select('*').eq('user_id', user.id).eq('course_id', SALES_COURSE_ID);
    const { data: taskData } = await supabase.from('task_submissions').select('*').eq('user_id', user.id).eq('course_id', SALES_COURSE_ID);

    setCourse(courseData);
    setLessons(lessonData || []);
    setCompletedLessons(new Set((progressData || []).map((p: any) => p.lesson_id)));
    setPhaseProgress(phaseData || []);
    setTaskSubmissions(taskData || []);

    // Initialize phase progress if needed
    const existingPhases = new Set((phaseData || []).map((p: any) => p.phase_number));
    for (let i = 1; i <= 5; i++) {
      if (!existingPhases.has(i)) {
        await supabase.from('phase_progress').insert({
          user_id: user.id,
          course_id: SALES_COURSE_ID,
          phase_number: i,
          status: i === 1 ? 'in_progress' : 'locked',
        });
      }
    }

    // Re-fetch after init
    if (existingPhases.size === 0) {
      const { data: refreshedPhaseData } = await supabase.from('phase_progress').select('*').eq('user_id', user.id).eq('course_id', SALES_COURSE_ID);
      setPhaseProgress(refreshedPhaseData || []);
    }

    setLoading(false);
  };

  const getPhaseStatus = (phaseNum: number): PhaseProgress | undefined => {
    return phaseProgress.find(p => p.phase_number === phaseNum);
  };

  const isPhaseUnlocked = (phaseNum: number) => {
    if (isAdmin) return true;
    if (phaseNum === 1) return true;
    const prev = getPhaseStatus(phaseNum - 1);
    return prev?.assessment_passed === true;
  };

  const getOverallProgress = () => {
    const completedPhases = phaseProgress.filter(p => p.status === 'completed').length;
    return Math.round((completedPhases / 5) * 100);
  };

  const getCurrentPhase = () => {
    for (let i = 1; i <= 5; i++) {
      const prog = getPhaseStatus(i);
      if (prog?.status === 'in_progress' || (i === 1 && prog?.status === 'locked')) return i;
      if (prog?.status === 'locked' && isPhaseUnlocked(i)) return i;
    }
    return 1;
  };

  // ─── Lesson Logic ─────────────────────────────────────────────────
  const isLessonAccessible = (index: number) => {
    if (isAdmin) return true;
    const phase = PHASES.find(p => p.modules.includes(index));
    if (!phase) return false;
    if (!isPhaseUnlocked(phase.number)) return false;
    const phaseModuleIdx = phase.modules.indexOf(index);
    if (phaseModuleIdx === 0) return true;
    const prevLessonId = lessons[phase.modules[phaseModuleIdx - 1]]?.id;
    return completedLessons.has(prevLessonId);
  };

  const currentSlides = useMemo(() => {
    const slides = MODULE_SLIDES[currentLessonIndex];
    return slides || [];
  }, [currentLessonIndex]);

  const markCompleteAndContinue = async () => {
    if (!user) return;
    const lesson = lessons[currentLessonIndex];
    if (!lesson) return;

    if (!completedLessons.has(lesson.id)) {
      await supabase.from('lesson_progress').upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      setCompletedLessons(prev => new Set([...prev, lesson.id]));
      pushLessonCompletion(user.id, lesson.id, SALES_COURSE_ID, lesson.duration || null);
      markLessonCompleteInProgress(user.id, SALES_COURSE_ID, lesson.id);
    }

    // Check if this was the last lesson in the phase
    const phase = PHASES.find(p => p.modules.includes(currentLessonIndex))!;
    const phaseModuleIds = phase.modules.map(idx => lessons[idx]?.id).filter(Boolean);
    const allDone = phaseModuleIds.every(id => completedLessons.has(id) || id === lesson.id);

    if (allDone) {
      setView('complete');
      await supabase.from('phase_progress').update({ status: 'completed' }).eq('user_id', user.id).eq('course_id', SALES_COURSE_ID).eq('phase_number', phase.number);
      const { data: refreshed } = await supabase.from('phase_progress').select('*').eq('user_id', user.id).eq('course_id', SALES_COURSE_ID);
      setPhaseProgress(refreshed || []);
      return;
    }

    // Move to next lesson
    const nextIdx = currentLessonIndex + 1;
    if (nextIdx < lessons.length) {
      setCurrentLessonIndex(nextIdx);
      setCurrentSlideIndex(0);
    }
  };

  // ─── Assessment Logic ─────────────────────────────────────────────
  const startPhaseAssessment = async (phaseNum: number) => {
    const phase = PHASES.find(p => p.number === phaseNum)!;
    const { data: aData } = await supabase.from('assessments').select('*').eq('course_id', SALES_COURSE_ID).ilike('title', `%${phase.assessmentTitle}%`).single();
    if (!aData) return;

    const { data: qData } = await supabase.from('questions').select('*').eq('assessment_id', aData.id).order('order_index');
    setTakingAssessment(aData);
    setTakingQuestions(qData || []);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(aData.time_limit * 60);
    setSubmitted(false);
    setResult(null);
    setView('assessment');

    await supabase.from('assessment_attempts').insert({
      user_id: user?.id,
      assessment_id: aData.id,
      status: 'in_progress',
    });
  };

  const handleSubmitAssessment = async () => {
    if (!takingAssessment || !user) return;
    setSubmitted(true);

    let correct = 0;
    let totalGradable = 0;
    const review: any[] = [];

    for (const q of takingQuestions) {
      const answer = answers[q.id];
      let isCorrect = false;
      if (!q.manual_grading) {
        totalGradable++;
        if (q.type === 'multiple_choice') {
          isCorrect = answer === q.correct_answer;
        } else if (q.type === 'true_false') {
          isCorrect = answer === q.correct_answer;
        } else if (q.type === 'fill_blank') {
          isCorrect = answer?.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim();
        }
        if (isCorrect) correct++;
      }
      review.push({ question: q, answer, isCorrect });
    }

    const score = totalGradable > 0 ? Math.round((correct / totalGradable) * 100) : 0;
    const passed = score >= takingAssessment.passing_score;

    setResult({ score, passed, correct, total: totalGradable, review });

    await supabase.from('assessment_attempts').update({
      score,
      status: passed ? 'passed' : 'failed',
      answers,
      submitted_at: new Date().toISOString(),
    }).eq('user_id', user.id).eq('assessment_id', takingAssessment.id).eq('status', 'in_progress');

    const phaseNum = activePhase;
    await supabase.from('phase_progress').update({
      assessment_passed: passed,
      assessment_score: score,
      status: passed ? 'completed' : 'in_progress',
    }).eq('user_id', user.id).eq('course_id', SALES_COURSE_ID).eq('phase_number', phaseNum);

    if (passed && phaseNum < 5) {
      await supabase.from('phase_progress').update({ status: 'in_progress' }).eq('user_id', user.id).eq('course_id', SALES_COURSE_ID).eq('phase_number', phaseNum + 1);
    }

    const { data: refreshed } = await supabase.from('phase_progress').select('*').eq('user_id', user.id).eq('course_id', SALES_COURSE_ID);
    setPhaseProgress(refreshed || []);
    setView('result');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Task Submission Logic ────────────────────────────────────────
  const submitTask = async (taskType: string, content: string) => {
    if (!user || !content.trim()) return;
    await supabase.from('task_submissions').insert({
      user_id: user.id,
      course_id: SALES_COURSE_ID,
      task_type: taskType,
      content,
      status: 'submitted',
    });
    const { data: refreshed } = await supabase.from('task_submissions').select('*').eq('user_id', user.id).eq('course_id', SALES_COURSE_ID);
    setTaskSubmissions(refreshed || []);
  };

  const hasTaskSubmission = (taskType: string) => {
    return taskSubmissions.some(t => t.task_type === taskType);
  };

  const allPhase5TasksDone = () => {
    return hasTaskSubmission('shadow_calls') && hasTaskSubmission('mock_sales_flow') && hasTaskSubmission('final_assessment');
  };

  // ─── Certificate ──────────────────────────────────────────────────
  const issueCertificate = async () => {
    if (!user) return;
    await supabase.from('certificates').insert({
      user_id: user.id,
      course_id: SALES_COURSE_ID,
      course_name: 'Sales Onboarding Certification — Leapswitch & CloudPe',
      score: 100,
      certificate_id: `LMS-SALES-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'course_completed',
      title: 'Completed Sales Onboarding',
      description: 'Earned Sales Onboarding Certification',
    });
    setView('certificate');
  };

  // ─── Render Helpers ───────────────────────────────────────────────
  const getLessonStatus = (index: number) => {
    const lesson = lessons[index];
    if (!lesson) return 'locked';
    if (completedLessons.has(lesson.id)) return 'completed';
    if (index === currentLessonIndex) return 'current';
    if (isLessonAccessible(index)) return 'available';
    return 'locked';
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'quiz': return HelpCircle;
      case 'document': return FileText;
      default: return BookOpen;
    }
  };

  const navigateToLesson = (lessonIndex: number) => {
    const status = getLessonStatus(lessonIndex);
    if (status === 'locked' && !isAdmin) return;
    setCurrentLessonIndex(lessonIndex);
    setCurrentSlideIndex(0);
    const phase = PHASES.find(p => p.modules.includes(lessonIndex));
    if (phase) {
      setActivePhase(phase.number);
      // Phase 5 uses a special task view
      if (phase.number === 5) {
        setView('phase5');
      } else {
        setView('lesson');
      }
    } else {
      setView('lesson');
    }
  };

  const togglePhaseCollapse = (phaseNum: number) => {
    setCollapsedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseNum)) next.delete(phaseNum);
      else next.add(phaseNum);
      return next;
    });
  };

  // ─── Loading State ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
      </div>
    );
  }

  // ─── OVERVIEW VIEW ────────────────────────────────────────────────
  if (view === 'overview') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('course-library')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-800 truncate">{course?.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-full">{course?.department}</span>
              <span className="text-xs text-slate-400">{course?.duration}</span>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-lg p-4 border border-slate-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Course Progress</span>
            <span className="font-semibold text-cyan-700">
              {phaseProgress.filter(p => p.status === 'completed').length} of 5 Phases Completed — {getOverallProgress()}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-cyan-500 rounded-full h-2.5 transition-all duration-500" style={{ width: `${getOverallProgress()}%` }} />
          </div>
        </div>

        {/* Continue Learning Button */}
        {(() => {
          const currentPhase = getCurrentPhase();
          const allComplete = phaseProgress.every(p => p.status === 'completed');
          const nextLesson = lessons[currentLessonIndex];
          if (allComplete) {
            return (
              <button
                onClick={() => setView('certificate')}
                className="w-full flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">View Certificate</span>
                  <span className="text-green-100 text-sm font-normal">Course completed</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>
            );
          }
          return (
            <button
              onClick={() => {
                setActivePhase(currentPhase);
                navigateToLesson(currentLessonIndex);
              }}
              className="w-full flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <PlayCircle className="w-5 h-5" />
                <span className="font-semibold">Continue Learning</span>
                <span className="text-blue-100 text-sm font-normal">{nextLesson?.title || 'Next lesson'}</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
          );
        })()}

        {/* Course Index */}
        {(() => {
          const indexPhases = PHASES.map(phase => ({
            number: phase.number,
            name: phase.name,
            color: phase.color,
            bgColor: phase.bgColor,
            borderColor: phase.borderColor,
            description: phase.description,
            modules: phase.modules.map((modIdx, i) => {
              const ls = lessons[modIdx];
              const isPhase5 = phase.number === 5;
              return {
                id: ls?.id || `mod-${phase.number}-${i}`,
                title: ls?.title || '',
                type: isPhase5 ? 'task' : ls?.type || 'reading',
                duration: ls?.duration || null,
                lessonIndex: modIdx,
              };
            }).filter(m => m.title),
          }));

          const getPhaseStatusForIndex = (phaseNum: number): 'completed' | 'in_progress' | 'locked' | 'not_started' => {
            const prog = getPhaseStatus(phaseNum);
            if (prog?.status === 'completed') return 'completed';
            if (getCurrentPhase() === phaseNum && isPhaseUnlocked(phaseNum)) return 'in_progress';
            if (!isPhaseUnlocked(phaseNum)) return 'locked';
            return 'not_started';
          };

          const getModuleStatusForIndex = (mod: { lessonIndex: number; id: string }): 'completed' | 'current' | 'available' | 'locked' => {
            const lessonId = lessons[mod.lessonIndex]?.id;
            if (!lessonId) return 'locked';
            if (completedLessons.has(lessonId)) return 'completed';
            if (currentLessonIndex === mod.lessonIndex) return 'current';
            if (!isLessonAccessible(mod.lessonIndex)) return 'locked';
            return 'available';
          };

          return (
            <CourseIndex
              courseId={SALES_COURSE_ID}
              userId={user?.id || ''}
              phases={indexPhases}
              getPhaseStatus={getPhaseStatusForIndex}
              getModuleStatus={getModuleStatusForIndex}
              isPhaseUnlocked={isPhaseUnlocked}
              isAdmin={!!isAdmin}
              onModuleClick={(lessonIdx) => {
                setCurrentLessonIndex(lessonIdx);
                const phase = PHASES.find(p => p.modules.includes(lessonIdx));
                if (phase) setActivePhase(phase.number);
                setView('lesson');
              }}
            />
          );
        })()}

        <CourseAppendix />

        {/* Sticky Progress Pill */}
        {!pillDismissed && (() => {
          const allComplete = phaseProgress.every(p => p.status === 'completed');
          const currentPhase = getCurrentPhase();
          if (allComplete) {
            return (
              <div className="fixed bottom-6 right-6 md:bottom-4 md:right-4 z-50 bg-white border border-slate-200 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-slate-700 font-medium">Course Complete</span>
                <button onClick={() => { setPillDismissed(true); try { localStorage.setItem(`pill-dismissed-${SALES_COURSE_ID}`, 'true'); } catch {} }} className="ml-1 p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            );
          }
          const phase = PHASES.find(p => p.number === currentPhase);
          return (
            <div className="fixed bottom-6 right-6 md:bottom-4 md:right-4 z-50 bg-white border border-slate-200 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: phase?.color || '#3B82F6' }} />
              <span className="text-slate-700 font-medium">Phase {currentPhase} — In Progress</span>
              <button onClick={() => { setPillDismissed(true); try { localStorage.setItem(`pill-dismissed-${SALES_COURSE_ID}`, 'true'); } catch {} }} className="ml-1 p-1 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          );
        })()}
      </div>
    );
  }

  // ─── LESSON VIEW (Slide-based) ──────────────────────────────────────
  if (view === 'lesson' && activePhase !== 5) {
    const currentLesson = lessons[currentLessonIndex];
    const currentPhaseData = PHASES.find(p => p.modules.includes(currentLessonIndex))!;
    const slide = currentSlides[currentSlideIndex];
    const isLastSlide = currentSlideIndex === currentSlides.length - 1;
    const completedModulesTotal = lessons.filter(l => completedLessons.has(l.id)).length;

    // Get phase status for display
    const getPhaseDisplayStatus = (phaseNum: number): 'completed' | 'in_progress' | 'locked' | 'not_started' => {
      const phase = PHASES.find(p => p.number === phaseNum);
      if (!phase) return 'not_started';
      const unlocked = isAdmin || isPhaseUnlocked(phaseNum);
      if (!unlocked) return 'locked';
      const prog = getPhaseStatus(phaseNum);
      if (prog?.status === 'completed') return 'completed';
      if (prog?.status === 'in_progress') return 'in_progress';
      return 'not_started';
    };

    // Get assessment status for a phase
    const getAssessmentStatus = (phaseNum: number): 'passed' | 'available' | 'locked' => {
      const unlocked = isAdmin || isPhaseUnlocked(phaseNum);
      if (!unlocked) return 'locked';
      const prog = getPhaseStatus(phaseNum);
      if (prog?.assessment_passed) return 'passed';
      // Check if all modules in phase are complete
      const phase = PHASES.find(p => p.number === phaseNum);
      if (!phase) return 'locked';
      const allModulesComplete = phase.modules.every(idx => completedLessons.has(lessons[idx]?.id));
      if (allModulesComplete && unlocked) return 'available';
      return 'locked';
    };

    return (
      <div className="fixed inset-0 flex bg-slate-50">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen overflow-hidden transition-transform duration-300 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm truncate">{course?.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Course Navigation</p>
          </div>

          {/* Course Tree */}
          <div className="flex-1 overflow-y-auto py-2">
            {PHASES.map(phase => {
              const isCurrentPhase = phase.number === currentPhaseData.number;
              const isCollapsed = collapsedPhases.has(phase.number);
              const phaseUnlocked = isAdmin || isPhaseUnlocked(phase.number);
              const phaseDisplayStatus = getPhaseDisplayStatus(phase.number);

              return (
                <div key={phase.number}>
                  {/* Phase Header */}
                  <button
                    onClick={() => togglePhaseCollapse(phase.number)}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors ${
                      isCurrentPhase ? 'bg-cyan-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: phase.color }}
                    />
                    <span className="flex-1 text-sm font-semibold text-slate-700 truncate">
                      Phase {phase.number} — {phase.name.length > 18 ? phase.name.substring(0, 18) + '...' : phase.name}
                    </span>
                    {/* Status Badge */}
                    {phaseDisplayStatus === 'completed' ? (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    ) : phaseDisplayStatus === 'in_progress' ? (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    ) : phaseDisplayStatus === 'locked' ? (
                      <Lock className="w-3 h-3 text-slate-400" />
                    ) : (
                      <Circle className="w-3 h-3 text-slate-300" />
                    )}
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Module List */}
                  {!isCollapsed && (
                    <div className="border-l-2 ml-6 pl-0">
                      {phase.modules.map(modIdx => {
                        const modLesson = lessons[modIdx];
                        if (!modLesson) return null;
                        const status = getLessonStatus(modIdx);
                        const isActive = modIdx === currentLessonIndex;
                        const Icon = getLessonIcon(modLesson.type);
                        const isLocked = (status === 'locked' && !isAdmin) || !phaseUnlocked;

                        return (
                          <button
                            key={modLesson.id}
                            ref={isActive ? activeModuleRef : null}
                            onClick={() => {
                              if (!isLocked) {
                                navigateToLesson(modIdx);
                                setMobileSidebarOpen(false);
                              }
                            }}
                            disabled={isLocked}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                              isActive
                                ? 'bg-blue-50 border-l-[3px]'
                                : 'hover:bg-slate-50'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ borderLeftColor: isActive ? phase.color : 'transparent' }}
                          >
                            {/* Type Icon */}
                            <Icon className={`w-4 h-4 flex-shrink-0 ${
                              isLocked ? 'text-slate-300' : isActive ? 'text-cyan-600' : 'text-slate-400'
                            }`} />

                            {/* Module Info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-tight line-clamp-2 ${
                                isLocked ? 'text-slate-400' : isActive ? 'text-cyan-800 font-medium' : 'text-slate-700'
                              }`}>
                                {modLesson.title.replace(/^Module \d+ — /, '')}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">{modLesson.duration || 'N/A'}</p>
                            </div>

                            {/* Status Icon */}
                            <div className="flex-shrink-0">
                              {status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : isLocked ? (
                                <Lock className="w-5 h-5 text-slate-300" />
                              ) : isActive ? (
                                <Clock className="w-5 h-5 text-blue-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                          </button>
                        );
                      })}

                      {/* Phase Assessment Row */}
                      <button
                        onClick={() => {
                          const assessmentStatus = getAssessmentStatus(phase.number);
                          if (assessmentStatus === 'available') {
                            startPhaseAssessment(phase.number);
                            setMobileSidebarOpen(false);
                          }
                        }}
                        disabled={getAssessmentStatus(phase.number) === 'locked'}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left border-t border-slate-100 ${
                          getAssessmentStatus(phase.number) === 'locked'
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <FileText className={`w-4 h-4 flex-shrink-0 ${
                          getAssessmentStatus(phase.number) === 'passed' ? 'text-green-600' : 'text-indigo-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700">Phase {phase.number} Assessment</p>
                        </div>
                        {getAssessmentStatus(phase.number) === 'passed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : getAssessmentStatus(phase.number) === 'available' ? (
                          <span className="text-xs font-medium text-indigo-600">Take Now</span>
                        ) : (
                          <Lock className="w-5 h-5 text-slate-300 flex-shrink-0" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
            {/* Circular Progress */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="stroke-slate-200"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="stroke-cyan-500"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 16 * (completedModulesTotal / lessons.length)} ${2 * Math.PI * 16}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-700">{completedModulesTotal}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">{completedModulesTotal} of {lessons.length} Complete</p>
              <p className="text-xs text-slate-400">modules completed</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <button onClick={() => setView('overview')} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <span className="text-sm text-slate-500 truncate hidden sm:inline">{course?.title}</span>
            </div>
            <div className="flex-1 flex justify-center min-w-0 px-4">
              <h1 className="font-bold text-slate-800 truncate text-sm sm:text-base">{currentLesson?.title}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 min-w-0">
              <span>{currentSlideIndex + 1} / {currentSlides.length}</span>
            </div>
          </header>

          {/* Flashcard Content */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
            {slide && (
              <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 lg:gap-8">
                {/* Left Card */}
                <div className="lg:w-[48%] bg-white rounded-2xl shadow-md p-6 lg:p-8 flex flex-col">
                  <SlideLeftContent slide={slide} />
                </div>

                {/* Right Card */}
                <div className="lg:w-[48%] bg-white rounded-2xl shadow-md p-6 lg:p-8 flex flex-col">
                  <SlideRightContent slide={slide} />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="h-16 bg-white border-t border-slate-200 flex items-center px-6 flex-shrink-0">
            {/* Previous Button */}
            <div className="w-32">
              {currentSlideIndex > 0 && (
                <button
                  onClick={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
              )}
            </div>

            {/* Slide Indicators */}
            <div className="flex-1 flex justify-center">
              {currentSlides.length <= 8 ? (
                <div className="flex items-center gap-2">
                  {currentSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        idx === currentSlideIndex ? 'bg-cyan-500' : 'bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-sm text-slate-500">
                  {currentSlideIndex + 1} / {currentSlides.length}
                </span>
              )}
            </div>

            {/* Next Button */}
            <div className="w-40 flex justify-end">
              {!isLastSlide ? (
                <button
                  onClick={() => setCurrentSlideIndex(currentSlideIndex + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={markCompleteAndContinue}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  Mark Complete & Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE 5 TASK VIEW ────────────────────────────────────────────
  if (view === 'phase5') {
    const allDone = allPhase5TasksDone();

    return (
      <div className="space-y-6">
        <button onClick={() => setView('overview')} className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-800 font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to Phases
        </button>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Phase 5 — Field Readiness and Certification</h2>
          <p className="text-slate-500 mb-6">Complete all 3 tasks below to earn your Sales Onboarding Certification.</p>
          {allDone && (
            <button
              onClick={issueCertificate}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Award className="w-5 h-5" /> Complete Course & Get Certificate
            </button>
          )}
        </div>

        {/* Task 1 — Shadow Calls */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Task 1 — Shadow Calls Log</h3>
              <p className="text-sm text-slate-500">Record your observations from 20 valid customer calls</p>
            </div>
            {hasTaskSubmission('shadow_calls') && (
              <span className="ml-auto px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Submitted
              </span>
            )}
          </div>
          <div className="bg-slate-50 rounded-lg p-4 mb-4 text-sm text-slate-600">
            <p className="font-medium mb-2">Assignment Instructions:</p>
            <p className="mb-2">Shadow 20 valid customer calls or meetings conducted by experienced sales team members during your first two weeks on the floor.</p>
            <p className="mb-2"><strong>Valid Call Criteria:</strong> Genuine interaction | Minimum 60 seconds | Wrong numbers and RNR do not count</p>
            <p><strong>Format:</strong> Prospect Name | Salesperson Shadowed | What They Pitched | How They Pitched | Pitch Outcome | Your Learnings</p>
          </div>
          {!hasTaskSubmission('shadow_calls') ? (
            <>
              <textarea
                value={shadowCallsContent}
                onChange={(e) => setShadowCallsContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm mb-3"
                placeholder="Enter your shadow call observations here..."
              />
              <button
                onClick={() => submitTask('shadow_calls', shadowCallsContent)}
                disabled={!shadowCallsContent.trim()}
                className="px-5 py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 disabled:opacity-50"
              >
                Submit Log
              </button>
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
              Your shadow calls log has been submitted successfully.
            </div>
          )}
        </div>

        {/* Task 2 — Mock Sales Flow */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Task 2 — Mock Sales Flow</h3>
              <p className="text-sm text-slate-500">Document your mock sales conversation</p>
            </div>
            {hasTaskSubmission('mock_sales_flow') && (
              <span className="ml-auto px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Submitted
              </span>
            )}
          </div>
          <div className="bg-slate-50 rounded-lg p-4 mb-4 text-sm text-slate-600">
            <p className="font-medium mb-2">Evaluation Criteria — You must demonstrate:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Ask discovery questions</li>
              <li>Identify customer pain points</li>
              <li>Recommend suitable solutions</li>
              <li>Explain business value</li>
              <li>Handle objections professionally</li>
              <li>Define clear next steps</li>
            </ul>
            <p><strong>Format:</strong> Customer Scenario | Pain Points Identified | Solution Recommended | Objection Raised | Your Response | Next Step Suggested | Key Learning</p>
          </div>
          {!hasTaskSubmission('mock_sales_flow') ? (
            <>
              <textarea
                value={mockSalesContent}
                onChange={(e) => setMockSalesContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm mb-3"
                placeholder="Enter your mock sales flow here..."
              />
              <button
                onClick={() => submitTask('mock_sales_flow', mockSalesContent)}
                disabled={!mockSalesContent.trim()}
                className="px-5 py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 disabled:opacity-50"
              >
                Submit Mock Sales Flow
              </button>
            </>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
              Your mock sales flow has been submitted successfully.
            </div>
          )}
        </div>

        {/* Task 3 — Final Assessment */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Task 3 — Scenario-Based Final Assessment</h3>
              <p className="text-sm text-slate-500">10 scenario questions | 30 minutes</p>
            </div>
            {hasTaskSubmission('final_assessment') ? (
              <span className="ml-auto px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            ) : (
              <span className="ml-auto px-2.5 py-1 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-full flex items-center gap-1">
                <Play className="w-3 h-3" /> Required
              </span>
            )}
          </div>
          {!hasTaskSubmission('final_assessment') ? (
            <button
              onClick={() => startPhaseAssessment(5)}
              className="px-5 py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Start Final Assessment
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
              You have completed the final assessment.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── PHASE COMPLETE SCREEN ────────────────────────────────────────
  if (view === 'complete') {
    const phase = PHASES.find(p => p.number === activePhase)!;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Phase {activePhase} Complete!</h2>
          <p className="text-slate-500 mb-6">You have completed all modules in {phase.name}.</p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-slate-800 mb-3">Modules Completed</h4>
            <div className="space-y-2">
              {phase.modules.map(idx => lessons[idx]).filter(Boolean).map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {lesson.title}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => startPhaseAssessment(activePhase)}
            className="px-6 py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ClipboardCheck className="w-5 h-5" /> Take Phase {activePhase} Assessment
          </button>
        </div>
      </div>
    );
  }

  // ─── ASSESSMENT VIEW ──────────────────────────────────────────────
  if (view === 'assessment' && takingAssessment && !submitted) {
    const currentQ = takingQuestions[currentQuestionIndex];
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => setView('overview')} className="text-sm text-cyan-600 hover:text-cyan-800 mb-2 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Exit Assessment
            </button>
            <h2 className="text-xl font-bold text-slate-800">{takingAssessment.title}</h2>
            <p className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {takingQuestions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-700'}`}>
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {currentQ && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-full">Q{currentQuestionIndex + 1}</span>
              </div>
              <p className="text-slate-800 font-medium mb-4">{currentQ.question_text}</p>

              {currentQ.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {currentQ.options?.map((opt: string, oi: number) => (
                    <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[currentQ.id] === opt ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name={`q-${currentQ.id}`} checked={answers[currentQ.id] === opt} onChange={() => setAnswers({ ...answers, [currentQ.id]: opt })} className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.type === 'true_false' && (
                <div className="flex gap-3">
                  {['True', 'False'].map(opt => (
                    <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${answers[currentQ.id] === opt.toLowerCase() ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name={`q-${currentQ.id}`} checked={answers[currentQ.id] === opt.toLowerCase()} onChange={() => setAnswers({ ...answers, [currentQ.id]: opt.toLowerCase() })} className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-medium text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ.type === 'fill_blank' && (
                <input type="text" value={answers[currentQ.id] || ''} onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm" placeholder="Your answer" />
              )}

              {currentQ.type === 'matching' && (
                <div className="space-y-3">
                  {currentQ.matching_pairs?.map((pair: any, pi: number) => (
                    <div key={pi} className="flex items-center gap-3">
                      <span className="flex-1 p-2 bg-slate-50 rounded-lg text-sm text-slate-700">{pair.left}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <select value={answers[currentQ.id]?.[pi] || ''} onChange={(e) => setAnswers({ ...answers, [currentQ.id]: { ...answers[currentQ.id], [pi]: e.target.value } })} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none bg-white">
                        <option value="">Select match...</option>
                        {currentQ.matching_pairs.map((p: any, i: number) => <option key={i} value={p.right}>{p.right}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {(currentQ.type === 'short_answer' || currentQ.type === 'long_answer') && (
                <textarea value={answers[currentQ.id] || ''} onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })} rows={currentQ.type === 'long_answer' ? 6 : 3} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm" placeholder="Type your answer here..." />
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50">
                Previous
              </button>
              {currentQuestionIndex < takingQuestions.length - 1 ? (
                <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmitAssessment} className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Submit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── RESULT VIEW ──────────────────────────────────────────────────
  if (view === 'result' && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
            {result.passed ? <Trophy className="w-10 h-10 text-green-500" /> : <XCircle className="w-10 h-10 text-red-500" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{result.passed ? 'Congratulations!' : 'Assessment Completed'}</h2>
          <p className="text-slate-500 mb-6">{result.passed ? 'You passed the assessment!' : 'You did not meet the passing score.'}</p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-700">{result.score}%</p>
              <p className="text-sm text-slate-500">Your Score</p>
            </div>
            <div className="w-px h-12 bg-slate-200" />
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-700">{takingAssessment?.passing_score}%</p>
              <p className="text-sm text-slate-500">Passing Score</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-slate-800 mb-3">Review</h4>
            <div className="space-y-2">
              {result.review.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-slate-700 truncate flex-1">{i + 1}. {r.question.question_text.substring(0, 60)}...</span>
                  {r.question.manual_grading ? (
                    <span className="text-xs text-amber-600 font-medium">Manual grading</span>
                  ) : r.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {result.passed ? (
              <button
                onClick={() => {
                  if (activePhase < 5) {
                    setActivePhase(activePhase + 1);
                    setView('overview');
                  } else {
                    setView('overview');
                  }
                }}
                className="px-6 py-2.5 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                {activePhase < 5 ? (
                  <>Continue to Phase {activePhase + 1} <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>Back to Overview</>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  setSubmitted(false);
                  setResult(null);
                  setView('complete');
                }}
                className="px-6 py-2.5 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Retake Assessment
              </button>
            )}
            <button onClick={() => setView('overview')} className="px-6 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Back to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CERTIFICATE VIEW ─────────────────────────────────────────────
  if (view === 'certificate') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Sales Onboarding Complete!</h2>
          <p className="text-slate-500 mb-6">You have successfully completed the Sales Onboarding Training Programme.</p>

          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-8 mb-6 border-2 border-cyan-200">
            <div className="text-sm text-cyan-600 font-medium mb-2">CERTIFICATE OF COMPLETION</div>
            <h3 className="text-xl font-bold text-cyan-800 mb-4">Sales Onboarding Certification — Leapswitch & CloudPe</h3>
            <div className="text-slate-600 text-sm">This certifies that the bearer has completed all required training modules, assessments, and field readiness tasks.</div>
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={() => onNavigate('certificates')} className="px-6 py-2.5 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> View in Certificates
            </button>
            <button onClick={() => setView('overview')} className="px-6 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Slide Content Components ────────────────────────────────────────
function SlideLeftContent({ slide }: { slide: Slide }) {
  return (
    <div className="flex-1">
      {slide.leftContent.label && (
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2 block">
          {slide.leftContent.label}
        </span>
      )}
      <h2 className="text-2xl font-bold text-slate-800 mb-4">{slide.leftContent.title}</h2>

      {slide.leftContent.subtitle && (
        <p className="text-lg font-medium text-slate-700 mb-4">{slide.leftContent.subtitle}</p>
      )}

      <hr className="border-slate-200 mb-4" />

      {slide.leftContent.content && (
        <div
          className="text-slate-600 text-sm leading-relaxed [&_p]:mb-3 [&_strong]:text-slate-800 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
          dangerouslySetInnerHTML={{ __html: slide.leftContent.content }}
        />
      )}

      {slide.leftContent.callout && (
        <div className="mt-4 bg-cyan-50 border-l-4 border-cyan-500 rounded-r-lg p-4">
          <span className="text-xs font-bold text-cyan-700">{slide.leftContent.callout.label}</span>
          <p className="text-sm text-cyan-800 mt-1">{slide.leftContent.callout.text}</p>
        </div>
      )}
    </div>
  );
}

function SlideRightContent({ slide }: { slide: Slide }) {
  return (
    <div className="flex-1">
      {slide.rightContent.type === 'objectives' && (
        <div className="border border-slate-200 rounded-xl p-6">
          <p className="font-bold text-slate-800 mb-4">{slide.rightContent.title}</p>
          <ul className="space-y-3">
            {slide.rightContent.items?.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {slide.rightContent.type === 'visual' && (
        <div>
          <h3 className="font-bold text-slate-800 mb-3">{slide.rightContent.title}</h3>
          <div className="grid gap-2">
            {slide.rightContent.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                {item.includes('—') || item.includes(':') ? (
                  <span className="text-sm text-slate-700">{item}</span>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0" />
                )}
                {!item.includes('—') && !item.includes(':') && (
                  <span className="text-sm text-slate-700">{item}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {slide.rightContent.type === 'takeaways' && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-800">{slide.rightContent.title}</h3>
          </div>
          <ul className="space-y-2">
            {slide.rightContent.items?.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-amber-900">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-amber-700 font-medium">Ready to continue?</p>
        </div>
      )}
    </div>
  );
}
