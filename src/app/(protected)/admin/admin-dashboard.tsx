"use client";

import { useState, useTransition, useMemo } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from "lucide-react";

import { approveBhw, rejectBhw } from "./actions";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface HealthCenter {
  id: string;
  profile_id: string;
  center_name: string | null;
  barangay_name: string;
  municipality: string;
  province: string;
  street_address: string | null;
  mapbox_place_name: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface BHWProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  contact_number: string | null;
  barangay_name: string | null;
  municipality: string | null;
  province: string | null;
  proof_document_path: string | null;
  role: "bhw" | "super_admin";
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
  health_center: HealthCenter | null;
  proof_document_url: string;
}

export function AdminDashboard({ profiles }: { profiles: BHWProfile[] }) {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [selectedBhwId, setSelectedBhwId] = useState<string | null>(() => {
    const initialList = profiles.filter((p) => p.approval_status === "pending");
    return initialList.length > 0 ? initialList[0].id : (profiles.length > 0 ? profiles[0].id : null);
  });
  
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter profiles based on active tab
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => p.approval_status === activeTab);
  }, [profiles, activeTab]);

  // Selected profile details
  const selectedProfile = useMemo(() => {
    return profiles.find((p) => p.id === selectedBhwId) || null;
  }, [profiles, selectedBhwId]);

  const stats = useMemo(() => {
    return {
      total: profiles.length,
      pending: profiles.filter((p) => p.approval_status === "pending").length,
      approved: profiles.filter((p) => p.approval_status === "approved").length,
      rejected: profiles.filter((p) => p.approval_status === "rejected").length,
    };
  }, [profiles]);

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this health worker?")) return;
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await approveBhw(id);
      } catch (err) {
        const error = err as Error;
        setErrorMsg(error.message || "An error occurred during approval.");
      }
    });
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter the reason for rejection (optional):");
    if (reason === null) return; // User cancelled
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await rejectBhw(id);
      } catch (err) {
        const error = err as Error;
        setErrorMsg(error.message || "An error occurred during rejection.");
      }
    });
  };

  const isPdf = selectedProfile?.proof_document_url?.toLowerCase().includes(".pdf") || 
                selectedProfile?.proof_document_path?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-6">
      {/* Stats Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111827]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Total BHWs</p>
          <p className="mt-2 text-3xl font-extrabold text-[#1E293B] dark:text-slate-100">{stats.total}</p>
        </div>
        <div className="rounded-3xl border border-amber-100 bg-amber-50/30 p-5 shadow-sm dark:border-amber-950/20 dark:bg-amber-950/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Review</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-700 dark:text-amber-300">{stats.pending}</p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-5 shadow-sm dark:border-emerald-950/20 dark:bg-emerald-950/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Approved BHWs</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">{stats.approved}</p>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-rose-50/30 p-5 shadow-sm dark:border-rose-950/20 dark:bg-rose-950/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Rejected BHWs</p>
          <p className="mt-2 text-3xl font-extrabold text-rose-700 dark:text-rose-300">{stats.rejected}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-950/30 dark:bg-rose-950/10 dark:text-rose-400">
          <ShieldAlert className="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs Control */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-px dark:border-white/10">
        <div className="flex gap-6">
          {(["pending", "approved", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              id={`tab-button-${tab}`}
              onClick={() => {
                setActiveTab(tab);
                const list = profiles.filter((p) => p.approval_status === tab);
                setSelectedBhwId(list.length > 0 ? list[0].id : null);
              }}
              className={`relative pb-3 text-sm font-semibold transition-colors focus:outline-none ${
                activeTab === tab
                  ? "text-[#2563EB] dark:text-[#60A5FA]"
                  : "text-[#64748B] hover:text-[#1E293B] dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        
        {/* Left Column: BHW List */}
        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
          {filteredProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#E2E8F0] bg-white py-12 px-4 text-center dark:border-white/10 dark:bg-[#111827]">
              <AlertCircle className="size-8 text-[#64748B] dark:text-slate-500" />
              <p className="mt-3 text-sm font-semibold text-[#1E293B] dark:text-slate-200">
                No health workers found
              </p>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                There are no {activeTab} BHW accounts to show.
              </p>
            </div>
          ) : (
            filteredProfiles.map((p) => {
              const isSelected = p.id === selectedBhwId;
              return (
                <button
                  key={p.id}
                  id={`bhw-card-${p.id}`}
                  onClick={() => setSelectedBhwId(p.id)}
                  className={`w-full text-left rounded-3xl border p-4 transition-all duration-200 ${
                    isSelected
                      ? "border-[#2563EB] bg-[#EFF6FF] shadow-sm dark:border-[#3B82F6] dark:bg-[#1e293b]"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] dark:border-white/10 dark:bg-[#111827] dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm font-bold ${
                        isSelected ? "text-[#2563EB] dark:text-[#60A5FA]" : "text-[#1E293B] dark:text-slate-100"
                      }`}>
                        {p.display_name || "Name not set"}
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
                        {p.email}
                      </p>
                    </div>
                    {p.approval_status === "approved" && (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 fill-emerald-50" />
                    )}
                    {p.approval_status === "rejected" && (
                      <XCircle className="size-4 shrink-0 text-rose-500 fill-rose-50" />
                    )}
                    {p.approval_status === "pending" && (
                      <div className="size-2 rounded-full bg-amber-500 animate-pulse mt-1" />
                    )}
                  </div>
                  
                  <div className="mt-3 border-t border-[#E2E8F0] pt-3 dark:border-white/5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#64748B] dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {p.barangay_name || "No health center"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: BHW Detailed Review Dashboard */}
        <div className="space-y-6">
          {!selectedProfile ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white p-6 text-center dark:border-white/10 dark:bg-[#111827]">
              <div className="size-16 rounded-full bg-[#F8FAFC] dark:bg-white/5 flex items-center justify-center">
                <ShieldAlert className="size-8 text-[#64748B] dark:text-slate-400" />
              </div>
              <p className="mt-4 text-base font-bold text-[#1E293B] dark:text-slate-100">
                Select a health worker
              </p>
              <p className="mt-2 text-sm text-[#64748B] dark:text-slate-400 max-w-sm">
                Choose a BHW profile from the list to examine their details, view their proofs, coordinates, and execute approvals.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-6">
              
              {/* Header profile info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-6 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-[#1E293B] dark:text-slate-100">
                      {selectedProfile.display_name || "Name not set"}
                    </h2>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      selectedProfile.approval_status === "approved"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : selectedProfile.approval_status === "rejected"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                    }`}>
                      {selectedProfile.approval_status.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400 flex items-center gap-2">
                    <Mail className="size-4" />
                    {selectedProfile.email}
                  </p>
                </div>

                {/* Status-specific administrative actions */}
                {selectedProfile.approval_status === "pending" && (
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-reject-bhw"
                      onClick={() => handleReject(selectedProfile.id)}
                      disabled={isPending}
                      className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {isPending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                      Reject Account
                    </button>
                    <button
                      id="btn-approve-bhw"
                      onClick={() => handleApprove(selectedProfile.id)}
                      disabled={isPending}
                      className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                      Approve Account
                    </button>
                  </div>
                )}

                {selectedProfile.approval_status === "approved" && (
                  <button
                    id="btn-revoke-bhw"
                    onClick={() => handleReject(selectedProfile.id)}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-[#64748B] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95 disabled:opacity-50 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-rose-950/30 dark:hover:bg-rose-950/10"
                  >
                    Revoke Approval
                  </button>
                )}

                {selectedProfile.approval_status === "rejected" && (
                  <button
                    id="btn-reconsider-bhw"
                    onClick={() => handleApprove(selectedProfile.id)}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-xs font-bold text-[#64748B] transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 disabled:opacity-50 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-emerald-950/30 dark:hover:bg-emerald-950/10"
                  >
                    Approve Account
                  </button>
                )}
              </div>

              {/* Extended Profile details and map */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Details list card */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] dark:text-slate-200">
                    Registration Information
                  </h3>
                  
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-white/5 dark:bg-white/5 space-y-3.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400 font-medium">Contact Number:</span>
                      <span className="text-[#1E293B] dark:text-slate-100 font-semibold flex items-center gap-1.5">
                        <Phone className="size-3.5 text-[#64748B]" />
                        {selectedProfile.contact_number || "Not provided"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400 font-medium">Barangay Name:</span>
                      <span className="text-[#1E293B] dark:text-slate-100 font-semibold">{selectedProfile.barangay_name || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400 font-medium">Municipality:</span>
                      <span className="text-[#1E293B] dark:text-slate-100 font-semibold">{selectedProfile.municipality || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B] dark:text-slate-400 font-medium">Province:</span>
                      <span className="text-[#1E293B] dark:text-slate-100 font-semibold">{selectedProfile.province || "Not provided"}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E2E8F0] pt-3 dark:border-white/5">
                      <span className="text-[#64748B] dark:text-slate-400 font-medium">Date Registered:</span>
                      <span className="text-[#1E293B] dark:text-slate-100 font-semibold flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-[#64748B]" />
                        {new Date(selectedProfile.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Pinned health center details */}
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] dark:text-slate-200 pt-2">
                    Pinned Health Center
                  </h3>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-white/5 dark:bg-white/5 space-y-2.5 text-sm">
                    {selectedProfile.health_center ? (
                      <>
                        <div>
                          <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase">Mapbox Location Name</p>
                          <p className="text-[#1E293B] dark:text-slate-100 font-semibold mt-0.5">
                            {selectedProfile.health_center.mapbox_place_name || `${selectedProfile.health_center.barangay_name}, ${selectedProfile.health_center.municipality}, ${selectedProfile.health_center.province}`}
                          </p>
                        </div>
                        {selectedProfile.health_center.street_address && (
                          <div>
                            <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase">Street Address</p>
                            <p className="text-[#1E293B] dark:text-slate-100 font-semibold mt-0.5">
                              {selectedProfile.health_center.street_address}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 border-t border-[#E2E8F0] pt-2.5 dark:border-white/5 text-xs">
                          <div>
                            <span className="text-[#64748B] dark:text-slate-400 font-medium block">Latitude:</span>
                            <span className="text-[#1E293B] dark:text-slate-100 font-semibold mt-0.5 block">{selectedProfile.health_center.latitude?.toFixed(6) ?? "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] dark:text-slate-400 font-medium block">Longitude:</span>
                            <span className="text-[#1E293B] dark:text-slate-100 font-semibold mt-0.5 block">{selectedProfile.health_center.longitude?.toFixed(6) ?? "N/A"}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-[#64748B] dark:text-slate-400 py-3 text-center">
                        No health center pinned location was saved.
                      </p>
                    )}
                  </div>
                </div>

                {/* Proof document preview */}
                <div className="flex flex-col h-full min-h-[300px]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] dark:text-slate-200 mb-4 flex items-center justify-between">
                    <span>Proof of Legitimacy Document</span>
                    {selectedProfile.proof_document_url && (
                      <a
                        href={selectedProfile.proof_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 font-semibold dark:text-[#60A5FA]"
                      >
                        <ExternalLink className="size-3" />
                        Open In New Tab
                      </a>
                    )}
                  </h3>

                  <div className="flex-1 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] dark:border-white/5 dark:bg-white/5 overflow-hidden flex flex-col justify-center items-center min-h-[250px] relative p-1">
                    {selectedProfile.proof_document_url ? (
                      isPdf ? (
                        <iframe
                          src={`${selectedProfile.proof_document_url}#view=FitH`}
                          title="BHW Proof Document PDF"
                          className="w-full h-full min-h-[250px] rounded-xl border-none bg-white"
                        />
                      ) : (
                        <div className="w-full h-full relative flex items-center justify-center p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedProfile.proof_document_url}
                            alt="BHW Proof Document"
                            className="max-h-[350px] w-auto max-w-full rounded-lg object-contain shadow-sm"
                          />
                        </div>
                      )
                    ) : (
                      <div className="text-center p-4">
                        <FileText className="size-10 text-[#64748B] mx-auto mb-2 dark:text-slate-500" />
                        <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                          No uploaded proof document
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Map Preview Frame */}
              {selectedProfile.health_center && selectedProfile.health_center.latitude && selectedProfile.health_center.longitude && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1E293B] dark:text-slate-200 flex items-center gap-1.5">
                    <MapPin className="size-4 text-[#2563EB] dark:text-[#60A5FA]" />
                    Pinned Barangay Location Map
                  </h3>
                  
                  <div className="h-[280px] w-full overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-white/5 relative">
                    {!MAPBOX_TOKEN ? (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/80 dark:bg-slate-900/80 text-sm font-medium">
                        Mapbox token is missing in environment variables.
                      </div>
                    ) : (
                      <Map
                        initialViewState={{
                          longitude: selectedProfile.health_center.longitude,
                          latitude: selectedProfile.health_center.latitude,
                          zoom: 14,
                        }}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                        mapboxAccessToken={MAPBOX_TOKEN}
                      >
                        <Marker
                          longitude={selectedProfile.health_center.longitude}
                          latitude={selectedProfile.health_center.latitude}
                          anchor="bottom"
                        >
                          <div className="text-[#2563EB] drop-shadow-md">
                            <MapPin className="size-8 fill-white" />
                          </div>
                        </Marker>
                      </Map>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
