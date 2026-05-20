import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ReportScope = "local" | "global";

export type ReportExportType =
  | "inventory"
  | "dispensing"
  | "referrals"
  | "consultations"
  | "audit";

export const REPORT_EXPORT_TYPES: ReportExportType[] = [
  "inventory",
  "dispensing",
  "referrals",
  "consultations",
  "audit",
];

type ProfileRow = {
  role: "bhw" | "super_admin";
  approval_status: "pending" | "approved" | "rejected";
};

type CenterRow = {
  id: string;
  barangay_name: string;
  center_name: string | null;
  municipality: string;
  province?: string | null;
};

type MedicineJoin = {
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
};

type CenterJoin = {
  center_name: string | null;
  barangay_name: string | null;
  municipality?: string | null;
};

type PatientJoin = {
  patient_code: string | null;
};

export type InventoryReportRow = {
  id: string;
  health_center_id: string;
  batch_number: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  status: string;
  updated_at: string;
  medicine_master?: MedicineJoin | MedicineJoin[] | null;
  health_centers?: CenterJoin | CenterJoin[] | null;
};

export type DispenseReportRow = {
  id: string;
  health_center_id: string;
  patient_code: string;
  illness_category: string;
  quantity_dispensed: number;
  unit: string;
  dispensed_at: string;
  medicine_batches?: {
    batch_number: string | null;
    medicine_master?: MedicineJoin | MedicineJoin[] | null;
  } | {
    batch_number: string | null;
    medicine_master?: MedicineJoin | MedicineJoin[] | null;
  }[] | null;
  health_centers?: CenterJoin | CenterJoin[] | null;
};

export type ReferralReportRow = {
  id: string;
  patient_code: string;
  medicine_id: string;
  quantity_requested: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  illness_category: string | null;
  medicine_master?: MedicineJoin | MedicineJoin[] | null;
  referring_center?: CenterJoin | CenterJoin[] | null;
  receiving_center?: CenterJoin | CenterJoin[] | null;
};

export type ConsultationReportRow = {
  id: string;
  health_center_id: string;
  consultation_date: string;
  chief_complaint: string;
  illness_category: string;
  prescription_status: string;
  patients?: PatientJoin | PatientJoin[] | null;
  health_centers?: CenterJoin | CenterJoin[] | null;
};

export type AuditEventReportRow = {
  id: string;
  actor_role: string;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  health_center_id: string | null;
  summary: string;
  created_at: string;
  health_centers?: CenterJoin | CenterJoin[] | null;
};

export type AuditTimelineRow = {
  id: string;
  eventType: string;
  entityType: string;
  centerName: string;
  actorRole: string;
  summary: string;
  createdAt: string;
  source: "audit_events" | "operational_records";
};

export type OperationalReport = {
  scope: ReportScope;
  generatedAt: string;
  rangeDays: number;
  centers: CenterRow[];
  unavailableSources: string[];
  inventoryRows: InventoryReportRow[];
  dispenseRows: DispenseReportRow[];
  referralRows: ReferralReportRow[];
  consultationRows: ConsultationReportRow[];
  auditEventRows: AuditEventReportRow[];
  auditTimeline: AuditTimelineRow[];
  metrics: {
    totalStockUnits: number;
    activeBatches: number;
    lowStockBatches: number;
    outOfStockBatches: number;
    expiringSoonBatches: number;
    expiredBatches: number;
    consultations: number;
    dispenseEvents: number;
    dispensedUnits: number;
    referrals: number;
    pendingReferrals: number;
    completedReferrals: number;
    cancelledReferrals: number;
  };
  topIllnesses: { illness: string; count: number }[];
};

type QueryResult<T> = {
  rows: T[];
  error: string | null;
};

function readOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function isReportExportType(value: string | null): value is ReportExportType {
  return REPORT_EXPORT_TYPES.includes(value as ReportExportType);
}

export function centerName(center: CenterJoin | CenterJoin[] | CenterRow | null | undefined) {
  const value = readOne(center);
  if (!value) return "Unknown center";
  return value.center_name || value.barangay_name || "Unknown center";
}

export function medicineName(value: MedicineJoin | MedicineJoin[] | null | undefined) {
  const medicine = readOne(value);
  if (!medicine?.generic_name) return "Unknown medicine";
  return `${medicine.generic_name}${medicine.brand_name ? ` (${medicine.brand_name})` : ""}${medicine.strength ? ` ${medicine.strength}` : ""}`;
}

