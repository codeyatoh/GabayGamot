"use client";

import { useEffect, useState, useCallback } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import type { MapLayerMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Navigation } from "lucide-react";

const PSGC_API = "https://psgc.cloud/api";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface Location {
  code: string;
  name: string;
}

export function MapLocationPicker({
  defaultProvince = "",
  defaultMunicipality = "",
  defaultBarangay = "",
}: {
  defaultProvince?: string;
  defaultMunicipality?: string;
  defaultBarangay?: string;
}) {
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [municipalities, setMunicipalities] = useState<Location[]>([]);
  const [barangays, setBarangays] = useState<Location[]>([]);

  const [provinceCode, setProvinceCode] = useState("");
  const [municipalityCode, setMunicipalityCode] = useState("");
  const [barangayCode, setBarangayCode] = useState("");

  const [provinceName, setProvinceName] = useState(defaultProvince);
  const [municipalityName, setMunicipalityName] = useState(defaultMunicipality);
  const [barangayName, setBarangayName] = useState(defaultBarangay);

  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 121.7740,
    latitude: 12.8797,
    zoom: 5
  });

  // Fetch provinces on mount
  useEffect(() => {
    fetch(`${PSGC_API}/provinces`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.value || []);
        const sorted = (list as Location[]).sort((a, b) => a.name.localeCompare(b.name));
        setProvinces(sorted);
        if (defaultProvince) {
          const match = sorted.find((p) => p.name === defaultProvince);
          if (match) setProvinceCode(match.code);
        }
      })
      .catch(console.error);
  }, [defaultProvince]);

  // Fetch municipalities when province changes
  useEffect(() => {
    if (!provinceCode) {
      Promise.resolve().then(() => {
        setMunicipalities([]);
        setBarangays([]);
      });
      return;
    }
    fetch(`${PSGC_API}/provinces/${provinceCode}/cities-municipalities`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.value || []);
        const sorted = (list as Location[]).sort((a, b) => a.name.localeCompare(b.name));
        setMunicipalities(sorted);
        if (defaultMunicipality && defaultProvince === provinceName) {
           const match = sorted.find((m) => m.name === defaultMunicipality);
           if (match) setMunicipalityCode(match.code);
        }
      })
      .catch(console.error);
  }, [provinceCode, defaultMunicipality, defaultProvince, provinceName]);

  // Fetch barangays when municipality changes
  useEffect(() => {
    if (!municipalityCode) {
      Promise.resolve().then(() => {
        setBarangays([]);
      });
      return;
    }
    fetch(`${PSGC_API}/cities-municipalities/${municipalityCode}/barangays`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.value || []);
        const sorted = (list as Location[]).sort((a, b) => a.name.localeCompare(b.name));
        setBarangays(sorted);
        if (defaultBarangay && defaultMunicipality === municipalityName) {
           const match = sorted.find((b) => b.name === defaultBarangay);
           if (match) setBarangayCode(match.code);
        }
      })
      .catch(console.error);
  }, [municipalityCode, defaultBarangay, defaultMunicipality, municipalityName]);

  const onMapClick = useCallback((e: MapLayerMouseEvent) => {
    setMarker({
      longitude: e.lngLat.lng,
      latitude: e.lngLat.lat,
    });
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarker({ latitude, longitude });
        setViewState({
          latitude,
          longitude,
          zoom: 15,
        });
      },
      (error) => {
        console.error("Error detecting location:", error);
        alert("Failed to detect location. Please check your browser's location permission or pin it manually on the map.");
      }
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Hidden inputs for Server Actions */}
      <input type="hidden" name="province" value={provinceName} />
      <input type="hidden" name="municipality" value={municipalityName} />
      <input type="hidden" name="barangayName" value={barangayName} />
      {marker && (
        <>
          <input type="hidden" name="latitude" value={marker.latitude} />
          <input type="hidden" name="longitude" value={marker.longitude} />
          <input type="hidden" name="mapboxPlaceName" value={`${barangayName}, ${municipalityName}, ${provinceName}`} />
        </>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100">Province</label>
          <select
            className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            value={provinceCode}
            onChange={(e) => {
              const code = e.target.value;
              setProvinceCode(code);
              setMunicipalityCode("");
              setBarangayCode("");
              setProvinceName(e.target.options[e.target.selectedIndex].text);
              setMunicipalityName("");
              setBarangayName("");
            }}
            required
          >
            <option value="" disabled>Select Province</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100">Municipality / City</label>
          <select
            className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 disabled:opacity-50"
            value={municipalityCode}
            onChange={(e) => {
              const code = e.target.value;
              setMunicipalityCode(code);
              setBarangayCode("");
              setMunicipalityName(e.target.options[e.target.selectedIndex].text);
              setBarangayName("");
            }}
            disabled={!provinceCode}
            required
          >
            <option value="" disabled>Select Municipality / City</option>
            {municipalities.map((m) => (
              <option key={m.code} value={m.code}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100">Barangay Health Center</label>
        <select
          className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 disabled:opacity-50"
          value={barangayCode}
          onChange={(e) => {
            setBarangayCode(e.target.value);
            setBarangayName(e.target.options[e.target.selectedIndex].text);
          }}
          disabled={!municipalityCode}
          required
        >
          <option value="" disabled>Select Barangay</option>
          {barangays.map((b) => (
            <option key={b.code} value={b.code}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 pt-2">
        <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100">
          Pin Health Center Location
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
          <p className="text-xs leading-6 text-[#64748B] dark:text-slate-400">
            Click on the map to set the exact coordinates of your barangay health center.
          </p>
          <button
            type="button"
            onClick={detectLocation}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#BFDBFE] dark:focus:ring-[#1D4ED8]/40 shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            <Navigation className="size-3.5 fill-current" />
            Detect My GPS Location
          </button>
        </div>
        
        <div className="h-[300px] w-full overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-white/10 relative">
          {!MAPBOX_TOKEN && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/80 dark:bg-slate-900/80 text-sm font-medium">
              Mapbox token is missing in environment variables.
            </div>
          )}
          <Map
            {...viewState}
            onMove={(evt: { viewState: typeof viewState }) => setViewState(evt.viewState)}
            onClick={onMapClick}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {marker && (
              <Marker
                longitude={marker.longitude}
                latitude={marker.latitude}
                anchor="bottom"
              >
                <div className="text-[#2563EB] drop-shadow-md">
                  <MapPin className="size-8 fill-white" />
                </div>
              </Marker>
            )}
          </Map>
        </div>
        {!marker && (
          <p className="text-sm font-medium text-[#DC2626]">
            * Please drop a pin on the map.
          </p>
        )}
      </div>
    </div>
  );
}
