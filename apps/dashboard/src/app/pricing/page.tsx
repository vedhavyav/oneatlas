'use client';

export const runtime = 'edge';

import React, { useState } from 'react';
import { GlassCard, ModernButton, DynamicIcon } from '@oneatlas/ui';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
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
    monthlyPrice: 0,
    annualPrice: 0,
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
    monthlyPrice: 29,
    annualPrice: 23, // ~20% off
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
    monthlyPrice: 79,
    annualPrice: 63, // ~20% off
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
    monthlyPrice: 199,
    annualPrice: 159, // ~20% off
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
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeFaqCategory, setActiveFaqCategory] = useState('All');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  
  // Interactive Slider Calculator State
  const [sliderCredits, setSliderCredits] = useState(350);

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
    alert(`Redirecting to payment workflow for ${tierName} (${isAnnual ? 'Annual' : 'Monthly'} plan)...`);
  };

  // Determine dynamic calculator recommendations
  const getSliderRecommendation = (credits: number) => {
    if (credits <= 30) {
      return {
        plan: 'Explorer',
        cost: 0,
        desc: 'Ideal for basic testing & experimenting with AI capabilities.',
        badgeColor: 'bg-text-secondary/10 border-border-color text-text-secondary'
      };
    } else if (credits <= 200) {
      return {
        plan: 'Builder',
        cost: isAnnual ? 23 : 29,
        desc: 'Perfect for solo developers creating proof-of-concepts & active MVPs.',
        badgeColor: 'bg-accent-primary/5 border-accent-primary/20 text-text-primary'
      };
    } else if (credits <= 800) {
      return {
        plan: 'Studio',
        cost: isAnnual ? 63 : 79,
        desc: 'Highly recommended. Designed for fast-moving startup teams needing premium frontier models & collaboration.',
        badgeColor: 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary font-bold'
      };
    } else {
      return {
        plan: 'Scale',
        cost: isAnnual ? 159 : 199,
        desc: 'Built for enterprise execution priority, advanced analytics, and custom integrations.',
        badgeColor: 'bg-black text-white'
      };
    }
  };

  const recommendation = getSliderRecommendation(sliderCredits);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col transition-subtle selection:bg-accent-primary/20">
      {/* Top Navbar */}
      <header className="h-[72px] border-b border-border-color bg-bg-primary/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50 transition-subtle">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent-primary flex items-center justify-center shadow-subtle hover:scale-105 transition-subtle">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-16 flex flex-col gap-24">
        
        {/* Hero Section */}
        <section className="text-center py-4 flex flex-col items-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-text-primary md:text-6xl max-w-3xl leading-none">
            Clean, predictable pricing for <span className="text-accent-primary">builders</span>.
          </h1>
          <p className="text-text-secondary text-lg mt-6 max-w-2xl mx-auto font-medium leading-relaxed">
            From side projects to mission-critical operational tools. Build serverless, AI-powered applications with Zero DevOps.
          </p>

          {/* Interactive Billing Toggle */}
          <div className="mt-10 flex items-center gap-4 bg-bg-secondary p-1.5 rounded-2xl border border-border-color shadow-subtle">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                !isAnnual
                  ? 'bg-bg-primary text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Billed Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                isAnnual
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>Billed Annually</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                isAnnual ? 'bg-white text-accent-primary' : 'bg-accent-primary/10 text-accent-primary'
              }`}>
                Save 20%
              </span>
            </button>
          </div>

          <button 
            onClick={scrollToComparison}
            className="mt-8 flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:text-accent-hover transition-subtle group"
          >
            <span>Compare all plan features</span>
            <DynamicIcon name="ArrowDown" size={13} className="group-hover:translate-y-0.5 transition-subtle" />
          </button>
        </section>

        {/* Pricing Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TIERS.map((tier) => {
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            const hasDiscount = isAnnual && tier.monthlyPrice > 0;
            return (
              <div 
                key={tier.name} 
                className={`rounded-3xl bg-bg-secondary p-8 shadow-subtle flex flex-col justify-between border transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.04)] ${
                  tier.highlighted 
                    ? 'border-accent-primary scale-[1.02] ring-4 ring-accent-primary/5' 
                    : 'border-border-color hover:border-accent-primary/30'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-extrabold text-text-primary tracking-tight">{tier.name}</h3>
                      <p className="text-xs text-text-secondary font-medium mt-1">{tier.description}</p>
                    </div>
                    {tier.highlighted && (
                      <span className="px-2.5 py-0.5 rounded bg-accent-primary/15 border border-accent-primary/20 text-[9px] text-accent-primary font-bold uppercase tracking-wider shadow-subtle">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="mt-8 border-b border-border-color pb-6 flex flex-col gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-text-primary tracking-tight">
                        {price === 0 ? 'Free' : `$${price}`}
                      </span>
                      {price > 0 && (
                        <span className="text-xs text-text-secondary font-bold">
                          /mo
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <span className="text-[11px] text-accent-primary font-bold">
                        Billed annually (save 20%)
                      </span>
                    )}
                    {!hasDiscount && price > 0 && (
                      <span className="text-[11px] text-text-muted font-bold">
                        Billed month-to-month
                      </span>
                    )}
                    {price === 0 && (
                      <span className="text-[11px] text-text-muted font-bold">
                        No credit card required
                      </span>
                    )}
                  </div>

                  {/* Key Features List */}
                  <ul className="mt-6 flex flex-col gap-4 text-xs text-text-secondary font-medium">
                    <li className="flex items-center gap-2.5">
                      <DynamicIcon name="Sparkles" size={13} className="text-accent-primary shrink-0" />
                      <span>{tier.credits}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <DynamicIcon name="Cpu" size={13} className="text-text-muted shrink-0" />
                      <span>{tier.models}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <DynamicIcon name="Layers" size={13} className="text-text-muted shrink-0" />
                      <span>{tier.projects}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <DynamicIcon name="Link" size={13} className="text-text-muted shrink-0" />
                      <span>{tier.domains}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
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
                    className="w-full text-xs font-semibold h-11 active:scale-[0.98] transition-all"
                    onClick={() => handleAction(tier.name)}
                  >
                    {tier.cta}
                  </ModernButton>
                </div>
              </div>
            );
          })}
        </section>

        {/* Enterprise Banner Section */}
        <section className="rounded-3xl border border-border-color bg-bg-secondary p-8 shadow-subtle flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 transition-all hover:border-accent-primary/20">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20 text-[9px] text-accent-primary font-bold uppercase tracking-wider shadow-subtle">
                Enterprise
              </span>
              <span className="text-[11px] text-text-secondary font-semibold tracking-wide">Governance and security for modern organizations.</span>
            </div>
            <h2 className="text-2xl font-extrabold text-text-primary mt-3 tracking-tight">Enterprise Capabilities</h2>
            
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
                    <h4 className="font-bold text-text-primary tracking-tight">{item.title}</h4>
                    <p className="text-text-secondary text-[11px] mt-0.5 leading-normal font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-stretch lg:items-end justify-center gap-3 border-t lg:border-t-0 lg:border-l border-border-color pt-6 lg:pt-0 lg:pl-8 w-full lg:w-auto">
            <div className="text-left lg:text-right">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Pricing</span>
              <h3 className="text-2xl font-extrabold text-text-primary mt-0.5 tracking-tight">Custom engagement</h3>
              <span className="text-[11px] text-text-secondary font-medium block mt-1">Best For: Enterprises & regulated operations</span>
            </div>
            <ModernButton 
              variant="primary" 
              className="text-xs font-semibold px-6 h-11 active:scale-[0.98]"
              onClick={() => alert("Connecting you with the OneAtlas Enterprise team...")}
            >
              Speak with OneAtlas
            </ModernButton>
          </div>
        </section>

        {/* Dynamic AI Usage Plan Calculator Slider */}
        <section className="bg-bg-secondary border border-border-color rounded-3xl p-8 max-w-3xl mx-auto w-full shadow-subtle transition-all hover:border-accent-primary/20">
          <div className="text-center mb-8">
            <span className="px-2 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20 text-[9px] text-accent-primary font-bold uppercase tracking-wider shadow-subtle">
              Usage Estimator
            </span>
            <h3 className="text-2xl font-extrabold text-text-primary mt-2.5 tracking-tight">
              Estimate your AI workspace requirements
            </h3>
            <p className="text-xs text-text-secondary font-medium mt-1">
              Slide to view our recommended plan based on your estimated monthly credit consumption.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {/* Slider control */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-text-secondary">Expected Monthly Credits</span>
                <span className="text-xl font-extrabold text-accent-primary">
                  {sliderCredits === 2500 ? '2,500+' : sliderCredits} credits
                </span>
              </div>
              
              <input
                type="range"
                min="10"
                max="2500"
                step="10"
                value={sliderCredits}
                onChange={(e) => setSliderCredits(Number(e.target.value))}
                className="w-full h-2 bg-bg-primary rounded-lg appearance-none cursor-pointer accent-accent-primary"
              />
              
              <div className="flex justify-between text-[10px] text-text-muted font-bold mt-1">
                <span>10 credits</span>
                <span>200 credits</span>
                <span>800 credits</span>
                <span>2,500+ credits</span>
              </div>
            </div>

            {/* Recommendation Result Display */}
            <div className="p-5 rounded-2xl bg-bg-primary/50 border border-border-color flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Recommended Plan</span>
                <div className="flex items-center gap-2 mt-1">
                  <h4 className="text-xl font-extrabold text-text-primary tracking-tight">
                    OneAtlas {recommendation.plan}
                  </h4>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border uppercase tracking-wider shadow-subtle ${recommendation.badgeColor}`}>
                    {recommendation.plan === 'Studio' ? 'Best Choice' : 'Matches Need'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary font-medium mt-2 leading-relaxed">
                  {recommendation.desc}
                </p>
              </div>
              <div className="shrink-0 text-left md:text-right border-t md:border-t-0 md:border-l border-border-color pt-4 md:pt-0 md:pl-5 w-full md:w-auto flex flex-col md:items-end justify-center">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Estimated Cost</span>
                <h4 className="text-2xl font-extrabold text-text-primary mt-1 tracking-tight">
                  {recommendation.cost === 0 ? 'Free' : `$${recommendation.cost}`}
                  {recommendation.cost > 0 && <span className="text-xs text-text-secondary font-bold">/mo</span>}
                </h4>
                <button
                  onClick={() => handleAction(recommendation.plan)}
                  className="mt-3 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-subtle active:scale-[0.98] flex items-center gap-1.5"
                >
                  <span>Select {recommendation.plan}</span>
                  <DynamicIcon name="ArrowRight" size={12} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Atlas Comparison Section */}
        <section className="mt-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-primary tracking-tight">
              Why Atlas?
            </h2>
            <p className="text-xs text-text-secondary font-medium mt-2">
              See how Atlas stacks up against other AI app builders across the features that matter most.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border-color bg-bg-secondary shadow-subtle">
            <table className="w-full border-collapse text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-border-color bg-bg-primary/30 text-xs">
                  <th className="py-5 px-8 font-extrabold text-text-primary w-2/5">Feature</th>
                  <th className="py-5 px-6 font-extrabold text-accent-primary text-center w-1.5/5">OneAtlas</th>
                  <th className="py-5 px-6 font-bold text-text-secondary text-center w-1.5/5">Alternative App Builders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color text-xs font-semibold text-text-secondary">
                {WHY_ATLAS_ITEMS.map((item, index) => (
                  <tr key={index} className="hover:bg-bg-primary/5 transition-subtle">
                    <td className="py-5 px-8 font-bold text-text-primary">{item.feature}</td>
                    
                    {/* Atlas Score */}
                    <td className="py-5 px-6 text-center bg-accent-primary/[0.01]">
                      <span className="inline-flex items-center gap-2 text-accent-primary font-bold">
                        <span className="inline-flex items-center justify-center h-4.5 w-4.5 rounded-full bg-accent-primary/10 text-accent-primary">
                          <DynamicIcon name="Check" size={11} className="stroke-[3.5]" />
                        </span>
                        {item.atlas}
                      </span>
                    </td>

                    {/* Others Score */}
                    <td className="py-5 px-6 text-center">
                      <span className="inline-flex items-center gap-2 text-text-muted font-medium">
                        <DynamicIcon name="X" size={13} className="text-text-muted/60 shrink-0" />
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
        <section id="comparison-matrix" className="pt-4 scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-primary tracking-tight">
              Compare plan details
            </h2>
            <p className="text-xs text-text-secondary font-medium mt-2">
              Every detail mapped side-by-side to help you choose.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border-color bg-bg-secondary shadow-subtle">
            <table className="w-full border-collapse text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-border-color bg-bg-primary/30">
                  <th className="py-6 px-8 text-sm font-extrabold text-text-primary w-1/5">Features</th>
                  <th className="py-6 px-6 text-sm font-extrabold text-text-primary text-center w-1/5">Explorer</th>
                  <th className="py-6 px-6 text-sm font-extrabold text-text-primary text-center w-1/5">Builder</th>
                  {/* Studio column with aligned badge to prevent clipping */}
                  <th className="py-6 px-6 text-center bg-accent-primary/[0.02] border-x border-accent-primary/10 w-1/5">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20 text-[8px] text-accent-primary font-bold uppercase tracking-wider shadow-subtle">
                        Recommended
                      </span>
                      <span className="text-sm font-extrabold text-text-primary">Studio</span>
                    </div>
                  </th>
                  <th className="py-6 px-6 text-sm font-extrabold text-text-primary text-center w-1/5">Scale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color text-xs font-semibold text-text-secondary">
                {COMPARISON_MATRIX.map((categoryGroup, catIdx) => (
                  <React.Fragment key={catIdx}>
                    {/* Category Header Row */}
                    <tr className="bg-bg-primary/20 border-y border-border-color">
                      <td colSpan={5} className="py-4 px-8 font-bold uppercase tracking-wider text-[10px] text-text-primary">
                        {categoryGroup.category}
                      </td>
                    </tr>
                    {categoryGroup.features.map((feature, featIdx) => {
                      const isPricingRow = feature.name === 'Pricing';
                      
                      // Format the pricing dynamically based on toggle state
                      const getDynamicPriceString = (tierName: string, originalVal: string) => {
                        if (!isPricingRow) return originalVal;
                        const match = TIERS.find(t => t.name === tierName);
                        if (!match || match.monthlyPrice === 0) return originalVal;
                        const activePrice = isAnnual ? match.annualPrice : match.monthlyPrice;
                        return `$${activePrice}/mo`;
                      };

                      return (
                        <tr key={featIdx} className="hover:bg-bg-primary/5 transition-subtle">
                          <td className="py-4.5 px-8 font-bold text-text-primary">{feature.name}</td>
                          
                          {/* Explorer Column */}
                          <td className="py-4.5 px-6 text-center">
                            {feature.explorer === '—' ? (
                              <span className="text-text-muted/60 font-normal">—</span>
                            ) : (
                              <span className={isPricingRow ? "text-sm font-extrabold text-text-primary" : "font-medium"}>
                                {getDynamicPriceString('Explorer', feature.explorer)}
                              </span>
                            )}
                          </td>

                          {/* Builder Column */}
                          <td className="py-4.5 px-6 text-center">
                            {feature.builder === '—' ? (
                              <span className="text-text-muted/60 font-normal">—</span>
                            ) : feature.builder === 'Included' ? (
                              <span className="inline-flex items-center gap-1.5 text-accent-primary font-bold">
                                <span className="inline-flex items-center justify-center h-4.5 w-4.5 rounded-full bg-accent-primary/10 text-accent-primary">
                                  <DynamicIcon name="Check" size={10} className="stroke-[3.5]" />
                                </span>
                                Included
                              </span>
                            ) : (
                              <span className={isPricingRow ? "text-sm font-extrabold text-text-primary" : "font-medium"}>
                                {getDynamicPriceString('Builder', feature.builder)}
                              </span>
                            )}
                          </td>

                          {/* Studio Column (Highlighted) */}
                          <td className="py-4.5 px-6 text-center bg-accent-primary/[0.01] border-x border-accent-primary/5">
                            {feature.studio === '—' ? (
                              <span className="text-text-muted/60 font-normal">—</span>
                            ) : feature.studio === 'Included' ? (
                              <span className="inline-flex items-center gap-1.5 text-accent-primary font-extrabold">
                                <span className="inline-flex items-center justify-center h-4.5 w-4.5 rounded-full bg-accent-primary/10 text-accent-primary">
                                  <DynamicIcon name="Check" size={10} className="stroke-[3.5]" />
                                </span>
                                Included
                              </span>
                            ) : (
                              <span className={isPricingRow ? "text-sm font-extrabold text-accent-primary" : "text-text-primary font-bold"}>
                                {getDynamicPriceString('Studio', feature.studio)}
                              </span>
                            )}
                          </td>

                          {/* Scale Column */}
                          <td className="py-4.5 px-6 text-center">
                            {feature.scale === '—' ? (
                              <span className="text-text-muted/60 font-normal">—</span>
                            ) : feature.scale === 'Included' ? (
                              <span className="inline-flex items-center gap-1.5 text-text-primary font-bold">
                                <span className="inline-flex items-center justify-center h-4.5 w-4.5 rounded-full bg-text-primary/10 text-text-primary">
                                  <DynamicIcon name="Check" size={10} className="stroke-[3.5]" />
                                </span>
                                Included
                              </span>
                            ) : (
                              <span className={isPricingRow ? "text-sm font-extrabold text-text-primary" : "font-medium"}>
                                {getDynamicPriceString('Scale', feature.scale)}
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
                  <td className="py-6 px-8 font-bold text-text-primary">Ready to get started?</td>
                  
                  {/* Explorer CTA */}
                  <td className="py-6 px-6 text-center">
                    <button
                      onClick={() => handleAction('Explorer')}
                      className="px-4 py-2 rounded-xl bg-bg-secondary hover:bg-bg-primary/30 text-text-primary border border-border-color text-xs font-bold transition-all shadow-subtle active:scale-[0.98] hover:-translate-y-[1px]"
                    >
                      Start Free
                    </button>
                  </td>

                  {/* Builder CTA */}
                  <td className="py-6 px-6 text-center">
                    <button
                      onClick={() => handleAction('Builder')}
                      className="px-4 py-2 rounded-xl bg-bg-secondary hover:bg-[#FAFAFA] text-text-primary border border-border-color text-xs font-bold transition-all shadow-subtle active:scale-[0.98] hover:-translate-y-[1px]"
                    >
                      Build Faster
                    </button>
                  </td>

                  {/* Studio CTA */}
                  <td className="py-6 px-6 text-center bg-accent-primary/[0.01] border-x border-accent-primary/5">
                    <button
                      onClick={() => handleAction('Studio')}
                      className="px-5 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-extrabold transition-all shadow-subtle active:scale-[0.98] hover:-translate-y-[1px]"
                    >
                      Upgrade to Studio
                    </button>
                  </td>

                  {/* Scale CTA */}
                  <td className="py-6 px-6 text-center">
                    <button
                      onClick={() => handleAction('Scale')}
                      className="px-4 py-2 rounded-xl bg-text-primary hover:bg-black text-white text-xs font-bold transition-all shadow-subtle active:scale-[0.98] hover:-translate-y-[1px]"
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
              <h2 className="text-3xl font-extrabold tracking-tight text-text-primary tracking-tight">Frequently Asked Questions</h2>
              <p className="text-xs text-text-secondary font-medium mt-2">Find quick answers to billing, custom domains, and database execution questions.</p>
              
              <div className="flex flex-col gap-2 mt-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveFaqCategory(cat);
                      setExpandedFaqIndex(null);
                    }}
                    className={`text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      activeFaqCategory === cat
                        ? 'bg-bg-secondary text-text-primary border-border-color shadow-sm'
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
                        name="ChevronDown" 
                        size={16} 
                        className={`text-text-secondary group-hover:text-text-primary transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-accent-primary' : ''
                        }`} 
                      />
                    </div>
                    
                    {isExpanded && (
                      <p className="text-xs text-text-secondary leading-relaxed font-medium transition-subtle animate-fadeIn">
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
