import { NextRequest, NextResponse } from "next/server";

import { getGeminiApiKey } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";
import type {
  ActionableInsight,
  InsightScope,
  InsightSeverity,
} from "@/types/ai-insights";
import { NOT_ENOUGH_INSIGHT_DATA_MESSAGE } from "@/types/ai-insights";

export const runtime = "nodejs";

const GEMINI_MODEL_CHAIN = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
];

const RETRYABLE_STATUS_CODES = new Set([429, 503, 502, 500]);
const VALID_SEVERITIES = new Set<InsightSeverity>(["low", "medium", "high"]);

type ProfileRow = {
  role: "bhw" | "super_admin";
  approval_status: "pending" | "approved" | "rejected";
};

type CenterRow = {
  id: string;
  barangay_name: string;
  municipality: string;
  center_name: string | null;
};

type MedicineJoin = {
  generic_name?: string | null;
  brand_name?: string | null;
  strength?: string | null;
};

type ConsultationRow = {
  id: string;
  health_center_id: string;
  illness_category: string;
  consultation_date: string;
  prescription_status: string;
};

type IllnessLogRow = {
  health_center_id: string;
  illness_category: string;
  action_taken: string;
  created_at: string;
};

type RequestRow = {
  consultation_id: string;
  medicine_id: string;
  requested_quantity: number;
  status: string;
  created_at: string;
  medicine_master?: MedicineJoin | MedicineJoin[] | null;
};

type BatchRow = {
  health_center_id: string;
  medicine_id: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  status: string;
  medicine_master?: MedicineJoin | MedicineJoin[] | null;
};

type DispenseRow = {
  health_center_id: string;
  illness_category: string;
  quantity_dispensed: number;
  unit: string;
  dispensed_at: string;
  medicine_batches?: {
    medicine_id?: string | null;
    medicine_master?: MedicineJoin | MedicineJoin[] | null;
  } | {
    medicine_id?: string | null;
    medicine_master?: MedicineJoin | MedicineJoin[] | null;
  }[] | null;
};

type ReferralRow = {
  referring_center_id: string;
  receiving_center_id: string;
  medicine_id: string;
  quantity_requested: number;
  status: string;
  illness_category: string | null;
  created_at: string;
  medicine_master?: MedicineJoin | MedicineJoin[] | null;
};

type InventorySummary = {
  center_id: string;
  barangay: string;
  medicine_id: string;
  medicine: string;
  total_quantity: number;
  unit: string;
  earliest_expiry: string | null;
  expired_quantity: number;
  expiring_quantity_30d: number;
  expiring_quantity_60d: number;
  batch_count: number;
};

type IllnessSummary = {
  center_id: string;
  barangay: string;
  illness: string;
  total_records_30d: number;
  consultation_count_30d: number;
  illness_log_count_30d: number;
  records_7d: number;
};

type DemandSummary = {
  center_id: string;
  barangay: string;
  medicine_id: string;
  medicine: string;
  requested_quantity_30d: number;
  request_count_30d: number;
  dispensed_quantity_30d: number;
  dispense_count_30d: number;
  related_illness: string | null;
};

type ReferralSummary = {
  center_id: string;
  barangay: string;
  medicine_id: string;
  medicine: string;
  outgoing_count_30d: number;
  incoming_count_30d: number;
  pending_count_30d: number;
  completed_count_30d: number;
  related_illness: string | null;
};

type StockImbalanceSummary = {
  medicine_id: string;
  medicine: string;
  low_barangay: string;
  low_quantity: number;
  high_barangay: string;
  high_quantity: number;
};

type OperationalSummary = {
  generated_at: string;
  current_date: string;
  scope: InsightScope;
  totals: {
    centers: number;
    consultations_30d: number;
    illness_logs_30d: number;
    medicine_requests_30d: number;
    dispense_events_30d: number;
    referrals_30d: number;
    active_inventory_rows: number;
  };
  centers: { id: string; barangay: string; municipality: string }[];
  top_illnesses: IllnessSummary[];
  medicine_inventory: InventorySummary[];
  medicine_demand: DemandSummary[];
  referrals: ReferralSummary[];
  stock_imbalances: StockImbalanceSummary[];
  unavailable_sources: string[];
};

type GeminiPayload = {
  contents: { parts: { text: string }[] }[];
  generationConfig: Record<string, unknown>;
};

function normalizeScope(value: unknown): InsightScope {
  return value === "global" ? "global" : "local";
}

function readOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatMedicineName(value: MedicineJoin | MedicineJoin[] | null | undefined) {
  const medicine = readOne(value);
  if (!medicine?.generic_name) {
    return "Unknown medicine";
  }

  return `${medicine.generic_name}${medicine.brand_name ? ` (${medicine.brand_name})` : ""}${medicine.strength ? ` ${medicine.strength}` : ""}`;
}

function daysUntil(dateValue: string, now: Date) {
  const target = new Date(dateValue);
  target.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isWithinDays(dateValue: string, days: number, now: Date) {
  const date = new Date(dateValue);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

function centerLabel(center: CenterRow | undefined) {
  return center?.barangay_name || center?.center_name || "Unknown barangay";
}

async function queryRows<T>(
  label: string,
  query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
) {
  const { data, error } = await query;

  if (error) {
    return { rows: [] as T[], error: `${label}: ${error.message}` };
  }

  return { rows: data ?? [], error: null };
}

function topByCount<T>(items: T[], getValue: (item: T) => number, limit: number) {
  return [...items].sort((a, b) => getValue(b) - getValue(a)).slice(0, limit);
}

function addToMap<T>(map: Map<string, T>, key: string, create: () => T) {
  const existing = map.get(key);
  if (existing) {
    return existing;
  }

  const next = create();
  map.set(key, next);
  return next;
}

function buildOperationalSummary(args: {
  scope: InsightScope;
  centers: CenterRow[];
  consultations: ConsultationRow[];
  illnessLogs: IllnessLogRow[];
  requests: RequestRow[];
  batches: BatchRow[];
  dispenseLogs: DispenseRow[];
  referrals: ReferralRow[];
  unavailableSources: string[];
}) {
  const now = new Date();
  const centerById = new Map(args.centers.map((center) => [center.id, center]));
  const centerIds = new Set(args.centers.map((center) => center.id));
  const consultationById = new Map(args.consultations.map((item) => [item.id, item]));

  const illnessMap = new Map<string, IllnessSummary>();
  const inventoryMap = new Map<string, InventorySummary>();
  const demandMap = new Map<string, DemandSummary>();
  const referralMap = new Map<string, ReferralSummary>();

  for (const consultation of args.consultations) {
    if (!isWithinDays(consultation.consultation_date, 30, now)) continue;
    const key = `${consultation.health_center_id}:${consultation.illness_category}`;
    const summary = addToMap(illnessMap, key, () => ({
      center_id: consultation.health_center_id,
      barangay: centerLabel(centerById.get(consultation.health_center_id)),
      illness: consultation.illness_category,
      total_records_30d: 0,
      consultation_count_30d: 0,
      illness_log_count_30d: 0,
      records_7d: 0,
    }));

    summary.total_records_30d += 1;
    summary.consultation_count_30d += 1;
    if (isWithinDays(consultation.consultation_date, 7, now)) {
      summary.records_7d += 1;
    }
  }

  for (const log of args.illnessLogs) {
    if (!centerIds.has(log.health_center_id) || !isWithinDays(log.created_at, 30, now)) continue;
    const key = `${log.health_center_id}:${log.illness_category}`;
    const summary = addToMap(illnessMap, key, () => ({
      center_id: log.health_center_id,
      barangay: centerLabel(centerById.get(log.health_center_id)),
      illness: log.illness_category,
      total_records_30d: 0,
      consultation_count_30d: 0,
      illness_log_count_30d: 0,
      records_7d: 0,
    }));

    summary.total_records_30d += 1;
    summary.illness_log_count_30d += 1;
    if (isWithinDays(log.created_at, 7, now)) {
      summary.records_7d += 1;
    }
  }

  for (const batch of args.batches) {
    if (!centerIds.has(batch.health_center_id)) continue;
    const key = `${batch.health_center_id}:${batch.medicine_id}`;
    const medicine = formatMedicineName(batch.medicine_master);
    const summary = addToMap(inventoryMap, key, () => ({
      center_id: batch.health_center_id,
      barangay: centerLabel(centerById.get(batch.health_center_id)),
      medicine_id: batch.medicine_id,
      medicine,
      total_quantity: 0,
      unit: batch.unit,
      earliest_expiry: null,
      expired_quantity: 0,
      expiring_quantity_30d: 0,
      expiring_quantity_60d: 0,
      batch_count: 0,
    }));

    const quantity = Number(batch.quantity) || 0;
    const expiryDays = daysUntil(batch.expiry_date, now);

    summary.total_quantity += quantity;
    summary.batch_count += 1;
    if (!summary.earliest_expiry || batch.expiry_date < summary.earliest_expiry) {
      summary.earliest_expiry = batch.expiry_date;
    }
    if (expiryDays < 0) {
      summary.expired_quantity += quantity;
    } else if (expiryDays <= 30) {
      summary.expiring_quantity_30d += quantity;
      summary.expiring_quantity_60d += quantity;
    } else if (expiryDays <= 60) {
      summary.expiring_quantity_60d += quantity;
    }
  }

  for (const request of args.requests) {
    if (!isWithinDays(request.created_at, 30, now)) continue;
    const consultation = consultationById.get(request.consultation_id);
    if (!consultation || !centerIds.has(consultation.health_center_id)) continue;

    const key = `${consultation.health_center_id}:${request.medicine_id}`;
    const summary = addToMap(demandMap, key, () => ({
      center_id: consultation.health_center_id,
      barangay: centerLabel(centerById.get(consultation.health_center_id)),
      medicine_id: request.medicine_id,
      medicine: formatMedicineName(request.medicine_master),
      requested_quantity_30d: 0,
      request_count_30d: 0,
      dispensed_quantity_30d: 0,
      dispense_count_30d: 0,
      related_illness: consultation.illness_category || null,
    }));

    summary.requested_quantity_30d += Number(request.requested_quantity) || 0;
    summary.request_count_30d += 1;
    if (!summary.related_illness && consultation.illness_category) {
      summary.related_illness = consultation.illness_category;
    }
  }

  for (const log of args.dispenseLogs) {
    if (!centerIds.has(log.health_center_id) || !isWithinDays(log.dispensed_at, 30, now)) continue;
    const batch = readOne(log.medicine_batches);
    const medicineId = batch?.medicine_id;
    if (!medicineId) continue;

    const key = `${log.health_center_id}:${medicineId}`;
    const summary = addToMap(demandMap, key, () => ({
      center_id: log.health_center_id,
      barangay: centerLabel(centerById.get(log.health_center_id)),
      medicine_id: medicineId,
      medicine: formatMedicineName(batch?.medicine_master),
      requested_quantity_30d: 0,
      request_count_30d: 0,
      dispensed_quantity_30d: 0,
      dispense_count_30d: 0,
      related_illness: log.illness_category || null,
    }));

    summary.dispensed_quantity_30d += Number(log.quantity_dispensed) || 0;
    summary.dispense_count_30d += 1;
    if (!summary.related_illness && log.illness_category) {
      summary.related_illness = log.illness_category;
    }
  }

  for (const referral of args.referrals) {
    if (!isWithinDays(referral.created_at, 30, now)) continue;

    for (const direction of ["outgoing", "incoming"] as const) {
      const centerId = direction === "outgoing" ? referral.referring_center_id : referral.receiving_center_id;
      if (!centerIds.has(centerId)) continue;

      const key = `${centerId}:${referral.medicine_id}`;
      const summary = addToMap(referralMap, key, () => ({
        center_id: centerId,
        barangay: centerLabel(centerById.get(centerId)),
        medicine_id: referral.medicine_id,
        medicine: formatMedicineName(referral.medicine_master),
        outgoing_count_30d: 0,
        incoming_count_30d: 0,
        pending_count_30d: 0,
        completed_count_30d: 0,
        related_illness: referral.illness_category,
      }));

      if (direction === "outgoing") summary.outgoing_count_30d += 1;
      if (direction === "incoming") summary.incoming_count_30d += 1;
      if (referral.status === "pending") summary.pending_count_30d += 1;
      if (referral.status === "completed") summary.completed_count_30d += 1;
      if (!summary.related_illness && referral.illness_category) {
        summary.related_illness = referral.illness_category;
      }
    }
  }

  const inventory = Array.from(inventoryMap.values());
  const imbalances: StockImbalanceSummary[] = [];
  const byMedicine = new Map<string, InventorySummary[]>();

  for (const item of inventory) {
    const list = byMedicine.get(item.medicine_id) ?? [];
    list.push(item);
    byMedicine.set(item.medicine_id, list);
  }

  for (const list of byMedicine.values()) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => a.total_quantity - b.total_quantity);
    const low = sorted[0];
    const high = sorted[sorted.length - 1];
    if (low.total_quantity <= 50 && high.total_quantity >= 100 && high.total_quantity >= low.total_quantity * 2) {
      imbalances.push({
        medicine_id: high.medicine_id,
        medicine: high.medicine,
        low_barangay: low.barangay,
        low_quantity: low.total_quantity,
        high_barangay: high.barangay,
        high_quantity: high.total_quantity,
      });
    }
  }

  const topIllnesses = topByCount(
    Array.from(illnessMap.values()),
    (item) => item.total_records_30d,
    10,
  );
  const medicineInventory = topByCount(
    inventory,
    (item) => item.expiring_quantity_30d + item.expiring_quantity_60d + Math.max(0, 60 - item.total_quantity),
    20,
  );
  const medicineDemand = topByCount(
    Array.from(demandMap.values()),
    (item) => item.requested_quantity_30d + item.dispensed_quantity_30d,
    20,
  );
  const referrals = topByCount(
    Array.from(referralMap.values()),
    (item) => item.outgoing_count_30d + item.incoming_count_30d + item.pending_count_30d,
    12,
  );

  return {
    generated_at: now.toISOString(),
    current_date: now.toISOString().split("T")[0],
    scope: args.scope,
    totals: {
      centers: args.centers.length,
      consultations_30d: args.consultations.filter((item) => isWithinDays(item.consultation_date, 30, now)).length,
      illness_logs_30d: args.illnessLogs.filter((item) => isWithinDays(item.created_at, 30, now)).length,
      medicine_requests_30d: args.requests.filter((item) => isWithinDays(item.created_at, 30, now)).length,
      dispense_events_30d: args.dispenseLogs.filter((item) => isWithinDays(item.dispensed_at, 30, now)).length,
      referrals_30d: args.referrals.filter((item) => isWithinDays(item.created_at, 30, now)).length,
      active_inventory_rows: args.batches.length,
    },
    centers: args.centers.map((center) => ({
      id: center.id,
      barangay: centerLabel(center),
      municipality: center.municipality,
    })),
    top_illnesses: topIllnesses,
    medicine_inventory: medicineInventory,
    medicine_demand: medicineDemand,
    referrals,
    stock_imbalances: imbalances.slice(0, 8),
    unavailable_sources: args.unavailableSources,
  } satisfies OperationalSummary;
}

