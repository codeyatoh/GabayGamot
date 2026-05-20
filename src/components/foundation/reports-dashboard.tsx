import Link from "next/link";
import type { ComponentType } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ClipboardList,
  FileText,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import {
  centerName,
  medicineName,
  REPORT_EXPORT_TYPES,
  type OperationalReport,
  type ReportExportType,
} from "@/lib/reports/operational-reports";

const exportLabels: Record<ReportExportType, string> = {
  inventory: "Inventory CSV",
  dispensing: "Dispensing CSV",
  referrals: "Referrals CSV",
  consultations: "Consultations CSV",
  audit: "Audit Trail CSV",
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function MetricCard({
  label,
  value,
  helper,
  tone = "blue",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  tone?: "blue" | "amber" | "rose" | "teal";
  icon: ComponentType<{ className?: string }>;
}) {
  const tones = {
    blue: "border-[#E2E8F0] bg-white text-[#2563EB] dark:border-white/10 dark:bg-[#111827] dark:text-[#60A5FA]",
    amber: "border-amber-100 bg-amber-50/20 text-amber-600 dark:border-amber-950/20 dark:bg-amber-950/5 dark:text-amber-400",
    rose: "border-rose-100 bg-rose-50/20 text-rose-600 dark:border-rose-950/20 dark:bg-rose-950/5 dark:text-rose-400",
    teal: "border-teal-100 bg-teal-50/20 text-teal-600 dark:border-teal-950/20 dark:bg-teal-950/5 dark:text-teal-400",
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${tones[tone]}`}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-white/70 dark:bg-white/5">
          <Icon className="size-5" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
          {label}
        </p>
      </div>
      <p className="mt-4 text-3xl font-extrabold text-[#1E293B] dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">{helper}</p>
    </div>
  );
}

function exportHref(report: OperationalReport, type: ReportExportType) {
  const params = new URLSearchParams({
    scope: report.scope,
    type,
    days: String(report.rangeDays),
  });

  return `/api/reports/export?${params.toString()}`;
}

export function ReportsDashboard({ report }: { report: OperationalReport }) {
  const isGlobal = report.scope === "global";
  const generatedTime = Date.parse(report.generatedAt);
  const topInventoryRisks = report.inventoryRows
    .filter((row) => row.quantity <= 50 || new Date(row.expiry_date).getTime() < generatedTime)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2563EB] dark:text-[#60A5FA]">
              Phase 17 Reporting
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#1E293B] dark:text-slate-100">
              {isGlobal ? "Global Reports, Audit Trail, and Exports" : "Health Center Reports, Audit Trail, and Exports"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#64748B] dark:text-slate-400">
              This page summarizes the current operational records and provides simple CSV exports for hackathon-ready review. The audit timeline uses saved audit events when available and falls back to existing timestamped operational records.
            </p>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs text-[#64748B] dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            Generated: <span className="font-semibold text-[#1E293B] dark:text-slate-200">{formatDateTime(report.generatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={ClipboardList}
          label="Consultations"
          value={report.metrics.consultations}
          helper={`Last ${report.rangeDays} days`}
        />
        <MetricCard
          icon={Activity}
          label="Dispensing"
          value={report.metrics.dispenseEvents}
          helper={`${report.metrics.dispensedUnits} units released`}
          tone="teal"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Inventory Risk"
          value={report.metrics.lowStockBatches + report.metrics.expiringSoonBatches + report.metrics.expiredBatches}
          helper={`${report.metrics.lowStockBatches} low, ${report.metrics.expiringSoonBatches} expiring, ${report.metrics.expiredBatches} expired`}
          tone="amber"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Referral Status"
          value={report.metrics.referrals}
          helper={`${report.metrics.pendingReferrals} pending, ${report.metrics.completedReferrals} completed`}
          tone="rose"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#1E293B] dark:text-slate-100">CSV Exports</h3>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                Exports use the same authorization as the reports page.
              </p>
            </div>
            <ArrowDownToLine className="size-5 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {REPORT_EXPORT_TYPES.map((type) => (
              <Link
                key={type}
                href={exportHref(report, type)}
                className="group rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm font-bold text-[#1E293B] transition hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#2563EB] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20"
              >
                <span className="flex items-center justify-between gap-3">
                  {exportLabels[type]}
                  <ArrowDownToLine className="size-4 text-[#94A3B8] transition group-hover:text-[#2563EB]" />
                </span>
                <span className="mt-1 block text-xs font-medium text-[#64748B] dark:text-slate-400">
                  Download filtered {type} data
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
              <Stethoscope className="size-5" />
            </span>
            <div>
              <h3 className="font-bold text-[#1E293B] dark:text-slate-100">Top Illness Signals</h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Aggregated only, no patient names.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {report.topIllnesses.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#CBD5E1] p-4 text-sm text-[#64748B] dark:border-white/20 dark:text-slate-400">
                No consultation or dispensing illness data yet.
              </p>
            ) : (
              report.topIllnesses.map((item) => (
                <div key={item.illness} className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] px-4 py-3 dark:border-white/10">
                  <span className="text-sm font-semibold text-[#1E293B] dark:text-slate-200">{item.illness}</span>
                  <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-bold text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                    {item.count} records
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {report.unavailableSources.length > 0 && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200">
          Some report sources are not available yet: {report.unavailableSources.join("; ")}
        </div>
      )}

      <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-[#1E293B] dark:text-slate-100">Audit Trail</h3>
            <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
              Shows saved audit events first, then derived operational activity as fallback.
            </p>
          </div>
          <FileText className="size-5 text-[#64748B] dark:text-slate-400" />
        </div>
        <div className="mt-5 divide-y divide-[#E2E8F0] dark:divide-white/5">
          {report.auditTimeline.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#64748B] dark:text-slate-400">
              No audit or operational activity found for this report range yet.
            </p>
          ) : (
            report.auditTimeline.slice(0, 12).map((event) => (
              <div key={event.id} className="grid gap-3 py-4 sm:grid-cols-[170px_1fr_auto] sm:items-center">
                <div className="text-xs text-[#64748B] dark:text-slate-400">{formatDateTime(event.createdAt)}</div>
                <div>
                  <p className="text-sm font-semibold text-[#1E293B] dark:text-slate-200">{event.summary}</p>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                    {event.centerName} - {event.entityType} - {event.actorRole}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-bold capitalize text-[#64748B] dark:bg-white/5 dark:text-slate-300">
                  {event.source === "audit_events" ? "saved audit" : "derived"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
        <h3 className="font-bold text-[#1E293B] dark:text-slate-100">Inventory Risk Snapshot</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-xs uppercase tracking-wider text-[#64748B] dark:border-white/5 dark:text-slate-400">
                <th className="pb-3 pr-4">Center</th>
                <th className="pb-3 px-4">Medicine</th>
                <th className="pb-3 px-4">Batch</th>
                <th className="pb-3 px-4 text-center">Qty</th>
                <th className="pb-3 pl-4 text-right">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-white/5">
              {topInventoryRisks.length === 0 ? (
                <tr>
                  <td className="py-8 text-center text-[#64748B] dark:text-slate-400" colSpan={5}>
                    No low-stock or expired inventory risks found.
                  </td>
                </tr>
              ) : (
                topInventoryRisks.map((row) => (
                  <tr key={row.id}>
                    <td className="py-4 pr-4 text-xs font-semibold text-[#1E293B] dark:text-slate-200">{centerName(row.health_centers)}</td>
                    <td className="py-4 px-4 text-xs text-[#64748B] dark:text-slate-400">{medicineName(row.medicine_master)}</td>
                    <td className="py-4 px-4 text-xs text-[#64748B] dark:text-slate-400">{row.batch_number}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">
                        {row.quantity} {row.unit}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right text-xs text-[#64748B] dark:text-slate-400">{row.expiry_date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
