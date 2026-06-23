import { useState, useMemo } from 'react';
import {
  BookMarked, Globe, FileText, FolderOpen, Award, Shield, BookOpen,
  ChevronDown, ChevronUp, ExternalLink, Search, LayoutTemplate, SearchX
} from 'lucide-react';

const glossaryTerms = [
  { term: 'Bare Metal', def: 'A physical server dedicated entirely to one customer — no shared resources' },
  { term: 'VPS', def: 'A portion of a physical server allocated to one customer using virtualisation' },
  { term: 'Hypervisor', def: 'Software that creates and manages virtual machines on a physical server' },
  { term: 'GPU', def: 'Graphics Processing Unit — high-performance chip used for AI, ML, and rendering' },
  { term: 'IaaS', def: 'Infrastructure as a Service — raw computing resources delivered over the internet' },
  { term: 'PaaS', def: 'Platform as a Service — a managed platform for deploying applications' },
  { term: 'SaaS', def: 'Software as a Service — a complete application delivered over the internet' },
  { term: 'Uptime', def: 'The percentage of time a system is operational and available' },
  { term: 'SLA', def: 'Service Level Agreement — a contract defining the minimum service standards the provider commits to' },
  { term: 'Latency', def: 'The time it takes data to travel from one point to another' },
  { term: 'Bandwidth', def: 'The amount of data that can be transferred per second' },
  { term: 'Colocation', def: "Hosting a customer's own servers in our data centre" },
  { term: 'Private Cloud', def: 'Cloud infrastructure dedicated exclusively to one organisation' },
  { term: 'Public Cloud', def: 'Cloud infrastructure shared across multiple customers' },
  { term: 'Hybrid Cloud', def: 'A combination of private and public cloud environments' },
  { term: 'Dedicated Server', def: 'A physical server used by only one customer' },
  { term: 'Managed Services', def: 'Services where the provider handles ongoing management and maintenance' },
  { term: 'KYC', def: 'Know Your Customer — the identity verification process required before activating services' },
  { term: 'Provisioning', def: 'The process of setting up and configuring a server or service for a customer' },
  { term: 'Redundancy', def: 'Having backup systems in place so a failure does not cause downtime' },
  { term: 'Failover', def: 'Automatic switching to a backup system when the primary system fails' },
  { term: 'Backup', def: 'Copies of data stored separately to allow recovery after loss or failure' },
  { term: 'Disaster Recovery', def: 'A plan and set of systems that allow a business to recover from major failures' },
  { term: 'IP Allocation', def: "Assigning internet addresses to a customer's servers and services" },
  { term: 'CDN', def: 'Content Delivery Network — a network of servers distributed globally to deliver content faster to end users' },
];

interface SectionMeta {
  id: string;
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
  hoverBg: string;
  openBorder: string;
}

const SECTIONS: SectionMeta[] = [
  { id: 'a1', icon: <Globe className="w-4 h-4" />, title: 'A.1 Official Websites and Documentation', count: 3, color: 'text-blue-500', hoverBg: 'hover:bg-blue-50', openBorder: 'border-b border-gray-200' },
  { id: 'a2', icon: <FileText className="w-4 h-4" />, title: 'A.2 Product Brochures', count: 3, color: 'text-indigo-500', hoverBg: 'hover:bg-indigo-50', openBorder: 'border-b border-gray-200' },
  { id: 'a3', icon: <FolderOpen className="w-4 h-4" />, title: 'A.3 Marketing Folder and Certifications', count: 2, color: 'text-purple-500', hoverBg: 'hover:bg-purple-50', openBorder: 'border-b border-gray-200' },
  { id: 'a4', icon: <Shield className="w-4 h-4" />, title: 'A.4 SLA and Policy Documents — CloudPe', count: 3, color: 'text-teal-500', hoverBg: 'hover:bg-teal-50', openBorder: 'border-b border-gray-200' },
  { id: 'a5', icon: <Shield className="w-4 h-4" />, title: 'A.5 SLA and Policy Documents — Leapswitch Networks', count: 4, color: 'text-teal-600', hoverBg: 'hover:bg-teal-50', openBorder: 'border-b border-gray-200' },
  { id: 'a6', icon: <BookOpen className="w-4 h-4" />, title: 'A.6 Knowledge Base and Learning Resources', count: 3, color: 'text-orange-500', hoverBg: 'hover:bg-orange-50', openBorder: 'border-b border-gray-200' },
];

