import React, { useState } from 'react';
import { Sparkles, Search, Wand2, CheckCircle2 } from 'lucide-react';
import { intelligence } from '../../services/intelligenceService';
import { auth } from '../../services/auth';
import type { TriageSuggestion } from '../../services/intelligenceService';

export const AiAssistView: React.FC<{ onViewTicket?: (id: string) => void }> = ({ onViewTicket }) => {
  const user = auth.getCurrentUser();
  const orgId = user?.organization_id;
  const [issueText, setIssueText] = useState(
    'Water leaking from ceiling above the cold room, floor is wet and slippery near the back stock area'
  );
  const [suggestion, setSuggestion] = useState<TriageSuggestion | null>(null);
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<ReturnType<typeof intelligence.naturalSearch> | null>(
    null
  );

  const runTriage = () => {
    setSuggestion(intelligence.suggestTriage(issueText, orgId));
  };

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchResult(intelligence.naturalSearch(query, orgId));
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">AI Assist</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ticket triage suggestions and natural-language search across tickets, tenants, and units.
          Rule-based intelligence (works offline in demo mode).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Wand2 className="w-4 h-4 text-violet-600" /> Ticket triage
          </div>
          <textarea
            rows={5}
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            placeholder="Describe the issue as a tenant would…"
          />
          <button
            onClick={runTriage}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl"
          >
            Suggest priority & category
          </button>

          {suggestion && (
            <div className="mt-3 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900 space-y-2 text-xs">
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white font-bold">
                  {suggestion.suggested_priority}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white font-bold">
                  {suggestion.suggested_category}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border font-semibold">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{suggestion.rationale}</p>
              {suggestion.suggested_assignee_name && (
                <p>
                  <strong>Suggested tech:</strong> {suggestion.suggested_assignee_name}
                </p>
              )}
              {suggestion.preferred_vendor_name && (
                <p>
                  <strong>Preferred vendor:</strong> {suggestion.preferred_vendor_name}
                </p>
              )}
              <div className="pt-2 border-t border-violet-200 dark:border-violet-800">
                <div className="font-semibold mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> First-response draft
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {suggestion.first_response_draft}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Search className="w-4 h-4 text-blue-600" /> Natural language search
          </div>
          <form onSubmit={runSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. "leak G-14" or "HVAC" or tenant name'
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">
              Search
            </button>
          </form>

          {searchResult && (
            <div className="space-y-3 text-xs max-h-80 overflow-y-auto">
              <div>
                <div className="font-bold text-slate-500 mb-1">Tickets ({searchResult.tickets.length})</div>
                {searchResult.tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onViewTicket?.(t.id)}
                    className="block w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <span className="font-mono text-[10px] text-slate-400">{t.ticket_number}</span>{' '}
                    <span className="font-semibold">{t.title}</span>
                  </button>
                ))}
                {!searchResult.tickets.length && <p className="text-slate-400">None</p>}
              </div>
              <div>
                <div className="font-bold text-slate-500 mb-1">Tenants ({searchResult.tenants.length})</div>
                {searchResult.tenants.map((t) => (
                  <div key={t.id} className="p-2">
                    <span className="font-semibold">{t.business_name}</span>
                    <span className="text-slate-400"> — {t.contact_person}</span>
                  </div>
                ))}
                {!searchResult.tenants.length && <p className="text-slate-400">None</p>}
              </div>
              <div>
                <div className="font-bold text-slate-500 mb-1">Units ({searchResult.shops.length})</div>
                {searchResult.shops.map((s) => (
                  <div key={s.id} className="p-2">
                    <span className="font-semibold">{s.shop_number}</span>
                    <span className="text-slate-400"> — {s.floor} · {s.status}</span>
                  </div>
                ))}
                {!searchResult.shops.length && <p className="text-slate-400">None</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
