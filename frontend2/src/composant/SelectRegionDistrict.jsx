import React, { useState, useEffect, useRef } from "react";
import data from "../fichier/liste_commune_par_district.json";
import { ChevronDown, ChevronLeft, MapPin } from "lucide-react";

export default function SelectRegionDistrictCommune({
  label = "Région, District et Commune",
  name = "regionDistrictCommune",
  onChange,
}) {
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCommune, setSelectedCommune] = useState(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Charger les régions au montage
  useEffect(() => {
    const keys = Object.keys(data).filter((k) => k !== "Region");
    setRegions(keys);
  }, []);

  // Synchroniser districts quand selectedRegion change
  useEffect(() => {
    if (selectedRegion) {
      const regionData = data[selectedRegion] || {};
      setDistricts(Object.keys(regionData));
    } else {
      setDistricts([]);
    }
    setSelectedDistrict(null);
    setCommunes([]);
    setSelectedCommune(null);
  }, [selectedRegion]);

  // Synchroniser communes quand selectedDistrict change
  useEffect(() => {
    if (selectedRegion && selectedDistrict) {
      const communeData = data[selectedRegion][selectedDistrict] || [];
      setCommunes(communeData);
    } else {
      setCommunes([]);
    }
    setSelectedCommune(null);
  }, [selectedDistrict, selectedRegion]);

  // Fermer si clic en dehors
  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleRegionClick = (region) => {
    if (region === selectedRegion) {
      setSelectedRegion(null);
      return;
    }
    setSelectedRegion(region);
  };

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
  };

  const handleCommuneClick = (commune) => {
    setSelectedCommune(commune);
    setOpen(false);

    if (onChange) {
      onChange({
        target: {
          name,
          value: {
            region: selectedRegion,
            district: selectedDistrict,
            commune,
          },
        },
      });
    }
  };

  const resetSelection = () => {
    setSelectedRegion(null);
    setSelectedDistrict(null);
    setSelectedCommune(null);
  };

  const displayLabel = selectedCommune
    ? `${selectedRegion} • ${selectedDistrict} • ${selectedCommune}`
    : selectedDistrict
    ? `${selectedRegion} • ${selectedDistrict}`
    : selectedRegion
    ? selectedRegion
    : "Sélectionner une région";

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative flex justify-between items-center w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 bg-white/80 backdrop-blur-sm ${
          open
            ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
            : "border-gray-300 hover:border-gray-400"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-gray-700 truncate">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span
            className={`truncate ${
              !selectedCommune ? "text-gray-400" : "text-gray-700"
            }`}
          >
            {displayLabel}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
          {!selectedRegion ? (
            // Liste régions
            <div className="divide-y divide-gray-100">
              {regions.map((r) => (
                <div
                  key={r}
                  onClick={() => handleRegionClick(r)}
                  className="px-4 py-2.5 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  {r}
                </div>
              ))}
            </div>
          ) : !selectedDistrict ? (
            // Liste districts
            <div className="divide-y divide-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium border-b">
                <ChevronLeft
                  onClick={resetSelection}
                  className="w-4 h-4 cursor-pointer hover:text-blue-600 transition"
                />
                <span>{selectedRegion}</span>
              </div>
              {districts.map((d) => (
                <div
                  key={d}
                  onClick={() => handleDistrictClick(d)}
                  className="px-4 py-2.5 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  {d}
                </div>
              ))}
            </div>
          ) : (
            // Liste communes
            <div className="divide-y divide-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium border-b">
                <ChevronLeft
                  onClick={() => setSelectedDistrict(null)}
                  className="w-4 h-4 cursor-pointer hover:text-blue-600 transition"
                />
                <span>{selectedDistrict}</span>
              </div>
              {communes.map((c) => (
                <div
                  key={c}
                  onClick={() => handleCommuneClick(c)}
                  className={`px-4 py-2.5 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${
                    selectedCommune === c ? "bg-blue-100 text-blue-700" : ""
                  }`}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
