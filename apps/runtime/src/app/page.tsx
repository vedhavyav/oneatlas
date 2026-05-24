import React from 'react';
import { headers } from 'next/headers';
import { prisma } from '@oneatlas/db';
import { GlassCard, GradientText, ModernButton, DynamicIcon } from '@oneatlas/ui';
import { getSiblingUrls } from '@oneatlas/metadata';

export const runtime = 'edge';

async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        deployments: {
          where: { active: true },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return { projects, dbOnline: true, error: null };
  } catch (error: any) {
    console.error("Database connection warning in Runtime:", error);
    return { projects: [], dbOnline: false, error: error.message };
  }
}

export default async function RuntimeLandingPage() {
  const { projects, dbOnline, error } = await getProjects();
  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3002';
  const protocol = host.includes('localhost') ? 'http:' : 'https:';
  const isPagesDev = host.includes('pages.dev');

  const siblingUrls = getSiblingUrls(host);
  const builderUrl = siblingUrls.builder;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-slate-950/40 backdrop-blur px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href={siblingUrls.dashboard} className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition mr-1">
            <DynamicIcon name="ArrowLeft" size={16} />
          </a>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-extrabold text-white text-base">R</span>
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            OneAtlas<span className="text-emerald-400">.runtime</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            dbOnline 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dbOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>Database: {dbOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-8 py-16 flex flex-col gap-10 justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
            <DynamicIcon name="Cpu" size={32} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            OneAtlas <GradientText>Runtime Environment</GradientText>
          </h1>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            This console is execution host for generated operational tools. Deploy applications using the AI Builder and access them below.
          </p>
        </div>

        {/* Workspace Applications */}
        <div className="flex flex-col gap-4 mt-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <DynamicIcon name="Layers" size={14} />
            <span>Deployed Applications ({projects.length})</span>
          </h2>

          {projects.length === 0 ? (
            <GlassCard className="text-center py-12 border border-white/5 flex flex-col items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                <DynamicIcon name="Info" size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">No active deployments found</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  {error ? `Database error: ${error}` : 'Generate and deploy a tool from the builder to get started.'}
                </p>
              </div>
              <a href={builderUrl} target="_blank" rel="noreferrer">
                <ModernButton className="py-2 text-xs">
                  <DynamicIcon name="Sparkles" size={14} />
                  <span>Launch AI Builder</span>
                </ModernButton>
              </a>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => {
                const activeDeployment = project.deployments?.[0];
                const versionNum = activeDeployment ? activeDeployment.version : 1;
                const appUrl = isPagesDev
                  ? `${protocol}//${host}/app/${project.slug}`
                  : `${protocol}//${project.slug}.${host}`;

                return (
                  <GlassCard key={project.id} className="flex flex-col justify-between h-40 border border-white/5 hover:border-emerald-500/20 transition duration-300">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">{project.name}</h3>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">slug: {project.slug}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-semibold tracking-wide">
                          v{versionNum} Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2.5 line-clamp-2">{project.description || "Operational app."}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-3">
                      <span className="text-[10px] text-slate-500">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <a href={appUrl}>
                        <ModernButton variant="secondary" className="py-1 px-3 text-xs gap-1">
                          <span>Open Console</span>
                          <DynamicIcon name="ExternalLink" size={10} />
                        </ModernButton>
                      </a>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600 font-medium">
        &copy; {new Date().getFullYear()} OneAtlas.dev • Powered by Next.js Edge Runtime
      </footer>
    </div>
  );
}
