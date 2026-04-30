import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Search,
  X,
} from "lucide-react";
import Publication from "../composant/publication";
import Doleance from "../composant/doleance";
import UserProfile from "../composant/profilDetail";
import AddDoleanceModal from "../composant/ajoutDoleance";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    nom: "",
    regionDistrict: null,
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showNotification = (type, message) => {
    if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 5000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const [description, setDescription] = useState("");
  const [titre, setTitre] = useState("");
  const [files, setFiles] = useState([]); 
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [doleances, setDoleances] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isDoleanceModalOpen, setIsDoleanceModalOpen] = useState(false);

  const [likes, setLikes] = useState({});
  const [favorites, setFavorites] = useState({});

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
    if (!description && !titre && files.length === 0) return;
  
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("description", description);
    formData.append("titre", titre);
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
  
      setTitre("");
      setDescription("");
      setFiles([]);
      showNotification("success", "Information publier avec success");
      setIsPostModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDoleanceSubmit = async (formData) => {
    try {
      await fetch("http://localhost:5000/doleances", {
        method: "POST",
        body: formData,
      });
  
      // Re-fetch les doléances de l'utilisateur
      const res = await fetch(`http://localhost:5000/doleances/user/${userId}`);
      const doleancesData = await res.json();
      setDoleances(doleancesData);
      showNotification("success", "Doleance soumise avec success");
      setIsDoleanceModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Fonction pour supprimer une publication de la liste
  const handleDeletedPub = (id) => {
    setPublications(prev => prev.filter(pub => pub.id !== id));
    showNotification("success", "Publication supprimer");
  };
   
  // Fonction appelée après suppression
  const handleDeleted = (id) => {
    setDoleances((prev) => prev.filter((d) => d.id !== id));
    showNotification("success", "Doleance supprimer");
  };

  if (!user) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <>
      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 max-w-md px-4 pointer-events-none">
        {successMessage && (
          <div className="pointer-events-auto mb-3 animate-fadeIn">
            <div className="flex items-center gap-3 bg-green-50 backdrop-blur-lg border border-green-200 text-green-700 p-5 rounded-2xl shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Succès</p>
                <p className="text-sm text-gray-600 mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {errorMessage && (
          <div className="pointer-events-auto mb-3 animate-fadeIn">
            <div className="flex items-center gap-3 bg-red-50 backdrop-blur-lg border border-red-200 text-red-700 p-5 rounded-2xl shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Erreur</p>
                <p className="text-sm text-gray-600 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>


      <div className="w-full flex justify-center">
        <div className="w-full p-2 space-y-2">

          <UserProfile
            user={user}
            userRole={userRole}
            onEdit={() => setIsEditModalOpen(true)}
            onAddDoleance={() => setIsDoleanceModalOpen(true)}
            onAddPublication={() => setIsPostModalOpen(true)}
          />
          
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
                    onDeleted={handleDeleted}
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
                <h2 className="text-2xl font-semibold text-gray-800">Faire une publication</h2>
                <button
                  onClick={() => setIsPostModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form className="flex flex-col gap-2" onSubmit={handlePostSubmit}>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Titre de votre publication..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="Écrivez votre publication..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    spellCheck={false}
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

        {/* Modal d'ajout de doléance */}
        <AddDoleanceModal
          isOpen={isDoleanceModalOpen}
          onClose={() => setIsDoleanceModalOpen(false)}
          onSubmit={handleDoleanceSubmit}
          user={user}
        />
      </div>
    </>
  );
}