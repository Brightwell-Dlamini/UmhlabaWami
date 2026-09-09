import React, { useMemo, useState } from 'react';
import {
  Rocket,
  Camera,
  Bell,
  Banknote,
  FileText,
  RefreshCw,
  Building2,
  Wrench,
  QrCode,
  Truck,
  ClipboardList,
  Package,
  Brain,
  TrendingUp,
  MessageSquare,
  Star,
  Webhook,
  Shield,
  Users,
  HeartPulse,
  Download,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { phase7 } from '../../services/phase7Service';
import { auth } from '../../services/auth';
import { db } from '../../services/db';

type Tab =
  | 'overview'
  | 'photos'
  | 'alerts'
  | 'payments'
  | 'invoices'
  | 'renewals'
  | 'cam'
  | 'field'
  | 'qr'
  | 'vendors'
  | 'handover'
  | 'assets'
  | 'predictive'
  | 'pricing'
  | 'nl'
  | 'narrative'
  | 'benchmarks'
  | 'csat'
  | 'webhooks'
  | 'popia'
  | 'access'
  | 'dr';

const TABS: { id: Tab; label: string; icon: React.ElementType; theme: string }[] = [
  { id: 'overview', label: 'Overview', icon: Rocket, theme: 'All' },
  { id: 'photos', label: 'Photos', icon: Camera, theme: 'A' },
  { id: 'alerts', label: 'Alerts', icon: Bell, theme: 'A' },
  { id: 'payments', label: 'Payments', icon: Banknote, theme: 'B' },
  { id: 'invoices', label: 'Invoices', icon: FileText, theme: 'B' },
  { id: 'renewals', label: 'Renewals', icon: RefreshCw, theme: 'B' },
  { id: 'cam', label: 'CAM', icon: Building2, theme: 'B' },
  { id: 'field', label: 'Field jobs', icon: Wrench, theme: 'C' },
  { id: 'qr', label: 'Unit QR', icon: QrCode, theme: 'C' },
  { id: 'vendors', label: 'Vendors', icon: Truck, theme: 'C' },
  { id: 'handover', label: 'Handover', icon: ClipboardList, theme: 'C' },
  { id: 'assets', label: 'Assets', icon: Package, theme: 'C' },
  { id: 'predictive', label: 'Predictive', icon: Brain, theme: 'D' },
  { id: 'pricing', label: 'Pricing', icon: TrendingUp, theme: 'D' },
  { id: 'nl', label: 'NL ops', icon: MessageSquare, theme: 'D' },
  { id: 'narrative', label: 'Narrative', icon: FileText, theme: 'D' },
  { id: 'benchmarks', label: 'Benchmarks', icon: TrendingUp, theme: 'D' },
  { id: 'csat', label: 'CSAT', icon: Star, theme: 'E' },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook, theme: 'F' },
  { id: 'popia', label: 'POPIA', icon: Shield, theme: 'G' },
  { id: 'access', label: 'Access', icon: Users, theme: 'G' },
  { id: 'dr', label: 'DR', icon: HeartPulse, theme: 'G' },
];

