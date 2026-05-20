"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

const PSGC_API = "https://psgc.cloud/api";

type Location = {
  code: string;
  name: string;
};

function sortLocations(list: Location[]) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchLocationList(path: string) {
  const response = await fetch(`${PSGC_API}${path}`);
  const data = await response.json();
  const list = Array.isArray(data) ? data : data?.value || [];
  return sortLocations(list as Location[]);
}

export function PatientAddressPicker({
  barangay,
  cityMunicipality,
  onBarangayChange,
  onCityMunicipalityChange,
  disabled = false,
}: {
  barangay: string;
  cityMunicipality: string;
  onBarangayChange: (value: string) => void;
  onCityMunicipalityChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [municipalities, setMunicipalities] = useState<Location[]>([]);
  const [barangays, setBarangays] = useState<Location[]>([]);

  const [provinceCode, setProvinceCode] = useState("");
  const [municipalityCode, setMunicipalityCode] = useState("");
  const [barangayCode, setBarangayCode] = useState("");

  const [provinceName, setProvinceName] = useState("");
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchLocationList("/provinces")
      .then((list) => {
        if (!active) return;
        setProvinces(list);
      })
      .catch(() => {
        if (!active) return;
        setErrorMsg("Unable to load address list. Please try again.");
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingProvinces(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!provinceCode) {
      return undefined;
    }

    fetchLocationList(`/provinces/${provinceCode}/cities-municipalities`)
      .then((list) => {
        if (!active) return;
        setMunicipalities(list);
      })
      .catch(() => {
        if (!active) return;
        setErrorMsg("Unable to load municipalities for this province.");
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingMunicipalities(false);
      });

    return () => {
      active = false;
    };
  }, [provinceCode, onBarangayChange, onCityMunicipalityChange]);

  useEffect(() => {
    let active = true;

    if (!municipalityCode) {
      return undefined;
    }

    fetchLocationList(`/cities-municipalities/${municipalityCode}/barangays`)
      .then((list) => {
        if (!active) return;
        setBarangays(list);
      })
      .catch(() => {
        if (!active) return;
        setErrorMsg("Unable to load barangays for this municipality.");
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingBarangays(false);
      });

    return () => {
      active = false;
    };
  }, [municipalityCode, onBarangayChange]);

  const selectedProvinceLabel = provinceName || "Select Province";

  return (
    <div className="space-y-3 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC]/50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
        <MapPin className="size-4 text-[#2563EB]" />
        Address Lookup via PSGC API
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
            Province
          </label>
          <select
            disabled={disabled || isLoadingProvinces}
            value={provinceCode}
            onChange={(event) => {
              const code = event.target.value;
              const selected = provinces.find((item) => item.code === code);
              setProvinceCode(code);
              setProvinceName(selected?.name ?? "");
              setMunicipalities([]);
              setBarangays([]);
              setMunicipalityCode("");
              setBarangayCode("");
              onCityMunicipalityChange("");
              onBarangayChange("");
              setIsLoadingMunicipalities(Boolean(code));
              setIsLoadingBarangays(false);
              setErrorMsg(null);
            }}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] outline-none transition focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-60"
          >
            <option value="">{isLoadingProvinces ? "Loading provinces..." : "Select Province"}</option>
            {provinces.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
            City / Municipality
          </label>
          <select
            disabled={disabled || !provinceCode || isLoadingMunicipalities}
            value={municipalityCode}
            onChange={(event) => {
              const code = event.target.value;
              const selected = municipalities.find((item) => item.code === code);
              setMunicipalityCode(code);
              onCityMunicipalityChange(selected?.name ?? "");
              setBarangays([]);
              setBarangayCode("");
              onBarangayChange("");
              setIsLoadingBarangays(Boolean(code));
              setErrorMsg(null);
            }}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] outline-none transition focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-60"
          >
            <option value="">
              {!provinceCode
                ? "Select province first"
                : isLoadingMunicipalities
                  ? "Loading cities / municipalities..."
                  : "Select City / Municipality"}
            </option>
            {municipalities.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
            Barangay
          </label>
          <select
            disabled={disabled || !municipalityCode || isLoadingBarangays}
            value={barangayCode}
            onChange={(event) => {
              const code = event.target.value;
              const selected = barangays.find((item) => item.code === code);
              setBarangayCode(code);
              onBarangayChange(selected?.name ?? "");
              setErrorMsg(null);
            }}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#1E293B] outline-none transition focus:border-[#BFDBFE] dark:border-white/10 dark:bg-[#1F2937] dark:text-slate-100 disabled:opacity-60"
          >
            <option value="">
              {!municipalityCode
                ? "Select municipality first"
                : isLoadingBarangays
                  ? "Loading barangays..."
                  : "Select Barangay"}
            </option>
            {barangays.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-white px-4 py-3 text-xs text-[#64748B] dark:border-white/10 dark:bg-black/10 dark:text-slate-400">
        {errorMsg ? (
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Loader2 className="size-3.5 animate-spin" />
            {errorMsg}
          </div>
        ) : (
          <p>
            Choose the address from the PSGC API so the patient record stays minimal while avoiding manual typing.
            {provinceName ? ` Selected province: ${selectedProvinceLabel}.` : ""}
          </p>
        )}
        <p className="mt-2 text-[#94A3B8] dark:text-slate-500">
          Current selection: {cityMunicipality || "City / Municipality"} / {barangay || "Barangay"}
        </p>
      </div>
    </div>
  );
}
