"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Bolt, Sparkles, Loader2, CheckCircle2, Upload, AlertTriangle } from "lucide-react";
import { saveScannedMedicineAction } from "./actions";

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-suggest unit based on the AI-extracted dosage form
  useEffect(() => {
    if (!dosageForm) return;
    const form = dosageForm.toLowerCase().trim();
    if (form.includes("tablet")) {
      setManualUnit("tabs");
    } else if (form.includes("capsule")) {
      setManualUnit("caps");
    } else if (
      form.includes("syrup") ||
      form.includes("suspension") ||
      form.includes("solution") ||
      form.includes("drops") ||
      form.includes("elixir")
    ) {
      setManualUnit("mL");
    } else if (form.includes("sachet")) {
      setManualUnit("sachets");
    } else if (
      form.includes("cream") ||
      form.includes("ointment") ||
      form.includes("gel")
    ) {
      setManualUnit("g");
    } else if (form.includes("vial") || form.includes("ampule") || form.includes("injection")) {
      setManualUnit("vials");
    } else {
      setManualUnit("pcs");
    }
  }, [dosageForm]);

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
      
      setScanState("reviewed");
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
    setApiError(null);
  };

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
                disabled={!manualQty || isSaving}
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