function downloadText(filename: string, content: string, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const Phase7ElevateView: React.FC<{ onViewTicket?: (id: string) => void }> = ({
  onViewTicket,
}) => {
  const user = auth.getCurrentUser();
  const orgId = user?.role === 'super_admin' ? undefined : user?.organization_id;
  const orgIdSolid = user?.organization_id || 'org_gables_lifestyle';
  const [tab, setTab] = useState<Tab>('overview');
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const summary = useMemo(() => phase7.elevateSummary(orgId), [orgId, tick]);

  // local form state
  const [photoTicketId, setPhotoTicketId] = useState('');
  const [payAmount, setPayAmount] = useState('5000');
  const [payRef, setPayRef] = useState('MOMO-G14-202609');
  const [handoverBody, setHandoverBody] = useState('');
  const [nlQuery, setNlQuery] = useState('emergency open tickets older than 1 hour');
  const [nlResult, setNlResult] = useState<ReturnType<typeof phase7.naturalLanguageOps> | null>(null);
  const [csatTicket, setCsatTicket] = useState('');
  const [csatScore, setCsatScore] = useState(5);
  const [popiaName, setPopiaName] = useState('');
  const [popiaEmail, setPopiaEmail] = useState('');
  const [notice, setNotice] = useState('');

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
    refresh();
  };

  const openTickets = (orgId
    ? db.tickets.filter((t) => t.organization_id === orgId)
    : db.tickets
  ).filter((t) => !['Resolved', 'Closed', 'Cancelled'].includes(t.status));

  return (
    <div className="space-y-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Phase 7 — Elevate
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System-wide excellence · Themes A–G · Demo-ready contracts for production cutover
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
        >
          Refresh
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
              tab === t.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600'
            }`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
            <span className="opacity-60">{t.theme}</span>
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Photos stored', value: summary.photos },
            { label: 'Alert outbox', value: summary.outbox },
            { label: 'Payments', value: summary.payments },
            { label: 'Invoices', value: summary.invoices },
            { label: 'Upcoming renewals', value: summary.renewals },
            { label: 'Assets needing service', value: summary.assets },
            { label: 'Predictive actions', value: summary.predictive },
            { label: 'CSAT avg', value: summary.csat_avg ?? '—' },
          ].map((c) => (
            <div
              key={c.label}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">{c.label}</div>
              <div className="text-xl font-extrabold mt-1">{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* A PHOTOS */}
      {tab === 'photos' && (
        <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <p className="text-slate-500">Attach before/after evidence to a ticket (stored as compressed data URL in demo).</p>
          <select
            value={photoTicketId}
            onChange={(e) => setPhotoTicketId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
          >
            <option value="">Select ticket…</option>
            {openTickets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.ticket_number} — {t.title}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file || !photoTicketId) return;
              const reader = new FileReader();
              reader.onload = () => {
                const data_url = String(reader.result).slice(0, 120000); // soft limit
                phase7.addPhoto({
                  ticket_id: photoTicketId,
                  organization_id: orgId,
                  kind: 'evidence',
                  data_url,
                  created_by: user?.name,
                });
                flash('Photo attached to ticket');
              };
              reader.readAsDataURL(file);
            }}
          />
          {photoTicketId && (
            <div className="flex flex-wrap gap-2">
              {phase7.listPhotos(photoTicketId).map((p) => (
                <img key={p.id} src={p.data_url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* A ALERTS */}
      {tab === 'alerts' && (
        <div className="space-y-3">
          <button
            onClick={() => {
              phase7.notifyEmergencyTickets(orgId);
              flash('Emergency SMS/email alerts queued (demo sent)');
            }}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
          >
            Dispatch alerts for open emergencies
          </button>
          <ul className="space-y-2">
            {phase7.listOutbox().slice(0, 15).map((o) => (
              <li key={o.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800">
                <div className="font-bold">
                  {o.channel.toUpperCase()} · {o.status} · {o.priority}
                </div>
                <div className="text-slate-500">{o.to} — {o.subject}</div>
                <div className="mt-1">{o.body}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* B PAYMENTS */}
      {tab === 'payments' && (
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border space-y-2">
            <div className="font-bold">Record MoMo / EFT payment</div>
            <input
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
              placeholder="Amount"
            />
            <input
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
              placeholder="MOMO-UNIT-PERIOD"
            />
            <button
              onClick={() => {
                const tenant = db.tenants.find((t) => t.organization_id === orgIdSolid) || db.tenants[0];
                const shop = db.shops.find((s) => s.id === tenant?.shop_id) || db.shops[0];
                phase7.recordPayment({
                  organization_id: orgIdSolid,
                  tenant_id: tenant?.id || 't1',
                  shop_id: shop?.id || 's1',
                  amount: Number(payAmount) || 0,
                  method: payRef.startsWith('MOMO') ? 'MTN_MoMo' : 'EFT',
                  reference: payRef,
                  period: new Date().toISOString().slice(0, 7),
                });
                flash('Payment recorded');
              }}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl"
            >
              Record payment
            </button>
          </div>
          <ul className="space-y-1">
            {phase7.listPayments(orgId).map((p) => (
              <li key={p.id} className="p-2 rounded-lg border text-xs flex justify-between">
                <span>
                  {p.method} · {p.reference}
                </span>
                <span className="font-bold">
                  E{p.amount} · {p.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* B INVOICES */}
      {tab === 'invoices' && (
        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadText('statements.csv', phase7.exportStatementCsv(orgId))}
              className="px-3 py-2 rounded-xl border font-bold flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Statements CSV
            </button>
            <button
              onClick={() => downloadText('sage-journals.csv', phase7.exportSageCsv(orgId))}
              className="px-3 py-2 rounded-xl border font-bold flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Sage journals
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                <tr>
                  <th className="p-2">Period</th>
                  <th className="p-2">Tenant</th>
                  <th className="p-2">Shop</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {phase7.listInvoices(orgId).map((i) => (
                  <tr key={i.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="p-2">{i.period}</td>
                    <td className="p-2">{i.business_name}</td>
                    <td className="p-2">{i.shop_number}</td>
                    <td className="p-2 font-bold">E{i.total.toLocaleString()}</td>
                    <td className="p-2">{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* B RENEWALS */}
      {tab === 'renewals' && (
        <ul className="space-y-2 text-xs">
          {phase7.listRenewals(orgId).map((r) => (
            <li key={r.id} className="p-3 rounded-xl border bg-white dark:bg-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-bold">
                  {r.tenant_name} · {r.shop_number}
                </div>
                <div className="text-slate-500">
                  Ends {r.current_end} → {r.proposed_end} · +{r.escalation_pct}% → E{r.proposed_rent.toLocaleString()}
                </div>
                <div className="text-[10px]">Reminders: {r.reminder_days.join('/')} days · {r.status}</div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    phase7.advanceRenewal(r.id, 'offered');
                    flash('Renewal offered');
                  }}
                  className="px-2 py-1 bg-blue-600 text-white rounded-lg font-bold"
                >
                  Offer
                </button>
                <button
                  onClick={() => {
                    phase7.advanceRenewal(r.id, 'accepted');
                    flash('Renewal accepted');
                  }}
                  className="px-2 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Accept
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* B CAM */}
      {tab === 'cam' && (
        <div className="space-y-3 text-xs">
          <button
            onClick={() => {
              const draft = phase7.buildCamDraft(orgIdSolid);
              phase7.postCam(draft);
              flash('CAM pool posted');
            }}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl"
          >
            Build & post CAM allocation
          </button>
          {phase7.listCam(orgId).map((c) => (
            <div key={c.id} className="p-4 rounded-2xl border bg-white dark:bg-slate-800">
              <div className="font-bold">
                {c.period} · E{c.total_pool.toLocaleString()} · {c.status}
              </div>
              <p className="text-slate-500">{c.description}</p>
              <ul className="mt-2 space-y-1">
                {c.allocations.slice(0, 12).map((a) => (
                  <li key={a.shop_id} className="flex justify-between">
                    <span>{a.shop_number}</span>
                    <span>
                      {a.share_pct}% · E{a.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* C FIELD */}
      {tab === 'field' && (
        <ul className="space-y-2 text-xs">
          {openTickets.slice(0, 10).map((t) => {
            const job = phase7.getFieldJob(t.id);
            return (
              <li key={t.id} className="p-3 rounded-xl border bg-white dark:bg-slate-800">
                <div className="font-bold">{t.ticket_number} — {t.title}</div>
                <div className="text-slate-500">Field status: {job.status}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(['en_route', 'on_site', 'completed'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        phase7.updateFieldJob(t.id, {
                          status: s,
                          parts_used: s === 'completed' ? 'Sealant, washer' : job.parts_used,
                          signature_name: s === 'completed' ? user?.name : undefined,
                        });
                        flash(`Job ${s}`);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 font-semibold"
                    >
                      {s}
                    </button>
                  ))}
                  <button onClick={() => onViewTicket?.(t.id)} className="px-2 py-1 text-blue-600 font-bold">
                    Open
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* C QR */}
      {tab === 'qr' && (
        <div className="space-y-2 text-xs">
          <p className="text-slate-500">Unit QR payloads (encode on printed labels). Scan/parse by pasting payload or shop number.</p>
          {(orgId ? db.shops.filter((s) => s.organization_id === orgId) : db.shops).slice(0, 8).map((s) => (
            <div key={s.id} className="p-3 rounded-xl border bg-white dark:bg-slate-800 flex justify-between gap-2">
              <div>
                <div className="font-bold">{s.shop_number}</div>
                <code className="text-[10px] break-all text-slate-500">{phase7.unitQrPayload(s)}</code>
              </div>
            </div>
          ))}
          <input
            placeholder="Paste QR JSON or shop number"
            className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const shop = phase7.resolveUnitQr((e.target as HTMLInputElement).value);
                flash(shop ? `Resolved unit ${shop.shop_number}` : 'Unit not found');
              }
            }}
          />
        </div>
      )}

      {/* C VENDORS */}
      {tab === 'vendors' && (
        <div className="overflow-x-auto rounded-2xl border text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="p-2">Vendor</th>
                <th className="p-2">Jobs</th>
                <th className="p-2">On-time %</th>
                <th className="p-2">Reopens</th>
                <th className="p-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {phase7.vendorScorecards(orgId).map((v) => (
                <tr key={v.vendor.id} className="border-t">
                  <td className="p-2 font-semibold">{v.vendor.company_name}</td>
                  <td className="p-2">{v.jobs}</td>
                  <td className="p-2">{v.on_time_pct}%</td>
                  <td className="p-2">{v.reopen_count}</td>
                  <td className="p-2 font-bold">{v.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* C HANDOVER */}
      {tab === 'handover' && (
        <div className="space-y-3 text-xs">
          <textarea
            rows={3}
            value={handoverBody}
            onChange={(e) => setHandoverBody(e.target.value)}
            placeholder="Shift handover notes…"
            className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
          />
          <button
            onClick={() => {
              if (!handoverBody.trim()) return;
              phase7.addHandover({
                organization_id: orgIdSolid,
                shift_label: 'Evening',
                author_name: user?.name || 'Staff',
                body: handoverBody,
              });
              setHandoverBody('');
              flash('Handover saved');
            }}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl"
          >
            Save handover
          </button>
          <ul className="space-y-2">
            {phase7.listHandovers(orgId).map((h) => (
              <li key={h.id} className="p-3 rounded-xl border">
                <div className="font-bold">
                  {h.shift_label} · {h.author_name}
                </div>
                <div className="text-slate-500 text-[10px]">{new Date(h.created_at).toLocaleString()}</div>
                <p className="mt-1">{h.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* C ASSETS */}
      {tab === 'assets' && (
        <ul className="space-y-2 text-xs">
          {phase7.listAssets(orgId).map((a) => (
            <li key={a.id} className="p-3 rounded-xl border flex justify-between gap-2 bg-white dark:bg-slate-800">
              <div>
                <div className="font-bold">{a.name}</div>
                <div className="text-slate-500">
                  {a.category} · {a.location} · Next service {a.next_service || '—'}
                </div>
              </div>
              <span
                className={`self-start px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  a.status === 'Operational'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {a.status}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* D PREDICTIVE */}
      {tab === 'predictive' && (
        <ul className="space-y-2 text-xs">
          {phase7.predictiveActions(orgId).map((a) => (
            <li key={a.id} className="p-3 rounded-xl border bg-white dark:bg-slate-800">
              <div className="font-bold">{a.title}</div>
              <p className="text-slate-500">{a.detail}</p>
              <button
                onClick={() => {
                  try {
                    phase7.createPmFromPrediction(orgIdSolid, a.title);
                  } catch {
                    /* ops may not expose create */
                  }
                  flash(`Suggested: ${a.suggested}`);
                }}
                className="mt-2 text-blue-600 font-bold"
              >
                {a.suggested} →
              </button>
            </li>
          ))}
          {!phase7.predictiveActions(orgId).length && (
            <p className="text-slate-500">No predictive actions right now.</p>
          )}
        </ul>
      )}

      {/* D PRICING */}
      {tab === 'pricing' && (
        <ul className="space-y-2 text-xs">
          {phase7.vacancyPricingAssist(orgId).map((p) => (
            <li key={p.shop.id} className="p-3 rounded-xl border flex justify-between">
              <div>
                <div className="font-bold">{p.shop.shop_number}</div>
                <div className="text-slate-500">{p.basis}</div>
              </div>
              <div className="text-right font-bold">
                E{p.suggested_rent.toLocaleString()}
                <div className="text-[10px] font-normal text-slate-500">
                  Band E{p.low.toLocaleString()}–E{p.high.toLocaleString()}
                </div>
              </div>
            </li>
          ))}
          {!phase7.vacancyPricingAssist(orgId).length && (
            <p className="text-slate-500">No vacant units.</p>
          )}
        </ul>
      )}

      {/* D NL */}
      {tab === 'nl' && (
        <div className="space-y-3 text-xs">
          <div className="flex gap-2">
            <input
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
            />
            <button
              onClick={() => setNlResult(phase7.naturalLanguageOps(nlQuery, orgId))}
              className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-1"
            >
              <Play className="w-3 h-3" /> Run
            </button>
          </div>
          {nlResult && (
            <ul className="space-y-1">
              {nlResult.tickets.map((t) => (
                <li key={t.id}>
                  <button onClick={() => onViewTicket?.(t.id)} className="text-left font-semibold text-blue-600">
                    {t.ticket_number} · {t.priority} · {t.title}
                  </button>
                </li>
              ))}
              {!nlResult.tickets.length && <li className="text-slate-500">No matching tickets</li>}
            </ul>
          )}
        </div>
      )}

      {/* D NARRATIVE */}
      {tab === 'narrative' && (
        <div className="space-y-3 text-xs">
          <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 whitespace-pre-wrap text-[11px] leading-relaxed">
            {phase7.boardPackNarrative(orgId)}
          </pre>
          <button
            onClick={() =>
              downloadText(
                `board-narrative-${new Date().toISOString().slice(0, 10)}.txt`,
                phase7.boardPackNarrative(orgId),
                'text/plain'
              )
            }
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl"
          >
            Download narrative
          </button>
        </div>
      )}

      {/* D BENCHMARKS */}
      {tab === 'benchmarks' && (
        <div className="overflow-x-auto rounded-2xl border text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="p-2">Organisation</th>
                <th className="p-2">Occupancy</th>
                <th className="p-2">SLA %</th>
                <th className="p-2">Collection</th>
                <th className="p-2">Health</th>
              </tr>
            </thead>
            <tbody>
              {phase7.portfolioBenchmarks().map((b) => (
                <tr key={b.code} className="border-t">
                  <td className="p-2 font-semibold">{b.organization}</td>
                  <td className="p-2">{b.occupancy}%</td>
                  <td className="p-2">{b.sla}%</td>
                  <td className="p-2">{b.collection}%</td>
                  <td className="p-2 font-bold">{b.health}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* E CSAT */}
      {tab === 'csat' && (
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-800 space-y-2">
            <div className="font-bold">Average CSAT: {summary.csat_avg ?? 'No ratings yet'}</div>
            <select
              value={csatTicket}
              onChange={(e) => setCsatTicket(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
            >
              <option value="">Ticket…</option>
              {db.tickets
                .filter((t) => ['Resolved', 'Closed'].includes(t.status))
                .slice(0, 20)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.ticket_number}
                  </option>
                ))}
            </select>
            <input
              type="range"
              min={1}
              max={5}
              value={csatScore}
              onChange={(e) => setCsatScore(Number(e.target.value))}
              className="w-full"
            />
            <div>Score: {csatScore}</div>
            <button
              onClick={() => {
                if (!csatTicket) return;
                phase7.submitCsat({
                  ticket_id: csatTicket,
                  organization_id: orgId,
                  score: csatScore,
                });
                flash('CSAT submitted');
              }}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl"
            >
              Submit rating
            </button>
          </div>
        </div>
      )}

      {/* F WEBHOOKS */}
      {tab === 'webhooks' && (
        <div className="space-y-3 text-xs">
          <button
            onClick={() => {
              phase7.simulateWebhookDelivery(orgIdSolid, 'ticket.created', {
                ticket_number: 'DEMO-001',
              });
              flash('Webhook delivery simulated');
            }}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl"
          >
            Simulate delivery
          </button>
          <ul className="space-y-2">
            {phase7.listWebhookDeliveries(orgId).map((w) => (
              <li key={w.id} className="p-3 rounded-xl border">
                <div className="font-bold">
                  {w.event} · {w.status} · attempts {w.attempts}
                </div>
                <div className="text-slate-500">{w.url}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* G POPIA */}
      {tab === 'popia' && (
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl border space-y-2 bg-white dark:bg-slate-800">
            <input
              value={popiaName}
              onChange={(e) => setPopiaName(e.target.value)}
              placeholder="Subject name"
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
            />
            <input
              value={popiaEmail}
              onChange={(e) => setPopiaEmail(e.target.value)}
              placeholder="Subject email"
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  phase7.createPopiaRequest({
                    organization_id: orgId,
                    subject_name: popiaName,
                    subject_email: popiaEmail,
                    type: 'export',
                  });
                  flash('Export request logged');
                }}
                className="px-3 py-2 bg-blue-600 text-white font-bold rounded-xl"
              >
                Request export
              </button>
              <button
                onClick={() => {
                  phase7.createPopiaRequest({
                    organization_id: orgId,
                    subject_name: popiaName,
                    subject_email: popiaEmail,
                    type: 'deletion',
                  });
                  flash('Deletion request logged');
                }}
                className="px-3 py-2 bg-red-600 text-white font-bold rounded-xl"
              >
                Request deletion
              </button>
              <button
                onClick={() => {
                  const data = phase7.exportSubjectData(popiaEmail);
                  downloadText('popia-export.json', JSON.stringify(data, null, 2), 'application/json');
                  flash('Subject data downloaded');
                }}
                className="px-3 py-2 border font-bold rounded-xl"
              >
                Download data
              </button>
            </div>
          </div>
          <ul className="space-y-1">
            {phase7.listPopia(orgId).map((p) => (
              <li key={p.id} className="p-2 rounded-lg border flex justify-between">
                <span>
                  {p.type} · {p.subject_name} · {p.status}
                </span>
                {p.status !== 'completed' && (
                  <button
                    onClick={() => {
                      phase7.advancePopia(p.id, 'completed');
                      flash('Marked completed');
                    }}
                    className="text-blue-600 font-bold"
                  >
                    Complete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* G ACCESS */}
      {tab === 'access' && (
        <div className="overflow-x-auto rounded-2xl border text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Role</th>
                <th className="p-2">Status</th>
                <th className="p-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              {phase7.accessReview(orgId).map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2 font-semibold">{u.name}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.status}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.risk === 'elevated'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* G DR */}
      {tab === 'dr' && (
        <ul className="space-y-2 text-xs">
          {phase7.disasterRecoveryStatus().map((item) => (
            <li key={item.id}>
              <label className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer bg-white dark:bg-slate-800">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => {
                    phase7.toggleDrItem(item.id);
                    refresh();
                  }}
                />
                <span className={item.done ? 'line-through text-slate-400' : 'font-semibold'}>
                  {item.item}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
