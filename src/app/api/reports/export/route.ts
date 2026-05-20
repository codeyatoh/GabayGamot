import { NextRequest, NextResponse } from "next/server";

import { buildReportCsv, getOperationalReport, isReportExportType } from "@/lib/reports/operational-reports";
import type { ReportScope } from "@/lib/reports/operational-reports";
import { recordAuditEvent } from "@/lib/supabase/audit";

export const runtime = "nodejs";
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  Object.entries(NO_STORE_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

function normalizeScope(value: string | null): ReportScope {
  return value === "global" ? "global" : "local";
}

function normalizeRangeDays(value: string | null) {
  const days = Number(value);
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    return 30;
  }
  return Math.round(days);
}

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type");

    if (!isReportExportType(type)) {
      return jsonNoStore({ error: "Invalid report export type." }, { status: 400 });
    }

    const scope = normalizeScope(request.nextUrl.searchParams.get("scope"));
    const rangeDays = normalizeRangeDays(request.nextUrl.searchParams.get("days"));
    const report = await getOperationalReport({ scope, rangeDays });
    const csv = buildReportCsv(report, type);
    const filename = `gabaygamot-${scope}-${type}-report-${report.generatedAt.slice(0, 10)}.csv`;

    await recordAuditEvent({
      eventType: "report_exported",
      entityType: "report",
      summary: `Exported ${scope} ${type} report as CSV.`,
      metadata: {
        report_type: type,
        scope,
        range_days: rangeDays,
      },
    });

    return new Response(csv, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "text/csv; charset=utf-8",
        ...NO_STORE_HEADERS,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to export report.";
    const status = message.startsWith("Unauthorized")
      ? 401
      : message.includes("Super admin") || message.includes("Approved account")
        ? 403
        : 500;
    return jsonNoStore({ error: message }, { status });
  }
}
