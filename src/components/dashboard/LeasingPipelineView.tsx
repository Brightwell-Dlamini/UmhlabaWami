import React, { useState } from 'react';
import { Kanban, PlusCircle, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { commercial, LeasePipelineDeal, PipelineStage } from '../../services/commercialService';
import { auth } from '../../services/auth';

const STAGES: PipelineStage[] = [
  'Enquiry',
  'Viewing Scheduled',
  'Offer Made',
  'Negotiation',
  'Lease Draft',
  'Signed',
  'Lost',
];

function fmt(n: number) {
  return `E${n.toLocaleString()}`;
}

export const LeasingPipelineView: React.FC = () => {
  const user = auth.getCurrentUser();
  const orgId = user?.organization_id || 'org_gables_lifestyle';
  const [deals, setDeals] = useState(() => commercial.listPipeline(orgId));
  const [notice, setNotice] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    prospect_name: '',
    company: '',
    email: '',
    phone: '+268 ',
    shop_label: '',
    proposed_rent: 15000,
  });

  const refresh = () => setDeals(commercial.listPipeline(orgId));

  const advance = (deal: LeasePipelineDeal) => {
    const idx = STAGES.indexOf(deal.stage);
    if (idx < 0 || idx >= STAGES.length - 2) return;
    const next = STAGES[idx + 1];
    if (next === 'Signed') {
      commercial.convertDealToLease(deal.id, user?.name || 'Manager');
      setNotice(`Lease created for ${deal.company}. Unit marked occupied; deposit held.`);
    } else {
      commercial.updatePipelineStage(deal.id, next);
      setNotice(`${deal.company} moved to ${next}`);
    }
    refresh();
    setTimeout(() => setNotice(''), 3500);
  };

  const markLost = (deal: LeasePipelineDeal) => {
    commercial.updatePipelineStage(deal.id, 'Lost');
    refresh();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    commercial.addPipelineDeal({
      organization_id: orgId,
      prospect_name: form.prospect_name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      shop_label: form.shop_label.trim() || 'TBD unit',
      proposed_rent: form.proposed_rent,
      stage: 'Enquiry',
      probability: 20,
      expected_close: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
    });
    setShowAdd(false);
    setForm({ prospect_name: '', company: '', email: '', phone: '+268 ', shop_label: '', proposed_rent: 15000 });
    refresh();
    setNotice('Deal added to pipeline');
    setTimeout(() => setNotice(''), 3000);
  };

  const active = deals.filter((d) => d.stage !== 'Lost');
  const weighted = active
    .filter((d) => d.stage !== 'Signed')
    .reduce((s, d) => s + d.proposed_rent * (d.probability / 100), 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Kanban className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Leasing Pipeline</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enquiry → viewing → offer → lease. Weighted pipeline value:{' '}
            <strong className="text-slate-800 dark:text-slate-200">{fmt(Math.round(weighted))}/mo</strong>
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow"
        >
          <PlusCircle className="w-4 h-4" /> New prospect
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGES.filter((s) => s !== 'Lost').map((stage) => {
          const col = active.filter((d) => d.stage === stage);
          return (
            <div
              key={stage}
              className="min-w-[220px] w-[220px] flex-shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 p-3"
            >
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2 flex justify-between">
                <span>{stage}</span>
                <span className="text-slate-400">{col.length}</span>
              </div>
              <div className="space-y-2">
                {col.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2"
                  >
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{d.company}</div>
                    <div className="text-[10px] text-slate-500">{d.prospect_name}</div>
                    <div className="text-[10px] text-slate-500">{d.shop_label}</div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-600">{fmt(d.proposed_rent)}</span>
                      <span className="text-slate-400">{d.probability}%</span>
                    </div>
                    {stage !== 'Signed' && (
                      <div className="flex gap-1 pt-1">
                        <button
                          onClick={() => advance(d)}
                          className="flex-1 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center gap-0.5"
                        >
                          Advance <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => markLost(d)}
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-[10px] text-slate-500"
                        >
                          Lost
                        </button>
                      </div>
                    )}
                    {stage === 'Signed' && (
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Converted to lease
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAdd}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xl text-xs"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">New pipeline deal</h3>
              <button type="button" onClick={() => setShowAdd(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {(['prospect_name', 'company', 'email', 'phone', 'shop_label'] as const).map((k) => (
              <div key={k}>
                <label className="font-semibold block mb-1 capitalize">{k.replace(/_/g, ' ')}</label>
                <input
                  required={k !== 'shop_label'}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                />
              </div>
            ))}
            <div>
              <label className="font-semibold block mb-1">Proposed monthly rent (E)</label>
              <input
                type="number"
                required
                value={form.proposed_rent}
                onChange={(e) => setForm({ ...form, proposed_rent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl">
                Add deal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