function hasEnoughData(summary: OperationalSummary) {
  const totals = summary.totals;
  return (
    totals.consultations_30d +
      totals.illness_logs_30d +
      totals.medicine_requests_30d +
      totals.dispense_events_30d +
      totals.referrals_30d +
      totals.active_inventory_rows >
    0
  );
}

function findInventory(summary: OperationalSummary, centerId: string, medicineId: string) {
  return summary.medicine_inventory.find(
    (item) => item.center_id === centerId && item.medicine_id === medicineId,
  );
}

function findDemandForIllness(summary: OperationalSummary, centerId: string, illness: string) {
  return summary.medicine_demand.find(
    (item) => item.center_id === centerId && item.related_illness === illness,
  );
}

function createInsight(input: Omit<ActionableInsight, "generated_at">, generatedAt: string) {
  return { ...input, generated_at: generatedAt };
}

function buildHeuristicInsights(summary: OperationalSummary) {
  const insights: ActionableInsight[] = [];
  const generatedAt = summary.generated_at;

  const topIllness = summary.top_illnesses[0];
  if (topIllness) {
    const demand = findDemandForIllness(summary, topIllness.center_id, topIllness.illness);
    const stock = demand ? findInventory(summary, demand.center_id, demand.medicine_id) : null;
    const lowStock = stock ? stock.total_quantity <= 50 : false;

    insights.push(createInsight({
      title: demand && lowStock
        ? `${topIllness.illness} Cases May Strain ${demand.medicine} Supply`
        : `${topIllness.illness} Is Driving Local Service Demand`,
      severity: lowStock || topIllness.total_records_30d >= 10 ? "high" : topIllness.total_records_30d >= 3 ? "medium" : "low",
      insight_type: "Top Illness / Medicine Demand Insight",
      observation: `${topIllness.illness} is the most recorded case in ${topIllness.barangay} with ${topIllness.total_records_30d} records in the last 30 days.`,
      why_it_matters: "Repeated illness cases can increase medicine demand, staff workload, and the chance that patients need referral support when local stock is not enough.",
      root_cause_or_reason: demand
        ? `The same period shows recorded medicine requests or dispensing activity for ${demand.medicine}, so the illness trend is already connected to medicine movement in the data.`
        : "The available data shows the illness pattern, but there is not enough linked dispensing or medicine request data to confirm the exact medicine demand reason yet.",
      possible_impact: stock
        ? `Current ${demand?.medicine} stock for ${topIllness.barangay} is ${stock.total_quantity} ${stock.unit}, so continued demand may affect availability.`
        : "The health center may need closer stock review because the illness trend is visible before a clear medicine demand pattern is fully recorded.",
      risk: lowStock
        ? "If no action is taken, the center may run low and patients may need referral to another barangay."
        : "If the trend continues without monitoring, medicine requests and referral needs may rise without early preparation.",
      recommended_action: demand
        ? `Check current ${demand.medicine} batches, prioritize valid near-expiry stock if appropriate, and prepare restock or referral options if the stock level is near the safety margin.`
        : "Review recent consultations with the assigned health worker and continue recording medicine requests so the next insight can connect illness demand to inventory movement.",
      related_barangay: topIllness.barangay,
      related_medicine: demand?.medicine ?? null,
      related_illness: topIllness.illness,
      supporting_data_summary: `${topIllness.consultation_count_30d} consultations and ${topIllness.illness_log_count_30d} illness logs mention this category in the last 30 days.`,
    }, generatedAt));
  }

  const shortageCandidate = summary.medicine_inventory.find((item) => {
    const demand = summary.medicine_demand.find(
      (entry) => entry.center_id === item.center_id && entry.medicine_id === item.medicine_id,
    );
    return item.total_quantity <= 50 && Boolean(demand) && item.expired_quantity < item.total_quantity;
  });

  if (shortageCandidate) {
    const demand = summary.medicine_demand.find(
      (item) => item.center_id === shortageCandidate.center_id && item.medicine_id === shortageCandidate.medicine_id,
    );
    insights.push(createInsight({
      title: `${shortageCandidate.medicine} Shortage Risk in ${shortageCandidate.barangay}`,
      severity: shortageCandidate.total_quantity <= 10 ? "high" : "medium",
      insight_type: "Shortage Risk Insight",
      observation: `${shortageCandidate.medicine} has ${shortageCandidate.total_quantity} ${shortageCandidate.unit} left in ${shortageCandidate.barangay}.`,
      why_it_matters: "Low stock matters because dispensing and consultation-based medicine requests can quickly turn into referral demand when the center cannot release medicine locally.",
      root_cause_or_reason: demand
        ? `Recent records show ${demand.dispensed_quantity_30d} ${shortageCandidate.unit} dispensed and ${demand.requested_quantity_30d} requested in the last 30 days.`
        : "The stock level is low, but there is not enough recent demand data to identify the exact reason.",
      possible_impact: "The center may have to refer more patients or delay service if demand continues at the current pace.",
      risk: "If no stock review or restock action is taken, the medicine may run out before the next replenishment cycle.",
      recommended_action: "Check remaining valid batches, confirm expected daily use with recent logs, and prepare restock or nearby referral options before the stock reaches zero.",
      related_barangay: shortageCandidate.barangay,
      related_medicine: shortageCandidate.medicine,
      related_illness: demand?.related_illness ?? null,
      supporting_data_summary: `${shortageCandidate.total_quantity} ${shortageCandidate.unit} available; recent demand includes ${demand?.dispense_count_30d ?? 0} dispense events and ${demand?.request_count_30d ?? 0} medicine requests.`,
    }, generatedAt));
  }

  const expiryCandidate = summary.medicine_inventory.find(
    (item) => item.expiring_quantity_30d > 0 || item.expiring_quantity_60d >= 50,
  );

  if (expiryCandidate) {
    const demand = summary.medicine_demand.find(
      (item) => item.center_id === expiryCandidate.center_id && item.medicine_id === expiryCandidate.medicine_id,
    );
    insights.push(createInsight({
      title: `${expiryCandidate.medicine} May Become Expiry Waste`,
      severity: expiryCandidate.expiring_quantity_30d > 0 ? "high" : "medium",
      insight_type: "Expiry Waste Risk Insight",
      observation: `${expiryCandidate.barangay} has ${expiryCandidate.expiring_quantity_60d} ${expiryCandidate.unit} of ${expiryCandidate.medicine} expiring within 60 days.`,
      why_it_matters: "Expiring stock matters because usable medicine can be wasted while other barangays may still need supply.",
      root_cause_or_reason: demand && demand.dispensed_quantity_30d > 0
        ? `Recent dispensing exists, but the quantity expiring soon is still high compared with recorded movement.`
        : "The available records show expiring inventory, but there is not enough recent dispensing activity to show that the batch will move before expiry.",
      possible_impact: "The center may lose usable stock and still need procurement later if demand returns after the batch expires.",
      risk: "If no action is taken, valid medicine may expire in storage instead of supporting patient service.",
      recommended_action: "Review the nearest-expiry batches, use valid stock first when clinically appropriate, and consider referral or redistribution planning with an authorized worker.",
      related_barangay: expiryCandidate.barangay,
      related_medicine: expiryCandidate.medicine,
      related_illness: demand?.related_illness ?? null,
      supporting_data_summary: `Earliest expiry: ${expiryCandidate.earliest_expiry ?? "unknown"}; ${expiryCandidate.expiring_quantity_30d} ${expiryCandidate.unit} expiring within 30 days.`,
    }, generatedAt));
  }

  const referralCandidate = summary.referrals[0];
  if (referralCandidate && referralCandidate.outgoing_count_30d + referralCandidate.incoming_count_30d > 0) {
    insights.push(createInsight({
      title: `${referralCandidate.medicine} Referral Pattern Needs Review`,
      severity: referralCandidate.pending_count_30d >= 3 ? "high" : "medium",
      insight_type: "Referral Pattern Insight",
      observation: `${referralCandidate.barangay} has ${referralCandidate.outgoing_count_30d} outgoing and ${referralCandidate.incoming_count_30d} incoming referrals for ${referralCandidate.medicine} in the last 30 days.`,
      why_it_matters: "Referral movement shows where medicine availability is already affecting patient service across barangays.",
      root_cause_or_reason: referralCandidate.pending_count_30d > 0
        ? `${referralCandidate.pending_count_30d} referral requests are still pending, which may indicate unresolved stock gaps or coordination delays.`
        : "Referral records show completed movement, which suggests the network is being used to balance local stock gaps.",
      possible_impact: "Frequent referrals can increase patient waiting time and make nearby centers carry extra demand.",
      risk: "If the pattern continues without stock planning, the same medicine may repeatedly require cross-barangay coordination.",
      recommended_action: "Compare referral frequency with local stock and request quantities, then plan restock or redistribution before the next shortage cycle.",
      related_barangay: referralCandidate.barangay,
      related_medicine: referralCandidate.medicine,
      related_illness: referralCandidate.related_illness,
      supporting_data_summary: `${referralCandidate.pending_count_30d} pending and ${referralCandidate.completed_count_30d} completed referral records for this medicine in the last 30 days.`,
    }, generatedAt));
  }

  const imbalance = summary.stock_imbalances[0];
  if (imbalance) {
    insights.push(createInsight({
      title: `${imbalance.medicine} Stock Is Uneven Across Barangays`,
      severity: "medium",
      insight_type: "Barangay Stock Imbalance Insight",
      observation: `${imbalance.low_barangay} has ${imbalance.low_quantity} units of ${imbalance.medicine}, while ${imbalance.high_barangay} has ${imbalance.high_quantity} units.`,
      why_it_matters: "Uneven stock can cause avoidable referrals in one barangay while another barangay carries possible overstock or expiry risk.",
      root_cause_or_reason: "Inventory totals show a clear quantity gap between barangays for the same medicine.",
      possible_impact: "Patients in the low-stock barangay may need referral even though nearby network supply exists.",
      risk: "If no balancing action is taken, one barangay may run out while another keeps excess supply.",
      recommended_action: "Review both centers' current demand and expiry dates, then coordinate a supervised transfer if the high-stock barangay can safely spare units.",
      related_barangay: `${imbalance.low_barangay} / ${imbalance.high_barangay}`,
      related_medicine: imbalance.medicine,
      related_illness: null,
      supporting_data_summary: `Stock comparison: ${imbalance.low_barangay} ${imbalance.low_quantity}, ${imbalance.high_barangay} ${imbalance.high_quantity}.`,
    }, generatedAt));
  }

  return insights.slice(0, 6);
}

