"use client";

import { useState } from "react";
import { Search, Trash2, Edit3, X, AlertTriangle, Calendar, Package, Sparkles } from "lucide-react";
import { MedicineBatchWithDetails } from "@/lib/supabase/inventory";
import { updateInventoryBatchAction, deleteInventoryBatchAction } from "./actions";

export function InventoryClient({ initialBatches }: { initialBatches: MedicineBatchWithDetails[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "low_stock" | "near_expiry" | "expired" | "out_of_stock">("all");
  
  // Modal states
  const [editingItem, setEditingItem] = useState<MedicineBatchWithDetails | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editUnit, setEditUnit] = useState("pcs");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deletingItem, setDeletingItem] = useState<MedicineBatchWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const statusBadges = {
    available: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30",
    low_stock: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30",
    near_expiry: "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30",
    expired: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30",
    out_of_stock: "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/5",
  };

  const statusLabels = {
    available: "Available",
    low_stock: "Low Stock",
    near_expiry: "Near Expiry",
    expired: "Expired",
    out_of_stock: "Out of Stock",
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(todayStr);

  const processedInventory = initialBatches.map((item) => {
    const expDate = new Date(item.expiry_date);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: "available" | "low_stock" | "near_expiry" | "expired" | "out_of_stock" = "available";
    if (diffDays < 0) {
      status = "expired";
    } else if (diffDays <= 180) {
      status = "near_expiry";
    } else if (item.quantity === 0) {
      status = "out_of_stock";
    } else if (item.quantity <= 50) {
      status = "low_stock";
    }

    return {
      ...item,
      computedStatus: status,
      daysToExpiry: diffDays,
    };
  });

  const filteredInventory = processedInventory.filter((item) => {
    const generic = item.medicine_master?.generic_name || "";
    const brand = item.medicine_master?.brand_name || "";
    const batch = item.batch_number || "";

    const matchesSearch =
      generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || item.computedStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Action handlers
  const openEditModal = (item: typeof processedInventory[0]) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
    setEditUnit(item.unit);
    setEditExpiryDate(item.expiry_date);
    setEditErrorMsg("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editQuantity < 0) {
      setEditErrorMsg("Hindi pwedeng negative ang quantity.");
      return;
    }

    setIsSaving(true);
    setEditErrorMsg("");

    const res = await updateInventoryBatchAction(editingItem.id, {
      quantity: editQuantity,
      unit: editUnit,
      expiryDate: editExpiryDate,
    });

    setIsSaving(false);
    if (res.success) {
      setEditingItem(null);
    } else {
      setEditErrorMsg(res.error || "Failed to update batch.");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    const res = await deleteInventoryBatchAction(deletingItem.id);
    setIsDeleting(false);

    if (res.success) {
      setDeletingItem(null);
    } else {
      alert(res.error || "Failed to delete batch.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Subheader action bar */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Local Center Stock</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Browse, filter, and monitor active batches held inside your barangay health center cabinet.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search generic name, brand, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-11 pr-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(["all", "low_stock", "near_expiry", "expired", "out_of_stock"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-2xl px-4 py-3 text-xs font-bold capitalize whitespace-nowrap transition-all duration-200 ${
                  filterStatus === status
                    ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/15"
                    : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2563EB] dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
                }`}
              >
                {status === "all" ? "All Items" : status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory list */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-white/5 text-[#64748B] dark:text-slate-400 font-semibold">
                <th className="pb-3 pr-4 font-bold">Medicine Generic/Brand</th>
                <th className="pb-3 px-4 font-bold">Batch Code</th>
                <th className="pb-3 px-4 font-bold text-center">Expiry Date</th>
                <th className="pb-3 px-4 font-bold text-center">In Stock</th>
                <th className="pb-3 px-4 font-bold text-center">Status</th>
                <th className="pb-3 pl-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-white/5">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748B] dark:text-slate-500 font-medium">
                    No matching medicine inventory batches found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-[#1E293B] dark:text-slate-200">
                        {item.medicine_master?.generic_name}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                        {item.medicine_master?.brand_name || "Generic"} • {item.medicine_master?.strength} • {item.medicine_master?.dosage_form}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-[#1E293B] dark:text-slate-200">
                      {item.batch_number}
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-[#64748B] dark:text-slate-350">
                      <div>{item.expiry_date}</div>
                      {item.daysToExpiry > 0 && item.daysToExpiry <= 180 && (
                        <div className="text-[10px] text-rose-500 font-bold mt-0.5">({item.daysToExpiry} days left)</div>
                      )}
                      {item.daysToExpiry <= 0 && (
                        <div className="text-[10px] text-red-500 font-bold mt-0.5">(EXPIRED)</div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex rounded-xl bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusBadges[item.computedStatus as keyof typeof statusBadges]}`}>
                        {statusLabels[item.computedStatus as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="flex size-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#BFDBFE] hover:text-[#2563EB] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-[#60A5FA] transition"
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="flex size-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:border-red-200 hover:text-red-650 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-red-400 transition"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-350">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#111827]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-white/5 dark:text-blue-400">
                  <Edit3 className="size-4.5" />
                </span>
                <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">Ayusin ang Batch</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-[#94A3B8] hover:text-[#64748B] dark:hover:text-slate-200 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-1">Medisina</label>
                <div className="rounded-xl bg-[#F8FAFC] px-3.5 py-2.5 text-sm font-semibold text-[#1E293B] dark:bg-white/5 dark:text-slate-300">
                  {editingItem.medicine_master?.generic_name}
                  <span className="block text-xs font-medium text-[#64748B] dark:text-slate-400 mt-0.5">
                    {editingItem.medicine_master?.brand_name || "Generic"} • {editingItem.medicine_master?.strength} • {editingItem.medicine_master?.dosage_form}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-quantity" className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-1">Dami (Quantity)</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
                    <input
                      id="edit-quantity"
                      type="number"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9 pr-3 py-2.5 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-unit" className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-1">Unit</label>
                  <select
                    id="edit-unit"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                  >
                    <option value="tabs">tabs (Tablets)</option>
                    <option value="caps">caps (Capsules)</option>
                    <option value="mL">mL (Syrup/Liquid)</option>
                    <option value="vials">vials (Injectable)</option>
                    <option value="sachets">sachets (Powder)</option>
                    <option value="g">g (Ointments)</option>
                    <option value="pcs">pcs (Pieces)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="edit-expiry" className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 mb-1">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
                  <input
                    id="edit-expiry"
                    type="date"
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-9 pr-3 py-2.5 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Guiding tip banner */}
              <div className="rounded-2xl bg-blue-50/50 p-4 border border-blue-100/50 dark:bg-white/5 dark:border-white/5 text-xs text-[#2563EB] dark:text-blue-400 leading-relaxed flex gap-2">
                <Sparkles className="size-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Tip:</strong> Paki-verify kung ang dami ay pira-piraso (tabs/caps) at hindi kahon, upang maging tugma ang dispensing calculations natin sa cabinet records.
                </div>
              </div>

              {editErrorMsg && (
                <div className="rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400 font-semibold">
                  {editErrorMsg}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2 border-t border-[#E2E8F0] dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-300 dark:hover:bg-slate-800 transition"
                >
                  Banselahin
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#1D4ED8] transition disabled:opacity-50"
                >
                  {isSaving ? "Inililigtas..." : "I-save ang Pagbabago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#111827]">
            <div className="flex items-center gap-3 text-red-650 dark:text-red-400 border-b border-[#E2E8F0] dark:border-white/5 pb-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-100">Sigurado ka bang buburahin ito?</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Permanente itong mawawala sa iyong imbentaryo.</p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-red-50/20 border border-red-100/50 dark:bg-red-950/5 dark:border-red-950/20 space-y-2">
              <div className="text-sm font-bold text-[#1E293B] dark:text-slate-200">
                {deletingItem.medicine_master?.generic_name}
              </div>
              <div className="text-xs text-[#64748B] dark:text-slate-400 font-semibold">
                Batch Code: <span className="font-mono text-[#1E293B] dark:text-slate-200">{deletingItem.batch_number}</span>
              </div>
              <div className="text-xs text-[#64748B] dark:text-slate-400 font-semibold">
                Kasalukuyang Dami: <span className="text-[#1E293B] dark:text-slate-200">{deletingItem.quantity} {deletingItem.unit}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-3 border-t border-[#E2E8F0] dark:border-white/5">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-300 dark:hover:bg-slate-800 transition"
              >
                Huwag Burahin
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSubmit}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-750 transition disabled:opacity-50"
              >
                {isDeleting ? "Binubura..." : "Oo, Burahin"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
