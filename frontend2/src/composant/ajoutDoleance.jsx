import React, { useState } from "react";
import { AlertTriangle, FileText, X } from "lucide-react";
import MapPicker from "./MapPicker";
import SelectRegionDistrict from "./SelectRegionDistrict";
import SelectCategorie from "./SelectCategorie";

export default function AddDoleanceModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  user 
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [type, setType] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [titre, setTitre] = useState("");
  const [descriptionDoleance, setDescriptionDoleance] = useState("");
  const [adresse, setAdresse] = useState("");
  const [filesDoleance, setFilesDoleance] = useState([]);
  const [regionDistrictCommune, setRegionDistrictCommune] = useState(null);
  const [categorieData, setCategorieData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !descriptionDoleance) return;

    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("type", type);
    formData.append("titre", titre);
    formData.append("description", descriptionDoleance);
    formData.append("adresse", adresse);
    formData.append("lat", lat || null);
    formData.append("lng", lng || null);

    // Ajouter Région / District / Commune
    formData.append("region", regionDistrictCommune?.region || "");
    formData.append("district", regionDistrictCommune?.district || "");
    formData.append("commune", regionDistrictCommune?.commune || "");

    // Ajouter Catégorie et Sous-catégorie
    formData.append("categorie", categorieData?.categorie || "");
    formData.append("sousCategorie", categorieData?.sousCategorie || "");

    filesDoleance.forEach(file => formData.append("images", file));

    await onSubmit(formData);

    // Reset du formulaire
    setType("");
    setTitre("");
    setDescriptionDoleance("");
    setAdresse("");
    setFilesDoleance([]);
    setRegionDistrictCommune(null);
    setCategorieData(null);
    setCurrentStep(1);
  };

  const handleClose = () => {
    // Reset du formulaire
    setType("");
    setTitre("");
    setDescriptionDoleance("");
    setAdresse("");
    setFilesDoleance([]);
    setRegionDistrictCommune(null);
    setCategorieData(null);
    setCurrentStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[30rem] max-w-full relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Faire une Doléance</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 mx-1 rounded-full ${
                currentStep >= s ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* ÉTAPE 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Étape 1 : type de doleance
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de doléance
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Bouton Demande */}
                  <button
                    type="button"
                    onClick={() => setType("demande")}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                      type === "demande"
                        ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <FileText
                      className={`w-8 h-8 mb-2 transition-colors ${
                        type === "demande" ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                    <span className="text-base font-semibold">Demande</span>
                    <p className="text-xs mt-1 text-gray-500 text-center">
                      Pour soumettre une requête ou sollicitation.
                    </p>
                  </button>

                  {/* Bouton Signalement */}
                  <button
                    type="button"
                    onClick={() => setType("signalement")}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                      type === "signalement"
                        ? "border-red-500 bg-red-50 text-red-600 shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <AlertTriangle
                      className={`w-8 h-8 mb-2 transition-colors ${
                        type === "signalement" ? "text-red-500" : "text-gray-400"
                      }`}
                    />
                    <span className="text-base font-semibold">Signalement</span>
                    <p className="text-xs mt-1 text-gray-500 text-center">
                      Pour rapporter un problème ou une anomalie.
                    </p>
                  </button>
                </div>              
              </div>

              {/* Bouton suivant */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300 shadow-lg shadow-blue-100/50 hover:shadow-blue-200/60"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Étape 2 : information textuelle du doleance
              </h2>
              
              {/* Localisation */}
              <div>
                <SelectRegionDistrict
                  label="Région, District et Commune"
                  name="regionDistrictCommune"
                  onChange={(e) => setRegionDistrictCommune(e.target.value)}
                />
              </div>

              {/* Catégorie */}
              <div>
                <SelectCategorie
                  label="Catégorie de doléance"
                  onChange={(e) => setCategorieData(e.target.value)}
                />
              </div>

              {/* Titre (caché) */}
              <div className="hidden">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Entrez le titre"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={descriptionDoleance}
                  onChange={(e) => setDescriptionDoleance(e.target.value)}
                  placeholder="Décrivez votre doléance..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition resize-none"
                />
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300 shadow-lg shadow-blue-100/50 hover:shadow-blue-200/60"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Étape 3 : image
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos
                </label>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition bg-gray-50">
                  <span className="text-gray-500 font-medium">
                    Cliquez ici pour ajouter des photos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      setFilesDoleance([...filesDoleance, ...Array.from(e.target.files)])
                    }
                  />
                </label>

                {filesDoleance.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {filesDoleance.map((f, i) => (
                      <div
                        key={i}
                        className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
                      >
                        <img
                          src={URL.createObjectURL(f)}
                          alt="preview"
                          className="h-28 w-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:scale-110 transition"
                          onClick={() =>
                            setFilesDoleance(filesDoleance.filter((_, index) => index !== i))
                          }
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300 shadow-lg shadow-blue-100/50 hover:shadow-blue-200/60"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Étape 4 : Adresse sur la carte
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: Lot 123, Quartier X"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
                <input
                  type="hidden"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
                <input
                  type="hidden"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </div>

              {/* Map */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carte
                </label>
                <div className="h-96 border border-gray-300 rounded-xl overflow-hidden">
                  <MapPicker
                    onSelect={(coords) => {
                      console.log("📍 Coordonnées :", coords);
                      setAdresse(coords.address || `${coords.lat}, ${coords.lng}`);
                      setLat(coords.lat);
                      setLng(coords.lng);
                    }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
                >
                  Précédent
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-green-50 text-green-600 border border-green-200 shadow-lg shadow-green-100/50 hover:shadow-green-200/60"
                >
                  Envoyer
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}