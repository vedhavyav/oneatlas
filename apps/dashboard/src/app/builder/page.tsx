'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GlassCard, GradientText, ModernButton, DynamicIcon } from '@oneatlas/ui';
import { AppMetadata } from '@oneatlas/metadata';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function BuilderPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<AppMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'workflows'>('preview');
  
  // Preview specific state to simulate CRUD mutations live inside the builder
  const [previewData, setPreviewData] = useState<Record<string, Array<Record<string, any>>>>({});
  const [showAddForm, setShowAddForm] = useState<string | null>(null); // table name
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Deployment configuration state
  const [subdomain, setSubdomain] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Seed sample preview rows when metadata changes
  useEffect(() => {
    if (!metadata) return;
    const initialData: Record<string, any[]> = {};
    metadata.database.tables.forEach(table => {
      if (table.name === 'leads') {
        initialData[table.name] = [
          { id: '1', title: 'Enterprise Contract Acme', company: 'Acme Corp', value: 45000, status: 'Qualified', email: 'sales@acme.com', notes: 'Key account' },
          { id: '2', title: 'Mid-market Upgrade', company: 'Globex Ltd', value: 12000, status: 'New', email: 'ops@globex.com', notes: 'Needs call' }
        ];
      } else if (table.name === 'tickets') {
        initialData[table.name] = [
          { id: '1', title: 'Login loop on Firefox', severity: 'Critical', status: 'Open', customer_email: 'user1@gmail.com', description: 'User clicks login and gets redirected back' },
          { id: '2', title: 'Spelling error on billing page', severity: 'Low', status: 'In Progress', customer_email: 'user2@gmail.com', description: 'Reccurrance instead of Recurrence' }
        ];
      } else {
        initialData[table.name] = [
          table.fields.reduce((acc, field) => {
            if (field.name === 'id') return acc;
            acc[field.name] = field.type === 'number' ? 100 : field.type === 'boolean' ? false : `${field.name} Value`;
            return acc;
          }, { id: '1' } as Record<string, any>)
        ];
      }
    });
    setPreviewData(initialData);
    
    // Suggest subdomain based on app name
    const suggestedSub = metadata.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 16);
    setSubdomain(suggestedSub);
  }, [metadata]);

  // Conversational API Dispatcher
  const handleGenerate = async (promptText: string) => {
    if (!promptText.trim()) return;

    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: promptText }]);
    setInput('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          currentMetadata: metadata
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      const data = await response.json();
      
      setMetadata(data);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `I have compiled the layouts and database schemas for **${data.name}**! Check the interactive workspace on the right to preview your app before publishing.` }
      ]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred during metadata generation. Please check your GEMINI_API_KEY environment variable and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Deploy trigger
  const handleDeploy = async () => {
    if (!metadata || !subdomain) return;
    setDeploying(true);
    setDeployResult(null);

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: subdomain,
          name: metadata.name,
          appMetadata: metadata
        })
      });

      if (!response.ok) throw new Error('Deployment failed');
      const res = await response.json();
      // Build the app URL using same-origin path
      setDeployResult({ ...res, appUrl: `/app/${subdomain}` });
    } catch (e) {
      console.error(e);
      alert('Deployment failed. Verify PostgreSQL connectivity.');
    } finally {
      setDeploying(false);
    }
  };

  // Live preview interactive CRUD handlers
  const handleAddRow = (tableName: string) => {
    const newRow = {
      id: Date.now().toString(),
      ...formData
    };
    setPreviewData(prev => ({
      ...prev,
      [tableName]: [...(prev[tableName] || []), newRow]
    }));
    setShowAddForm(null);
    setFormData({});
  };

  return (
    <div className="h-screen bg-bg-primary text-text-primary flex flex-col overflow-hidden transition-subtle">
      
      {/* Top Header */}
      <header className="border-b border-border-color bg-bg-secondary px-6 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <a href="/" className="h-8 w-8 rounded-lg bg-bg-primary border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-primary shadow-subtle transition-subtle">
            <DynamicIcon name="ArrowLeft" size={16} />
          </a>
          <span className="font-bold tracking-tight text-text-primary">
            OneAtlas<span className="text-accent-primary">.dev</span> Builder
          </span>
        </div>

        {metadata && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-text-secondary">Workspace App: <strong className="text-text-primary">{metadata.name}</strong></span>
          </div>
        )}
      </header>

      {/* Main split grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: conversational chatbot */}
        <div className="w-[450px] border-r border-border-color flex flex-col bg-bg-secondary">
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-6 my-auto text-center px-4">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center shadow-subtle">
                  <DynamicIcon name="Sparkles" size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Design your internal operations tool</h3>
                  <p className="text-xs text-text-secondary mt-1">Prompt Gemini to construct fields, charts, tables, and workflows instantly.</p>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                  {[
                    "Create a real estate CRM to track properties, clients, and offers.",
                    "Build an IT support ticketing app with severity spread charts.",
                    "Design a recruitment manager app with candidate status tables."
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => handleGenerate(tpl)}
                      className="text-left text-xs p-3 rounded-xl bg-bg-primary border border-border-color text-text-secondary hover:text-text-primary hover:border-accent-primary/30 transition-subtle shadow-subtle"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent-primary text-white rounded-tr-none shadow-subtle'
                        : 'bg-bg-primary border border-border-color text-text-primary rounded-tl-none shadow-subtle'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-bg-primary border border-border-color rounded-2xl rounded-tl-none p-4 max-w-[85%] flex items-center gap-3 shadow-subtle">
                  <span className="h-2 w-2 rounded-full bg-accent-primary animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-accent-primary animate-bounce [animation-delay:0.2s]" />
                  <span className="h-2 w-2 rounded-full bg-accent-primary animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-text-secondary font-semibold tracking-wider uppercase">Gemini compiles code...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Deployment controls block */}
          {metadata && !deployResult && (
            <div className="p-6 border-t border-border-color bg-bg-secondary flex flex-col gap-4">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-2">
                <DynamicIcon name="Rocket" size={14} className="text-accent-primary" />
                <span>Ready to deploy?</span>
              </h3>
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="subdomain"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full text-xs bg-bg-primary border border-border-color rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:border-accent-primary shadow-subtle"
                  />
                  <span className="absolute right-3 top-2 text-[10px] font-bold text-text-muted">.oneatlas.app</span>
                </div>

                <ModernButton
                  disabled={deploying || !subdomain}
                  onClick={handleDeploy}
                  className="py-2 text-xs h-9"
                >
                  {deploying ? 'Deploying...' : 'Deploy'}
                </ModernButton>
              </div>
            </div>
          )}

          {/* Deploy completion result card */}
          {deployResult && (
            <div className="p-6 border-t border-border-color bg-bg-secondary flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <DynamicIcon name="CheckCircle2" size={16} />
                <span className="text-xs font-bold">App Deployed successfully!</span>
              </div>
              <p className="text-[11px] text-text-secondary">Your dynamic Neon schema has been synchronised.</p>
              
              <a href={deployResult.appUrl}>
                <ModernButton className="w-full py-2 text-xs gap-1 h-9">
                  <span>Launch Live App</span>
                  <DynamicIcon name="ExternalLink" size={12} />
                </ModernButton>
              </a>

              <ModernButton variant="ghost" onClick={() => setDeployResult(null)} className="w-full py-1 text-xs h-9">
                Edit App
              </ModernButton>
            </div>
          )}

          {/* Chat Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate(input);
            }}
            className="p-4 border-t border-border-color bg-bg-secondary flex gap-2"
          >
            <input
              type="text"
              placeholder={metadata ? "Modify app (e.g. 'Add active flag to tasks')..." : "Create new app (e.g. 'Build a CRM')..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-bg-primary border border-border-color rounded-xl px-4 py-3 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/50 transition duration-200 shadow-subtle"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-xl bg-accent-primary hover:bg-accent-hover text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shrink-0 shadow-subtle"
            >
              <DynamicIcon name="Send" size={14} />
            </button>
          </form>

        </div>

        {/* Right Side: Interactive preview / schema workspace */}
        <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary">
          
          {/* Workspace Tabs Navbar */}
          <div className="border-b border-border-color px-6 py-2 flex items-center justify-between bg-bg-secondary">
            <div className="flex gap-1.5">
              {[
                { id: 'preview', label: 'Live Sandbox Preview', icon: 'Eye' },
                { id: 'schema', label: 'Database Schema & JSON', icon: 'Code2' },
                { id: 'workflows', label: 'Automations', icon: 'Workflow' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-subtle ${
                    activeTab === tab.id
                      ? 'bg-bg-primary text-text-primary border border-border-color shadow-subtle'
                      : 'text-text-secondary hover:text-text-primary border border-transparent'
                  }`}
                >
                  <DynamicIcon name={tab.icon} size={13} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Work Workspace */}
          <div className="flex-1 overflow-y-auto p-8">
            {!metadata ? (
              <div className="h-full flex flex-col items-center justify-center my-auto text-text-secondary gap-2">
                <DynamicIcon name="MonitorPlay" size={48} className="text-text-muted animate-pulse" />
                <span className="text-xs font-medium">Write a prompt to see the live app render.</span>
              </div>
            ) : (
              <>
                {/* 1. Live Sandbox Preview */}
                {activeTab === 'preview' && (
                  <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                    
                    {/* Rendered App Name/Description */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-text-primary">{metadata.name}</h2>
                        <p className="text-xs text-text-secondary mt-0.5">{metadata.description || "Interactive operational sandbox."}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: metadata.themeColor }} />
                        <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Preview Engine</span>
                      </div>
                    </div>

                    {/* App views rendering */}
                    {metadata.pages.map((page) => {
                      
                      // RENDER DASHBOARD PAGE TYPE
                      if (page.type === 'dashboard') {
                        return (
                          <div key={page.id} className="flex flex-col gap-6">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">{page.title} View</h3>
                            
                            {/* Stat cards grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {page.components
                                .filter(c => c.type === 'stat-card')
                                .map(comp => {
                                  const tbl = comp.table || '';
                                  const aggregateVal = comp.statConfig?.aggregation === 'sum' 
                                    ? (previewData[tbl] || []).reduce((sum, row) => sum + (Number(row[comp.statConfig?.valueField || '']) || 0), 0)
                                    : (previewData[tbl] || []).length;

                                  return (
                                    <GlassCard key={comp.id}>
                                      <p className="text-xs text-text-secondary font-semibold">{comp.title || comp.statConfig?.label}</p>
                                      <h4 className="text-3xl font-extrabold text-text-primary mt-1">
                                        {comp.statConfig?.aggregation === 'sum' ? '$' : ''}{aggregateVal}
                                      </h4>
                                    </GlassCard>
                                  );
                                })}
                            </div>

                            {/* Charts simulation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {page.components
                                .filter(c => c.type === 'chart')
                                .map(comp => (
                                  <GlassCard key={comp.id} className="h-64 flex flex-col justify-between">
                                    <h4 className="text-xs font-bold text-text-secondary">{comp.title || comp.chartConfig?.title}</h4>
                                    
                                    {/* Mock chart illustration */}
                                    <div className="flex-1 flex items-end justify-around gap-2 px-4 py-6 border-b border-border-color">
                                      {(previewData[comp.table || ''] || []).map((row, idx) => {
                                        const hVal = Math.min(100, Math.max(20, (Number(row[comp.chartConfig?.yAxis || '']) || 40) / 500));
                                        return (
                                          <div key={idx} className="flex flex-col items-center gap-2 w-full">
                                            <div
                                              className="w-full rounded-t-lg transition-all duration-500"
                                              style={{
                                                height: `${hVal}%`,
                                                backgroundColor: metadata.themeColor || '#FF6600',
                                                opacity: 0.8
                                              }}
                                            />
                                            <span className="text-[10px] text-text-secondary truncate w-full text-center">
                                              {row[comp.chartConfig?.xAxis || ''] || `Item ${idx}`}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </GlassCard>
                                ))}
                            </div>
                          </div>
                        );
                      }

                      // RENDER TABLE PAGE TYPE (CRUD Grid)
                      if (page.type === 'table') {
                        return (
                          <div key={page.id} className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest">{page.title} View</h3>
                              
                              {page.components.map(comp => comp.type === 'table-view' && (
                                <ModernButton
                                  key={comp.id}
                                  onClick={() => {
                                    setShowAddForm(comp.table || null);
                                    setFormData({});
                                  }}
                                  className="py-1.5 px-3 text-xs gap-1 h-8"
                                >
                                  <DynamicIcon name="Plus" size={12} />
                                  <span>Add Record</span>
                                </ModernButton>
                              ))}
                            </div>

                            {/* Render Add Row Form Overlay */}
                            {showAddForm && (
                              <GlassCard className="border border-border-color bg-bg-secondary shadow-subtle">
                                <h4 className="text-xs font-bold text-text-primary mb-4">Add new record to {showAddForm}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  {metadata.database.tables.find(t => t.name === showAddForm)?.fields.map(field => {
                                    if (field.type === 'relation') return null;
                                    return (
                                      <div key={field.name} className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-text-secondary uppercase">{field.name}</label>
                                        <input
                                          type={field.type === 'number' ? 'number' : 'text'}
                                          placeholder={`Enter ${field.name}`}
                                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                          className="bg-bg-primary border border-border-color rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex gap-2 justify-end mt-4">
                                  <ModernButton variant="ghost" onClick={() => setShowAddForm(null)} className="py-1 text-xs h-8">Cancel</ModernButton>
                                  <ModernButton onClick={() => handleAddRow(showAddForm)} className="py-1 px-4 text-xs h-8">Save</ModernButton>
                                </div>
                              </GlassCard>
                            )}

                            {/* Table contents rendering */}
                            {page.components.map((comp) => {
                              if (comp.type !== 'table-view') return null;
                              const tableSchema = metadata.database.tables.find(t => t.name === comp.table);
                              const columns = comp.fields || tableSchema?.fields.map(f => f.name) || [];
                              const rows = previewData[comp.table || ''] || [];

                              return (
                                <GlassCard key={comp.id} className="p-0 border border-border-color overflow-hidden shadow-subtle">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-bg-primary border-b border-border-color text-[10px] text-text-secondary uppercase font-semibold">
                                        {columns.map(col => (
                                          <th key={col} className="px-4 py-3">{col}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-color text-xs text-text-secondary">
                                      {rows.map((row, rIdx) => (
                                        <tr key={row.id || rIdx} className="hover:bg-bg-primary/50 text-text-primary transition duration-150">
                                          {columns.map(col => (
                                            <td key={col} className="px-4 py-3 font-medium">
                                              {row[col] === undefined ? '-' : String(row[col])}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </GlassCard>
                              );
                            })}
                          </div>
                        );
                      }

                      return null;
                    })}

                  </div>
                )}

                {/* 2. Database Schema and JSON Inspector */}
                {activeTab === 'schema' && (
                  <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                    
                    {/* Database Visual Schema Mapper */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {metadata.database.tables.map((table) => (
                        <GlassCard key={table.name} className="flex flex-col gap-3 shadow-subtle border-border-color">
                          <div className="flex items-center gap-2 border-b border-border-color pb-2">
                            <DynamicIcon name="Database" size={16} className="text-accent-primary" />
                            <h4 className="font-bold text-sm text-text-primary">{table.name}</h4>
                          </div>

                          <div className="flex flex-col gap-2">
                            {table.fields.map(field => (
                              <div key={field.name} className="flex items-center justify-between text-xs py-1">
                                <span className="font-semibold text-text-primary">
                                  {field.name}
                                  {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded bg-bg-primary border border-border-color text-[10px] text-text-secondary font-mono">
                                    {field.type}
                                  </span>
                                  {field.type === 'relation' && field.relation && (
                                    <span className="text-[10px] text-accent-primary font-medium">
                                      → {field.relation.targetTable} ({field.relation.relationType})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </GlassCard>
                      ))}
                    </div>

                    {/* Plain JSON Metadata Editor */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-text-secondary uppercase">Raw AppMetadata Specification</h4>
                      <pre className="bg-bg-secondary p-6 rounded-2xl border border-border-color overflow-x-auto text-[11px] font-mono text-text-primary leading-relaxed max-h-96 shadow-subtle">
                        {JSON.stringify(metadata, null, 2)}
                      </pre>
                    </div>

                  </div>
                )}

                {/* 3. Workflows List */}
                {activeTab === 'workflows' && (
                  <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-bold tracking-tight text-text-primary">Workflow Automations</h2>
                      <p className="text-xs text-text-secondary">Trigger Slack notifications, dynamic emails, or data rows creation automatically.</p>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                      {metadata.workflows.length === 0 ? (
                        <div className="py-12 border border-dashed border-border-color rounded-2xl text-center text-xs text-text-muted bg-bg-secondary shadow-subtle">
                          No workflows configured for this application. Ask Gemini to write an automation!
                        </div>
                      ) : (
                        metadata.workflows.map((wf) => (
                          <GlassCard key={wf.id} className="flex flex-col gap-4 shadow-subtle border-border-color">
                            <div className="flex items-center justify-between border-b border-border-color pb-3">
                              <div>
                                <h4 className="font-bold text-text-primary text-sm">{wf.name}</h4>
                                <p className="text-[10px] text-text-secondary mt-0.5">Trigger: Database {wf.trigger.type} on table <strong className="text-text-primary">{wf.trigger.table}</strong></p>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-600 font-semibold tracking-wide uppercase shadow-subtle">Active</span>
                            </div>

                            {/* Workflow steps sequence rendering */}
                            <div className="flex flex-col gap-3">
                              {wf.steps.map((step, idx) => (
                                <div key={step.id} className="flex items-start gap-3 text-xs bg-bg-primary border border-border-color rounded-xl p-3.5 shadow-subtle">
                                  <div className="h-6 w-6 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0 font-bold text-[10px]">
                                    {idx + 1}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-text-primary">{step.name}</span>
                                      <span className="px-1.5 py-0.5 rounded bg-bg-secondary border border-border-color text-[9px] text-text-secondary uppercase font-mono">{step.type}</span>
                                    </div>
                                    <pre className="text-[10px] text-text-secondary font-mono mt-1 whitespace-pre-wrap">
                                      {JSON.stringify(step.config, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              ))}
                            </div>

                          </GlassCard>
                        ))
                      )}
                    </div>

                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
