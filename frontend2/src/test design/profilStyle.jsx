import React, { useEffect, useState } from "react";
import {
  Search,
  Shield,
  X,
} from "lucide-react";
import MapPicker from "../composant/MapPicker";
import Publication from "../composant/publication";
import Doleance from "../composant/doleance";
import SelectRegionDistrict from "../composant/SelectRegionDistrict";
import SelectCategorie from "../composant/SelectCategorie";
import UserProfile from "../composant/profilDetail";


export default function ProfilePage() {
  const [formData, setFormData] = useState({
    nom: "",
    regionDistrict: null,
  });


  const [currentStep, setCurrentStep] = useState(1);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [titre, setTitre] = useState("");
  const [descriptionDoleance, setDescriptionDoleance] = useState("");
  const [adresse, setAdresse] = useState("");
  const [filesDoleance, setFilesDoleance] = useState([]); 
  const [files, setFiles] = useState([]); 
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [doleances, setDoleances] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isDoleanceModalOpen, setIsDoleanceModalOpen] = useState(false);

  const [regionDistrictCommune, setRegionDistrictCommune] = useState(null);
  const [categorieData, setCategorieData] = useState(null);


  const [likes, setLikes] = useState({});      // { pubId: true/false }
  const [favorites, setFavorites] = useState({}); // { pubId: true/false }

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    // Récupérer les infos utilisateur
    fetch(`http://localhost:5000/profil/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(console.error);
  
    // Récupérer les publications
    fetch(`http://localhost:5000/publications/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setPublications(data))
      .catch(console.error);
  
    // Récupérer les doléances
    fetch(`http://localhost:5000/doleances/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setDoleances(data))
      .catch(console.error);
  }, [userId]);
  
  useEffect(() => {
    if (publications.length > 0 && userId) {
      const initialLikes = {};
      const initialFavorites = {};
  
      publications.forEach((pub) => {
        initialLikes[pub.id] = pub.userLike?.includes(userId) || false;
        initialFavorites[pub.id] = pub.userFavoris?.includes(userId) || false;
      });
  
      setLikes(initialLikes);
      setFavorites(initialFavorites);
    }
  }, [publications, userId]);
  

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!description && files.length === 0) return;
  
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("description", description);
    files.forEach((file) => formData.append("images", file));
  
    try {
      await fetch("http://localhost:5000/publications", {
        method: "POST",
        body: formData,
      });
  
      // Re-fetch les publications avec les infos user
      const res = await fetch(`http://localhost:5000/publications/user/${userId}`);
      const publicationsData = await res.json();
      setPublications(publicationsData);
  
      setDescription("");
      setFiles([]);
      setIsPostModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
  

  const handleDoleanceSubmit = async (e) => {
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
  
    try {
      await fetch("http://localhost:5000/doleances", {
        method: "POST",
        body: formData,
      });
  
      // Re-fetch les doléances de l'utilisateur
      const res = await fetch(`http://localhost:5000/doleances/user/${userId}`);
      const doleancesData = await res.json();
      setDoleances(doleancesData);
  
      // Reset du formulaire
      setType("");
      setTitre("");
      setDescriptionDoleance("");
      setAdresse("");
      setFilesDoleance([]);
      setRegionDistrictCommune(null); // Reset sélection Région/District/Commune
      setCategorieData(null);
      setCurrentStep(1);
      setIsDoleanceModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
  

    // Fonction pour supprimer une publication de la liste
    const handleDeletedPub = (id) => {
      setPublications(prev => prev.filter(pub => pub.id !== id));
    };
     
      // Fonction appelée après suppression
    const handleDeleted = (id) => {
      // On filtre la liste pour retirer la doléance supprimée
      setDoleances((prev) => prev.filter((d) => d.id !== id));
    };

  if (!user) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="h-full w-full bg-gray-50 flex justify-center">
      <div className="w-full p-2 space-y-6">

        <UserProfile
          user={user}
          userRole={userRole}
          onEdit={() => setIsEditModalOpen(true)}
          onAddDoleance={() => setIsDoleanceModalOpen(true)}
          onAddPublication={() => setIsPostModalOpen(true)}
        />
        
        {/* ---- Legal Info ---- */}
        <div className="bg-white rounded-xl shadow-md p-6 hidden">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-gray-500" /> Legal Information
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Review our legal documents and policies
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-1 text-sm px-4 py-2 border rounded-lg hover:bg-gray-50">
              📄 Privacy Policy
            </button>
            <button className="flex items-center gap-1 text-sm px-4 py-2 border rounded-lg hover:bg-gray-50">
              📄 Terms of Service
            </button>
          </div>
        </div>
        
        {/* ---- Publications ---- */}
        {userRole !== "citoyen" && publications.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Mes Publications</h3>
            <div className="flex flex-col gap-6">
              {publications.map((pub) => (
                <Publication
                  key={pub.id}
                  pub={pub}
                  userId={userId}
                  likes={likes}
                  setLikes={setLikes}
                  favorites={favorites}
                  setFavorites={setFavorites}
                  onDeleted={handleDeletedPub} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Message si aucune doléance pour les citoyens */}
        {userRole !== "citoyen" && publications.length === 0 && (
            <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Aucune publication trouvée</p>
            <p className="text-gray-400 text-sm mt-1">
              Essayez de modifier vos critères de recherche ou de filtres
            </p>
          </div>
        )}
        
        {/* ---- Doléances ---- */}
        {doleances.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Mes Doléances</h3>
            <div className="flex flex-col gap-6">
              {doleances.map((doleance) => (
                <Doleance
                  key={doleance.id}
                  doleance={doleance}
                  user={user}
                  onDeleted={handleDeleted} // passe la fonction
                />
              ))}
            </div>
          </div>
        )}

        {/* Message si aucune doléance pour les citoyens */}
        {userRole === "citoyen" && doleances.length === 0 && (
            <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Aucune doléance trouvée</p>
            <p className="text-gray-400 text-sm mt-1">
              Essayez de modifier vos critères de recherche ou de filtres
            </p>
          </div>
        )}
      </div>


      

      {/* ---- Modals ---- */}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Modifier Profil</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p>Formulaire de modification du profil ici...</p>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative max-h-[90vh] overflow-y-auto w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
            <div className="flex items-center justify-between mb-2 -mt-2">
              <h2 className="text-xl font-semibold text-gray-800">Faire une publication</h2>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="flex flex-col gap-2" onSubmit={handlePostSubmit}>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Écrivez votre publication..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 transition bg-gray-50">
                <span className="text-gray-500 font-medium">
                  Cliquez ici pour ajouter des photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
                />
              </label>

              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
                    >
                      <img
                        src={URL.createObjectURL(f)}
                        alt="preview"
                        className="h-28 w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:scale-110 transition"
                        onClick={() => setFiles(files.filter((_, index) => index !== i))}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-green-50 text-green-600 border border-green-200 shadow-lg shadow-green-100/50 hover:shadow-green-200/60"
              >
                Publier
              </button>
            </form>
          </div>
        </div>
      )}

      {isDoleanceModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[30rem] max-w-full relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Faire une Doléance</h2>
              <button
                onClick={() => setIsDoleanceModalOpen(false)}
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

            <form className="space-y-5" onSubmit={handleDoleanceSubmit}>
              {/* ÉTAPE 1 */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Étape 1 : type de doleance
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de doléance
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setType("demande")}
                        className={`flex-1 py-2 rounded-lg font-medium ${
                          type === "demande"
                            ? "bg-blue-500 text-white shadow"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Demande
                      </button>
                      <button
                        type="button"
                        onClick={() => setType("signalement")}
                        className={`flex-1 py-2 rounded-lg font-medium ${
                          type === "signalement"
                            ? "bg-blue-500 text-white shadow"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Signalement
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


              {currentStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Étape 2 : information textuele du doleance
                  </h2>
                  {/* Titre */}
                  <div>
                    <SelectRegionDistrict
                      label="Région, District et Commune"
                      name="regionDistrictCommune"
                      onChange={(e) => setRegionDistrictCommune(e.target.value)}
                    />
                  </div>

                  <div>
                    <SelectCategorie
                      label="Catégorie de doléance"
                      onChange={(e) => setCategorieData(e.target.value)}
                    />
                  </div>

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

              {/* ÉTAPE 2 */}
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

              {/* ÉTAPE 3 */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Étape 3 : Adresse sur la carte
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
                    <label className="text-sm font-medium text-gray-700 mb-1 hidden">
                      lat
                    </label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="Ex: Lot 123, Quartier X"
                      className="hidden w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                    <label className="text-sm font-medium text-gray-700 mb-1 hidden">
                      lng
                    </label>
                    <input
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="Ex: Lot 123, Quartier X"
                      className="hidden w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                  </div>

                  {/* Map */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carte
                    </label>
                    <div className="h-64 border border-gray-300 rounded-xl overflow-hidden">
                      <MapPicker
                        onSelect={(coords) => {
                          console.log("📍 Coordonnées :", coords);
                          setAdresse(coords.address || `${coords.lat}, ${coords.lng}`);
                          setLat(coords.lat);
                          setLng(coords.lng)
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
      )}
    </div>
  );
}
