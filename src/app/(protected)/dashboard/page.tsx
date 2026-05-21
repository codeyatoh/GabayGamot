import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Boxes,
  Camera,
  Settings,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { ProtectedShell } from "@/components/foundation/protected-shell";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getInventoryBatches,
  type MedicineBatchWithDetails,
} from "@/lib/supabase/inventory";
import { getCurrentProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

function getBatchStatus(item: MedicineBatchWithDetails, today: Date) {
  const diffDays = Math.ceil(
    (new Date(item.expiry_date).getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "Expired";
  if (diffDays <= 180) return `Expiring in ${diffDays}d`;
  if (item.quantity > 0 && item.quantity <= 50) return "Low stock";

  return "Stable";
}

function getStatusVariant(label: string) {
  if (label === "Stable") return "success-light" as const;
  if (label === "Low stock") return "info-light" as const;
  if (label === "Expired") return "destructive-light" as const;
  return "warning-light" as const;
}

export default async function DashboardPage() {
  const { profile, user } = await getCurrentProfile();

  if (profile?.role === "super_admin") {
    redirect("/admin");
  }

  let batches: MedicineBatchWithDetails[] = [];

  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();
    const { data: centerData } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (centerData) {
      batches = await getInventoryBatches(centerData.id);
    }
  }

  let totalConsultationsToday = 0;

  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();
    const { data: centerData } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (centerData) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("illness_logs")
        .select("*", { count: "exact", head: true })
        .eq("health_center_id", centerData.id)
        .gte("created_at", startOfDay.toISOString());

      if (count) {
        totalConsultationsToday = count;
      }
    }
  }

  let activeReferralsCount = 0;

  if (user && profile && profile.approval_status === "approved") {
    const supabase = await createClient();
    const { data: centerData } = await supabase
      .from("health_centers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (centerData) {
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .or(
          `referring_center_id.eq.${centerData.id},receiving_center_id.eq.${centerData.id}`
        );

      if (count) activeReferralsCount = count;
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(todayStr);

  let totalItems = 0;
  let lowStockCount = 0;
  let nearExpiryCount = 0;
  let expiredCount = 0;

  const criticalBatches: {
    name: string;
    batchNumber: string;
    expiryDate: string;
    daysLeft: number;
    isExpired: boolean;
  }[] = [];

  batches.forEach((item) => {
    totalItems += item.quantity;

    const expDate = new Date(item.expiry_date);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expiredCount++;
      criticalBatches.push({
        name: item.medicine_master?.generic_name || "Medicine",
        batchNumber: item.batch_number,
        expiryDate: item.expiry_date,
        daysLeft: diffDays,
        isExpired: true,
      });
    } else if (diffDays <= 180) {
      nearExpiryCount++;
      criticalBatches.push({
        name: item.medicine_master?.generic_name || "Medicine",
        batchNumber: item.batch_number,
        expiryDate: item.expiry_date,
        daysLeft: diffDays,
        isExpired: false,
      });
    } else if (item.quantity > 0 && item.quantity <= 50) {
      lowStockCount++;
    }
  });

  const metrics = {
    totalItems,
    lowStock: lowStockCount,
    nearExpiry: nearExpiryCount + expiredCount,
    activeReferrals: activeReferralsCount,
  };

  const inventoryRows = [...batches]
    .sort(
      (left, right) =>
        new Date(left.expiry_date).getTime() -
        new Date(right.expiry_date).getTime()
    )
    .slice(0, 6);

  const aiInsightCards = [
    {
      title:
        criticalBatches.length > 0
          ? "Expiry risk needs action"
          : "Expiry risk is under control",
      description:
        criticalBatches.length > 0
          ? `${criticalBatches.length} batch${
              criticalBatches.length === 1 ? "" : "es"
            } need review because they are expired or near expiry.`
          : "No critical expiry batch is blocking service right now.",
      variant: criticalBatches.length > 0 ? "warning-light" : "success-light",
    },
    {
      title:
        metrics.lowStock > 0
          ? "Low stock may slow patient service"
          : "Stock coverage looks stable",
      description:
        metrics.lowStock > 0
          ? `${metrics.lowStock} inventory item${
              metrics.lowStock === 1 ? "" : "s"
            } are now low and may need restock or transfer planning.`
          : "No low-stock item is flagged in the current batch list.",
      variant: metrics.lowStock > 0 ? "warning-light" : "success-light",
    },
    {
      title:
        totalConsultationsToday > 0
          ? "Consultation demand is active today"
          : "No consultation trend yet today",
      description:
        totalConsultationsToday > 0
          ? `${totalConsultationsToday} consultation case${
              totalConsultationsToday === 1 ? "" : "s"
            } have been logged today, so medicine demand should be watched closely.`
          : "Start recording consultations to unlock stronger daily insight signals.",
      variant: totalConsultationsToday > 0 ? "info-light" : "outline",
    },
  ] as const;

  const referralCards = [
    {
      title:
        activeReferralsCount > 0
          ? `${activeReferralsCount} referral request${
              activeReferralsCount === 1 ? "" : "s"
            } need follow-up`
          : "No pending referral right now",
      description:
        activeReferralsCount > 0
          ? "Review sending and receiving centers so medicine releases are not delayed."
          : "Your center has no pending referral request at the moment.",
      variant: activeReferralsCount > 0 ? "warning-light" : "success-light",
    },
    {
      title:
        metrics.lowStock > 0
          ? "Prepare referral backup for low-stock items"
          : "Referral backup is ready if stock changes",
      description:
        metrics.lowStock > 0
          ? "Low-stock items may need nearby barangay support if demand rises before restock."
          : "Keep nearby center options ready, even while stock is still stable.",
      variant: metrics.lowStock > 0 ? "info-light" : "outline",
    },
  ] as const;

  return (
    <ProtectedShell title="Health Center Overview">
      <div className="flex flex-1 flex-col gap-4">
        <div className="grid auto-rows-min gap-4 xl:grid-cols-3">
          <section className="min-h-[172px] rounded-xl border border-[#262626] bg-[#181818] p-5">
            <Badge variant="info-light" size="sm">
              Daily overview
            </Badge>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[#fafafa]">
              Welcome back, {profile?.display_name || user?.email || "Health Worker"}.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#a1a1aa]">
              Review consultations, stock pressure, and referral work before
              scanning or dispensing.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm" className="h-8 rounded-md">
                <Link href="/scan">
                  <Camera className="size-4" />
                  Open Scan
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="h-8 rounded-md border-[#3f3f46] bg-[#202020] text-[#fafafa] hover:bg-[#27272a]"
              >
                <Link href="/dispense">
                  <Activity className="size-4" />
                  Dispense
                </Link>
              </Button>
            </div>
          </section>

          <section className="min-h-[172px] rounded-xl border border-[#262626] bg-[#181818] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9bb7e0]">
                  Center status
                </p>
                <h3 className="mt-4 text-lg font-semibold text-[#fafafa]">
                  Keep service moving
                </h3>
              </div>
              <Badge variant="success-light" size="sm">
                Live data
              </Badge>
            </div>
            <div className="mt-5 grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-[#343434] px-3 py-2">
                <span className="text-[#a1a1aa]">Consultations</span>
                <span className="font-semibold text-[#fafafa]">
                  {totalConsultationsToday}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#343434] px-3 py-2">
                <span className="text-[#a1a1aa]">Pending referrals</span>
                <span className="font-semibold text-[#fafafa]">
                  {activeReferralsCount}
                </span>
              </div>
            </div>
          </section>

          <section className="min-h-[172px] rounded-xl border border-[#262626] bg-[#181818] p-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9bb7e0]">
              Stock watch
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <p className="text-3xl font-semibold text-[#fafafa]">{totalItems}</p>
                <p className="mt-1 text-xs text-[#a1a1aa]">units</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-amber-300">
                  {metrics.lowStock}
                </p>
                <p className="mt-1 text-xs text-[#a1a1aa]">low</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-rose-300">
                  {metrics.nearExpiry}
                </p>
                <p className="mt-1 text-xs text-[#a1a1aa]">expiry</p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mt-5 h-8 rounded-md border-[#3f3f46] bg-[#202020] text-[#fafafa] hover:bg-[#27272a]"
            >
              <Link href="/inventory">Open Full Inventory</Link>
            </Button>
          </section>
        </div>

        {criticalBatches.length > 0 ? (
          <section className="rounded-xl border border-rose-400/20 bg-rose-500/5 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-300">
                <AlertTriangle className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#fafafa]">
                  Critical expiry alerts need attention
                </h3>
                <p className="mt-1 text-xs text-[#a1a1aa]">
                  {expiredCount} expired and {nearExpiryCount} near-expiry batch
                  {nearExpiryCount === 1 ? "" : "es"} may affect patient service.
                </p>
              </div>
              <Button asChild size="sm" className="h-8 rounded-md">
                <Link href="/inventory">Review</Link>
              </Button>
            </div>
          </section>
        ) : null}

        <section
          id="insight-tabs"
          className="min-h-[calc(100vh-18.5rem)] flex-1 overflow-hidden rounded-xl border border-[#262626] bg-[#181818]"
        >
          <Tabs defaultValue="inventory" className="flex min-h-[560px] flex-col">
            <div className="flex flex-col gap-4 border-b border-[#262626] p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9bb7e0]">
                  Dashboard workspace
                </p>
                <h3 className="mt-2 text-base font-semibold text-[#fafafa]">
                  Batch inventory snapshot
                </h3>
              </div>
              <TabsList className="grid w-full grid-cols-3 lg:w-[430px]">
                <TabsTrigger value="inventory">
                  <Boxes className="size-4" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="insights">
                  <BarChart3 className="size-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="actions">
                  <Settings className="size-4" />
                  Actions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="inventory" className="mt-0 flex-1">
              <div className="flex flex-col gap-4 p-5">
                <div className="flex justify-end">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-md border-[#3f3f46] bg-[#202020] text-[#fafafa] hover:bg-[#27272a]"
                  >
                    <Link href="/inventory">Open Full Inventory</Link>
                  </Button>
                </div>
                <div className="overflow-hidden rounded-xl border border-[#343434]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryRows.length > 0 ? (
                        inventoryRows.map((item) => {
                          const status = getBatchStatus(item, today);

                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {item.medicine_master?.generic_name ||
                                      "Medicine"}
                                  </span>
                                  <span className="text-xs text-[#a1a1aa]">
                                    {item.medicine_master?.brand_name ||
                                      "No brand name"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-[#d4d4d8]">
                                {item.batch_number}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-[#d4d4d8]">
                                {new Date(item.expiry_date).toLocaleDateString(
                                  "en-PH",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={getStatusVariant(status)}
                                  size="sm"
                                >
                                  {status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    asChild
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 rounded-md text-[#fafafa] hover:bg-[#202020]"
                                  >
                                    <Link href="/inventory">
                                      <Boxes
                                        className="size-3.5"
                                        aria-hidden="true"
                                      />
                                      <span className="sr-only">
                                        Open inventory
                                      </span>
                                    </Link>
                                  </Button>
                                  <Button
                                    asChild
                                    size="icon"
                                    variant="ghost"
                                    className="size-7 rounded-md text-[#fafafa] hover:bg-[#202020]"
                                  >
                                    <Link href="/scan">
                                      <Camera
                                        className="size-3.5"
                                        aria-hidden="true"
                                      />
                                      <span className="sr-only">
                                        Scan medicine
                                      </span>
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-40 text-center text-sm text-[#a1a1aa]"
                          >
                            No medicine batch is available yet. Open Scan to add
                            your first stock record.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0 flex-1 p-5">
              <div className="grid gap-3 lg:grid-cols-3">
                {aiInsightCards.map((card) => (
                  <div
                    key={card.title}
                    className="min-h-36 rounded-xl border border-[#343434] bg-[#111111] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-[#fafafa]">
                        {card.title}
                      </p>
                      <Badge variant={card.variant} size="xs">
                        AI
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#a1a1aa]">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
              <Button asChild size="sm" className="mt-4 h-8 rounded-md">
                <Link href="/ai-insights">
                  <Sparkles className="size-4" />
                  Open Insights
                </Link>
              </Button>
            </TabsContent>

            <TabsContent value="actions" className="mt-0 flex-1 p-5">
              <div className="grid gap-3 lg:grid-cols-2">
                {referralCards.map((card) => (
                  <div
                    key={card.title}
                    className="min-h-36 rounded-xl border border-[#343434] bg-[#111111] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-[#fafafa]">
                        {card.title}
                      </p>
                      <Badge variant={card.variant} size="xs">
                        Queue
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#a1a1aa]">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="h-8 rounded-md">
                  <Link href="/ai-insights">
                    <Sparkles className="size-4" />
                    Open Insights
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-md border-[#3f3f46] bg-[#202020] text-[#fafafa] hover:bg-[#27272a]"
                >
                  <Link href="/referrals">
                    <ArrowLeftRight className="size-4" />
                    Open Referrals
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </ProtectedShell>
  );
}
