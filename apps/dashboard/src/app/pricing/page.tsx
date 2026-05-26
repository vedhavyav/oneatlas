'use client';

export const runtime = 'edge';

import React, { useState } from 'react';
import { GlassCard, ModernButton, DynamicIcon } from '@oneatlas/ui';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  credits: string;
  models: string;
  projects: string;
  domains: string;
  infra: string;
  db: string;
  collab: string;
  priority: string;
  analytics: string;
  branding: string;
  support: string;
  useCase: string;
  cta: string;
  highlighted?: boolean;
}

const TIERS: PricingTier[] = [
  {
    name: 'Explorer',
    price: 'Free',
    description: 'Learning & experimentation',
    credits: '30 monthly credits',
    models: 'Core models',
    projects: 'Unlimited public apps',
    domains: '—',
    infra: 'Shared infrastructure',
    db: 'Basic',
    collab: '—',
    priority: 'Standard',
    analytics: 'Basic usage metrics',
    branding: 'OneAtlas branding',
    support: 'Community support',
    useCase: 'Explore the platform',
    cta: 'Start Free'
  },
  {
    name: 'Builder',
    price: '$29/mo',
    description: 'Indie builders & MVPs',
    credits: '200 monthly credits',
    models: 'Advanced reasoning models',
    projects: 'Public + private apps',
    domains: '1 custom domain',
    infra: 'Managed backend & database',
    db: 'Included',
    collab: '—',
    priority: 'Faster builds',
    analytics: 'Project analytics',
    branding: 'Reduced branding',
    support: 'Email support',
    useCase: 'Launch production-ready apps',
    cta: 'Build Faster'
  },
  {
    name: 'Studio',
    price: '$79/mo',
    description: 'Startups & fast-moving teams',
    credits: '800 monthly credits',
    models: 'Premium frontier models',
    projects: 'Unlimited apps',
    domains: 'Multi-domain support',
    infra: 'Production-grade infrastructure',
    db: 'Advanced configuration',
    collab: 'Shared workspaces',
    priority: 'Priority builds',
    analytics: 'Advanced observability',
    branding: 'Remove branding',
    support: 'Priority support',
    useCase: 'Scale products & teams',
    cta: 'Upgrade to Studio',
    highlighted: true
  },
  {
    name: 'Scale',
    price: '$199/mo',
    description: 'AI-native companies at scale',
    credits: '2,500 monthly credits',
    models: 'Priority access + fastest inference',
    projects: 'Unlimited apps',
    domains: 'Advanced domain controls',
    infra: 'High-performance dedicated resources',
    db: 'Enterprise-grade controls',
    collab: 'Granular permissions & org controls',
    priority: 'Dedicated compute priority',
    analytics: 'Full platform insights',
    branding: 'White-label experience',
    support: 'Dedicated success channel',
    useCase: 'Operate mission-critical AI systems',
    cta: 'Contact Sales'
  }
];

interface ComparisonFeature {
  name: string;
  explorer: string;
  builder: string;
  studio: string;
  scale: string;
}

interface ComparisonCategory {
  category: string;
  features: ComparisonFeature[];
}

