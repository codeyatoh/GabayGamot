export type InsightSeverity = "low" | "medium" | "high";

export type InsightScope = "local" | "global";

export interface ActionableInsight {
  title: string;
  severity: InsightSeverity;
  insight_type: string;
  observation: string;
  why_it_matters: string;
  root_cause_or_reason: string;
  possible_impact: string;
  risk: string;
  recommended_action: string;
  related_barangay: string | null;
  related_medicine: string | null;
  related_illness: string | null;
  supporting_data_summary: string;
  generated_at: string;
}

export const NOT_ENOUGH_INSIGHT_DATA_MESSAGE =
  "Not enough consultation, illness, dispensing, or inventory data yet to generate reliable insights. Continue recording consultations, dispensing logs, and referrals to unlock deeper insights.";
