import React from 'react';
import { prisma } from '@oneatlas/db';
import { GlassCard, GradientText, ModernButton, DynamicIcon } from '@oneatlas/ui';

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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-slate-950/40 backdrop-blur px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="font-extrabold text-white text-base">O</span>
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">OneAtlas<span className="text-blue-500">.dev</span></span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-400 font-medium">
            <DynamicIcon name="Box" size={14} className="text-blue-500" />
            <span>Workspace: {org.name}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-slate-200">
            U
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10 flex flex-col gap-10">
        
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, <GradientText>Atlas Builder</GradientText>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Deploy and run custom internal operations apps generated by AI.</p>
          </div>
          {/* Link pointing to app builder */}
          <a href="http://localhost:3000" target="_blank" rel="noreferrer">
            <ModernButton className="group py-3 px-5">
              <DynamicIcon name="Sparkles" size={16} className="text-blue-200 group-hover:animate-pulse" />
              <span>Create New App</span>
            </ModernButton>
          </a>
        </section>

        {/* Stats Matrix Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
              <DynamicIcon name="Layers" size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Applications</p>
              <h3 className="text-2xl font-bold mt-0.5">{projects.length}</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <DynamicIcon name="Activity" size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">API Invocations</p>
              <h3 className="text-2xl font-bold mt-0.5">38,124</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
              <DynamicIcon name="Link2" size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Integrations Wired</p>
              <h3 className="text-2xl font-bold mt-0.5">{activeIntegrationsCount} / 5</h3>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <DynamicIcon name="DollarSign" size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Operational Cost</p>
              <h3 className="text-2xl font-bold mt-0.5">$0.00</h3>
            </div>
          </GlassCard>
        </section>

        {/* Workspace Applications */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Workspace Apps</h2>
            <span className="text-xs text-slate-500">{projects.length} Total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const activeDeployment = project.deployments?.[0];
              const versionNum = activeDeployment ? activeDeployment.version : 1;
              const runtimeUrl = process.env.NEXT_PUBLIC_RUNTIME_URL || 'http://localhost:3002';
              const parsedUrl = new URL(runtimeUrl);
              const subdomainUrl = `${parsedUrl.protocol}//${project.slug}.${parsedUrl.host}`;

              return (
                <GlassCard key={project.id} className="flex flex-col justify-between h-48 border border-white/5 hover:border-blue-500/20 transition-all duration-300">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{project.name}</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">.{project.slug}.oneatlas.app</p>
                      </div>
                      <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                        v{versionNum} Deployed
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 line-clamp-2">{project.description || "No description provided."}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <DynamicIcon name="Clock" size={10} />
                      Last updated {new Date(project.updatedAt).toLocaleDateString()}
                    </span>

                    <a href={subdomainUrl} target="_blank" rel="noreferrer">
                      <ModernButton variant="secondary" className="py-1 px-3 text-xs gap-1">
                        <span>Launch App</span>
                        <DynamicIcon name="ExternalLink" size={10} />
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
          <GlassCard className="md:col-span-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold tracking-tight">Integrations Vault</h2>
            <p className="text-xs text-slate-400">Manage API keys and OAuth workflows for app automation triggers.</p>
            
            <div className="flex flex-col gap-3 mt-2">
              {[
                { name: 'Slack', provider: 'SLACK', icon: 'MessageSquare', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { name: 'Google Sheets', provider: 'GOOGLE_SHEETS', icon: 'Grid', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { name: 'Gmail', provider: 'GMAIL', icon: 'Mail', color: 'text-rose-400', bg: 'bg-rose-500/10' },
                { name: 'Notion Workspace', provider: 'NOTION', icon: 'FileText', color: 'text-slate-300', bg: 'bg-slate-500/10' }
              ].map((item) => {
                const conn = integrations.some(i => i.provider === item.provider && i.active);
                return (
                  <div key={item.provider} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                        <DynamicIcon name={item.icon} size={16} />
                      </div>
                      <span className="text-xs font-semibold text-white">{item.name}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      conn ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 border border-white/5'
                    }`}>
                      {conn ? 'Active' : 'Unwired'}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Audit Logs Module */}
          <GlassCard className="md:col-span-2 flex flex-col gap-4">
            <h2 className="text-lg font-bold tracking-tight">Recent Platform Audits</h2>
            <p className="text-xs text-slate-400 font-medium">Verify system deployment and workflow trigger statuses.</p>

            <div className="flex flex-col gap-3 mt-2">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No recent audit logs available. Build and deploy an app to generate records.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          {log.action}
                        </span>
                        <span className="font-medium text-slate-300">{log.resource}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        ID: {log.id.slice(0, 8)} • Details: {JSON.stringify(log.details)}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-500 font-medium shrink-0">
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