const COMPARISON_MATRIX: ComparisonCategory[] = [
  {
    category: 'Plan Overview',
    features: [
      {
        name: 'Best For',
        explorer: 'Learning & experimentation',
        builder: 'Indie builders & MVPs',
        studio: 'Startups & fast-moving teams',
        scale: 'AI-native companies at scale'
      },
      {
        name: 'Pricing',
        explorer: 'Free',
        builder: '$29/mo',
        studio: '$79/mo',
        scale: '$199/mo'
      },
      {
        name: 'Ideal Use Case',
        explorer: 'Explore the platform',
        builder: 'Launch production-ready apps',
        studio: 'Scale products & teams',
        scale: 'Operate mission-critical AI systems'
      }
    ]
  },
  {
    category: 'AI & Compute',
    features: [
      {
        name: 'AI Usage Capacity',
        explorer: '30 monthly credits',
        builder: '200 monthly credits',
        studio: '800 monthly credits',
        scale: '2,500 monthly credits'
      },
      {
        name: 'AI Model Access',
        explorer: 'Core models',
        builder: 'Advanced reasoning models',
        studio: 'Premium frontier models',
        scale: 'Priority access + fastest inference'
      },
      {
        name: 'Build Queue Priority',
        explorer: 'Standard',
        builder: 'Faster builds',
        studio: 'Priority builds',
        scale: 'Dedicated compute priority'
      }
    ]
  },
  {
    category: 'Projects & Hosting',
    features: [
      {
        name: 'Projects',
        explorer: 'Unlimited public apps',
        builder: 'Public + private apps',
        studio: 'Unlimited apps',
        scale: 'Unlimited apps'
      },
      {
        name: 'Custom Domains',
        explorer: '—',
        builder: '1 custom domain',
        studio: 'Multi-domain support',
        scale: 'Advanced domain controls'
      },
      {
        name: 'Backend Infrastructure',
        explorer: 'Shared infrastructure',
        builder: 'Managed backend & database',
        studio: 'Production-grade infrastructure',
        scale: 'High-performance dedicated resources'
      }
    ]
  },
  {
    category: 'Data & Security',
    features: [
      {
        name: 'Authentication & Database',
        explorer: 'Basic',
        builder: 'Included',
        studio: 'Advanced configuration',
        scale: 'Enterprise-grade controls'
      },
      {
        name: 'GitHub Integration',
        explorer: '—',
        builder: 'Included',
        studio: 'Included',
        scale: 'Included'
      }
    ]
  },
  {
    category: 'Collaboration & API',
    features: [
      {
        name: 'Team Collaboration',
        explorer: '—',
        builder: '—',
        studio: 'Shared workspaces',
        scale: 'Granular permissions & org controls'
      },
      {
        name: 'API & Automation Access',
        explorer: '—',
        builder: 'Basic API access',
        studio: 'Advanced workflows & API',
        scale: 'Expanded enterprise APIs'
      }
    ]
  },
  {
    category: 'Analytics & Operations',
    features: [
      {
        name: 'Analytics & Monitoring',
        explorer: 'Basic usage metrics',
        builder: 'Project analytics',
        studio: 'Advanced observability',
        scale: 'Full platform insights'
      },
      {
        name: 'Branding Control',
        explorer: 'OneAtlas branding',
        builder: 'Reduced branding',
        studio: 'Remove branding',
        scale: 'White-label experience'
      },
      {
        name: 'Support',
        explorer: 'Community support',
        builder: 'Email support',
        studio: 'Priority support',
        scale: 'Dedicated success channel'
      },
      {
        name: 'Early Access Features',
        explorer: '—',
        builder: '—',
        studio: 'Included',
        scale: 'Included'
      }
    ]
  }
];

const WHY_ATLAS_ITEMS = [
  {
    feature: 'Ease of Use',
    atlas: 'No technical background needed',
    others: 'Headache for non-coders'
  },
  {
    feature: 'What You Can Build',
    atlas: 'Fully-featured apps',
    others: 'Basic apps only'
  },
  {
    feature: 'All-in-one Platform',
    atlas: 'Everything built-in',
    others: 'Requires external services'
  },
  {
    feature: 'SEO',
    atlas: 'Built-in SEO tools',
    others: 'Not supported'
  },
  {
    feature: 'Human Support',
    atlas: 'Live chat & calls',
    others: 'Little to no support'
  },
  {
    feature: 'Error Correction',
    atlas: 'Smart & automatic',
    others: 'Gets stuck often'
  },
  {
    feature: 'Hosting',
    atlas: 'Scales with you',
    others: 'Limited'
  }
];

