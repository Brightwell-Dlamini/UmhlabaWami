import React from 'react';
import { X, Scale, Shield, Clock, BookOpen } from 'lucide-react';
import type { LegalPageId } from '../layout/Footer';

const DOCS: Record<
  LegalPageId,
  { title: string; icon: React.ComponentType<{ className?: string }>; sections: { h: string; p: string }[] }
> = {
  terms: {
    title: 'Commercial Terms',
    icon: Scale,
    sections: [
      {
        h: '1. Platform services',
        p: 'Umhlaba Wami provides multi-tenant software for commercial property management, vacancy listing, maintenance ticketing, and related operations in the Kingdom of Eswatini. Access is granted under an organisation subscription approved by the platform operator.',
      },
      {
        h: '2. Organisation accounts',
        p: 'Organisation administrators are responsible for staff accounts created under their organisation code, for accurate portfolio data, and for compliance with applicable lease and employment obligations.',
      },
      {
        h: '3. Acceptable use',
        p: 'You may not misuse the platform to harass occupants, publish false listings, circumvent access controls, or process unlawful content. We may suspend accounts that breach these terms or applicable law.',
      },
      {
        h: '4. Fees & billing',
        p: 'Subscription fees are agreed per organisation and tier. Integrated billing features support operational rent and deposit ledgers; third-party payment providers may be required for card or mobile money collection.',
      },
      {
        h: '5. Limitation of liability',
        p: 'The platform is provided as a management tool. We do not replace licensed legal, accounting, or facilities advice. Liability is limited to fees paid for the subscription period in which a claim arises, to the extent permitted by Eswatini law.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    sections: [
      {
        h: '1. Data we process',
        p: 'We process organisation profile data, user accounts (name, email, role), property portfolio records, tickets, and operational documents required to deliver the service.',
      },
      {
        h: '2. Purpose',
        p: 'Data is used to authenticate users, operate multi-tenant portals, support maintenance and leasing workflows, and improve platform reliability. We do not sell personal data.',
      },
      {
        h: '3. Storage & security',
        p: 'Application data is stored in Supabase (PostgreSQL) with row-level controls. Authentication credentials are handled by Supabase Auth. Access is restricted by organisation and role.',
      },
      {
        h: '4. Retention',
        p: 'Organisation data is retained while the account is active. Upon written closure request, we de-provision access and retain only records required for legal or accounting obligations.',
      },
      {
        h: '5. Contact',
        p: 'Privacy requests: contact@umhlabawami.sz. Kingdom of Eswatini HQ — Ezulwini Valley Commercial Park.',
      },
    ],
  },
  sla: {
    title: 'SLA Guarantee',
    icon: Clock,
    sections: [
      {
        h: '1. What an SLA means here',
        p: 'Service levels on Umhlaba Wami are operational targets configured per organisation for maintenance ticket response and resolution. They help managers and technicians prioritise work with visible countdowns.',
      },
      {
        h: '2. Default priority bands',
        p: 'Typical defaults: Emergency (fastest response), High, Medium, and Low. Organisations may customise the SLA matrix. “On-time leasing” targets support vacancy-to-lease operational discipline alongside facilities SLAs.',
      },
      {
        h: '3. Platform availability',
        p: 'We aim for continuous availability of the web application. Planned maintenance will be communicated where practical. Critical outages are addressed as a priority by the platform team.',
      },
      {
        h: '4. Exclusions',
        p: 'SLAs do not cover delays caused by third-party utilities, site access denial, force majeure, or incorrect ticket information supplied by users.',
      },
    ],
  },
  rent: {
    title: 'Eswatini Rent Regulations',
    icon: BookOpen,
    sections: [
      {
        h: '1. Purpose of this page',
        p: 'This summary is for operational awareness only. It is not legal advice. Always confirm obligations with a qualified practitioner and current Eswatini statutes and regulations.',
      },
      {
        h: '2. Commercial leases',
        p: 'Commercial tenancies are primarily governed by the written lease between landlord and tenant. Umhlaba Wami helps you store lease terms, escalations, deposits, and arrears — it does not create the legal relationship.',
      },
      {
        h: '3. Deposits & receipts',
        p: 'Good practice is to record deposits, issue receipts, and reconcile refunds or deductions against documented condition. The deposit ledger supports this operationally.',
      },
      {
        h: '4. Disputes',
        p: 'Rent and occupancy disputes should follow the dispute mechanisms in the lease and applicable dispute-resolution forums in Eswatini. Platform records can support your paper trail.',
      },
      {
        h: '5. Updates',
        p: 'Regulatory references may change. Review this page periodically and subscribe to official government notices for binding requirements.',
      },
    ],
  },
};

interface Props {
  page: LegalPageId;
  onClose: () => void;
}

export const LegalDocumentPage: React.FC<Props> = ({ page, onClose }) => {
  const doc = DOCS[page];
  const Icon = doc.icon;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 sm:p-8">
        <article className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6">
          <header className="flex items-start justify-between gap-3 p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">{doc.title}</h1>
                <p className="text-[11px] text-slate-500">Umhlaba Wami · Kingdom of Eswatini</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </header>
          <div className="p-6 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {doc.sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-slate-900 dark:text-white font-bold text-sm mb-1.5">{s.h}</h2>
                <p className="text-xs sm:text-sm">{s.p}</p>
              </section>
            ))}
          </div>
          <footer className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white"
            >
              Close
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
};
