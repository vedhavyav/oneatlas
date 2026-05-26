'use client';

import React, { useState } from 'react';
import { GlassCard, DynamicIcon, ModernButton } from '@oneatlas/ui';

interface Integration {
  id: string;
  provider: string;
  credentials: any;
  active: boolean;
}

interface IntegrationsVaultProps {
  initialIntegrations: Integration[];
  organizationId: string;
}

interface ProviderMeta {
  name: string;
  provider: string;
  icon: string;
  color: string;
  bg: string;
  fields: { name: string; label: string; placeholder: string; type: string }[];
}

const PROVIDERS: ProviderMeta[] = [
  {
    name: 'Slack Notification Webhook',
    provider: 'SLACK',
    icon: 'MessageSquare',
    color: 'text-accent-primary',
    bg: 'bg-accent-primary/10',
    fields: [
      { name: 'webhookUrl', label: 'Incoming Webhook URL', placeholder: 'https://hooks.slack.com/services/...', type: 'text' }
    ]
  },
  {
    name: 'Custom Webhook HTTP Trigger',
    provider: 'WEBHOOK',
    icon: 'Link2',
    color: 'text-text-primary',
    bg: 'bg-text-secondary/10',
    fields: [
      { name: 'webhookUrl', label: 'HTTP POST URL', placeholder: 'https://api.yourcompany.com/webhook', type: 'text' }
    ]
  },
  {
    name: 'Google Sheets Integration',
    provider: 'GOOGLE_SHEETS',
    icon: 'Grid',
    color: 'text-text-primary',
    bg: 'bg-text-secondary/10',
    fields: [
      { name: 'spreadsheetId', label: 'Spreadsheet ID', placeholder: '1A2B3C4D...', type: 'text' },
      { name: 'sheetName', label: 'Sheet Name', placeholder: 'Sheet1', type: 'text' }
    ]
  },
  {
    name: 'Gmail Automations',
    provider: 'GMAIL',
    icon: 'Mail',
    color: 'text-text-primary',
    bg: 'bg-text-secondary/10',
    fields: [
      { name: 'apiKey', label: 'OAuth API Key', placeholder: 'AIzaSy...', type: 'password' },
      { name: 'fromAddress', label: 'Verified Send-From Email', placeholder: 'alerts@company.com', type: 'text' }
    ]
  },
  {
    name: 'Notion Workspace',
    provider: 'NOTION',
    icon: 'FileText',
    color: 'text-text-primary',
    bg: 'bg-text-secondary/10',
    fields: [
      { name: 'integrationToken', label: 'Internal Integration Token', placeholder: 'secret_...', type: 'password' },
      { name: 'databaseId', label: 'Database ID', placeholder: 'a1b2c3d4...', type: 'text' }
    ]
  }
];

export function IntegrationsVault({ initialIntegrations, organizationId }: IntegrationsVaultProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [selectedProvider, setSelectedProvider] = useState<ProviderMeta | null>(null);
  
  // Modal state
  const [active, setActive] = useState(true);
  const [fieldsState, setFieldsState] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleOpenConfig = (prov: ProviderMeta) => {
    const existing = integrations.find(i => i.provider === prov.provider);
    setSelectedProvider(prov);
    setActive(existing ? existing.active : true);
    
    // Pre-populate fields
    const initialFields: Record<string, string> = {};
    prov.fields.forEach(f => {
      initialFields[f.name] = existing?.credentials?.[f.name] || '';
    });
    setFieldsState(initialFields);
  };

  const handleSave = async () => {
    if (!selectedProvider) return;
    setSaving(true);

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          provider: selectedProvider.provider,
          credentials: fieldsState,
          active
        })
      });

      if (!response.ok) throw new Error('Save failed');
      const data = await response.json();

      if (data.success && data.integration) {
        // Update state
        setIntegrations(prev => {
          const index = prev.findIndex(i => i.provider === selectedProvider.provider);
          if (index > -1) {
            const copy = [...prev];
            copy[index] = data.integration;
            return copy;
          } else {
            return [...prev, data.integration];
          }
        });
        setSelectedProvider(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to configure integration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <GlassCard className="md:col-span-1 flex flex-col gap-4 border border-border-color bg-bg-secondary p-7 shadow-subtle">
        <h2 className="text-lg font-bold tracking-tight text-text-primary">Integrations Vault</h2>
        <p className="text-xs text-text-secondary font-medium">Manage API keys and OAuth workflows for app automation triggers.</p>
        
        <div className="flex flex-col gap-3 mt-2">
          {PROVIDERS.map((item) => {
            const connRecord = integrations.find(i => i.provider === item.provider);
            const conn = connRecord ? connRecord.active : false;
            return (
              <div 
                key={item.provider} 
                onClick={() => handleOpenConfig(item)}
                className="flex items-center justify-between p-3 rounded-xl bg-bg-primary border border-border-color hover:bg-bg-secondary hover:border-accent-primary/20 transition cursor-pointer shadow-subtle"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                    <DynamicIcon name={item.icon} size={16} />
                  </div>
                  <span className="text-xs font-semibold text-text-primary">{item.name.split(' ')[0]}</span>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  conn ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600' : 'bg-bg-secondary text-text-muted border border-border-color'
                }`}>
                  {conn ? 'Active' : 'Unwired'}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Configuration Dialog */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-text-primary/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full border border-border-color flex flex-col gap-5 bg-bg-secondary shadow-subtle">
            <div className="flex items-center justify-between border-b border-border-color pb-3">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg ${selectedProvider.bg} flex items-center justify-center ${selectedProvider.color}`}>
                  <DynamicIcon name={selectedProvider.icon} size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm">{selectedProvider.name}</h3>
                  <p className="text-[10px] text-text-secondary">Configure connection credentials</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedProvider(null)}
                className="h-7 w-7 rounded-lg bg-bg-primary border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary transition shadow-subtle"
              >
                <DynamicIcon name="X" size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Enabled toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-primary border border-border-color">
                <span className="text-xs font-semibold text-text-primary">Enable Integration</span>
                <input 
                  type="checkbox" 
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border-color bg-bg-secondary text-accent-primary focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Dynamic fields */}
              {selectedProvider.fields.map(field => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{field.label}</label>
                  <input
                    type={field.type}
                    value={fieldsState[field.name] || ''}
                    placeholder={field.placeholder}
                    onChange={(e) => setFieldsState(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="w-full bg-bg-primary border border-border-color rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-border-color pt-4 mt-1">
              <ModernButton 
                variant="ghost" 
                onClick={() => setSelectedProvider(null)} 
                className="py-1.5 text-xs h-9"
              >
                Cancel
              </ModernButton>
              <ModernButton 
                disabled={saving}
                onClick={handleSave} 
                className="py-1.5 px-5 text-xs h-9"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </ModernButton>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
