import React, { useState, useEffect } from "react";
import { AlertTriangle, FileText, X } from "lucide-react";
import MapPicker from "./MapPicker";
import SelectRegionDistrict from "./selectRegionDistrictModifie";
import SelectCategorie from "./SelectCategorieModifie";

export default function EditDoleanceModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  user,
  doleanceData
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [type, setType] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [titre, setTitre] = useState("");
  const [descriptionDoleance, setDescriptionDoleance] = useState("");
  const [adresse, setAdresse] = useState("");
  const [filesDoleance, setFilesDoleance] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [regionDistrictCommune, setRegionDistrictCommune] = useState({
    region: "",
    district: "", 
    commune: ""
  });
  const [categorieDataState, setCategorieDataState] = useState({
    categorie: "",
    sousCategorie: ""
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Fonction pour construire l'URL complète des images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    
    // Si c'est déjà une URL complète
    if (imagePath.startsWith('http')) return imagePath;
    
    // Si c'est un chemin avec backslashes (Windows), les remplacer par des forward slashes
    const normalizedPath = imagePath.replace(/\\/g, '/');
    
    // Si c'est un chemin relatif
    if (normalizedPath.startsWith('/')) {
      return `http://localhost:5000${normalizedPath}`;
    }
    
    // Sinon, ajouter le base URL
    return `http://localhost:5000/${normalizedPath}`;
  };

  // Réinitialiser le formulaire quand on ferme le modal
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setIsInitialized(false);
    }
  }, [isOpen]);

  // Initialiser les données de la doléance à modifier quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && doleanceData && !isInitialized) {
      console.log("Initialisation du formulaire avec les données de la doléance:", doleanceData);
      
      setType(doleanceData.type || "");
      setTitre(doleanceData.titre || "");
      setDescriptionDoleance(doleanceData.description || "");
      setAdresse(doleanceData.adresse || "");
      setLat(doleanceData.lat || "");
      setLng(doleanceData.lng || "");
      
      if (doleanceData.images && doleanceData.images.length > 0) {
        console.log("Images existantes formatées:", doleanceData.images);
        setExistingImages(doleanceData.images.map((img, index) => ({
          id: img.id || `img-${index}-${Date.now()}`,
          url: getImageUrl(img.url || img.path || img),
          path: img.path || img
        })));
      } else {
        setExistingImages([]);
      }
      
      // Initialiser la localisation
      setRegionDistrictCommune({
        region: doleanceData.region || "",
        district: doleanceData.district || "",
        commune: doleanceData.commune || ""
      });
      
      // Initialiser la catégorie
      setCategorieDataState({
        categorie: doleanceData.categorie || "",
        sousCategorie: doleanceData.sousCategorie || ""
      });
      
      setImagesToDelete([]);
      setFilesDoleance([]);
      setIsInitialized(true);
      setCurrentStep(1);
    }
  }, [isOpen, doleanceData, isInitialized]);

  useEffect(() => {
    if (isOpen) {
      console.log("regionDistrictCommune state:", regionDistrictCommune);
      console.log("categorieDataState state:", categorieDataState);
    }
  }, [regionDistrictCommune, categorieDataState, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!type) {
      setError("Veuillez sélectionner un type de doléance");
      return;
    }
    
    if (!descriptionDoleance.trim()) {
      setError("Veuillez remplir la description");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("type", type);
      formData.append("titre", titre);
      formData.append("description", descriptionDoleance);
      formData.append("adresse", adresse);
      formData.append("lat", lat || "");
      formData.append("lng", lng || "");
  
      // Ajouter Région / District / Commune
      formData.append("region", regionDistrictCommune?.region || "");
      formData.append("district", regionDistrictCommune?.district || "");
      formData.append("commune", regionDistrictCommune?.commune || "");
  
      // Ajouter Catégorie et Sous-catégorie
      formData.append("categorie", categorieDataState?.categorie || "");
      formData.append("sousCategorie", categorieDataState?.sousCategorie || "");
  
      // IMPORTANT: Les nouvelles images doivent être ajoutées avec le champ "images"
      filesDoleance.forEach(file => formData.append("images", file));
  
      // Ajouter la liste des images existantes à conserver
      const remainingImages = existingImages.filter(img => 
        !imagesToDelete.includes(img.id)
      );
      
      // Formatage correct pour le backend
      const formattedExistingImages = remainingImages.map(img => ({
        path: img.path || img,
        url: img.url || img
      }));
      
      if (formattedExistingImages.length > 0) {
        formData.append("existingImages", JSON.stringify(formattedExistingImages));
      }
  
      // Ajouter la liste des images à supprimer
      if (imagesToDelete.length > 0) {
        // Récupérer les chemins complets des images à supprimer
        const imagesToDeletePaths = imagesToDelete.map(imageId => {
          const image = doleanceData.images.find(img => 
            img.id === imageId || (img.id === undefined && img.path === imageId)
          );
          return image?.path || image?.url || imageId;
        });
        
        formData.append("images_to_delete", JSON.stringify(imagesToDeletePaths));
      }
  
      console.log("Envoi des données de modification:", {
        doleanceId: doleanceData.id,
        type,
        titre,
        descriptionLength: descriptionDoleance.length,
        existingImagesCount: formattedExistingImages.length,
        imagesToDeleteCount: imagesToDelete.length,
        newImagesCount: filesDoleance.length,
        region: regionDistrictCommune?.region,
        district: regionDistrictCommune?.district,
        commune: regionDistrictCommune?.commune,
        categorie: categorieDataState?.categorie,
        sousCategorie: categorieDataState?.sousCategorie
      });
  
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      setError("Erreur lors de la modification de la doléance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setType("");
    setTitre("");
    setDescriptionDoleance("");
    setAdresse("");
    setFilesDoleance([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setRegionDistrictCommune({
      region: "",
      district: "",
      commune: ""
    });
    setCategorieDataState({
      categorie: "",
      sousCategorie: ""
    });
    setCurrentStep(1);
    setError("");
    setIsLoading(false);
    setIsInitialized(false);
  };

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  // Gérer la suppression d'une image existante
  const handleDeleteExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete([...imagesToDelete, imageToDelete.id]);
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // Gérer la suppression d'une nouvelle image
  const handleDeleteNewImage = (index) => {
    setFilesDoleance(filesDoleance.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[30rem] max-w-full relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Modifier la Doléance</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={`step-${step}`}
              className={`flex-1 h-2 mx-1 rounded-full ${
                currentStep >= step ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* ÉTAPE 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Étape 1 : type de doléance
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
                  onClick={handleNext}
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
                Étape 2 : information textuelle de la doléance
              </h2>
              
              {/* Localisation */}
              <div>
                <SelectRegionDistrict
                  label="Région, District et Commune"
                  value={regionDistrictCommune}
                  onChange={(e) => {
                    console.log("RegionDistrict onChange:", e.target.value);
                    setRegionDistrictCommune(e.target.value);
                  }}
                />
              </div>

              {/* Catégorie */}
              <div>
                <SelectCategorie
                  label="Catégorie de doléance"
                  value={categorieDataState}
                  onChange={(e) => {
                    console.log("Categorie onChange:", e.target.value);
                    setCategorieDataState(e.target.value);
                  }}
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
                  onClick={handleBack}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={handleNext}
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
                Étape 3 : images
              </h2>
              
              {/* Images existantes */}
              {existingImages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Images existantes</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {existingImages.map((image, index) => (
                      <div
                        key={`existing-${index}-${image.id || image.path}`}
                        className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
                      >
                        <img
                          src={image.url}
                          alt={`Image existante ${index + 1}`}
                          className="h-28 w-full object-cover"
                          onError={(e) => {
                            console.error("Erreur de chargement de l'image:", image);
                            e.target.src = "https://via.placeholder.com/150?text=Erreur+Image";
                          }}
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:scale-110 transition"
                          onClick={() => handleDeleteExistingImage(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ajouter nouvelles images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ajouter de nouvelles photos
                </label>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition bg-gray-50">
                  <span className="text-gray-500 font-medium">
                    Cliquez ici pour ajouter de nouvelles photos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setFilesDoleance([...filesDoleance, ...newFiles]);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Nouvelles images */}
              {filesDoleance.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Nouvelles images</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {filesDoleance.map((file, index) => (
                      <div
                        key={`new-${index}-${file.name}-${file.size}`}
                        className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${index}`}
                          className="h-28 w-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:scale-110 transition"
                          onClick={() => handleDeleteNewImage(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={handleNext}
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
                    initialLocation={lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null}
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
                  onClick={handleBack}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
                >
                  Précédent
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-green-50 text-green-600 border border-green-200 shadow-lg shadow-green-100/50 hover:shadow-green-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Mise à jour..." : "Mettre à jour"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}