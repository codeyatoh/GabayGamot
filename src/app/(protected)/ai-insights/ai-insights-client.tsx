"use client";

import { useState, type ReactNode } from "react";
import { AlertOctagon, ArrowRight, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";

import type { ActionableInsight, InsightScope, InsightSeverity } from "@/types/ai-insights";
import { NOT_ENOUGH_INSIGHT_DATA_MESSAGE } from "@/types/ai-insights";
import { Button } from "@/components/ui/button";

type InsightApiResponse = {
  insights?: ActionableInsight[];
  message?: string | null;
  error?: string;
  source?: string;
  model?: string;
  storage?: string;
};

type AiInsightsClientProps = {
  scope?: InsightScope;
};

const severityClasses: Record<InsightSeverity, string> = {
  low: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/30 dark:bg-cyan-950/20 dark:text-cyan-300",
  medium: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300",
  high: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300",
};

const severityIcons: Record<InsightSeverity, ReactNode> = {
  low: <Sparkles className="size-5 text-cyan-600 dark:text-cyan-300" />,
  medium: <AlertOctagon className="size-5 text-amber-600 dark:text-amber-300" />,
  high: <ShieldAlert className="size-5 text-red-600 dark:text-red-300" />,
};

function formatGeneratedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function InsightSection({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className={emphasis ? "rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 dark:border-white/10 dark:bg-white/5" : ""}>
      <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#64748B] dark:text-slate-400">
        {label}
      </h4>
      <p className={`mt-2 text-sm leading-relaxed ${emphasis ? "font-semibold text-[#1E293B] dark:text-slate-100" : "text-[#334155] dark:text-slate-300"}`}>
        {value}
      </p>
    </div>
  );
}

function RelatedChip({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
      {label}: {value}
    </span>
  );
}

export function AiInsightsClient({ scope = "local" }: AiInsightsClientProps) {
  const [result, setResult] = useState<InsightApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const insights = result?.insights ?? [];
  const isGlobal = scope === "global";
  const emptyMessage = result?.message ?? NOT_ENOUGH_INSIGHT_DATA_MESSAGE;

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const payload = (await response.json()) as InsightApiResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate AI insights right now.");
      }

      setResult(payload);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to generate AI insights right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-500/10 via-teal-500/5 to-transparent p-6 dark:border-cyan-950/30">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0891B2] text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="size-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-700 dark:text-cyan-300">
                Decision Support
              </p>
              <h2 className="mt-2 text-xl font-bold text-cyan-950 dark:text-cyan-100">
                {isGlobal ? "Global Actionable AI Insights" : "Actionable AI Insights"}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cyan-800 dark:text-cyan-300/85">
                Gemini reviews aggregated consultations, illness trends, inventory, dispensing, and referral movement to explain what is happening, why it matters, and what practical next step health workers should consider.
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-cyan-800/80 dark:text-cyan-300/80">
                AI explains trends only. It does not diagnose patients or prescribe medicine.
              </p>
            </div>
          </div>

          <Button
            onClick={handleGenerateInsights}
            disabled={isLoading}
            size="lg"
            className="rounded-2xl px-5 shadow-lg shadow-blue-500/10"
          >
            {isLoading ? "Analyzing data..." : "Generate Insights"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#111827]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#64748B] dark:text-slate-400">Scope</p>
          <p className="mt-2 text-sm font-semibold text-[#1E293B] dark:text-slate-100">
            {isGlobal ? "All active barangays" : "Your health center"}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#111827]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#64748B] dark:text-slate-400">Source</p>
          <p className="mt-2 text-sm font-semibold text-[#1E293B] dark:text-slate-100">
            {result?.source === "gemini" ? `Gemini${result.model ? ` (${result.model})` : ""}` : result?.source ?? "Ready"}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 dark:border-white/10 dark:bg-[#111827]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#64748B] dark:text-slate-400">Privacy</p>
          <p className="mt-2 text-sm font-semibold text-[#1E293B] dark:text-slate-100">
            Aggregated data only
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {!result && !errorMessage && (
        <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-white/70 p-8 text-center dark:border-white/20 dark:bg-[#111827]/70">
          <CheckCircle2 className="mx-auto size-8 text-cyan-500" />
          <h3 className="mt-3 text-lg font-bold text-[#1E293B] dark:text-slate-100">Ready to generate decision support</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B] dark:text-slate-400">
            Click Generate Insights to ask the secure server route for deep operational insights. The browser never receives the Gemini API key.
          </p>
        </div>
      )}

      {result && insights.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center dark:border-white/20 dark:bg-[#111827]">
          <Sparkles className="mx-auto size-8 text-cyan-500" />
          <h3 className="mt-3 text-lg font-bold text-[#1E293B] dark:text-slate-100">Not enough reliable data yet</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B] dark:text-slate-400">
            {emptyMessage}
          </p>
        </div>
      )}

      {insights.length > 0 && (
        <div className="space-y-5">
          {insights.map((insight, index) => (
            <article
              key={`${insight.title}-${insight.generated_at}-${index}`}
              className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition dark:border-white/10 dark:bg-[#111827]"
            >
              <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5 dark:border-white/5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-1">{severityIcons[insight.severity]}</span>
                  <div>
                    <h3 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">{insight.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                      {insight.insight_type}
                    </p>
                    <p className="mt-2 text-xs text-[#64748B] dark:text-slate-500">
                      Generated {formatGeneratedAt(insight.generated_at)}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex w-fit rounded-xl border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${severityClasses[insight.severity]}`}>
                  {insight.severity} severity
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <RelatedChip label="Barangay" value={insight.related_barangay} />
                <RelatedChip label="Medicine" value={insight.related_medicine} />
                <RelatedChip label="Illness" value={insight.related_illness} />
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InsightSection label="Observation" value={insight.observation} />
                <InsightSection label="Why it matters" value={insight.why_it_matters} />
                <InsightSection label="Root cause / reason" value={insight.root_cause_or_reason} />
                <InsightSection label="Possible impact" value={insight.possible_impact} />
                <InsightSection label="Risk" value={insight.risk} />
                <InsightSection label="Recommended action" value={insight.recommended_action} emphasis />
              </div>

              <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-white/10 dark:bg-white/5">
                <InsightSection label="Supporting data summary" value={insight.supporting_data_summary} />
              </div>
            </article>
          ))}
        </div>
      )}

      {result?.storage && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200">
          Manual review note: {result.storage}
        </div>
      )}
    </div>
  );
}