function buildGeminiPrompt(summary: OperationalSummary) {
  return `You are GabayGamot's AI insight generator for barangay health center operations.

Use only the aggregated JSON summary below. Do not invent patient details. Do not diagnose patients. Do not prescribe medicine. Do not recommend medicine directly to patients. Mention that decisions remain with authorized health workers only when relevant.

Definition of insight:
An insight explains what is happening, why it may be happening, how it affects medicine supply, patient service, referral needs, or waste risk, what may happen if no action is taken, and what practical action should happen next.

Supported insight types:
- Top Illness / Top Cases Insight
- Shortage Risk Insight
- Expiry Waste Risk Insight
- Overstock Insight
- Referral Pattern Insight
- Common Illness Demand Insight
- Procurement Planning Insight
- Barangay Stock Imbalance Insight
- Consultation-Based Medicine Demand Insight

Rules:
- Return strict JSON only. No markdown.
- Return an array with 1 to 6 insight objects.
- If the data is not enough, return [].
- Use simple language understandable by barangay health workers.
- Use aggregated counts, stock levels, expiry dates, referral frequency, and medicine demand only.
- Do not include full patient names or patient-level details.
- Do not say a medicine treats an illness unless the relationship appears in recorded medicine requests or dispensing data.

Every insight must match this schema exactly:
{
  "title": "string",
  "severity": "low | medium | high",
  "insight_type": "string",
  "observation": "string",
  "why_it_matters": "string",
  "root_cause_or_reason": "string",
  "possible_impact": "string",
  "risk": "string",
  "recommended_action": "string",
  "related_barangay": "string or null",
  "related_medicine": "string or null",
  "related_illness": "string or null",
  "supporting_data_summary": "string",
  "generated_at": "${summary.generated_at}"
}

Aggregated data:
${JSON.stringify(summary, null, 2)}`;
}

