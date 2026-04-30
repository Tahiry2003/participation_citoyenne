import React, { useState, useEffect, useRef } from "react";
import data from "../fichier/liste_commune_par_district.json";
import { ChevronDown, ChevronLeft, MapPin } from "lucide-react";

export default function SelectRegionDistrictCommune({
  label = "Région, District et Commune",
  name = "regionDistrictCommune",
  value = null,
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

  // Initialiser les régions au montage
  useEffect(() => {
    const keys = Object.keys(data).filter((k) => k !== "Region");
    setRegions(keys);
  }, []);

  // Synchroniser avec la valeur passée en prop
  useEffect(() => {
    if (value) {
      if (value.region && data[value.region]) {
        setSelectedRegion(value.region);
        const regionData = data[value.region] || {};
        setDistricts(Object.keys(regionData));
        
        if (value.district && regionData[value.district]) {
          setSelectedDistrict(value.district);
          const communeData = regionData[value.district] || [];
          setCommunes(communeData);
          
          if (value.commune && communeData.includes(value.commune)) {
            setSelectedCommune(value.commune);
          } else {
            setSelectedCommune(null);
          }
        } else {
          setSelectedDistrict(null);
          setSelectedCommune(null);
        }
      } else {
        setSelectedRegion(null);
        setSelectedDistrict(null);
        setSelectedCommune(null);
      }
    } else {
      // Réinitialiser si value est null
      setSelectedRegion(null);
      setSelectedDistrict(null);
      setSelectedCommune(null);
      setDistricts([]);
      setCommunes([]);
    }
  }, [value]);

  // Charger les districts quand une région est sélectionnée
  const handleRegionClick = (region) => {
    if (region === selectedRegion) {
      setSelectedRegion(null);
      setSelectedDistrict(null);
      setSelectedCommune(null);
      setDistricts([]);
      setCommunes([]);
      return;
    }
    
    setSelectedRegion(region);
    setSelectedDistrict(null);
    setSelectedCommune(null);
    
    const regionData = data[region] || {};
    setDistricts(Object.keys(regionData));
    setCommunes([]);
  };

  // Charger les communes quand un district est sélectionné
  const handleDistrictClick = (district) => {
    if (district === selectedDistrict) {
      setSelectedDistrict(null);
      setSelectedCommune(null);
      setCommunes([]);
      return;
    }
    
    setSelectedDistrict(district);
    setSelectedCommune(null);
    
    if (selectedRegion) {
      const communeData = data[selectedRegion][district] || [];
      setCommunes(communeData);
    }
  };

  const handleCommuneClick = (commune) => {
    setSelectedCommune(commune);
    setOpen(false);

    if (onChange && selectedRegion && selectedDistrict) {
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
    setDistricts([]);
    setCommunes([]);
    setOpen(false);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: {
            region: "",
            district: "",
            commune: "",
          },
        },
      });
    }
  };

  const handleBackToRegions = () => {
    setSelectedRegion(null);
    setSelectedDistrict(null);
    setSelectedCommune(null);
    setDistricts([]);
    setCommunes([]);
  };

  const handleBackToDistricts = () => {
    setSelectedDistrict(null);
    setSelectedCommune(null);
    setCommunes([]);
  };

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

  const displayLabel = selectedCommune
    ? `${selectedRegion} • ${selectedDistrict} • ${selectedCommune}`
    : selectedDistrict
    ? `${selectedRegion} • ${selectedDistrict} (sélectionner une commune)`
    : selectedRegion
    ? `${selectedRegion} (sélectionner un district)`
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
              !selectedCommune && !selectedDistrict && !selectedRegion
                ? "text-gray-400"
                : "text-gray-700"
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
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
          {!selectedRegion ? (
            // Liste des régions
            <div className="divide-y divide-gray-100">
              {regions.length > 0 ? (
                regions.map((r) => (
                  <div
                    key={r}
                    onClick={() => handleRegionClick(r)}
                    className={`px-4 py-2.5 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${
                      selectedRegion === r
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : ""
                    }`}
                  >
                    {r}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  Chargement des régions...
                </div>
              )}
            </div>
          ) : !selectedDistrict ? (
            // Liste des districts
            <div className="divide-y divide-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium border-b">
                <ChevronLeft
                  onClick={handleBackToRegions}
                  className="w-4 h-4 cursor-pointer hover:text-blue-600 transition"
                />
                <span className="font-semibold">{selectedRegion}</span>
              </div>
              {districts.length > 0 ? (
                districts.map((d) => (
                  <div
                    key={d}
                    onClick={() => handleDistrictClick(d)}
                    className={`px-4 py-2.5 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${
                      selectedDistrict === d
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : ""
                    }`}
                  >
                    {d}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  Aucun district disponible
                </div>
              )}
            </div>
          ) : (
            // Liste des communes
            <div className="divide-y divide-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium border-b">
                <ChevronLeft
                  onClick={handleBackToDistricts}
                  className="w-4 h-4 cursor-pointer hover:text-blue-600 transition"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{selectedRegion}</span>
                  <span className="text-xs text-gray-500">
                    {selectedDistrict}
                  </span>
                </div>
              </div>
              {communes.length > 0 ? (
                communes.map((c) => (
                  <div
                    key={c}
                    onClick={() => handleCommuneClick(c)}
                    className={`px-4 py-2.5 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${
                      selectedCommune === c
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    {c}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  Aucune commune disponible
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}