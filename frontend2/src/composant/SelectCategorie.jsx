import React, { useState, useEffect, useRef } from "react";
import categoriesData from "../fichier/liste_categorie.json";
import { ChevronDown, ChevronLeft, Tag } from "lucide-react";

export default function SelectCategorie({
  label = "Catégorie de doléance",
  name = "categorie",
  onChange,
}) {
  const [categories, setCategories] = useState([]);
  const [sousCategories, setSousCategories] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [selectedSousCategorie, setSelectedSousCategorie] = useState(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Charger les catégories au montage
  useEffect(() => {
    const categoriesList = Object.keys(categoriesData);
    setCategories(categoriesList);
  }, []);

  // Synchroniser sous-catégories quand selectedCategorie change
  useEffect(() => {
    if (selectedCategorie) {
      const sousCats = categoriesData[selectedCategorie] || [];
      setSousCategories(sousCats);
    } else {
      setSousCategories([]);
    }
    setSelectedSousCategorie(null);
  }, [selectedCategorie]);

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

  const handleCategorieClick = (categorie) => {
    if (categorie === selectedCategorie) {
      setSelectedCategorie(null);
      return;
    }
    setSelectedCategorie(categorie);
  };

  const handleSousCategorieClick = (sousCategorie) => {
    setSelectedSousCategorie(sousCategorie);
    setOpen(false);

    if (onChange) {
      onChange({
        target: {
          name,
          value: {
            categorie: selectedCategorie,
            sousCategorie,
          },
        },
      });
    }
  };

  const resetSelection = () => {
    setSelectedCategorie(null);
    setSelectedSousCategorie(null);
  };

  const displayLabel = selectedSousCategorie
    ? `${selectedCategorie} • ${selectedSousCategorie}`
    : selectedCategorie
    ? selectedCategorie
    : "Sélectionner une catégorie";

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
          <Tag className="w-4 h-4 text-blue-500" />
          <span
            className={`truncate ${
              !selectedSousCategorie ? "text-gray-400" : "text-gray-700"
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
          {!selectedCategorie ? (
            // Liste catégories
            <div className="divide-y divide-gray-100">
              {categories.map((categorie) => (
                <div
                  key={categorie}
                  onClick={() => handleCategorieClick(categorie)}
                  className="px-4 py-2.5 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  {categorie}
                </div>
              ))}
            </div>
          ) : (
            // Liste sous-catégories
            <div className="divide-y divide-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium border-b">
                <ChevronLeft
                  onClick={resetSelection}
                  className="w-4 h-4 cursor-pointer hover:text-blue-600 transition"
                />
                <span>{selectedCategorie}</span>
              </div>
              {sousCategories.map((sousCategorie) => (
                <div
                  key={sousCategorie}
                  onClick={() => handleSousCategorieClick(sousCategorie)}
                  className={`px-4 py-2.5 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all ${
                    selectedSousCategorie === sousCategorie ? "bg-blue-100 text-blue-700" : ""
                  }`}
                >
                  {sousCategorie}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}