async function tryGeminiModel(
  apiKey: string,
  modelName: string,
  payload: GeminiPayload,
): Promise<{ ok: boolean; status: number; data?: unknown; errorText?: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false, status: response.status, errorText: await response.text() };
    }

    return { ok: true, status: response.status, data: await response.json() };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      errorText: error instanceof Error ? error.message : "Network error",
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readRequiredString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function validateInsight(value: unknown, fallbackGeneratedAt: string): ActionableInsight | null {
  if (!isRecord(value)) return null;

  const severity = value.severity;
  if (typeof severity !== "string" || !VALID_SEVERITIES.has(severity as InsightSeverity)) {
    return null;
  }

  const title = readRequiredString(value.title);
  const insightType = readRequiredString(value.insight_type);
  const observation = readRequiredString(value.observation);
  const whyItMatters = readRequiredString(value.why_it_matters);
  const rootCause = readRequiredString(value.root_cause_or_reason);
  const impact = readRequiredString(value.possible_impact);
  const risk = readRequiredString(value.risk);
  const action = readRequiredString(value.recommended_action);
  const support = readRequiredString(value.supporting_data_summary);

  if (!title || !insightType || !observation || !whyItMatters || !rootCause || !impact || !risk || !action || !support) {
    return null;
  }

  return {
    title,
    severity: severity as InsightSeverity,
    insight_type: insightType,
    observation,
    why_it_matters: whyItMatters,
    root_cause_or_reason: rootCause,
    possible_impact: impact,
    risk,
    recommended_action: action,
    related_barangay: readNullableString(value.related_barangay),
    related_medicine: readNullableString(value.related_medicine),
    related_illness: readNullableString(value.related_illness),
    supporting_data_summary: support,
    generated_at: readRequiredString(value.generated_at) ?? fallbackGeneratedAt,
  };
}

