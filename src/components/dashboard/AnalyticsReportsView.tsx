import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  Building,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  FileSpreadsheet,
} from 'lucide-react';
import { db } from '../../services/db';

export const AnalyticsReportsView: React.FC = () => {
  const [downloadNotice, setDownloadNotice] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return () => unsub();
  }, []);

  const handleExportReport = () => {
    const csvContent =
      'Metric,Value,Target,Status\n' +
      'SLA_Emergency_Compliance,96.4%,95.0%,Exceeding\n' +
      'Average_Resolution_Time_Hours,2.4,4.0,Optimal\n' +
      'Commercial_Occupancy_Rate,92.8%,90.0%,Healthy\n' +
      'Rent_Collection_Efficiency,88.5%,85.0%,Compliant\n' +
      'Open_Tickets_Total,2,5,Normal\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Umhlaba_Wami_SLA_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice('Executive KPI & SLA performance report downloaded successfully.');
    setTimeout(() => setDownloadNotice(''), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              SLA Analytics & Executive Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time facilities performance metrics, vendor benchmarks, and occupancy trends
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export KPI Report (CSV)</span>
        </button>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Emergency SLA Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">96.4%</div>
          <div className="text-[11px] text-slate-400">Avg 11.2 min response (Target: 15m)</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Avg Resolution Time</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.4 hrs</div>
          <div className="text-[11px] text-slate-400">Down 28% from last month</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Commercial Occupancy</span>
            <Building className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">92.8%</div>
          <div className="text-[11px] text-slate-400">18 units active • 2 available</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">On-Time Collections</span>
            <TrendingUp className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">88.5%</div>
          <div className="text-[11px] text-slate-400">E 216,040 collected this cycle</div>
        </div>
      </div>

      {/* Category Breakdown & Performance Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume by Category */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Maintenance Category Breakdown
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Air Conditioning & HVAC</span>
                <span className="text-slate-900 dark:text-white">35% (7 tickets)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Plumbing & Water Supply</span>
                <span className="text-slate-900 dark:text-white">28% (5 tickets)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Electrical & Power</span>
                <span className="text-slate-900 dark:text-white">22% (4 tickets)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '22%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Structural, Doors & Signage</span>
                <span className="text-slate-900 dark:text-white">15% (3 tickets)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Contractor Performance Index */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Contractor SLA Benchmark Index
          </h2>

          <div className="space-y-3">
            {db.vendors.slice(0, 4).map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{v.company_name}</div>
                  <div className="text-[11px] text-slate-500">{v.service_category}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    ★ {v.performance_rating} / 5.0
                  </div>
                  <div className="text-[10px] text-slate-400">Response SLA: 100%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