const FAQS = [
  {
    category: 'Billing & Limits',
    question: 'What counts as AI usage?',
    answer: 'AI usage includes app generation, editing, workflows, automations, AI actions, and model inference requests across the platform.'
  },
  {
    category: 'Features',
    question: 'Can I deploy real production applications?',
    answer: 'Yes. OneAtlas includes hosting, deployments, authentication, databases, and infrastructure management out of the box.'
  },
  {
    category: 'General',
    question: 'Which AI models does OneAtlas support?',
    answer: 'OneAtlas supports leading AI providers and models, including OpenAI, Anthropic, Gemini, DeepSeek, and selected open-source models.'
  },
  {
    category: 'Billing & Limits',
    question: 'What happens if I reach my plan limit?',
    answer: 'You can purchase additional usage capacity or upgrade instantly without affecting existing projects.'
  },
  {
    category: 'Features',
    question: 'Can I collaborate with my team?',
    answer: 'Yes. Team workspaces, permissions, shared environments, and collaboration features are available on Studio plans and above.'
  },
  {
    category: 'Features',
    question: 'Is hosting included in every plan?',
    answer: 'Yes. Hosting, SSL, deployment infrastructure, and scaling are built into the platform.'
  },
  {
    category: 'Features',
    question: 'Can I connect external APIs and databases?',
    answer: 'Absolutely. OneAtlas supports APIs, databases, webhooks, third-party services, and external integrations.'
  },
  {
    category: 'Enterprise',
    question: 'Do you support private deployments?',
    answer: 'Enterprise customers can deploy within isolated environments, dedicated infrastructure, or private cloud configurations.'
  },
  {
    category: 'General',
    question: 'Who owns the generated apps and code?',
    answer: 'You do. Your applications, data, workflows, and exported code remain fully yours.'
  },
  {
    category: 'General',
    question: 'Do you offer startup or student programs?',
    answer: 'Yes. OneAtlas supports startups, universities, hackathons, and developer communities through special access programs.'
  }
];

