"use client";

import { useState } from "react";

type Tier = "tier1" | "tier2" | "tier3" | "tier4";

interface Company {
  name: string;
  why: string;
  salary: string;
  careerPage: string;
  difficulty?: string;
}

interface Category {
  title: string;
  description?: string;
  companies: Company[];
}

const tierData: Record<Tier, { title: string; subtitle: string; color: string; categories: Category[] }> = {
  tier1: {
    title: "Tier 1: High Probability",
    subtitle: "Apply First — Reasonable interviews, values enterprise experience",
    color: "emerald",
    categories: [
      {
        title: "Canadian Banks",
        description: "Stable, always hiring, less LeetCode. Your CRA experience shows you can work in regulated environments.",
        companies: [
          { name: "RBC", why: "Large tech team, React roles, stable", salary: "$110K-$140K", careerPage: "https://jobs.rbc.com" },
          { name: "TD Bank", why: "Big digital transformation, hiring aggressively", salary: "$105K-$135K", careerPage: "https://jobs.td.com" },
          { name: "CIBC", why: "Smaller but good culture, downtown Toronto", salary: "$100K-$130K", careerPage: "https://cibc.wd3.myworkdayjobs.com" },
          { name: "Scotiabank", why: "Global bank, lots of front-end work", salary: "$105K-$135K", careerPage: "https://jobs.scotiabank.com" },
          { name: "BMO", why: "Digital banking push, React/Angular", salary: "$100K-$130K", careerPage: "https://jobs.bmo.com" },
        ],
      },
      {
        title: "Insurance Companies",
        description: "Similar to banks, good pay and benefits.",
        companies: [
          { name: "Manulife", why: "Large tech team, React focus, Global Design System team", salary: "$110K-$140K", careerPage: "https://careers.manulife.com" },
          { name: "Sun Life", why: "Digital transformation, good benefits", salary: "$105K-$135K", careerPage: "https://www.sunlife.com/careers" },
          { name: "Intact Insurance", why: "Growing tech team", salary: "$100K-$130K", careerPage: "https://careers.intactfc.com" },
          { name: "Canada Life", why: "Stable, less competitive", salary: "$95K-$125K", careerPage: "https://www.canadalife.com/careers" },
        ],
      },
      {
        title: "Canadian Scale-Ups",
        description: "Good pay, moderate interview difficulty.",
        companies: [
          { name: "Lightspeed", why: "POS/commerce platform, React heavy", salary: "$115K-$145K", careerPage: "https://www.lightspeedhq.com/careers" },
          { name: "ApplyBoard", why: "EdTech, growing fast", salary: "$110K-$135K", careerPage: "https://www.applyboard.com/careers" },
          { name: "Hootsuite", why: "Social media platform, Vancouver but remote", salary: "$110K-$140K", careerPage: "https://careers.hootsuite.com" },
          { name: "Top Hat", why: "EdTech, Toronto-based", salary: "$105K-$130K", careerPage: "https://tophat.com/careers" },
          { name: "Clio", why: "Legal tech, Vancouver but remote roles", salary: "$115K-$145K", careerPage: "https://www.clio.com/careers" },
          { name: "Clearco", why: "Fintech, e-commerce funding", salary: "$110K-$140K", careerPage: "https://clear.co/careers" },
          { name: "TouchBistro", why: "Restaurant POS, Toronto", salary: "$100K-$130K", careerPage: "https://www.touchbistro.com/careers" },
          { name: "League", why: "Health benefits platform", salary: "$110K-$135K", careerPage: "https://league.com/careers" },
          { name: "Borrowell", why: "Credit/fintech", salary: "$105K-$130K", careerPage: "https://borrowell.com/careers" },
          { name: "Koho", why: "Fintech/banking", salary: "$105K-$130K", careerPage: "https://www.koho.ca/careers" },
        ],
      },
      {
        title: "Telecom/Media",
        description: "You know this industry from Bell.",
        companies: [
          { name: "Rogers", why: "Your direct competitor experience", salary: "$100K-$130K", careerPage: "https://jobs.rogers.com" },
          { name: "TELUS", why: "Big digital team, Vancouver + Toronto", salary: "$105K-$135K", careerPage: "https://www.telus.com/careers" },
          { name: "Corus Entertainment", why: "Media/streaming", salary: "$95K-$120K", careerPage: "https://www.corusent.com/careers" },
          { name: "CBC", why: "Public broadcaster, stable", salary: "$90K-$115K", careerPage: "https://cbc.taleo.net" },
        ],
      },
    ],
  },
  tier2: {
    title: "Tier 2: Higher Pay, Harder Interviews",
    subtitle: "More rigorous technical interviews (some LeetCode required)",
    color: "amber",
    categories: [
      {
        title: "Canadian Tech Leaders",
        companies: [
          { name: "Shopify", why: "Top Canadian tech company", salary: "$130K-$170K", difficulty: "Medium-Hard", careerPage: "https://www.shopify.com/careers" },
          { name: "Wealthsimple", why: "Great culture, React/TypeScript", salary: "$130K-$160K", difficulty: "Medium", careerPage: "https://www.wealthsimple.com/careers" },
          { name: "1Password", why: "Security focus, remote-friendly", salary: "$130K-$160K", difficulty: "Medium", careerPage: "https://1password.com/careers" },
          { name: "Faire", why: "B2B marketplace", salary: "$140K-$170K", difficulty: "Medium-Hard", careerPage: "https://www.faire.com/careers" },
        ],
      },
      {
        title: "Big Tech (Toronto Offices)",
        description: "Only pursue if willing to spend 4-6 weeks on LeetCode prep.",
        companies: [
          { name: "Amazon", why: "AWS, Retail, multiple teams", salary: "$140K-$180K+", difficulty: "Hard", careerPage: "https://www.amazon.jobs" },
          { name: "Google", why: "Large Toronto office", salary: "$150K-$200K+", difficulty: "Hard", careerPage: "https://careers.google.com" },
          { name: "Microsoft", why: "Growing Toronto presence", salary: "$140K-$180K", difficulty: "Medium-Hard", careerPage: "https://careers.microsoft.com" },
          { name: "Meta", why: "Smaller Toronto team", salary: "$150K-$200K+", difficulty: "Hard", careerPage: "https://www.metacareers.com" },
          { name: "Stripe", why: "Payments, some Toronto roles", salary: "$150K-$190K", difficulty: "Hard", careerPage: "https://stripe.com/jobs" },
        ],
      },
    ],
  },
  tier3: {
    title: "Tier 3: Contract/Contract-to-Perm",
    subtitle: "Fastest start — Can begin within 2-3 weeks",
    color: "blue",
    categories: [
      {
        title: "Recruiters & Agencies",
        description: "Contract rates: $60-$85/hour ($125K-$175K annualized). Often faster to start and many convert to permanent.",
        companies: [
          { name: "Robert Half Technology", why: "Enterprise, banks, insurance", salary: "$60-$85/hr", careerPage: "https://www.roberthalf.com/ca/en" },
          { name: "Randstad Digital", why: "Tech contracts", salary: "$60-$85/hr", careerPage: "https://www.randstad.ca" },
          { name: "Hays Technology", why: "IT/Tech staffing", salary: "$60-$85/hr", careerPage: "https://www.hays.ca" },
          { name: "Procom", why: "Canadian tech staffing", salary: "$60-$85/hr", careerPage: "https://www.procom.ca" },
          { name: "S.i. Systems", why: "IT consulting/contracts", salary: "$60-$85/hr", careerPage: "https://www.sisystems.com" },
        ],
      },
    ],
  },
  tier4: {
    title: "Tier 4: Consulting Firms",
    subtitle: "Good for enterprise experience",
    color: "purple",
    categories: [
      {
        title: "Consulting Companies",
        companies: [
          { name: "Publicis Sapient", why: "Digital transformation consulting", salary: "$110K-$140K", careerPage: "https://careers.publicissapient.com" },
          { name: "Deloitte Digital", why: "Big 4 consulting, tech focus", salary: "$100K-$130K", careerPage: "https://www2.deloitte.com/careers" },
          { name: "Accenture", why: "Large tech consulting", salary: "$100K-$130K", careerPage: "https://www.accenture.com/careers" },
          { name: "CGI", why: "Canadian IT services giant", salary: "$95K-$120K", careerPage: "https://www.cgi.com/careers" },
          { name: "Capgemini", why: "Global consulting", salary: "$100K-$125K", careerPage: "https://www.capgemini.com/careers" },
        ],
      },
    ],
  },
};