interface AccordionSectionProps {
  meta: SectionMeta;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function AccordionSection({ meta, defaultOpen = false, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 bg-slate-50 ${meta.hoverBg} transition-colors text-left ${open ? meta.openBorder : ''}`}
      >
        <div className="flex items-center gap-2">
          <span className={meta.color}>{meta.icon}</span>
          <span className="font-medium text-slate-800 text-sm">{meta.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-white text-gray-400 text-xs rounded-full border border-gray-100">{meta.count} links</span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '2000px' : '0px' }}
      >
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

function LinkRow({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-gray-50 hover:border-l-2 hover:border-l-blue-400 transition-all duration-150 group"
    >
      <div className="text-slate-400 group-hover:text-blue-500 transition-colors">{icon}</div>
      <span className="text-sm text-blue-600 group-hover:text-blue-700 group-hover:underline underline-offset-2 flex-1 transition-colors">{label}</span>
      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
    </a>
  );
}

function QuickReferenceToolkit() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400 italic">
        These materials can be used before customer meetings, during opportunity evaluation, and while preparing recommendations.
      </p>

      <AccordionSection meta={SECTIONS[0]} defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Official Websites</h4>
            <LinkRow href="https://www.cloudpe.com/" icon={<Globe className="w-4 h-4" />} label="CloudPe" />
            <LinkRow href="https://leapswitch.com/" icon={<Globe className="w-4 h-4" />} label="Leapswitch Networks" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Product Documentation</h4>
            <LinkRow href="https://www.cloudpe.com/article-categories/product/" icon={<BookOpen className="w-4 h-4" />} label="CloudPe Product Documentation" />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection meta={SECTIONS[1]}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 rounded-lg p-4 hover:shadow-md transition-shadow duration-150 flex flex-col items-center text-center gap-3 border-t-[3px] border-t-blue-500">
            <FileText className="w-8 h-8 text-blue-500" />
            <h4 className="font-medium text-slate-800 text-sm">CloudPe Brochure</h4>
            <a
              href="https://drive.google.com/file/d/1Wnp_8t6lT0XPS9uxLcJo-y5QkzPiHAh_/view"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Brochure
            </a>
          </div>
          <div className="bg-white border border-slate-100 rounded-lg p-4 hover:shadow-md transition-shadow duration-150 flex flex-col items-center text-center gap-3 border-t-[3px] border-t-indigo-500">
            <FileText className="w-8 h-8 text-indigo-500" />
            <h4 className="font-medium text-slate-800 text-sm">Leapswitch Services Brochure</h4>
            <a
              href="https://drive.google.com/file/d/19L2BRDs9pkHYmJYY4ip8o_RDC-xVdPHH/view"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Brochure
            </a>
          </div>
          <div className="bg-white border border-slate-100 rounded-lg p-4 hover:shadow-md transition-shadow duration-150 flex flex-col items-center text-center gap-3 border-t-[3px] border-t-purple-500">
            <LayoutTemplate className="w-8 h-8 text-purple-500" />
            <h4 className="font-medium text-slate-800 text-sm">Leapswitch Networks PPT</h4>
            <a
              href="https://drive.google.com/file/d/156xg_7nQGinf2Bg-y-c0_XDM_g8BckZP/view"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto px-4 py-2 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Presentation
            </a>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection meta={SECTIONS[2]}>
        <div className="space-y-2">
          <LinkRow href="https://drive.google.com/drive/folders/1BZyjKEg1OtBQB2J0tgA_9POQdEWsZHk7?usp=drive_link" icon={<FolderOpen className="w-4 h-4" />} label="Marketing Folder" />
          <LinkRow href="http://leapswitch.com/about-us.php" icon={<Award className="w-4 h-4" />} label="Company Certifications" />
        </div>
      </AccordionSection>

      <AccordionSection meta={SECTIONS[3]}>
        <div className="space-y-2">
          <LinkRow href="https://www.cloudpe.com/service-level-agreement/" icon={<Shield className="w-4 h-4" />} label="Service Level Agreement (SLA)" />
          <LinkRow href="https://www.cloudpe.com/terms-of-service/" icon={<Shield className="w-4 h-4" />} label="Terms of Service" />
          <LinkRow href="https://www.cloudpe.com/privacy-policy/" icon={<Shield className="w-4 h-4" />} label="Privacy Policy" />
        </div>
      </AccordionSection>

      <AccordionSection meta={SECTIONS[4]}>
        <div className="space-y-2">
          <LinkRow href="https://leapswitch.com/service-level-agreement.php" icon={<Shield className="w-4 h-4" />} label="Service Level Agreement (SLA)" />
          <LinkRow href="https://leapswitch.com/terms-of-service.php" icon={<Shield className="w-4 h-4" />} label="Terms of Service" />
          <LinkRow href="https://leapswitch.com/privacy-policy.php" icon={<Shield className="w-4 h-4" />} label="Privacy Policy" />
          <LinkRow href="https://leapswitch.com/acceptable-usage-policy.php" icon={<Shield className="w-4 h-4" />} label="Acceptable Use Policy (AUP)" />
        </div>
      </AccordionSection>

      <AccordionSection meta={SECTIONS[5]}>
        <div className="space-y-2">
          <LinkRow href="https://www.cloudpe.com/knowledge-base/" icon={<BookOpen className="w-4 h-4" />} label="CloudPe Knowledge Base" />
          <LinkRow href="https://service.leapswitch.com/knowledgebase/" icon={<BookOpen className="w-4 h-4" />} label="Leapswitch Knowledge Base" />
          <LinkRow href="https://leapswitch.com/managed-services-add-ons.php" icon={<BookOpen className="w-4 h-4" />} label="Managed Services Add-ons" />
        </div>
      </AccordionSection>
    </div>
  );
}

function TechnicalGlossary() {
  const [query, setQuery] = useState('');
  const filtered = glossaryTerms.filter(
    t => t.term.toLowerCase().includes(query.toLowerCase()) || t.def.toLowerCase().includes(query.toLowerCase())
  );

  const letterGroups = useMemo(() => {
    const groups: Record<string, typeof glossaryTerms> = {};
    glossaryTerms.forEach(t => {
      const letter = t.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(t);
    });
    return groups;
  }, []);

  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const activeLetters = Object.keys(letterGroups);

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`glossary-${letter}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-slate-800">25 Terms Every Sales Person Must Know</h4>
        <p className="text-sm text-slate-500 mt-1">Hover over any term to see its definition, or browse the full list below.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:shadow-sm outline-none border-0 transition-all duration-150"
        />
      </div>

      {/* Alphabet Jump */}
      {!query && (
        <div className="flex flex-wrap gap-1.5">
          {allLetters.map(letter => {
            const active = activeLetters.includes(letter);
            return (
              <button
                key={letter}
                onClick={() => active && scrollToLetter(letter)}
                disabled={!active}
                className={`w-7 h-7 rounded-md text-xs font-medium flex items-center justify-center transition-colors ${
                  active
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <SearchX className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">No terms found for &quot;{query}&quot;</p>
          <p className="text-xs text-gray-400 mt-1">Try a different keyword</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item, idx, arr) => {
            const letter = item.term[0].toUpperCase();
            const isFirstOfLetter = idx === 0 || arr[idx - 1].term[0].toUpperCase() !== letter;
            return (
              <div
                key={item.term}
                id={isFirstOfLetter ? `glossary-${letter}` : undefined}
                className="bg-white border border-slate-100 border-l-[3px] border-l-indigo-400 rounded-lg p-4 hover:shadow-md hover:border-indigo-500 transition-all duration-150 relative"
              >
                <span className="absolute top-2 right-2 w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                  {letter}
                </span>
                <h5 className="font-semibold text-primary-700 text-base mb-1 pr-8">{item.term}</h5>
                <p className="text-sm text-slate-600 leading-relaxed">{item.def}</p>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Can&apos;t find a term? Ask your manager or raise it in your onboarding check-in.
      </p>
    </div>
  );
}

export function CourseAppendix() {
  const [activeTab, setActiveTab] = useState<'toolkit' | 'glossary'>('toolkit');

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-7 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookMarked className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Appendix — Quick Reference Toolkit & Technical Glossary</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Practical resources and definitions to support your day-to-day sales conversations
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-xs font-medium rounded-full flex-shrink-0">
            Reference Material
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-6 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('toolkit')}
            className={`pb-3 text-sm font-medium border-b-[3px] transition-colors ${
              activeTab === 'toolkit'
                ? 'border-primary-500 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Quick Reference Toolkit
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`pb-3 text-sm font-medium border-b-[3px] transition-colors ${
              activeTab === 'glossary'
                ? 'border-primary-500 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Technical Glossary
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-7 pb-7">
        {activeTab === 'toolkit' ? <QuickReferenceToolkit /> : <TechnicalGlossary />}
      </div>
    </div>
  );
}