export default function PricingPage() {
  const [activeFaqCategory, setActiveFaqCategory] = useState('All');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const categories = ['All', 'General', 'Features', 'Billing & Limits', 'Enterprise'];
  
  const filteredFaqs = activeFaqCategory === 'All' 
    ? FAQS 
    : FAQS.filter(f => f.category === activeFaqCategory);

  const scrollToComparison = () => {
    const el = document.getElementById('comparison-matrix');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAction = (tierName: string) => {
    alert(`Redirecting to payment workflow for ${tierName}...`);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col transition-subtle">
      {/* Top Navbar */}
      <header className="h-[72px] border-b border-border-color bg-bg-primary/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50 transition-subtle">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent-primary flex items-center justify-center shadow-subtle">
            <span className="font-extrabold text-white text-base">O</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-text-primary">
            OneAtlas<span className="text-accent-primary">.dev</span>
          </span>
        </div>

        {/* Navigation items matching style system menu spec */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="/" className="text-[15px] font-medium text-text-secondary hover:text-text-primary transition-subtle">Dashboard</a>
          <a href="/pricing" className="text-[15px] font-medium text-text-primary transition-subtle border-b-2 border-accent-primary pb-0.5">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold select-none transition-subtle shadow-subtle">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-16 flex flex-col gap-20">
        
        {/* Hero Section */}
        <section className="text-center py-4 flex flex-col items-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-text-primary md:text-6xl max-w-3xl">
            Clean, predictable pricing for <span className="text-accent-primary">builders</span>.
          </h1>
          <p className="text-text-secondary text-lg mt-4 max-w-2xl mx-auto font-medium">
            From side projects to mission-critical operational tools. Build serverless, AI-powered applications with Zero DevOps.
          </p>
          <button 
            onClick={scrollToComparison}
            className="mt-6 flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:text-accent-hover transition-subtle group"
          >
            <span>Compare all plan features</span>
            <DynamicIcon name="ArrowDown" size={13} className="group-hover:translate-y-0.5 transition-subtle" />
          </button>
        </section>

        {/* Pricing Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TIERS.map((tier) => (
            <div 
              key={tier.name} 
              className={`rounded-2xl bg-bg-secondary p-7 shadow-subtle flex flex-col justify-between transition-subtle ${
                tier.highlighted 
                  ? 'border-2 border-accent-primary scale-[1.02]' 
                  : 'border border-border-color hover:border-text-muted'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-text-primary">{tier.name}</h3>
                    <p className="text-xs text-text-secondary mt-1">{tier.description}</p>
                  </div>
                  {tier.highlighted && (
                    <span className="px-2 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20 text-[9px] text-accent-primary font-bold uppercase tracking-wider shadow-subtle">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="mt-6 border-b border-border-color pb-6">
                  <span className="text-4xl font-extrabold text-text-primary">{tier.price}</span>
                </div>

                {/* Key Features List */}
                <ul className="mt-6 flex flex-col gap-3.5 text-xs text-text-secondary font-medium">
                  <li className="flex items-center gap-2">
                    <DynamicIcon name="Sparkles" size={13} className="text-accent-primary shrink-0" />
                    <span>{tier.credits}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DynamicIcon name="Cpu" size={13} className="text-text-muted shrink-0" />
                    <span>{tier.models}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DynamicIcon name="Layers" size={13} className="text-text-muted shrink-0" />
                    <span>{tier.projects}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DynamicIcon name="Link" size={13} className="text-text-muted shrink-0" />
                    <span>{tier.domains}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <DynamicIcon name="Database" size={13} className="text-text-muted shrink-0" />
                    <span className="truncate">{tier.infra}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 border-t border-border-color pt-6 flex flex-col gap-3">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block text-center">
                  Ideal for: {tier.name === 'Explorer' ? 'Learning' : tier.name === 'Builder' ? 'MVPs' : tier.name === 'Studio' ? 'Teams' : 'Scale'}
                </span>
                
                <ModernButton 
                  variant={tier.highlighted ? 'primary' : 'secondary'} 
                  className="w-full text-xs font-semibold h-11"
                  onClick={() => handleAction(tier.name)}
                >
                  {tier.cta}
                </ModernButton>
              </div>
            </div>
          ))}
        </section>

        {/* Enterprise Banner Section */}
        <section className="rounded-2xl border border-border-color bg-bg-secondary p-8 shadow-subtle flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20 text-[9px] text-accent-primary font-bold uppercase tracking-wider shadow-subtle">
                Enterprise
              </span>
              <span className="text-[11px] text-text-secondary font-semibold">Infrastructure, governance, and security for modern organizations.</span>
            </div>
            <h2 className="text-2xl font-extrabold text-text-primary mt-3">Enterprise Capabilities</h2>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4.5 gap-x-8 mt-6">
              {[
                { title: 'Deployment Options', desc: 'Dedicated cloud, VPC, or on-prem deployment', icon: 'Cloud' },
                { title: 'Identity & Access', desc: 'SSO, SAML, SCIM provisioning', icon: 'UserCheck' },
                { title: 'Security Controls', desc: 'Audit logs, advanced governance, policy management', icon: 'Shield' },
                { title: 'Compliance Support', desc: 'SOC2-ready operational workflows', icon: 'CheckSquare' },
                { title: 'AI Infrastructure', desc: 'Custom model routing & private integrations', icon: 'Cpu' },
                { title: 'Team Management', desc: 'Advanced environments & permission systems', icon: 'Users' },
                { title: 'Reliability', desc: 'SLA-backed uptime guarantees', icon: 'Activity' },
                { title: 'Regional Deployment', desc: 'Multi-region infrastructure controls', icon: 'Globe' },
                { title: 'Support', desc: 'Dedicated onboarding & solutions engineering', icon: 'LifeBuoy' },
              ].map((item) => (
                <div key={item.title} className="flex gap-2.5 text-xs">
                  <div className="text-accent-primary shrink-0 mt-0.5">
                    <DynamicIcon name={item.icon} size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{item.title}</h4>
                    <p className="text-text-secondary text-[11px] mt-0.5 leading-normal font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-stretch lg:items-end justify-center gap-3 border-t lg:border-t-0 lg:border-l border-border-color pt-6 lg:pt-0 lg:pl-8 w-full lg:w-auto">
            <div className="text-left lg:text-right">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Pricing</span>
              <h3 className="text-2xl font-extrabold text-text-primary mt-0.5">Custom engagement</h3>
              <span className="text-[11px] text-text-secondary font-medium block mt-1">Best For: Enterprises & regulated operations</span>
            </div>
            <ModernButton 
              variant="primary" 
              className="text-xs font-semibold px-6 h-11"
              onClick={() => alert("Connecting you with the OneAtlas Enterprise team...")}
            >
              Speak with OneAtlas
            </ModernButton>
          </div>
        </section>

        {/* Why Atlas Comparison Section */}
        <section className="mt-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Why Atlas?
            </h2>
            <p className="text-xs text-text-secondary font-medium mt-2">
              See how Atlas stacks up against other AI app builders across the features that matter most.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border-color bg-bg-secondary shadow-subtle">
            <table className="w-full border-collapse text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-border-color bg-bg-primary/30 text-xs">
                  <th className="py-5 px-6 font-bold text-text-primary w-2/5">Feature</th>
                  <th className="py-5 px-6 font-bold text-accent-primary text-center w-1.5/5">Atlas</th>
                  <th className="py-5 px-6 font-bold text-text-secondary text-center w-1.5/5">Others</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color text-xs font-medium text-text-secondary">
                {WHY_ATLAS_ITEMS.map((item, index) => (
                  <tr key={index} className="hover:bg-bg-primary/10 transition-subtle">
                    <td className="py-4.5 px-6 font-bold text-text-primary">{item.feature}</td>
                    
                    {/* Atlas Score */}
                    <td className="py-4.5 px-6 text-center bg-accent-primary/[0.01]">
                      <span className="inline-flex items-center gap-1.5 text-accent-primary font-bold">
                        <DynamicIcon name="Check" size={14} className="shrink-0" />
                        {item.atlas}
                      </span>
                    </td>

                    {/* Others Score */}
                    <td className="py-4.5 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 text-text-muted font-normal">
                        <DynamicIcon name="X" size={14} className="shrink-0" />
                        {item.others}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        <section id="comparison-matrix" className="mt-8 pt-4 scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Compare plan details
            </h2>
            <p className="text-xs text-text-secondary font-medium mt-2">
              Every detail mapped side-by-side to help you choose.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border-color bg-bg-secondary shadow-subtle">
            <table className="w-full border-collapse text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-border-color bg-bg-primary/30">
                  <th className="py-5 px-6 text-sm font-bold text-text-primary w-1/5">Features</th>
                  <th className="py-5 px-6 text-sm font-bold text-text-primary text-center w-1/5">Explorer</th>
                  <th className="py-5 px-6 text-sm font-bold text-text-primary text-center w-1/5">Builder</th>
                  <th className="py-5 px-6 text-sm font-bold text-text-primary text-center w-1/5 bg-accent-primary/[0.02] border-x border-accent-primary/10 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-accent-primary text-[8px] text-white font-extrabold uppercase tracking-wider shadow-subtle">
                      Recommended
                    </div>
                    Studio
                  </th>
                  <th className="py-5 px-6 text-sm font-bold text-text-primary text-center w-1/5">Scale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color text-xs font-medium text-text-secondary">
                {COMPARISON_MATRIX.map((categoryGroup, catIdx) => (
                  <React.Fragment key={catIdx}>
                    {/* Category Header Row */}
                    <tr className="bg-bg-primary/20 border-y border-border-color">
                      <td colSpan={5} className="py-3.5 px-6 font-bold uppercase tracking-wider text-[10px] text-text-primary">
                        {categoryGroup.category}
                      </td>
                    </tr>
                    {categoryGroup.features.map((feature, featIdx) => {
                      const isPricingRow = feature.name === 'Pricing';
                      return (
                        <tr key={featIdx} className="hover:bg-bg-primary/10 transition-subtle">
                          <td className="py-4.5 px-6 font-semibold text-text-primary">{feature.name}</td>
                          
                          {/* Explorer Column */}
                          <td className="py-4.5 px-6 text-center">
                            {feature.explorer === '—' ? (
                              <span className="text-text-muted font-normal">—</span>
                            ) : (
                              <span className={isPricingRow ? "text-sm font-extrabold text-text-primary" : ""}>
                                {feature.explorer}
                              </span>
                            )}
                          </td>

                          {/* Builder Column */}
                          <td className="py-4.5 px-6 text-center">
                            {feature.builder === '—' ? (
                              <span className="text-text-muted font-normal">—</span>
                            ) : feature.builder === 'Included' ? (
                              <span className="inline-flex items-center gap-1 text-accent-primary font-bold">
                                <DynamicIcon name="Check" size={13} className="shrink-0" />
                                Included
                              </span>
                            ) : (
                              <span className={isPricingRow ? "text-sm font-extrabold text-text-primary" : ""}>
                                {feature.builder}
                              </span>
                            )}
                          </td>

                          {/* Studio Column (Highlighted) */}
                          <td className="py-4.5 px-6 text-center bg-accent-primary/[0.01] border-x border-accent-primary/5">
                            {feature.studio === '—' ? (
                              <span className="text-text-muted font-normal">—</span>
                            ) : feature.studio === 'Included' ? (
                              <span className="inline-flex items-center gap-1 text-accent-primary font-extrabold">
                                <DynamicIcon name="Check" size={13} className="shrink-0" />
                                Included
                              </span>
                            ) : (
                              <span className={isPricingRow ? "text-sm font-extrabold text-accent-primary" : "text-text-primary font-semibold"}>
                                {feature.studio}
                              </span>
                            )}
                          </td>

                          {/* Scale Column */}
                          <td className="py-4.5 px-6 text-center">
                            {feature.scale === '—' ? (
                              <span className="text-text-muted font-normal">—</span>
                            ) : feature.scale === 'Included' ? (
                              <span className="inline-flex items-center gap-1 text-text-primary font-bold">
                                <DynamicIcon name="Check" size={13} className="shrink-0" />
                                Included
                              </span>
                            ) : (
                              <span className={isPricingRow ? "text-sm font-extrabold text-text-primary" : ""}>
                                {feature.scale}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}

                {/* Final Row with CTA Buttons */}
                <tr className="bg-bg-primary/5 border-t border-border-color">
                  <td className="py-6 px-6 font-bold text-text-primary">Ready to get started?</td>
                  
                  {/* Explorer CTA */}
                  <td className="py-6 px-6 text-center">
                    <button
                      onClick={() => handleAction('Explorer')}
                      className="px-4 py-2 rounded-lg bg-bg-secondary hover:bg-bg-primary/30 text-text-primary border border-border-color text-xs font-bold transition-subtle shadow-subtle hover:-translate-y-[1px]"
                    >
                      Start Free
                    </button>
                  </td>

                  {/* Builder CTA */}
                  <td className="py-6 px-6 text-center">
                    <button
                      onClick={() => handleAction('Builder')}
                      className="px-4 py-2 rounded-lg bg-bg-secondary hover:bg-[#FAFAFA] text-text-primary border border-border-color text-xs font-bold transition-subtle shadow-subtle hover:-translate-y-[1px]"
                    >
                      Build Faster
                    </button>
                  </td>

                  {/* Studio CTA */}
                  <td className="py-6 px-6 text-center bg-accent-primary/[0.01] border-x border-accent-primary/5">
                    <button
                      onClick={() => handleAction('Studio')}
                      className="px-5 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-extrabold transition-subtle shadow-subtle hover:-translate-y-[1px]"
                    >
                      Upgrade to Studio
                    </button>
                  </td>

                  {/* Scale CTA */}
                  <td className="py-6 px-6 text-center">
                    <button
                      onClick={() => handleAction('Scale')}
                      className="px-4 py-2 rounded-lg bg-text-primary hover:bg-black text-white text-xs font-bold transition-subtle shadow-subtle hover:-translate-y-[1px]"
                    >
                      Contact Sales
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Accordion FAQ Section */}
        <section className="mt-8 border-t border-border-color pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Category Selection */}
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Frequently Asked Questions</h2>
              <p className="text-xs text-text-secondary font-medium mt-2">Find quick answers to billing, custom domains, and database execution questions.</p>
              
              <div className="flex flex-col gap-2 mt-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveFaqCategory(cat);
                      setExpandedFaqIndex(null);
                    }}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition-subtle border ${
                      activeFaqCategory === cat
                        ? 'bg-bg-secondary text-text-primary border-border-color shadow-subtle'
                        : 'text-text-secondary hover:text-text-primary border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Accordion List */}
            <div className="lg:col-span-2 divide-y divide-border-color">
              {filteredFaqs.map((faq, index) => {
                const isExpanded = expandedFaqIndex === index;
                return (
                  <div key={index} className="py-5 flex flex-col gap-3">
                    <div 
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-primary transition-subtle">
                        {faq.question}
                      </h4>
                      <DynamicIcon 
                        name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
                        size={16} 
                        className="text-text-secondary group-hover:text-text-primary transition-subtle" 
                      />
                    </div>
                    
                    {isExpanded && (
                      <p className="text-xs text-text-secondary leading-relaxed font-medium transition-subtle">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border-color py-8 text-center text-xs text-text-muted font-medium bg-bg-secondary">
        &copy; {new Date().getFullYear()} OneAtlas.dev • All rights reserved
      </footer>
    </div>
  );
}
