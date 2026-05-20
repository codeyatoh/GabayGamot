"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Bolt, Sparkles, Loader2, CheckCircle2, Upload, AlertTriangle, Layers } from "lucide-react";
import { saveScannedMedicineAction, checkDatabaseMatchAction } from "./actions";
import type { Database } from "@/types/database";

type MedicineMasterRow = Database["public"]["Tables"]["medicine_master"]["Row"];
type MedicineBatchRow = Database["public"]["Tables"]["medicine_batches"]["Row"];

interface ExtractedMedicine {
  medicine_name: string;
  generic_name: string;
  brand_name: string;
  strength: string;
  dosage_form: string;
  category: string;
  expiry_date: string;
  batch_number: string;
  manufacturer: string;
  confidence_level: "high" | "medium" | "low";
  warnings: string[];
  suggested_unit?: string;
  pack_size_quantity?: number;
}

export function ScanClient() {
  const [scanState, setScanState] = useState<"idle" | "capturing" | "extracting" | "reviewed">("idle");
  const [flash, setFlash] = useState(false);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Form fields
  const [genericName, setGenericName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [strength, setStrength] = useState("");
  const [dosageForm, setDosageForm] = useState("");
  const [category, setCategory] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState<"high" | "medium" | "low">("medium");
  const [warnings, setWarnings] = useState<string[]>([]);
  
  const [manualQty, setManualQty] = useState("");
  const [manualUnit, setManualUnit] = useState("pcs");

  // Keep track of original AI-detected quantity & unit for smart auto-filling & warning messages
  const [aiQuantity, setAiQuantity] = useState<number | null>(null);
  const [aiUnit, setAiUnit] = useState<string | null>(null);

  // Live Database Matching State
  const [matchResult, setMatchResult] = useState<{
    matchType: "new_medicine" | "existing_medicine_new_batch" | "existing_batch" | "error" | null;
    medicine: MedicineMasterRow | null;
    matchingBatch: MedicineBatchRow | null;
    existingBatches: MedicineBatchRow[];
  }>({
    matchType: null,
    medicine: null,
    matchingBatch: null,
    existingBatches: [],
  });
  const [isCheckingMatch, setIsCheckingMatch] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-suggest unit based on the AI-extracted dosage form
  useEffect(() => {
    if (!dosageForm) return;
    const form = dosageForm.toLowerCase().trim();
    let suggestedUnit = "pcs";
    if (form.includes("tablet")) {
      suggestedUnit = "tabs";
    } else if (form.includes("capsule")) {
      suggestedUnit = "caps";
    } else if (
      form.includes("syrup") ||
      form.includes("suspension") ||
      form.includes("solution") ||
      form.includes("drops") ||
      form.includes("elixir")
    ) {
      suggestedUnit = "mL";
    } else if (form.includes("sachet")) {
      suggestedUnit = "sachets";
    } else if (
      form.includes("cream") ||
      form.includes("ointment") ||
      form.includes("gel")
    ) {
      suggestedUnit = "g";
    } else if (form.includes("vial") || form.includes("ampule") || form.includes("injection")) {
      suggestedUnit = "vials";
    }

    Promise.resolve().then(() => {
      setManualUnit(suggestedUnit);
    });
  }, [dosageForm]);

  // Helper to trigger database matching check
  const triggerDatabaseMatch = async (
    gName: string,
    bName: string,
    str: string,
    dForm: string,
    bNum: string
  ) => {
    if (!gName || !str || !dForm || !bNum) {
      return;
    }

    setIsCheckingMatch(true);
    try {
      const res = await checkDatabaseMatchAction({
        genericName: gName,
        brandName: bName || null,
        strength: str,
        dosageForm: dForm,
        batchNumber: bNum,
      });

      if (res.success) {
        setMatchResult({
          matchType: res.matchType || "error",
          medicine: res.medicine || null,
          matchingBatch: res.matchingBatch || null,
          existingBatches: res.existingBatches || [],
        });
      } else {
        console.warn("Match query failed:", res.error);
      }
    } catch (err) {
      console.error("Match error:", err);
    } finally {
      setIsCheckingMatch(false);
    }
  };

  // Debounce and trigger database match checking
  useEffect(() => {
    if (scanState !== "reviewed") return;

    const timer = setTimeout(() => {
      triggerDatabaseMatch(genericName, brandName, strength, dosageForm, batchNumber);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [genericName, brandName, strength, dosageForm, batchNumber, scanState]);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        setApiError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCamera(true);
      } catch (err) {
        console.warn("Webcam access rejected or unavailable, falling back to upload mode:", err);
        setHasCamera(false);
      }
    }

    if (scanState === "idle") {
      startCamera();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [scanState]);

  // Capture image frame from video feed
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanState("capturing");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      
      // Stop video stream track immediately to release camera lock
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      // Proceed to send image to Gemini endpoint
      processImage(dataUrl);
    }
  };

  // Process selected file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanState("capturing");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      processImage(dataUrl);
    };
    reader.onerror = () => {
      setApiError("Failed to read image file.");
      setScanState("idle");
    };
    reader.readAsDataURL(file);
  };

  // POST image data URL to the secure API route
  const processImage = async (dataUrl: string) => {
    setScanState("extracting");
    setApiError(null);

    try {
      const res = await fetch("/api/gemini/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to process label image.");
      }

      const data: ExtractedMedicine = await res.json();
      
      // Populate fields
      setGenericName(data.generic_name || "");
      setBrandName(data.brand_name || "");
      setStrength(data.strength || "");
      setDosageForm(data.dosage_form || "");
      setCategory(data.category || "");
      setBatchNumber(data.batch_number || "");
      setExpiryDate(data.expiry_date || "");
      setManufacturer(data.manufacturer || "");
      setConfidenceLevel(data.confidence_level || "medium");
      setWarnings(data.warnings || []);
      
      // Handle smart auto-fill of quantity and unit
      const detectedQty = data.pack_size_quantity || 0;
      const detectedUnit = data.suggested_unit || "";

      setAiQuantity(detectedQty > 0 ? detectedQty : null);
      setAiUnit(detectedUnit || null);

      if (detectedQty > 0) {
        setManualQty(String(detectedQty));
      } else {
        setManualQty("");
      }

      if (detectedUnit) {
        setManualUnit(detectedUnit);
      }
      
      setScanState("reviewed");

      // Trigger database match checking immediately on load
      if (data.generic_name && data.strength && data.dosage_form && data.batch_number) {
        triggerDatabaseMatch(
          data.generic_name,
          data.brand_name || "",
          data.strength,
          data.dosage_form,
          data.batch_number
        );
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while analyzing the label.";
      setApiError(msg);
      setScanState("idle");
    }
  };

  // Confirm and persist to database via Server Action
  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQty) return;

    setIsSaving(true);
    setApiError(null);

    try {
      const response = await saveScannedMedicineAction({
        genericName,
        brandName: brandName || null,
        strength,
        dosageForm,
        category: category || null,
        batchNumber,
        expiryDate,
        quantity: parseInt(manualQty, 10),
        unit: manualUnit,
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // Success - reset flow
      alert("Medicine batch successfully added to inventory!");
      resetScan();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Could not save medicine record. Try again.";
      setApiError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const resetScan = () => {
    setScanState("idle");
    setManualQty("");
    setManualUnit("pcs");
    setAiQuantity(null);
    setAiUnit(null);
    setApiError(null);
    setMatchResult({
      matchType: null,
      medicine: null,
      matchingBatch: null,
      existingBatches: [],
    });
  };

  const hasExpiryMismatch = !!(
    matchResult.matchType === "existing_batch" &&
    matchResult.matchingBatch &&
    expiryDate &&
    matchResult.matchingBatch.expiry_date !== expiryDate
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Hidden canvas for video captures */}
      <canvas ref={canvasRef} className="hidden" />

      {scanState === "idle" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827]">
            <h2 className="text-lg font-bold text-[#1E293B] dark:text-slate-100">Add Stock via Label Scanner</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              Aim your device camera at the medicine bottle/box label. Gemini AI will automatically read details like brand, dosage, and batch numbers.
            </p>
          </div>

          {apiError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold flex gap-2.5 items-start">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Viewfinder Container */}
          {hasCamera === true ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#0F172A] border border-[#334155] flex flex-col justify-between p-5 shadow-inner">
              {/* Laser Scan line animation */}
              <div className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_#22D3EE] z-10 animate-pulse top-1/2" />

              {/* Live Video stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Top controls inside container */}
              <div className="z-10 flex justify-between w-full">
                <button
                  type="button"
                  onClick={() => setFlash(!flash)}
                  className={`flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-[#1E293B]/80 text-white backdrop-blur transition hover:bg-[#334155] ${flash ? "text-amber-400 bg-[#334155]" : ""}`}
                >
                  <Bolt className="size-5" />
                </button>
                <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-[#1E293B]/80 text-white backdrop-blur">
                  <span className="text-[10px] font-bold tracking-wider">1.0x</span>
                </div>
              </div>

              {/* Viewfinder Target Guide */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-44 border-2 border-dashed border-cyan-400/80 rounded-2xl flex items-center justify-center z-10">
                <span className="text-[9px] uppercase font-black text-cyan-200/80 tracking-widest bg-[#0F172A]/40 px-2 py-1 rounded-md">Align Medicine Label</span>
              </div>

              {/* Bottom camera overlay */}
              <div className="z-10 flex flex-col sm:flex-row items-center justify-center gap-3 mt-auto">
                <button
                  type="button"
                  onClick={captureFrame}
                  className="flex items-center gap-2 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3.5 font-bold shadow-lg shadow-[#2563EB]/25 active:scale-95 transition duration-200"
                >
                  <Camera className="size-5" />
                  Capture & Scan Label
                </button>
                <label className="flex items-center gap-2 rounded-2xl bg-[#334155] hover:bg-[#475569] text-white px-5 py-3.5 font-bold cursor-pointer transition duration-200">
                  <Upload className="size-5" />
                  Upload Image
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : hasCamera === false ? (
            /* Upload Fallback if Camera Permission Denied or Unavailable */
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#0F172A] border border-[#334155] flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <Camera className="size-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">Webcam Stream Blocked or Unavailable</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Please grant browser camera permissions to enable instant live scanning, or upload an image file instead.
                </p>
              </div>
              <label className="flex items-center gap-2 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 font-bold cursor-pointer shadow-lg shadow-[#2563EB]/15 transition">
                <Upload className="size-4" />
                Upload Label Image
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            /* Checking media devices status state */
            <div className="aspect-[4/3] w-full rounded-3xl bg-[#0F172A] border border-[#334155] flex flex-col items-center justify-center text-center p-6">
              <Loader2 className="size-8 text-[#2563EB] animate-spin" />
              <p className="text-xs text-slate-400 mt-2">Checking camera access status...</p>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl border border-[#EFF6FF] bg-[#EFF6FF]/40 p-4 dark:border-white/5 dark:bg-white/5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] dark:bg-white/5 dark:text-[#60A5FA]">
              <Sparkles className="size-4" />
            </span>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              <strong className="text-[#1E293B] dark:text-slate-200 font-semibold">Gemini Rule:</strong> You must review all extracted fields and manually enter the stock count. AI is not permitted to auto-save inventory records.
            </p>
          </div>
        </div>
      )}

      {/* Capturing / Loading states */}
      {(scanState === "capturing" || scanState === "extracting") && (
        <div className="aspect-[4/3] w-full rounded-3xl bg-[#0F172A] border border-[#334155] flex flex-col items-center justify-center text-center p-6 space-y-4 shadow-xl">
          <Loader2 className="size-10 text-cyan-400 animate-spin" />
          <div>
            <p className="font-bold text-slate-100 text-base">
              {scanState === "capturing" ? "Capturing image..." : "AI analyzing medicine label..."}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {scanState === "capturing"
                ? "Freezing camera view and capturing high-resolution frame."
                : "Securely sending image to Gemini Flash to extract medicine catalog and batch details."}
            </p>
          </div>
        </div>
      )}

      {/* Review Form */}
      {scanState === "reviewed" && (
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111827] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-white/5 gap-3">
            <div>
              <h3 className="font-bold text-[#1E293B] dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-[#16A34A]" />
                Verify AI-Extracted Details
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Please review the details extracted by Gemini and complete the fields below.</p>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold capitalize border ${
              confidenceLevel === "high"
                ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-900/30"
                : confidenceLevel === "medium"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30"
                : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900/30"
            }`}>
              Confidence: {confidenceLevel}
            </span>
          </div>

          {apiError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold flex gap-2.5 items-start">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleConfirmSave} className="space-y-4">
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Medicine Generic Name</label>
                <input
                  type="text"
                  required
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Brand Name (Optional)</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Strength</label>
                <input
                  type="text"
                  required
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="e.g. 500 mg, 10mg/5mL"
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Dosage Form</label>
                <input
                  type="text"
                  required
                  value={dosageForm}
                  onChange={(e) => setDosageForm(e.target.value)}
                  placeholder="e.g. Tablet, Capsule, Syrup"
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Antibiotic, Analgesic"
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Batch Number</label>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">Manufacturer</label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                />
              </div>
            </div>

            {/* Live Database Matching Panel */}
            {matchResult.matchType && (
              <div className="rounded-3xl border border-[#E2E8F0] p-5 bg-[#F8FAFC]/50 dark:border-white/5 dark:bg-[#1E293B]/20 backdrop-blur space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#475569] dark:text-slate-400">
                    Database Matching Verification
                  </span>
                  {isCheckingMatch && (
                    <span className="flex items-center gap-1 text-[10px] text-[#2563EB] dark:text-[#60A5FA] font-bold">
                      <Loader2 className="size-3 animate-spin" />
                      Checking matching...
                    </span>
                  )}
                </div>

                {matchResult.matchType === "new_medicine" && (
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4 dark:border-cyan-900/30 dark:bg-cyan-950/10 space-y-2.5 transition duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400">
                        <Sparkles className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-cyan-900 dark:text-cyan-300 text-sm">
                          🆕 Bagong Medisina (New Catalog Entry)
                        </h4>
                        <p className="text-xs text-cyan-700 dark:text-cyan-400/80 mt-0.5">
                          Ang medisina na ito ay wala pa sa global master catalog.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-cyan-800 dark:text-cyan-400 leading-relaxed pl-11">
                      Kapag kinumpirma at sinave mo ito, <strong>awtomatikong marerehistro</strong> ang medisina sa global list (`medicine_master`) at gagawa ng bagong stock batch sa iyong barangay center cabinet.
                    </p>
                  </div>
                )}

                {matchResult.matchType === "existing_medicine_new_batch" && (
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/30 dark:bg-indigo-950/10 space-y-3 transition duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                        <Layers className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-indigo-900 dark:text-indigo-300 text-sm">
                          📦 Katugmang Medisina, Bagong Batch (Existing Medicine, New Batch)
                        </h4>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400/80 mt-0.5">
                          Nahanap ang medisina sa global master catalog.
                        </p>
                      </div>
                    </div>
                    
                    <div className="pl-11 space-y-2.5">
                      <p className="text-xs text-indigo-800 dark:text-indigo-400 leading-relaxed">
                        Katugma nito ang existing catalog record: <strong className="text-indigo-900 dark:text-indigo-300 font-extrabold">{matchResult.medicine?.generic_name} {matchResult.medicine?.brand_name ? `(${matchResult.medicine?.brand_name})` : ""} - {matchResult.medicine?.strength}, {matchResult.medicine?.dosage_form}</strong>. 
                        Dahil bago ang batch number o iba ang expiry date, ito ay ilalagay bilang <strong>bagong hiwalay na batch</strong> sa iyong stock.
                      </p>

                      {matchResult.existingBatches.length > 0 && (
                        <div className="rounded-xl bg-indigo-100/30 dark:bg-indigo-950/30 p-2.5 border border-indigo-100 dark:border-indigo-900/10">
                          <span className="block text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider mb-1.5">
                            Ibang Active Batches sa Iyong Barangay:
                          </span>
                          <div className="space-y-1">
                            {matchResult.existingBatches.map((b, idx) => (
                              <div key={idx} className="flex justify-between text-[11px] text-indigo-800 dark:text-indigo-400 font-medium">
                                <span>Batch #{b.batch_number}</span>
                                <span>Stock: {b.quantity} {b.unit} (Exp: {b.expiry_date})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {matchResult.matchType === "existing_batch" && (
                  <div className="rounded-2xl border border-green-200 bg-green-50/40 p-4 dark:border-green-900/30 dark:bg-green-950/10 space-y-3 transition duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                        <CheckCircle2 className="size-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-green-900 dark:text-green-300 text-sm">
                          ⚡ Katugmang Batch (Existing Batch Match)
                        </h4>
                        <p className="text-xs text-green-700 dark:text-green-400/80 mt-0.5">
                          Tugma sa umiiral na batch ng medisina sa iyong cabinet.
                        </p>
                      </div>
                    </div>
                    
                    <div className="pl-11 space-y-2.5">
                      <p className="text-xs text-green-800 dark:text-green-400 leading-relaxed">
                        Mayroon nang Batch <strong className="underline">#{matchResult.matchingBatch?.batch_number}</strong> para sa medisinang ito sa iyong center (Expiry: {matchResult.matchingBatch?.expiry_date}).
                        Ang bagong quantity na iyong i-save ay <strong>idadagdag sa kasalukuyang stock</strong>.
                      </p>

                      {/* Quantity Live Formula Addition block */}
                      {manualQty && parseInt(manualQty, 10) > 0 && (
                        <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-green-100/50 dark:bg-green-950/40 border border-green-200/50 dark:border-green-900/20 text-xs font-bold text-green-900 dark:text-green-300">
                          <span>Kasalukuyang stock: {matchResult.matchingBatch?.quantity ?? 0} {manualUnit}</span>
                          <span>+</span>
                          <span>Bagong scan: {manualQty} {manualUnit}</span>
                          <span>=</span>
                          <span className="text-green-600 dark:text-green-400 font-extrabold text-sm underline decoration-double">
                            {(matchResult.matchingBatch?.quantity ?? 0) + parseInt(manualQty, 10)} {manualUnit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expiry Date Mismatch Warning */}
                {matchResult.matchType === "existing_batch" && 
                 matchResult.matchingBatch && 
                 expiryDate && 
                 matchResult.matchingBatch.expiry_date !== expiryDate && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-red-900 dark:text-red-300 font-extrabold text-xs">
                      <AlertTriangle className="size-4 shrink-0 text-red-600 animate-bounce" />
                      ⚠️ WARNING: Magkaiba ang Expiry Date!
                    </div>
                    <p className="text-xs text-red-800 dark:text-red-400 pl-6 leading-relaxed">
                      Ang batch na <strong>#{matchResult.matchingBatch.batch_number}</strong> ay may expiry date na <strong>{matchResult.matchingBatch.expiry_date}</strong> sa database, ngunit ang iyong in-enter ngayon ay <strong>{expiryDate}</strong>.
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400 pl-6 font-semibold leading-relaxed">
                      Upang maiwasan ang maling records (Rule 8), pakipalitan ang Batch Number (e.g. maglagay ng suffix tulad ng <strong>#{matchResult.matchingBatch.batch_number}-B</strong>) o kaya ay itama ang expiry date para magkatugma sila.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 dark:border-[#1D4ED8]/30 dark:bg-[#1D4ED8]/10">
              <p className="text-xs font-semibold text-[#1D4ED8] dark:text-[#93C5FD]">
                📦 <strong>How to count:</strong> Always enter the <u>total individual count</u> — not boxes or packs.
                Example: 2 boxes × 100 tablets = enter <strong>200 tabs</strong>. For syrups, enter total mL (e.g. 3 bottles × 60mL = <strong>180 mL</strong>).
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
                  * Quantity (Total Individual Count)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 200 (not 2 boxes)"
                  value={manualQty}
                  onChange={(e) => setManualQty(e.target.value)}
                  className="mt-2 w-full rounded-2xl border-2 border-[#2563EB] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none dark:bg-[#1F2937] dark:text-slate-100"
                />
                {aiQuantity && (
                  <div className="mt-1.5 flex items-center justify-between text-xs px-1">
                    {parseInt(manualQty, 10) === aiQuantity && manualUnit === aiUnit ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                        ✨ AI Auto-filled: {aiQuantity} {aiUnit}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Modified (AI suggested: {aiQuantity} {aiUnit})
                      </span>
                    )}
                    {parseInt(manualQty, 10) !== aiQuantity && (
                      <button
                        type="button"
                        onClick={() => {
                          setManualQty(String(aiQuantity));
                          if (aiUnit) setManualUnit(aiUnit);
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold underline cursor-pointer"
                      >
                        Reset to {aiQuantity} {aiUnit}
                      </button>
                    )}
                  </div>
                )}
                {/* Filipinized dynamic warning if they input too small a quantity */}
                {manualQty && parseInt(manualQty, 10) > 0 && parseInt(manualQty, 10) <= 5 && ["tabs", "caps"].includes(manualUnit) && (
                  <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-[#78350F]/10 dark:text-amber-300 animate-pulse">
                    <span className="font-bold">💡 Tip para sa Quantity:</span> Sigurado po ba kayong <strong>{manualQty} {manualUnit === "tabs" ? "tablet/s" : "capsule/s"}</strong> lang ito? Baka po kahon (box) ang hawak ninyo. Paki-ilagay po ang kabuuang piraso (e.g. 1 box ng 100s = <strong>100</strong>).
                  </div>
                )}
                {manualQty && parseInt(manualQty, 10) > 0 && parseInt(manualQty, 10) <= 5 && manualUnit === "mL" && (
                  <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-[#78350F]/10 dark:text-amber-300 animate-pulse">
                    <span className="font-bold">💡 Tip para sa Liquids:</span> Karaniwan po ang syrup/liquid ay nasa <strong>60 mL</strong> o <strong>120 mL</strong>. Kung 1 bote ito, pakitingnan sa label kung ilang mL at iyon po ang i-enter dito.
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                  Unit <span className="normal-case font-normal text-[#94A3B8]">(auto-suggested from Dosage Form)</span>
                </label>
                <select
                  value={manualUnit}
                  onChange={(e) => setManualUnit(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] focus:outline-none focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100"
                >
                  <option value="tabs">Tablets (tabs)</option>
                  <option value="caps">Capsules (caps)</option>
                  <option value="mL">Milliliters — for syrups/suspensions (mL)</option>
                  <option value="vials">Vials / Ampules (vials)</option>
                  <option value="sachets">Sachets — e.g. Oresol (sachets)</option>
                  <option value="g">Grams — for creams/ointments (g)</option>
                  <option value="pcs">Pieces — for other supplies (pcs)</option>
                </select>
                {manualUnit === "pcs" && dosageForm && ![""].includes(dosageForm) && (
                  <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Double-check: Is &quot;pcs&quot; correct for a <strong>{dosageForm}</strong>? If it&apos;s a tablet or syrup, please update the unit above.
                  </p>
                )}
              </div>
            </div>

            {warnings.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20 text-xs space-y-1">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="size-4 shrink-0" />
                  Warnings & Precautions
                </div>
                <ul className="list-disc pl-5 text-amber-700 dark:text-amber-400 font-medium space-y-0.5">
                  {warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-[#E2E8F0] dark:border-white/5">
              <button
                type="button"
                onClick={resetScan}
                disabled={isSaving}
                className="rounded-2xl border border-[#E2E8F0] px-5 py-3 text-sm font-bold text-[#1E293B] hover:bg-[#F8FAFC] transition disabled:opacity-50 dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/5"
              >
                Discard Scan
              </button>
              <button
                type="submit"
                disabled={!manualQty || isSaving || hasExpiryMismatch}
                className="flex items-center gap-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white px-6 py-3 font-bold shadow-md shadow-green-500/10 transition"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm & Save Stock"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