function parseGeminiInsights(text: string, fallbackGeneratedAt: string) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start < 0 || end < start) {
    return [];
  }

  const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => validateInsight(item, fallbackGeneratedAt))
    .filter((item): item is ActionableInsight => Boolean(item))
    .slice(0, 6);
}

async function generateGeminiInsights(summary: OperationalSummary) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  const payload: GeminiPayload = {
    contents: [
      {
        parts: [{ text: buildGeminiPrompt(summary) }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  };

  let lastError = "";
  for (const modelName of GEMINI_MODEL_CHAIN) {
    const result = await tryGeminiModel(apiKey, modelName, payload);
    if (result.ok && result.data) {
      const geminiResult = result.data as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const textResponse = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        lastError = `${modelName} returned an empty response`;
        continue;
      }

      const parsed = parseGeminiInsights(textResponse, summary.generated_at);
      if (parsed.length > 0) {
        return { insights: parsed, modelName };
      }

      lastError = `${modelName} returned invalid insight JSON`;
      continue;
    }

    if (RETRYABLE_STATUS_CODES.has(result.status)) {
      lastError = `${modelName} returned ${result.status}: ${result.errorText?.slice(0, 160)}`;
      continue;
    }

    throw new Error(`Gemini insight generation failed: ${result.errorText?.slice(0, 300)}`);
  }

  console.warn("[Gemini Insights] Falling back after model chain failed:", lastError);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json().catch(() => ({}));
    const requestedScope = isRecord(body) ? normalizeScope(body.scope) : "local";
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, approval_status")
      .eq("id", authData.user.id)
      .maybeSingle<ProfileRow>();

    if (profileError || !profile || profile.approval_status !== "approved") {
      return NextResponse.json({ error: "Approved account required." }, { status: 403 });
    }

    if (requestedScope === "global" && profile.role !== "super_admin") {
      return NextResponse.json({ error: "Super admin access required for global insights." }, { status: 403 });
    }

    const { data: ownCenter } = await supabase
      .from("health_centers")
      .select("id, barangay_name, municipality, center_name")
      .eq("profile_id", authData.user.id)
      .maybeSingle<CenterRow>();

    const centerQuery = requestedScope === "global"
      ? supabase
          .from("health_centers")
          .select("id, barangay_name, municipality, center_name")
          .eq("is_active", true)
          .limit(100)
      : ownCenter
        ? Promise.resolve({ data: [ownCenter], error: null })
        : Promise.resolve({ data: [] as CenterRow[], error: null });

    const centerResult = await queryRows<CenterRow>("health centers", centerQuery);
    const centers = centerResult.rows;

    if (centers.length === 0) {
      return NextResponse.json({
        insights: [],
        message: NOT_ENOUGH_INSIGHT_DATA_MESSAGE,
        source: "none",
        unavailable_sources: centerResult.error ? [centerResult.error] : [],
      });
    }

    const centerIds = centers.map((center) => center.id);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const cutoff = ninetyDaysAgo.toISOString();

    const [
      consultationsResult,
      illnessLogsResult,
      requestsResult,
      batchesResult,
      dispenseResult,
      referralsResult,
    ] = await Promise.all([
      queryRows<ConsultationRow>(
        "consultations",
        supabase
          .from("consultations")
          .select("id, health_center_id, illness_category, consultation_date, prescription_status")
          .in("health_center_id", centerIds)
          .gte("consultation_date", cutoff)
          .limit(500),
      ),
      queryRows<IllnessLogRow>(
        "illness logs",
        supabase
          .from("illness_logs")
          .select("health_center_id, illness_category, action_taken, created_at")
          .in("health_center_id", centerIds)
          .gte("created_at", cutoff)
          .limit(500),
      ),
      queryRows<RequestRow>(
        "consultation medicine requests",
        supabase
          .from("consultation_medicine_requests")
          .select("consultation_id, medicine_id, requested_quantity, status, created_at, medicine_master(generic_name, brand_name, strength)")
          .gte("created_at", cutoff)
          .limit(500),
      ),
      queryRows<BatchRow>(
        "medicine inventory",
        supabase
          .from("medicine_batches")
          .select("health_center_id, medicine_id, quantity, unit, expiry_date, status, medicine_master(generic_name, brand_name, strength)")
          .in("health_center_id", centerIds)
          .limit(500),
      ),
      queryRows<DispenseRow>(
        "dispense logs",
        supabase
          .from("dispense_logs")
          .select("health_center_id, illness_category, quantity_dispensed, unit, dispensed_at, medicine_batches(medicine_id, medicine_master(generic_name, brand_name, strength))")
          .in("health_center_id", centerIds)
          .gte("dispensed_at", cutoff)
          .limit(500),
      ),
      queryRows<ReferralRow>(
        "referrals",
        supabase
          .from("referrals")
          .select("referring_center_id, receiving_center_id, medicine_id, quantity_requested, status, illness_category, created_at, medicine_master(generic_name, brand_name, strength)")
          .gte("created_at", cutoff)
          .limit(500),
      ),
    ]);

    const unavailableSources = [
      centerResult.error,
      consultationsResult.error,
      illnessLogsResult.error,
      requestsResult.error,
      batchesResult.error,
      dispenseResult.error,
      referralsResult.error,
    ].filter((item): item is string => Boolean(item));

    const summary = buildOperationalSummary({
      scope: requestedScope,
      centers,
      consultations: consultationsResult.rows,
      illnessLogs: illnessLogsResult.rows,
      requests: requestsResult.rows,
      batches: batchesResult.rows,
      dispenseLogs: dispenseResult.rows,
      referrals: referralsResult.rows,
      unavailableSources,
    });

    if (!hasEnoughData(summary)) {
      return NextResponse.json({
        insights: [],
        message: NOT_ENOUGH_INSIGHT_DATA_MESSAGE,
        source: "none",
        summary,
      });
    }

    const geminiResult = await generateGeminiInsights(summary);
    if (geminiResult) {
      return NextResponse.json({
        insights: geminiResult.insights,
        source: "gemini",
        model: geminiResult.modelName,
        summary,
        storage: "ai_insights table not detected in local schema; insights are displayed on demand only.",
      });
    }

    const fallbackInsights = buildHeuristicInsights(summary);
    return NextResponse.json({
      insights: fallbackInsights,
      message: fallbackInsights.length === 0 ? NOT_ENOUGH_INSIGHT_DATA_MESSAGE : null,
      source: "local-analysis",
      summary,
      storage: "ai_insights table not detected in local schema; insights are displayed on demand only.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown insight generation error.";
    console.error("Error in Gemini insights route handler:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
