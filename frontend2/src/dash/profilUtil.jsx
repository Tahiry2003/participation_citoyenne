import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Search,
  X,
} from "lucide-react";
import Publication from "../composant/publication";
import Doleance from "../composant/doleance";
import UserProfile from "../composant/profilDetail";
import AddDoleanceModal from "../composant/ajoutDoleance";
import { useNavigate, useParams } from "react-router-dom";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    nom: "",
    regionDistrict: null,
  });

  const [description, setDescription] = useState("");
  const [titre, setTitre] = useState("");
  const [files, setFiles] = useState([]); 
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [doleances, setDoleances] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isDoleanceModalOpen, setIsDoleanceModalOpen] = useState(false);
  const navigate = useNavigate();

  const [likes, setLikes] = useState({});
  const [favorites, setFavorites] = useState({});

  const { userId, userRole } = useParams();

  // Récupérer l'ID de l'utilisateur connecté depuis localStorage
  const currentUserId = localStorage.getItem("userId");
  const currentUserRole = localStorage.getItem("userRole");

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
    fetch(`http://localhost:5000/doleances/user2/${userId}`)
      .then((res) => res.json())
      .then((data) => setDoleances(data))
      .catch(console.error);
  }, [userId]);
  
  useEffect(() => {
    if (publications.length > 0 && currentUserId) {
      const initialLikes = {};
      const initialFavorites = {};
  
      publications.forEach((pub) => {
        // Utiliser currentUserId (utilisateur connecté) au lieu de userId (profil consulté)
        initialLikes[pub.id] = pub.userLike?.includes(currentUserId) || false;
        initialFavorites[pub.id] = pub.userFavoris?.includes(currentUserId) || false;
      });
  
      setLikes(initialLikes);
      setFavorites(initialFavorites);
    }
  }, [publications, currentUserId]); // Changé de [publications, userId] à [publications, currentUserId]
  
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
    setDoleances((prev) => prev.filter((d) => d.id !== id));
  };

  if (!user) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full p-2 space-y-2">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Retour</span>
        </button>

        <UserProfile
          user={user}
          userRole={userRole}
          isCurrentUser={true}
          onEdit={() => setIsEditModalOpen(true)}
          onAddDoleance={() => setIsDoleanceModalOpen(true)}
          onAddPublication={() => setIsPostModalOpen(true)}
        />
        
        {/* ---- Publications ---- */}
        {userRole !== "citoyen" && publications.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {userId === currentUserId ? "Mes Publications" : "Publications"}
            </h3>
            <div className="flex flex-col gap-6">
              {publications.map((pub) => (
                <Publication
                  key={pub.id}
                  pub={pub}
                  userId={currentUserId} // Passer currentUserId au lieu de userId
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
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {userId === currentUserId ? "Mes Doléances" : "Doléances"}
            </h3>
            <div className="flex flex-col gap-6">
              {doleances.map((doleance) => (
                <Doleance
                  key={doleance.id}
                  doleance={doleance}
                  user={user}
                  userRole={currentUserRole}
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
      {/* Edit Modal - SEULEMENT si c'est votre profil */}
      {isEditModalOpen && userId === currentUserId && (
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

      {/* Post Modal - SEULEMENT si c'est votre profil */}
      {isPostModalOpen && userId === currentUserId && (
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

      {/* Modal d'ajout de doléance - SEULEMENT si c'est votre profil */}
      <AddDoleanceModal
        isOpen={isDoleanceModalOpen && userId === currentUserId}
        onClose={() => setIsDoleanceModalOpen(false)}
        onSubmit={handleDoleanceSubmit}
        user={user}
      />
    </div>
  );
}