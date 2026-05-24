'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard, GradientText, ModernButton, DynamicIcon } from '@oneatlas/ui';
import { AppMetadata } from '@oneatlas/metadata';

export const runtime = 'edge';

export default function RuntimeAppPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const [loading, setLoading] = useState(true);
  const [appMetadata, setAppMetadata] = useState<AppMetadata | null>(null);
  const [activePageId, setActivePageId] = useState<string>('');
  
  // Dynamic rows and statistics
  const [dbData, setDbData] = useState<Record<string, any[]>>({});
  const [stats, setStats] = useState<Record<string, number>>({});
  
  // Interactive forms state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch deployment metadata
  useEffect(() => {
    async function loadDeployment() {
      try {
        setLoading(true);
        // Call internal lookup endpoint
        const response = await fetch(`/api/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, table: '---METADATA---' }) // special flag handled by resolver
        });

        // Let's create a local mock lookup if the API fails or DB is empty to make it testable
        if (!response.ok) throw new Error("Metadata resolve failed");
        
        // Wait, instead of calling a separate resolve API, let's fetch deployment metadata directly from /api/query
        // But since we want to be robust, let's create a lightweight deployment fetcher in this page:
      } catch (e) {
        console.error(e);
      }
    }
    loadDeployment();
  }, [slug]);

  // Let's implement a clean client fetcher
  useEffect(() => {
    async function resolveMetadata() {
      try {
        // Fetch metadata
        const metaRes = await fetch(`/api/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, table: '_METADATA_LOOKUP' }) // special query fallback
        });
        
        // Since we are writing both client and backend, let's fetch metadata by querying a dedicated route or using a GET request
        // Wait, let's look at how the route is designed. We can fetch it by sending a POST request to '/api/query' with table='_METADATA_LOOKUP'
        // Wait, let's make sure the `/api/query` route handles this metadata lookup request!
        // Yes, let's modify the `/api/query` route to handle table='_METADATA_LOOKUP' so we can fetch the metadata. That is extremely clean!
        // Let's implement that in our Page logic.
      } catch (err) {
        console.error(err);
      }
    }
  }, [slug]);

  // Let's create a robust state resolver inside the page. We will fetch:
  // 1. Active deployment appMetadata.
  // 2. Query each table defined in metadata database.
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchAppData = async () => {
    try {
      setLoading(true);
      
      // Let's query metadata by calling a custom internal endpoint or querying '/api/query'
      // We will make '/api/query' return the active metadata when table is '__metadata__'
      const res = await fetch(`/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, table: '__metadata__' })
      });

      if (!res.ok) {
        throw new Error("Failed to load application metadata. Make sure the app is deployed.");
      }

      const body = await res.json();
      if (!body.appMetadata) {
        throw new Error("Application metadata not found.");
      }

      const meta = body.appMetadata as AppMetadata;
      setAppMetadata(meta);
      if (meta.pages.length > 0) {
        setActivePageId(meta.pages[0].id);
      }

      // Fetch table records for each database table
      const dataStore: Record<string, any[]> = {};
      for (const table of meta.database.tables) {
        const tableRes = await fetch(`/api/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, table: table.name })
        });
        if (tableRes.ok) {
          const tableBody = await tableRes.json();
          dataStore[table.name] = tableBody.rows || [];
        }
      }
      setDbData(dataStore);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err.message || "Failed to load application.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, [slug]);

  // Submit CRUD mutation
  const handleFormSubmit = async (tableName: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/mutate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          table: tableName,
          data: formData
        })
      });

      if (!res.ok) throw new Error("Mutation failed");
      
      // Refresh database rows
      await fetchAppData();
      setShowAddForm(false);
      setFormData({});
    } catch (e) {
      alert("Failed to submit record. Please check database constraint logs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#090d16] flex flex-col items-center justify-center text-slate-400 gap-3">
        <span className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider">Loading OneAtlas application...</span>
      </div>
    );
  }

  if (loadError || !appMetadata) {
    return (
      <div className="h-screen bg-[#090d16] flex flex-col items-center justify-center text-center p-6">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center text-xl mb-4">
          <DynamicIcon name="AlertTriangle" size={28} />
        </div>
        <h2 className="text-lg font-bold text-white">Application Unreachable</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
          {loadError || "This subdomain does not have an active deployment. Open the builder to deploy your application."}
        </p>
        <a href={process.env.NEXT_PUBLIC_BUILDER_URL || "http://localhost:3000"} className="mt-6">
          <ModernButton variant="secondary" className="py-2 text-xs">
            Open App Builder
          </ModernButton>
        </a>
      </div>
    );
  }

  const activePage = appMetadata.pages.find(p => p.id === activePageId);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-slate-950/20 flex flex-col justify-between">
        <div className="flex flex-col gap-6 p-6">
          {/* App title */}
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: appMetadata.themeColor }} />
            <h1 className="font-extrabold text-white text-base tracking-tight">{appMetadata.name}</h1>
          </div>

          {/* Pages menu */}
          <nav className="flex flex-col gap-1.5">
            {appMetadata.pages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  setActivePageId(page.id);
                  setShowAddForm(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                  activePageId === page.id
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <DynamicIcon name={page.icon || 'LayoutDashboard'} size={15} />
                <span>{page.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Brand footer */}
        <div className="p-6 border-t border-white/5 text-[10px] text-slate-500 font-semibold tracking-wider uppercase flex items-center gap-1.5 justify-center">
          <DynamicIcon name="Cpu" size={12} className="text-blue-500" />
          <span>Powered by OneAtlas.dev</span>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-8">
        
        {activePage && (
          <>
            {/* Page Title Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">{activePage.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{appMetadata.description || "Operational console."}</p>
              </div>

              {/* Page action button (Form trigger) */}
              {activePage.type === 'table' && activePage.components.find(c => c.type === 'table-view') && (
                <ModernButton
                  onClick={() => {
                    setShowAddForm(true);
                    setFormData({});
                  }}
                  className="py-2 text-xs"
                >
                  <DynamicIcon name="Plus" size={14} />
                  <span>New Record</span>
                </ModernButton>
              )}
            </div>

            {/* Dynamic Page Components Render */}
            <div className="flex flex-col gap-8">
              
              {/* Form overlay for creating records */}
              {showAddForm && activePage.type === 'table' && (
                <GlassCard className="border border-blue-500/20">
                  {activePage.components.map((comp) => {
                    if (comp.type !== 'table-view') return null;
                    const tableSchema = appMetadata.database.tables.find(t => t.name === comp.table);
                    if (!tableSchema) return null;

                    return (
                      <div key={comp.id}>
                        <h3 className="text-xs font-bold text-white mb-4">Add record to {tableSchema.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tableSchema.fields.map(field => {
                            if (field.type === 'relation') return null;
                            return (
                              <div key={field.name} className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                  {field.name}
                                  {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                                </label>
                                
                                {field.type === 'select' && field.options ? (
                                  <select
                                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                    className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                  >
                                    <option value="">Select option</option>
                                    {field.options.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : field.type === 'text' ? (
                                  <textarea
                                    placeholder={`Enter ${field.name}...`}
                                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                    className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 min-h-16"
                                  />
                                ) : (
                                  <input
                                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                    placeholder={`Enter ${field.name}...`}
                                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                    className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex gap-2 justify-end mt-6 border-t border-white/5 pt-4">
                          <ModernButton variant="ghost" onClick={() => setShowAddForm(false)} className="py-1 text-xs">
                            Cancel
                          </ModernButton>
                          <ModernButton
                            disabled={submitting}
                            onClick={() => handleFormSubmit(tableSchema.name)}
                            className="py-1 px-5 text-xs"
                          >
                            {submitting ? 'Saving...' : 'Save Record'}
                          </ModernButton>
                        </div>
                      </div>
                    );
                  })}
                </GlassCard>
              )}

              {/* Render dashboard widgets */}
              {activePage.type === 'dashboard' && (
                <div className="flex flex-col gap-6">
                  {/* Aggregates grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {activePage.components
                      .filter(c => c.type === 'stat-card')
                      .map(comp => {
                        const tbl = comp.table || '';
                        const rows = dbData[tbl] || [];
                        const aggregateVal = comp.statConfig?.aggregation === 'sum'
                          ? rows.reduce((sum, row) => sum + (Number(row[comp.statConfig?.valueField || '']) || 0), 0)
                          : rows.length;

                        return (
                          <GlassCard key={comp.id}>
                            <p className="text-xs text-slate-500 font-semibold">{comp.title || comp.statConfig?.label}</p>
                            <h4 className="text-3xl font-extrabold text-white mt-1">
                              {comp.statConfig?.aggregation === 'sum' ? '$' : ''}{aggregateVal}
                            </h4>
                          </GlassCard>
                        );
                      })}
                  </div>

                  {/* Chart graphs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activePage.components
                      .filter(c => c.type === 'chart')
                      .map(comp => {
                        const rows = dbData[comp.table || ''] || [];
                        return (
                          <GlassCard key={comp.id} className="h-64 flex flex-col justify-between">
                            <h4 className="text-xs font-bold text-slate-400">{comp.title || comp.chartConfig?.title}</h4>
                            
                            <div className="flex-1 flex items-end justify-around gap-2 px-4 py-6 border-b border-white/5">
                              {rows.length === 0 ? (
                                <div className="text-[10px] text-slate-600 my-auto">No records available to chart.</div>
                              ) : (
                                rows.map((row, idx) => {
                                  // aggregate metric height ratio
                                  const hVal = Math.min(100, Math.max(15, (Number(row[comp.chartConfig?.yAxis || '']) || 40) / 500));
                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-1.5 w-full">
                                      <div
                                        className="w-full rounded-t-md transition-all duration-300"
                                        style={{
                                          height: `${hVal}%`,
                                          backgroundColor: appMetadata.themeColor || '#3b82f6',
                                          opacity: 0.85
                                        }}
                                      />
                                      <span className="text-[9px] text-slate-500 truncate w-full text-center">
                                        {String(row[comp.chartConfig?.xAxis || ''] || idx)}
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </GlassCard>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Render dynamic CRUD tables */}
              {activePage.type === 'table' && (
                <div className="flex flex-col gap-4">
                  {activePage.components.map((comp) => {
                    if (comp.type !== 'table-view') return null;
                    const tableSchema = appMetadata.database.tables.find(t => t.name === comp.table);
                    const columns = comp.fields || tableSchema?.fields.map(f => f.name) || [];
                    const rows = dbData[comp.table || ''] || [];

                    return (
                      <GlassCard key={comp.id} className="p-0 border border-white/5 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-[10px] text-slate-400 uppercase font-semibold">
                              {columns.map(col => (
                                <th key={col} className="px-4 py-3">{col}</th>
                              ))}
                              <th className="px-4 py-3">Created</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                            {rows.length === 0 ? (
                              <tr>
                                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-500">
                                  No records found. Click New Record to populate this table.
                                </td>
                              </tr>
                            ) : (
                              rows.map((row, rIdx) => (
                                <tr key={row.id || rIdx} className="hover:bg-white/[0.02] transition">
                                  {columns.map(col => (
                                    <td key={col} className="px-4 py-3 font-semibold">
                                      {row[col] === undefined ? '-' : String(row[col])}
                                    </td>
                                  ))}
                                  <td className="px-4 py-3 text-slate-500 text-[10px]">
                                    {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </GlassCard>
                    );
                  })}
                </div>
              )}

            </div>
          </>
        )}

      </main>
    </div>
  );
}
