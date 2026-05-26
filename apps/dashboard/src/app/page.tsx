import React from 'react';

import { prisma } from '@oneatlas/db';
import { GlassCard, GradientText, ModernButton, DynamicIcon } from '@oneatlas/ui';

import { IntegrationsVault } from './IntegrationsVault';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';



export const runtime = 'edge';

// Auto-seed function to guarantee active workspace records exist on first run
async function bootstrapAndGetProjects() {
  try {
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: "Acme Corp",
          slug: "acme"
        }
      });
    }

    let projects = await prisma.project.findMany({
      where: { organizationId: org.id },
      include: {
        deployments: {
          where: { active: true },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (projects.length === 0) {
      const defaultProject = await prisma.project.create({
        data: {
          name: "Sales Lead CRM",
          slug: "leads",
          description: "Internal sales tracker with automated Slack notifications.",
          organizationId: org.id
        }
      });
      
      // Seed an initial mock deployment metadata
      await prisma.deployment.create({
        data: {
          projectId: defaultProject.id,
          version: 1,
          active: true,
          appMetadata: {
            name: "Sales Lead CRM",
            themeColor: "#3b82f6",
            database: {
              tables: [
                {
                  name: "leads",
                  fields: [
                    { name: "title", type: "string", required: true },
                    { name: "value", type: "number" }
                  ]
                }
              ]
            },
            pages: [
              { id: "dashboard", title: "Overview", type: "dashboard", components: [] }
            ]
          }
        }
      });

      projects = await prisma.project.findMany({
        where: { organizationId: org.id },
        include: {
          deployments: {
            where: { active: true },
            take: 1
          }
        }
      });
    }

    const integrations = await prisma.integration.findMany({
      where: { organizationId: org.id }
    });

    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId: org.id },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    return { org, projects, integrations, auditLogs };
  } catch (error) {
    console.error("Database connection/migration warning:", error);
    // Fallback Mock Data for previewing UI if DB is offline/unmigrated
    const mockOrg = { id: "mock-org", name: "Offline Mode (Dev Workspace)", slug: "offline" };
    const mockProjects = [
      {
        id: "mock-proj-1",
        name: "Support Desk App",
        slug: "tickets",
        description: "Customer ticket tracking tool with critical severity notifications.",
        updatedAt: new Date(),
        deployments: [{ id: "mock-dep-1", version: 2 }]
      },
      {
        id: "mock-proj-2",
        name: "Employee Directory",
        slug: "staff",
        description: "List and view employee records and department roles.",
        updatedAt: new Date(),
        deployments: [{ id: "mock-dep-2", version: 1 }]
      }
    ];
    return {
      org: mockOrg,
      projects: mockProjects as any,
      integrations: [],
      auditLogs: []
    };
  }
}

export default async function DashboardPage() {
  const { org, projects, integrations, auditLogs } = await bootstrapAndGetProjects();


  const activeIntegrationsCount = integrations.filter(i => i.active).length;

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
          <a href="/" className="text-[15px] font-medium text-text-primary transition-subtle border-b-2 border-accent-primary pb-0.5">Dashboard</a>
          <a href="/pricing" className="text-[15px] font-medium text-text-secondary hover:text-text-primary transition-subtle">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-color text-xs text-text-secondary font-medium shadow-subtle">
            <DynamicIcon name="Box" size={14} className="text-accent-primary" />
            <span>Workspace: {org.name}</span>
          </div>
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10 flex flex-col gap-10">
        
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Welcome back, <GradientText>Atlas Builder</GradientText>
            </h1>
            <p className="text-text-secondary mt-1 text-sm">Deploy and run custom internal operations apps generated by AI.</p>
          </div>
          {/* Link pointing to app builder (same-origin) */}
          <a href="/builder">
            <ModernButton className="group py-3 px-5">
              <DynamicIcon name="Sparkles" size={16} className="text-white group-hover:animate-pulse" />
              <span>Create New App</span>
            </ModernButton>
          </a>
        </section>

        {/* Stats Matrix Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20 text-accent-primary shadow-subtle">
              <DynamicIcon name="Layers" size={24} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">Active Applications</p>
              <h3 className="text-2xl font-bold mt-0.5 text-text-primary">{projects.length}</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-text-secondary/10 flex items-center justify-center border border-border-color text-text-secondary shadow-subtle">
              <DynamicIcon name="Activity" size={24} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">API Invocations</p>
              <h3 className="text-2xl font-bold mt-0.5 text-text-primary">38,124</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-text-secondary/10 flex items-center justify-center border border-border-color text-text-secondary shadow-subtle">
              <DynamicIcon name="Link2" size={24} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">Integrations Wired</p>
              <h3 className="text-2xl font-bold mt-0.5 text-text-primary">{activeIntegrationsCount} / 5</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-text-secondary/10 flex items-center justify-center border border-border-color text-text-secondary shadow-subtle">
              <DynamicIcon name="DollarSign" size={24} />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">Operational Cost</p>
              <h3 className="text-2xl font-bold mt-0.5 text-text-primary">$0.00</h3>
            </div>
          </GlassCard>
        </section>

        {/* Workspace Applications */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-text-primary">Workspace Apps</h2>
            <span className="text-xs text-text-muted">{projects.length} Total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project : any) => {
              const activeDeployment = project.deployments?.[0];
              const versionNum = activeDeployment ? activeDeployment.version : 1;
              const subdomainUrl = `/app/${project.slug}`;

              return (
                <GlassCard key={project.id} className="flex flex-col justify-between h-48 border border-border-color bg-bg-secondary p-7 hover:border-accent-primary/45 transition-subtle">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-text-primary">{project.name}</h3>
                        <p className="text-xs text-text-secondary font-semibold mt-0.5">.{project.slug}.oneatlas.app</p>
                      </div>
                      <span className="px-2 py-1 rounded-md bg-accent-primary/10 border border-accent-primary/20 text-[10px] text-accent-primary font-semibold tracking-wider uppercase shadow-subtle">
                        v{versionNum} Deployed
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-3 line-clamp-2">{project.description || "No description provided."}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border-color pt-3 mt-4">
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <DynamicIcon name="Clock" size={10} />
                      Last updated {new Date(project.updatedAt).toLocaleDateString()}
                    </span>

                    <a href={subdomainUrl}>
                       <ModernButton variant="secondary" className="py-1 px-3 text-xs gap-1 h-8">
                        <span>Launch App</span>
                        <DynamicIcon name="ArrowRight" size={10} />
                      </ModernButton>
                    </a>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>

        {/* Bottom Split: Integrations & Audit Logs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Integrations Module */}
          <IntegrationsVault initialIntegrations={integrations} organizationId={org.id} />

          {/* Audit Logs Module */}
          <GlassCard className="md:col-span-2 flex flex-col gap-4">
            <h2 className="text-lg font-bold tracking-tight text-text-primary">Recent Platform Audits</h2>
            <p className="text-xs text-text-secondary font-medium">Verify system deployment and workflow trigger statuses.</p>

            <div className="flex flex-col gap-3 mt-2">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  No recent audit logs available. Build and deploy an app to generate records.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3 rounded-xl bg-bg-primary/50 border border-border-color text-xs transition-subtle">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary border border-border-color shadow-subtle">
                          {log.action}
                        </span>
                        <span className="font-medium text-text-primary">{log.resource}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1">
                        ID: {log.id.slice(0, 8)} • Details: {JSON.stringify(log.details)}
                      </p>
                    </div>

                    <span className="text-[10px] text-text-muted font-medium shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </section>

      </main>
    </div>
  );
}