function daysUntil(dateValue: string, now = new Date()) {
  const target = new Date(dateValue);
  target.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

async function queryRows<T>(
  label: string,
  query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<QueryResult<T>> {
  const { data, error } = await query;

  if (error) {
    return { rows: [], error: `${label}: ${error.message}` };
  }

  return { rows: data ?? [], error: null };
}

function countIllnesses(consultations: ConsultationReportRow[], dispenseRows: DispenseReportRow[]) {
  const map = new Map<string, number>();

  for (const row of consultations) {
    const key = row.illness_category || "Unspecified";
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  for (const row of dispenseRows) {
    const key = row.illness_category || "Unspecified";
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([illness, count]) => ({ illness, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function buildAuditTimeline(args: {
  auditEvents: AuditEventReportRow[];
  inventoryRows: InventoryReportRow[];
  dispenseRows: DispenseReportRow[];
  referralRows: ReferralReportRow[];
  consultationRows: ConsultationReportRow[];
}) {
  const explicitEvents = args.auditEvents.map((event): AuditTimelineRow => ({
    id: event.id,
    eventType: event.event_type,
    entityType: event.entity_type,
    centerName: centerName(event.health_centers),
    actorRole: event.actor_role,
    summary: event.summary,
    createdAt: event.created_at,
    source: "audit_events",
  }));

  const derivedEvents: AuditTimelineRow[] = [
    ...args.dispenseRows.slice(0, 20).map((row) => {
      const batch = readOne(row.medicine_batches);
      return {
        id: `dispense-${row.id}`,
        eventType: "medicine_dispensed",
        entityType: "dispense_log",
        centerName: centerName(row.health_centers),
        actorRole: "bhw",
        summary: `Dispensed ${row.quantity_dispensed} ${row.unit} of ${medicineName(batch?.medicine_master)} for ${row.patient_code}.`,
        createdAt: row.dispensed_at,
        source: "operational_records" as const,
      };
    }),
    ...args.referralRows.slice(0, 20).map((row) => ({
      id: `referral-${row.id}`,
      eventType: `referral_${row.status}`,
      entityType: "referral",
      centerName: centerName(row.referring_center),
      actorRole: "bhw",
      summary: `${row.status} referral for ${row.quantity_requested} ${medicineName(row.medicine_master)} units from ${centerName(row.referring_center)} to ${centerName(row.receiving_center)}.`,
      createdAt: row.updated_at || row.created_at,
      source: "operational_records" as const,
    })),
    ...args.consultationRows.slice(0, 20).map((row) => ({
      id: `consultation-${row.id}`,
      eventType: "consultation_recorded",
      entityType: "consultation",
      centerName: centerName(row.health_centers),
      actorRole: "bhw",
      summary: `Recorded ${row.illness_category} consultation for ${readOne(row.patients)?.patient_code ?? "patient"}.`,
      createdAt: row.consultation_date,
      source: "operational_records" as const,
    })),
    ...args.inventoryRows.slice(0, 20).map((row) => ({
      id: `inventory-${row.id}`,
      eventType: "inventory_batch_snapshot",
      entityType: "medicine_batch",
      centerName: centerName(row.health_centers),
      actorRole: "system",
      summary: `${medicineName(row.medicine_master)} batch ${row.batch_number} has ${row.quantity} ${row.unit} on hand.`,
      createdAt: row.updated_at,
      source: "operational_records" as const,
    })),
  ];

  return [...explicitEvents, ...derivedEvents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 40);
}

function buildMetrics(args: {
  inventoryRows: InventoryReportRow[];
  dispenseRows: DispenseReportRow[];
  referralRows: ReferralReportRow[];
  consultationRows: ConsultationReportRow[];
}) {
  const metrics: OperationalReport["metrics"] = {
    totalStockUnits: 0,
    activeBatches: args.inventoryRows.length,
    lowStockBatches: 0,
    outOfStockBatches: 0,
    expiringSoonBatches: 0,
    expiredBatches: 0,
    consultations: args.consultationRows.length,
    dispenseEvents: args.dispenseRows.length,
    dispensedUnits: 0,
    referrals: args.referralRows.length,
    pendingReferrals: 0,
    completedReferrals: 0,
    cancelledReferrals: 0,
  };

  for (const row of args.inventoryRows) {
    metrics.totalStockUnits += Number(row.quantity) || 0;
    const expiryDays = daysUntil(row.expiry_date);
    if (row.quantity <= 0) metrics.outOfStockBatches += 1;
    if (row.quantity > 0 && row.quantity <= 50) metrics.lowStockBatches += 1;
    if (expiryDays < 0) metrics.expiredBatches += 1;
    if (expiryDays >= 0 && expiryDays <= 30) metrics.expiringSoonBatches += 1;
  }

  for (const row of args.dispenseRows) {
    metrics.dispensedUnits += Number(row.quantity_dispensed) || 0;
  }

  for (const row of args.referralRows) {
    if (row.status === "pending") metrics.pendingReferrals += 1;
    if (row.status === "completed") metrics.completedReferrals += 1;
    if (row.status === "cancelled") metrics.cancelledReferrals += 1;
  }

  return metrics;
}

export async function getOperationalReport({
  scope,
  rangeDays = 30,
}: {
  scope: ReportScope;
  rangeDays?: number;
}): Promise<OperationalReport> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("Unauthorized: Please log in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, approval_status")
    .eq("id", authData.user.id)
    .maybeSingle<ProfileRow>();

  if (profileError || !profile || profile.approval_status !== "approved") {
    throw new Error("Approved account required.");
  }

  if (scope === "global" && profile.role !== "super_admin") {
    throw new Error("Super admin access required for global reports.");
  }

  let centers: CenterRow[] = [];

  if (scope === "global") {
    const { data, error } = await supabase
      .from("health_centers")
      .select("id, barangay_name, center_name, municipality, province")
      .eq("is_active", true)
      .order("barangay_name", { ascending: true });

    if (error) throw new Error(`Unable to load health centers: ${error.message}`);
    centers = data ?? [];
  } else {
    const { data, error } = await supabase
      .from("health_centers")
      .select("id, barangay_name, center_name, municipality, province")
      .eq("profile_id", authData.user.id)
      .maybeSingle<CenterRow>();

    if (error) throw new Error(`Unable to load assigned health center: ${error.message}`);
    centers = data ? [data] : [];
  }

  const generatedAt = new Date().toISOString();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - rangeDays);
  const cutoffIso = cutoff.toISOString();
  const centerIds = centers.map((center) => center.id);

  if (centerIds.length === 0) {
    return {
      scope,
      generatedAt,
      rangeDays,
      centers,
      unavailableSources: [],
      inventoryRows: [],
      dispenseRows: [],
      referralRows: [],
      consultationRows: [],
      auditEventRows: [],
      auditTimeline: [],
      metrics: buildMetrics({
        inventoryRows: [],
        dispenseRows: [],
        referralRows: [],
        consultationRows: [],
      }),
      topIllnesses: [],
    };
  }

  const referralQuery = scope === "global"
    ? supabase
        .from("referrals")
        .select(`
          id,
          patient_code,
          medicine_id,
          quantity_requested,
          status,
          created_at,
          updated_at,
          illness_category,
          medicine_master(generic_name, brand_name, strength),
          referring_center:health_centers!referring_center_id(center_name, barangay_name, municipality),
          receiving_center:health_centers!receiving_center_id(center_name, barangay_name, municipality)
        `)
        .gte("created_at", cutoffIso)
        .order("created_at", { ascending: false })
        .limit(500)
    : supabase
        .from("referrals")
        .select(`
          id,
          patient_code,
          medicine_id,
          quantity_requested,
          status,
          created_at,
          updated_at,
          illness_category,
          medicine_master(generic_name, brand_name, strength),
          referring_center:health_centers!referring_center_id(center_name, barangay_name, municipality),
          receiving_center:health_centers!receiving_center_id(center_name, barangay_name, municipality)
        `)
        .or(`referring_center_id.in.(${centerIds.join(",")}),receiving_center_id.in.(${centerIds.join(",")})`)
        .gte("created_at", cutoffIso)
        .order("created_at", { ascending: false })
        .limit(500);

  const [
    inventoryResult,
    dispenseResult,
    referralResult,
    consultationResult,
    auditResult,
  ] = await Promise.all([
    queryRows<InventoryReportRow>(
      "inventory",
      supabase
        .from("medicine_batches")
        .select(`
          id,
          health_center_id,
          batch_number,
          quantity,
          unit,
          expiry_date,
          status,
          updated_at,
          medicine_master(generic_name, brand_name, strength),
          health_centers(center_name, barangay_name, municipality)
        `)
        .in("health_center_id", centerIds)
        .order("expiry_date", { ascending: true })
        .limit(1000),
    ),
    queryRows<DispenseReportRow>(
      "dispensing",
      supabase
        .from("dispense_logs")
        .select(`
          id,
          health_center_id,
          patient_code,
          illness_category,
          quantity_dispensed,
          unit,
          dispensed_at,
          medicine_batches(batch_number, medicine_master(generic_name, brand_name, strength)),
          health_centers(center_name, barangay_name, municipality)
        `)
        .in("health_center_id", centerIds)
        .gte("dispensed_at", cutoffIso)
        .order("dispensed_at", { ascending: false })
        .limit(500),
    ),
    queryRows<ReferralReportRow>("referrals", referralQuery),
    queryRows<ConsultationReportRow>(
      "consultations",
      supabase
        .from("consultations")
        .select(`
          id,
          health_center_id,
          consultation_date,
          chief_complaint,
          illness_category,
          prescription_status,
          patients(patient_code),
          health_centers(center_name, barangay_name, municipality)
        `)
        .in("health_center_id", centerIds)
        .gte("consultation_date", cutoffIso)
        .order("consultation_date", { ascending: false })
        .limit(500),
    ),
    queryRows<AuditEventReportRow>(
      "audit events",
      supabase
        .from("audit_events")
        .select(`
          id,
          actor_role,
          event_type,
          entity_type,
          entity_id,
          health_center_id,
          summary,
          created_at,
          health_centers(center_name, barangay_name, municipality)
        `)
        .order("created_at", { ascending: false })
        .limit(200),
    ),
  ]);

  const unavailableSources = [
    inventoryResult.error,
    dispenseResult.error,
    referralResult.error,
    consultationResult.error,
    auditResult.error,
  ].filter((item): item is string => Boolean(item));

  const auditTimeline = buildAuditTimeline({
    auditEvents: auditResult.rows,
    inventoryRows: inventoryResult.rows,
    dispenseRows: dispenseResult.rows,
    referralRows: referralResult.rows,
    consultationRows: consultationResult.rows,
  });

  return {
    scope,
    generatedAt,
    rangeDays,
    centers,
    unavailableSources,
    inventoryRows: inventoryResult.rows,
    dispenseRows: dispenseResult.rows,
    referralRows: referralResult.rows,
    consultationRows: consultationResult.rows,
    auditEventRows: auditResult.rows,
    auditTimeline,
    metrics: buildMetrics({
      inventoryRows: inventoryResult.rows,
      dispenseRows: dispenseResult.rows,
      referralRows: referralResult.rows,
      consultationRows: consultationResult.rows,
    }),
    topIllnesses: countIllnesses(consultationResult.rows, dispenseResult.rows),
  };
}

function csvEscape(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function rowsToCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ].join("\r\n");
}

export function buildReportCsv(report: OperationalReport, type: ReportExportType) {
  if (type === "inventory") {
    return rowsToCsv(
      ["center", "medicine", "batch_number", "quantity", "unit", "expiry_date", "status"],
      report.inventoryRows.map((row) => [
        centerName(row.health_centers),
        medicineName(row.medicine_master),
        row.batch_number,
        row.quantity,
        row.unit,
        row.expiry_date,
        row.status,
      ]),
    );
  }

  if (type === "dispensing") {
    return rowsToCsv(
      ["center", "patient_code", "medicine", "batch_number", "illness_category", "quantity", "unit", "dispensed_at"],
      report.dispenseRows.map((row) => {
        const batch = readOne(row.medicine_batches);
        return [
          centerName(row.health_centers),
          row.patient_code,
          medicineName(batch?.medicine_master),
          batch?.batch_number ?? "",
          row.illness_category,
          row.quantity_dispensed,
          row.unit,
          row.dispensed_at,
        ];
      }),
    );
  }

  if (type === "referrals") {
    return rowsToCsv(
      ["referring_center", "receiving_center", "patient_code", "medicine", "illness_category", "quantity_requested", "status", "created_at", "updated_at"],
      report.referralRows.map((row) => [
        centerName(row.referring_center),
        centerName(row.receiving_center),
        row.patient_code,
        medicineName(row.medicine_master),
        row.illness_category,
        row.quantity_requested,
        row.status,
        row.created_at,
        row.updated_at,
      ]),
    );
  }

  if (type === "consultations") {
    return rowsToCsv(
      ["center", "patient_code", "illness_category", "chief_complaint", "prescription_status", "consultation_date"],
      report.consultationRows.map((row) => [
        centerName(row.health_centers),
        readOne(row.patients)?.patient_code ?? "",
        row.illness_category,
        row.chief_complaint,
        row.prescription_status,
        row.consultation_date,
      ]),
    );
  }

  return rowsToCsv(
    ["created_at", "center", "event_type", "entity_type", "actor_role", "summary", "source"],
    report.auditTimeline.map((row) => [
      row.createdAt,
      row.centerName,
      row.eventType,
      row.entityType,
      row.actorRole,
      row.summary,
      row.source,
    ]),
  );
}