const jobBoards = [
  { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" },
  { name: "Indeed Canada", url: "https://ca.indeed.com" },
  { name: "Glassdoor", url: "https://www.glassdoor.ca" },
  { name: "Wellfound (startups)", url: "https://wellfound.com" },
  { name: "Built In Toronto", url: "https://builtintoronto.com/jobs" },
];

const searchTerms = [
  "Senior Front End Developer",
  "Senior Frontend Engineer",
  "Senior Front-End Engineer",
  "Senior Software Engineer Frontend",
  "Senior React Developer",
  "Staff Frontend Engineer",
  "Front End Tech Lead",
  "UI Engineer Senior",
];

const TargetCompanies = () => {
  const [activeTier, setActiveTier] = useState<Tier>("tier1");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  const tierColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-700 border-blue-200",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      badge: "bg-purple-100 text-purple-700 border-purple-200",
    },
  };

  const currentTier = tierData[activeTier];
  const colors = tierColors[currentTier.color];

  return (
    <div className="w-full">
      {/* Tier Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(tierData) as Tier[]).map((tier) => {
          const tierInfo = tierData[tier];
          const isActive = activeTier === tier;
          const tierColor = tierColors[tierInfo.color];
          
          return (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              onKeyDown={(e) => handleKeyDown(e, () => setActiveTier(tier))}
              aria-label={`View ${tierInfo.title}`}
              aria-selected={isActive}
              tabIndex={0}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${isActive
                          ? `${tierColor.bg} ${tierColor.text} ${tierColor.border} border-2`
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent"
                        }`}
            >
              {tier.replace("tier", "Tier ")}
            </button>
          );
        })}
      </div>

      {/* Tier Header */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 mb-6`}>
        <h2 className={`text-xl font-bold ${colors.text} mb-1`}>
          {currentTier.title}
        </h2>
        <p className="text-slate-600">{currentTier.subtitle}</p>
      </div>

      {/* Categories */}
      <div className="space-y-4 mb-8">
        {currentTier.categories.map((category, idx) => {
          const isExpanded = expandedCategory === `${activeTier}-${idx}`;
          
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : `${activeTier}-${idx}`)}
                onKeyDown={(e) => handleKeyDown(e, () => setExpandedCategory(isExpanded ? null : `${activeTier}-${idx}`))}
                aria-expanded={isExpanded}
                aria-label={`Toggle ${category.title}`}
                tabIndex={0}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-slate-800">{category.title}</h3>
                  {category.description && (
                    <p className="text-sm text-slate-500 mt-1">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge} border`}>
                    {category.companies.length} companies
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-4 border-t border-slate-100">
                  <div className="grid gap-3 mt-4">
                    {category.companies.map((company, companyIdx) => (
                      <div
                        key={companyIdx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-slate-800">{company.name}</h4>
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              {company.salary}
                            </span>
                            {company.difficulty && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                                {company.difficulty}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{company.why}</p>
                        </div>
                        <a
                          href={company.careerPage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white
                                   bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg
                                   hover:from-slate-800 hover:to-slate-900
                                   focus:outline-none focus:ring-4 focus:ring-slate-300
                                   transition-all duration-200 whitespace-nowrap"
                          aria-label={`Visit ${company.name} careers page`}
                        >
                          Careers
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Links Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Job Boards */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </span>
            Job Boards
          </h3>
          <div className="flex flex-wrap gap-2">
            {jobBoards.map((board, idx) => (
              <a
                key={idx}
                href={board.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg
                         hover:bg-indigo-100 transition-colors border border-indigo-200"
                aria-label={`Visit ${board.name}`}
              >
                {board.name}
              </a>
            ))}
          </div>
        </div>

        {/* Search Terms */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            Search Terms
          </h3>
          <div className="flex flex-wrap gap-2">
            {searchTerms.map((term, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 text-sm bg-rose-50 text-rose-700 rounded-lg border border-rose-200"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Strategy */}
      <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </span>
          Week 1 Goal: 50 Applications
        </h3>
        <div className="grid sm:grid-cols-5 gap-3">
          {[
            { day: "Day 1", target: "10 apps", focus: "All 5 banks (2 roles each)" },
            { day: "Day 2", target: "10 apps", focus: "Insurance + Telecom" },
            { day: "Day 3", target: "10 apps", focus: "Scale-ups (Tier 1)" },
            { day: "Day 4", target: "10 apps", focus: "Consulting + more scale-ups" },
            { day: "Day 5", target: "10 apps", focus: "Contracts via agencies" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/80 rounded-lg p-3 border border-amber-200">
              <p className="font-semibold text-amber-800 text-sm">{item.day}</p>
              <p className="text-xs text-slate-600 mt-1">{item.target}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.focus}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-600 mt-4">
          <strong>Remember:</strong> One referral = 20 cold applications in terms of response rate. Check your network!
        </p>
      </div>
    </div>
  );
};

export default TargetCompanies;

