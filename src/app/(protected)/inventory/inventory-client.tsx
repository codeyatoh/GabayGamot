"use client";

import { useState } from "react";
import { Search, Trash2, Edit3 } from "lucide-react";

// Mock medicine data representing local center inventory
const mockInventory = [
  {
    id: "med-1",
    genericName: "Amoxicillin Trihydrate",
    brandName: "Amoxil",
    strength: "500 mg",
    dosageForm: "Capsule",
    batchNumber: "AMX-202",
    quantity: 450,
    expiryDate: "2028-09-12",
    status: "available",
  },
  {
    id: "med-2",
    genericName: "Paracetamol",
    brandName: "Biogesic",
    strength: "500 mg",
    dosageForm: "Tablet",
    batchNumber: "PAR-501",
    quantity: 12,
    expiryDate: "2027-12-05",
    status: "low_stock",
  },
  {
    id: "med-3",
    genericName: "Metformin Hydrochloride",
    brandName: "Glucophage",
    strength: "500 mg",
    dosageForm: "Tablet",
    batchNumber: "MET-301",
    quantity: 250,
    expiryDate: "2026-06-15", // near expiry
    status: "near_expiry",
  },
  {
    id: "med-4",
    genericName: "Cough Syrup (Ascof)",
    brandName: "Ascof Lagundi",
    strength: "300mg/5mL",
    dosageForm: "Syrup",
    batchNumber: "COF-012",
    quantity: 8,
    expiryDate: "2026-03-10", // expired
    status: "expired",
  },
  {
    id: "med-5",
    genericName: "Amlodipine Besilate",
    brandName: "Generic",
    strength: "5 mg",
    dosageForm: "Tablet",
    batchNumber: "AML-902",
    quantity: 800,
    expiryDate: "2029-01-20",
    status: "available",
  },
];

export function InventoryClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "low_stock" | "near_expiry" | "expired">("all");

  const statusBadges = {
    available: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30",
    low_stock: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30",
    near_expiry: "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30",
    expired: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30",
  };

  const statusLabels = {
    available: "Available",
    low_stock: "Low Stock",
    near_expiry: "Near Expiry",
    expired: "Expired",
  };

  const filteredInventory = mockInventory.filter((item) => {
    const matchesSearch =
      item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

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
          
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(["all", "low_stock", "near_expiry", "expired"] as const).map((status) => (
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
                      <div className="font-bold text-[#1E293B] dark:text-slate-200">{item.genericName}</div>
                      <div className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{item.brandName} • {item.strength} • {item.dosageForm}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-[#1E293B] dark:text-slate-200">
                      {item.batchNumber}
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-[#64748B] dark:text-slate-350">
                      {item.expiryDate}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex rounded-xl bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
                        {item.quantity} units
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusBadges[item.status as keyof typeof statusBadges]}`}>
                        {statusLabels[item.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" className="flex size-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#BFDBFE] hover:text-[#2563EB] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-[#60A5FA] transition">
                          <Edit3 className="size-4" />
                        </button>
                        <button type="button" className="flex size-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:border-red-200 hover:text-red-650 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-red-400 transition">
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

    </div>
  );
}
