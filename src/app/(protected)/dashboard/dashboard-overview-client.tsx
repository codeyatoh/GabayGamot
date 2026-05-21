"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeftRight,
  Camera,
  ChevronRight,
  ClipboardList,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";

type BadgeVariant =
  | "outline"
  | "info-light"
  | "warning-light"
  | "success-light"
  | "destructive-light";

type InsightCard = {
  title: string;
  description: string;
  variant: BadgeVariant;
};

type ChartDatum = {
  name: string;
  value: number;
  fill: string;
};

type DashboardOverviewClientProps = {
  insightCards: readonly InsightCard[];
  actionCards: readonly InsightCard[];
  stockStatusData: readonly ChartDatum[];
  operationsData: readonly ChartDatum[];
};

function DashboardChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: readonly ChartDatum[];
}) {
  return (
    <div className="rounded-[28px] border border-[#E2E8F0] bg-[#F8FAFC] p-5 dark:border-white/10 dark:bg-[#0F172A]">
      <div className="max-w-md">
        <h4 className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">
          {title}
        </h4>
        <p className="mt-2 text-sm leading-6 text-[#64748B] dark:text-slate-400">
          {description}
        </p>
      </div>
      <div className="mt-5 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              horizontal
              vertical={false}
              stroke="#D9E4F2"
              strokeDasharray="3 3"
            />
            <XAxis
              type="number"
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={108}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#1E293B", fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(37, 99, 235, 0.08)" }}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid #D9E4F2",
                background: "#FFFFFF",
                boxShadow: "0 18px 45px -24px rgba(15, 23, 42, 0.35)",
              }}
              formatter={(value) => [value ?? 0, "Count"]}
            />
            <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DashboardCardGrid({
  cards,
  badgeLabel,
}: {
  cards: readonly InsightCard[];
  badgeLabel: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-[28px] border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827]"
        >
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">
              {card.title}
            </h4>
            <Badge variant={card.variant} size="xs">
              {badgeLabel}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#64748B] dark:text-slate-400">
            {card.description}
          </p>
        </article>
      ))}
    </div>
  );
}

export function DashboardOverviewClient({
  insightCards,
  actionCards,
  stockStatusData,
  operationsData,
}: DashboardOverviewClientProps) {
  return (
    <div className="grid gap-5">
      <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#2563EB] dark:text-[#93C5FD]">
              Insights board
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[#1E293B] dark:text-slate-100">
              Service signals at a glance
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B] dark:text-slate-400">
              This view focuses only on the health-center signals that help you
              decide what needs attention next.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/ai-insights">
                <Sparkles className="size-4" />
                Open Insights
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/scan">
                <Camera className="size-4" />
                Open Scan
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <DashboardChart
            title="Stock pressure overview"
            description="Batch-level pressure is grouped here so you can quickly see if stable stock is still larger than the items already at risk."
            data={stockStatusData}
          />
          <DashboardCardGrid cards={insightCards} badgeLabel="Insight" />
        </div>
      </section>

      <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#2563EB] dark:text-[#93C5FD]">
              Action board
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[#1E293B] dark:text-slate-100">
              What the team should do next
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B] dark:text-slate-400">
              These cards and activity bars keep referrals, dispensing, and
              consultation response work visible without repeating the inventory
              table again.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dispense">
                <Activity className="size-4" />
                Open Dispense
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/referrals">
                <ArrowLeftRight className="size-4" />
                Open Referrals
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <DashboardChart
            title="Operations pulse"
            description="Daily consultations, pending referrals, and supply pressure are grouped to show where manual follow-up may be needed."
            data={operationsData}
          />
          <DashboardCardGrid cards={actionCards} badgeLabel="Action" />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link
            href="/patients"
            className="group rounded-[24px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition hover:border-[#BFDBFE] hover:bg-[#EFF6FF] dark:border-white/10 dark:bg-[#0F172A] dark:hover:border-[#1D4ED8]/40 dark:hover:bg-[#111C2E]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">
                  Consultation flow
                </p>
                <p className="mt-2 text-sm leading-6 text-[#64748B] dark:text-slate-400">
                  Start or continue patient consultations before dispensing or
                  referral.
                </p>
              </div>
              <Stethoscope className="size-5 text-[#2563EB] dark:text-[#93C5FD]" />
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] dark:text-[#93C5FD]">
              Open patients
              <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link
            href="/reports"
            className="group rounded-[24px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition hover:border-[#BFDBFE] hover:bg-[#EFF6FF] dark:border-white/10 dark:bg-[#0F172A] dark:hover:border-[#1D4ED8]/40 dark:hover:bg-[#111C2E]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">
                  Reports and exports
                </p>
                <p className="mt-2 text-sm leading-6 text-[#64748B] dark:text-slate-400">
                  Review the summary view and export the latest operational
                  records when needed.
                </p>
              </div>
              <ClipboardList className="size-5 text-[#2563EB] dark:text-[#93C5FD]" />
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] dark:text-[#93C5FD]">
              Open reports
              <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link
            href="/ai-insights"
            className="group rounded-[24px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition hover:border-[#BFDBFE] hover:bg-[#EFF6FF] dark:border-white/10 dark:bg-[#0F172A] dark:hover:border-[#1D4ED8]/40 dark:hover:bg-[#111C2E]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1E293B] dark:text-slate-100">
                  Full AI explanation
                </p>
                <p className="mt-2 text-sm leading-6 text-[#64748B] dark:text-slate-400">
                  Open the dedicated insights workspace for deeper reasoning and
                  longer action recommendations.
                </p>
              </div>
              <Sparkles className="size-5 text-[#2563EB] dark:text-[#93C5FD]" />
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] dark:text-[#93C5FD]">
              Open AI insights
              <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
