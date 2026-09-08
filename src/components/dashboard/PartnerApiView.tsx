import React, { useState } from 'react';
import { Code2, Play, CheckCircle2, XCircle } from 'lucide-react';
import { partnerApi, ApiResponse } from '../../services/partnerApi';
import { auth } from '../../services/auth';
import { db } from '../../services/db';

const EXAMPLES = [
  { method: 'GET', path: '/health', label: 'Health' },
  { method: 'GET', path: '/organizations/GAB-070826/units', label: 'List units' },
  { method: 'GET', path: '/organizations/GAB-070826/tickets', label: 'List tickets' },
  { method: 'GET', path: '/organizations/GAB-070826/rent-roll', label: 'Rent roll' },
  { method: 'GET', path: '/organizations/GAB-070826/kpis', label: 'Portfolio KPIs' },
  { method: 'GET', path: '/organizations/GAB-070826/webhooks', label: 'List webhooks' },
];

export const PartnerApiView: React.FC = () => {
  const user = auth.getCurrentUser();
  const orgCode =
    db.organizations.find((o) => o.id === user?.organization_id)?.organization_code || 'GAB-070826';
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState(`/organizations/${orgCode}/units`);
  const [body, setBody] = useState(
    JSON.stringify(
      { url: 'https://hooks.example.com/umhlaba', events: ['ticket.created', 'ticket.resolved'] },
      null,
      2
    )
  );
  const [result, setResult] = useState<ApiResponse | null>(null);

  const run = () => {
    let parsed: unknown;
    try {
      parsed = method === 'POST' ? JSON.parse(body) : undefined;
    } catch {
      setResult({ ok: false, status: 400, error: 'Invalid JSON body' });
      return;
    }
    setResult(partnerApi.invoke(method, path, parsed));
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Partner API</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          OpenAPI-aligned demo explorer. Spec: <code className="text-[11px]">/openapi.json</code>. Auth header in
          production: <code className="text-[11px]">X-Umhlaba-Api-Key</code>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.path + ex.label}
            onClick={() => {
              setMethod(ex.method);
              setPath(ex.path.replace('GAB-070826', orgCode));
            }}
            className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="px-2 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            >
              <option>GET</option>
              <option>POST</option>
            </select>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            />
          </div>
          {method === 'POST' && (
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 text-[11px] font-mono rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            />
          )}
          <button
            onClick={run}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Execute
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-xs">
            {result?.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : result ? (
              <XCircle className="w-4 h-4 text-red-400" />
            ) : null}
            <span className="font-mono">
              {result ? `${result.status} · ${result.meta?.latency_ms ?? 0}ms` : 'Response'}
            </span>
          </div>
          <pre className="text-[11px] overflow-auto max-h-80 font-mono text-slate-300">
            {result ? JSON.stringify(result, null, 2) : '// Run a request to see JSON output'}
          </pre>
        </div>
      </div>
    </div>
  );
};
