"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, NavigationControl, type MapRef } from "react-map-gl/mapbox";
import type { LngLatBoundsLike, MapLayerMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Check, ChevronsUpDown, MapPin, Navigation, Search, Satellite } from "lucide-react";

const PSGC_API = "https://psgc.cloud/api";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const DEFAULT_VIEW = {
  longitude: 122.0694,
  latitude: 6.9214,
  zoom: 12,
};

type Location = {
  code: string;
  name: string;
};

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

type LocationSelectProps = {
  label: string;
  placeholder: string;
  options: Location[];
  value: string;
  onChange: (code: string, name: string) => void;
  disabled?: boolean;
};

function LocationSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
}: LocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedName = options.find((option) => option.code === value)?.name ?? "";
  const filteredOptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) => option.name.toLowerCase().includes(normalizedSearch));
  }, [options, searchTerm]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100">{label}</label>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setSearchTerm("");
            setIsOpen((current) => !current);
          }}
          className="flex w-full items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className={selectedName ? "" : "text-slate-400 dark:text-slate-500"}>
            {selectedName || placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-[#E2E8F0] bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {label}
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={`Search ${label.toLowerCase()}`}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-10 pr-3 text-sm text-[#1E293B] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-[#60A5FA] dark:focus:ring-[#1D4ED8]/40"
                />
              </div>
            </div>

            <div className="scrollbar-none max-h-64 overflow-auto py-1.5">
              {options.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">Loading...</div>
              )}

              {options.length > 0 && filteredOptions.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">
                  No matching {label.toLowerCase()} found.
                </div>
              )}

              {filteredOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    onChange(option.code, option.name);
                    setSearchTerm("");
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-[#EFF6FF] hover:text-[#2563EB] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-100"
                >
                  <span>{option.name}</span>
                  {option.code === value && (
                    <Check className="size-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MapLocationPicker({
  defaultProvince = "",
  defaultMunicipality = "",
  defaultBarangay = "",
  showHiddenInputs = true,
  onLocationDataChange,
}: {
  defaultProvince?: string;
  defaultMunicipality?: string;
  defaultBarangay?: string;
  showHiddenInputs?: boolean;
  onLocationDataChange?: (value: {
    province: string;
    municipality: string;
    barangayName: string;
    latitude: string;
    longitude: string;
    mapboxPlaceName: string;
  }) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

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
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW);
  const [isSatellite, setIsSatellite] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const mapStyle = isSatellite
    ? "mapbox://styles/mapbox/satellite-streets-v12"
    : "mapbox://styles/mapbox/streets-v12";

  const fitMapToBounds = useCallback((bounds: LngLatBoundsLike) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.fitBounds(bounds, {
      padding: 36,
      duration: 900,
    });
  }, []);

  const focusMapOnPlace = useCallback(
    async (placeLabel: string, fallbackZoom: number) => {
      if (!MAPBOX_TOKEN || !placeLabel.trim()) {
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(placeLabel)}.json?access_token=${MAPBOX_TOKEN}&country=PH&limit=1`
        );
        const data = await response.json();
        const feature = data?.features?.[0];

        if (!feature) {
          return;
        }

        if (Array.isArray(feature.bbox) && feature.bbox.length === 4) {
          fitMapToBounds([
            [feature.bbox[0], feature.bbox[1]],
            [feature.bbox[2], feature.bbox[3]],
          ]);
          return;
        }

        if (Array.isArray(feature.center) && feature.center.length === 2) {
          const [longitude, latitude] = feature.center;
          setViewState({ longitude, latitude, zoom: fallbackZoom });
          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: fallbackZoom,
            duration: 900,
          });
        }
      } catch (error) {
        console.error("Unable to focus map on selected place:", error);
      }
    },
    [fitMapToBounds]
  );

  useEffect(() => {
    fetch(`${PSGC_API}/provinces`)
      .then((response) => response.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.value || []);
        const sorted = (list as Location[]).sort((left, right) => left.name.localeCompare(right.name));
        setProvinces(sorted);

        if (defaultProvince) {
          const match = sorted.find((province) => province.name === defaultProvince);
          if (match) {
            setProvinceCode(match.code);
          }
        }
      })
      .catch(console.error);
  }, [defaultProvince]);

  useEffect(() => {
    if (!provinceCode) {
      Promise.resolve().then(() => {
        setMunicipalities([]);
        setBarangays([]);
      });
      return;
    }

    fetch(`${PSGC_API}/provinces/${provinceCode}/cities-municipalities`)
      .then((response) => response.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.value || []);
        const sorted = (list as Location[]).sort((left, right) => left.name.localeCompare(right.name));
        setMunicipalities(sorted);

        if (defaultMunicipality && defaultProvince === provinceName) {
          const match = sorted.find((municipality) => municipality.name === defaultMunicipality);
          if (match) {
            setMunicipalityCode(match.code);
          }
        }
      })
      .catch(console.error);
  }, [provinceCode, defaultMunicipality, defaultProvince, provinceName]);

  useEffect(() => {
    if (!municipalityCode) {
      Promise.resolve().then(() => {
        setBarangays([]);
      });
      return;
    }

    fetch(`${PSGC_API}/cities-municipalities/${municipalityCode}/barangays`)
      .then((response) => response.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.value || []);
        const sorted = (list as Location[]).sort((left, right) => left.name.localeCompare(right.name));
        setBarangays(sorted);

        if (defaultBarangay && defaultMunicipality === municipalityName) {
          const match = sorted.find((barangay) => barangay.name === defaultBarangay);
          if (match) {
            setBarangayCode(match.code);
          }
        }
      })
      .catch(console.error);
  }, [municipalityCode, defaultBarangay, defaultMunicipality, municipalityName]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const resizeMap = () => map.resize();
    const timeoutId = window.setTimeout(resizeMap, 120);
    window.addEventListener("resize", resizeMap);

    const resizeObserver =
      mapContainerRef.current &&
      new ResizeObserver(() => {
        resizeMap();
      });

    if (resizeObserver && mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", resizeMap);
      resizeObserver?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (barangayName && municipalityName && provinceName) {
      const timeoutId = window.setTimeout(() => {
        void focusMapOnPlace(`${barangayName}, ${municipalityName}, ${provinceName}`, 15);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    if (municipalityName && provinceName) {
      const timeoutId = window.setTimeout(() => {
        void focusMapOnPlace(`${municipalityName}, ${provinceName}`, 12);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    if (provinceName) {
      const timeoutId = window.setTimeout(() => {
        void focusMapOnPlace(`${provinceName}, Philippines`, 8);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [barangayName, municipalityName, provinceName, focusMapOnPlace]);

  useEffect(() => {
    onLocationDataChange?.({
      province: provinceName,
      municipality: municipalityName,
      barangayName,
      latitude: marker ? String(marker.latitude) : "",
      longitude: marker ? String(marker.longitude) : "",
      mapboxPlaceName:
        marker && barangayName && municipalityName && provinceName
          ? `${barangayName}, ${municipalityName}, ${provinceName}`
          : "",
    });
  }, [barangayName, marker, municipalityName, onLocationDataChange, provinceName]);

  const onMapClick = useCallback((event: MapLayerMouseEvent) => {
    setMarker({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    });
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarker({ latitude, longitude });
        setViewState({ latitude, longitude, zoom: 17 });
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 17,
          duration: 900,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error detecting location:", error);
        alert("Failed to detect location. Please allow location access or pin it manually.");
        setIsLocating(false);
      }
    );
  }, []);

  return (
    <div className="space-y-4">
      {showHiddenInputs && <input type="hidden" name="province" value={provinceName} />}
      {showHiddenInputs && <input type="hidden" name="municipality" value={municipalityName} />}
      {showHiddenInputs && <input type="hidden" name="barangayName" value={barangayName} />}
      {showHiddenInputs && marker && (
        <>
          <input type="hidden" name="latitude" value={marker.latitude} />
          <input type="hidden" name="longitude" value={marker.longitude} />
          <input
            type="hidden"
            name="mapboxPlaceName"
            value={`${barangayName}, ${municipalityName}, ${provinceName}`}
          />
        </>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <LocationSelect
          label="Province"
          placeholder="Select Province"
          options={provinces}
          value={provinceCode}
          onChange={(code, name) => {
            setProvinceCode(code);
            setProvinceName(name);
            setMunicipalityCode("");
            setMunicipalityName("");
            setBarangayCode("");
            setBarangayName("");
            setMarker(null);
          }}
        />
        <LocationSelect
          label="Municipality / City"
          placeholder="Select Municipality / City"
          options={municipalities}
          value={municipalityCode}
          disabled={!provinceCode}
          onChange={(code, name) => {
            setMunicipalityCode(code);
            setMunicipalityName(name);
            setBarangayCode("");
            setBarangayName("");
            setMarker(null);
          }}
        />
      </div>

      <LocationSelect
        label="Barangay"
        placeholder="Select Barangay"
        options={barangays}
        value={barangayCode}
        disabled={!municipalityCode}
        onChange={(code, name) => {
          setBarangayCode(code);
          setBarangayName(name);
          setMarker(null);
        }}
      />

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#1E293B] dark:text-slate-100">
            Pin Health Center Location
          </label>
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            Search a location, then click the map to drop a pin
          </p>
        </div>

        <div
          ref={mapContainerRef}
          className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-[#E2E8F0] shadow-sm dark:border-white/10"
        >
          {!MAPBOX_TOKEN && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/80 text-sm font-medium dark:bg-slate-900/80">
              Mapbox token is missing.
            </div>
          )}

          <div className="absolute inset-0 [&_.mapboxgl-canvas]:!h-full [&_.mapboxgl-canvas]:!w-full [&_.mapboxgl-map]:!h-full [&_.mapboxgl-map]:!w-full">
            <Map
              ref={mapRef}
              {...viewState}
              onLoad={() => {
                mapRef.current?.resize();
                window.setTimeout(() => mapRef.current?.resize(), 120);
              }}
              onMove={(event) => {
                const nextView = event.viewState;
                setViewState({
                  longitude: nextView.longitude,
                  latitude: nextView.latitude,
                  zoom: nextView.zoom,
                });
              }}
              onClick={onMapClick}
              mapStyle={mapStyle}
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: "100%", height: "100%", display: "block" }}
            >
              <NavigationControl position="bottom-right" />

              <div className="absolute left-3 top-3 z-10">
                <button
                  type="button"
                  onClick={() => setIsSatellite((current) => !current)}
                  title={isSatellite ? "Switch to street view" : "Switch to satellite view"}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-md transition-all ${
                    isSatellite
                      ? "bg-white text-slate-700 hover:bg-slate-50"
                      : "bg-slate-900/80 text-white hover:bg-slate-900"
                  }`}
                >
                  <Satellite className="size-3.5" />
                  {isSatellite ? "Street" : "Satellite"}
                </button>
              </div>

              <div className="absolute right-3 top-3 z-10">
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={isLocating}
                  title="Detect my GPS location"
                  className="flex size-9 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md transition hover:bg-[#1D4ED8] active:scale-95 disabled:opacity-60"
                >
                  <Navigation className={`size-4 fill-current ${isLocating ? "animate-pulse" : ""}`} />
                </button>
              </div>

              {marker && (
                <Marker longitude={marker.longitude} latitude={marker.latitude} anchor="bottom">
                  <div className="text-[#2563EB] drop-shadow-lg">
                    <MapPin className="size-9 fill-[#2563EB] stroke-white stroke-1" />
                  </div>
                </Marker>
              )}
            </Map>
          </div>
        </div>

        {!marker && (
          <p className="text-xs font-medium text-[#DC2626]">
            * Tap on the map to mark the exact location of your health center.
          </p>
        )}
      </div>
    </div>
  );
}
