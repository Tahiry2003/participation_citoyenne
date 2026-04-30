import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  MapPinned,
  Tag,
  Image,
  Minus,
  Plus,
  CheckCircle,
  MoreVertical,
  Edit3,
  Trash2,
  Globe,
  Heart,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Clock,
} from "lucide-react";
import Map from "./Map";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) return `Il y a ${diffHour} h`;
  return date.toLocaleString();
}

export default function Doleance({ doleance, user, onDeleted, onSupportUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isValidated, setIsValidated] = useState(doleance?.status === "valide");
  const [isRejeter, setIsRejeter] = useState(doleance?.status === "rejeter");
  const [showMenu, setShowMenu] = useState(false);
  const [userSupport, setUserSupport] = useState(doleance?.userSupport || []);
  const [isSupporting, setIsSupporting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState({});
  const menuRef = useRef(null);

  // Vérifie si l'utilisateur courant soutient déjà cette doléance
  useEffect(() => {
    if (user && user.id && userSupport) {
      setIsSupporting(userSupport.includes(user.id));
    }
  }, [user, userSupport]);

  // Ferme le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Validation d'une doléance
  const handleValidate = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/doleances/${doleance.id}/valider`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsValidated(true);
        setIsRejeter(false);
        alert("✅ Doléance validée avec succès !");
      } else {
        alert(data.error || "Erreur lors de la validation");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    }
  };

    // ✅ Rejet d'une doléance
    const handleReject = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/doleances/${doleance.id}/rejeter`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setIsRejeter(true);
          setIsValidated(false);
          alert("Doléance rejetée avec succès !");
        } else {
          alert(data.error || "Erreur lors de la rejet");
        }
      } catch (err) {
        console.error(err);
        alert("Erreur de connexion au serveur");
      }
    };

  // 🗑️ Suppression d'une doléance
  const handleDelete = async () => {
    if (isValidated) {
      alert("❌ Impossible de supprimer une doléance déjà validée.");
      return;
    }

    if (!window.confirm("⚠️ Voulez-vous vraiment supprimer cette doléance ?")) return;

    try {
      const response = await fetch(`http://localhost:5000/doleances/${doleance.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        alert("🗑️ Doléance supprimée avec succès !");
        if (onDeleted) onDeleted(doleance.id);
      } else {
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    }
  };

  // ❤️ Soutenir une doléance
  const handleSupport = async () => {
    if (!user || !user.id) {
      alert("⚠️ Vous devez être connecté pour soutenir une doléance.");
      return;
    }

    if (user.id === doleance.user_id) {
      alert("ℹ️ Vous ne pouvez pas soutenir votre propre doléance.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/doleances/${doleance.id}/soutenir`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }
      );
      const data = await response.json();
      
      if (response.ok) {
        setUserSupport(data.doleance.userSupport);
        setIsSupporting(!isSupporting);
      } else {
        alert(data.error || "Erreur lors du soutien");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    }
  };

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === "modifier") {
      alert("📝 Fonction de modification à implémenter");
    }
    if (action === "supprimer") {
      handleDelete();
    }
  };

  const handleImageLoad = (imgIndex) => {
    setImageLoading(prev => ({ ...prev, [imgIndex]: false }));
  };

  const handleImageError = (imgIndex) => {
    setImageLoading(prev => ({ ...prev, [imgIndex]: false }));
  };

  const isAuthor = user && user.id === doleance.user_id;
  const canSupport = user && user.role === "citoyen" && !isAuthor;

  return (
    <div className="border border-gray-200/80 rounded-xl p-6 hover:shadow-xl transition-all duration-300 bg-white backdrop-blur-sm bg-opacity-95">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
            {doleance.nom?.[0] || "?"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <p className="font-semibold text-gray-900 text-lg">
                {doleance.nom} {doleance.prenoms}
              </p>
              <span className="px-3 py-1.5 text-xs font-semibold rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/60 hidden">
                {doleance.role || "Citoyen"}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">{formatDate(doleance.created_at)}</p>
          </div>
        </div>

        {/* Bouton Soutenir et menu 3 points */}
        <div className="flex items-center gap-2">
          {/* Bouton Soutenir */}
          {canSupport && (
            <button
              onClick={handleSupport}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 ${
                isSupporting
                  ? "bg-red-50 text-red-600 border border-red-200 shadow-lg shadow-red-100/50 hover:shadow-red-200/60"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:shadow-lg"
              }`}
            >
              <Heart className={`h-5 w-5 ${isSupporting ? "fill-red-500 text-red-500" : ""}`} />
              <span>{isSupporting ? "Soutenu" : "Soutenez"}</span>
            </button>
          )}

          {/* Icône 3 points (uniquement pour l'auteur) */}
          {isAuthor && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2.5 rounded-2xl hover:bg-gray-100/80 transition-all duration-200 backdrop-blur-sm"
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </button>

              {/* Menu contextuel */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white/80 backdrop-blur-md shadow-xl border border-gray-100 rounded-2xl overflow-hidden z-50 animate-fadeIn">
                  <button
                    onClick={() => handleAction("modifier")}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4 text-blue-500" />
                    Modifier
                  </button>

                  <div className="h-px bg-gray-100" />

                  <button
                    onClick={() => handleAction("supprimer")}
                    disabled={isValidated}
                    className={`flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isValidated
                        ? "text-gray-400 cursor-not-allowed bg-gray-50"
                        : "text-red-600 hover:bg-red-500/10"
                    }`}
                  >
                    <Trash2 className={`w-4 h-4 ${isValidated ? "text-gray-400" : "text-red-500"}`} />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Type, soutiens et statut */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-2xl border shadow-sm transition-all duration-300 ${
            doleance.type?.toLowerCase() === "signalement"
              ? "bg-blue-100/70 text-blue-800 border-blue-300"
              : doleance.type?.toLowerCase() === "demande"
              ? "bg-green-100/70 text-green-800 border-green-300"
              : "bg-gray-100/70 text-gray-800 border-gray-300"
          }`}
        >
          {doleance.type}
        </span>
        
        {/* Affichage du nombre de soutiens */}
        {userSupport.length > 0 && (
          <span className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-pink-100 text-pink-800 rounded-2xl border border-pink-300 shadow-sm">
            <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
            {userSupport.length} soutien{userSupport.length > 1 ? 's' : ''}
          </span>
        )}

        {/* Statut de la requête */}
        <div
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-2xl border shadow-sm ${
            isValidated
              ? "bg-green-100 text-green-800 border-green-300"
              : isRejeter
              ? "bg-red-100 text-red-800 border-red-300"
              : "bg-yellow-100 text-yellow-800 border-yellow-300"
          }`}
        >
          {isValidated ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : isRejeter ? (
            <XCircle className="h-4 w-4 text-red-600" />
          ) : (
            <Clock className="h-4 w-4 text-yellow-600" />
          )}
          {isValidated
            ? "Requête validée"
            : isRejeter
            ? "Requête rejetée"
            : "En attente"}
        </div>
      </div>

      {/* Infos */}
      <div className="text-sm text-gray-700 mb-4 space-y-2.5">
        <p className="flex items-center gap-3">
          <Tag className="h-4 w-4 text-indigo-500" />
          <span className="font-semibold text-gray-900">Catégorie / Sous catégorie :</span> 
          <span className="text-gray-800">{doleance.categorie} / {doleance.sousCategorie}</span>
        </p>
        <p className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-green-500" />
          <span className="font-semibold text-gray-900">Localisation :</span>
          <span className="text-gray-800">{doleance.region} / {doleance.district} / {doleance.commune}</span>
        </p>
        <p className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-red-500" />
          <span className="font-semibold text-gray-900">Adresse :</span>
          <span className="text-gray-800">{doleance.adresse}</span>
        </p>
      </div>

      {/* Description */}
      <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 shadow-sm mb-4">
        <p className="font-semibold text-gray-900 leading-relaxed">{doleance.description}</p>
      </div>

      {/* Détails supplémentaires */}
      {isOpen && (
        <div className="mt-4 mb-4 bg-white/80 border border-gray-200 rounded-2xl shadow-md overflow-hidden transition-all duration-300">
          <div>
            <div className="bg-white p-4 font-bold text-gray-900 text-base flex items-center gap-3">
              <MapPinned className="h-6 w-6 text-blue-500" />
              <p>Position sur la carte</p>
            </div>
            <div className="w-full h-64 md:h-72 overflow-hidden">
              <Map lat={doleance.lat} lng={doleance.lng} />
            </div>
          </div>

          {/* Images avec carousel */}
          {doleance.images && doleance.images.length > 0 && (
            <div>
              <div className="relative w-full group">
                <div className="relative overflow-hidden bg-gray-100 rounded-xl shadow-sm flex flex-col">
                  {/* Titre section */}
                  <div className="bg-white w-full p-4 font-bold text-gray-900 text-base flex items-center gap-3 border-b">
                    <Image className="h-6 w-6 text-blue-500" />
                    <p>Images associées à la doléance</p>
                  </div>

                  {/* Conteneur image stable */}
                  <div className="relative flex items-center justify-center bg-gray-50 aspect-[4/3] max-h-[600px] overflow-hidden">
                    {/* Indicateur de chargement */}
                    {imageLoading[currentImageIndex] !== false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    )}

                    {/* Image actuelle */}
                    <img
                      src={`http://localhost:5000/${doleance.images[currentImageIndex]}`}
                      alt={`doleance ${currentImageIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                      onLoad={() => handleImageLoad(currentImageIndex)}
                      onError={() => handleImageError(currentImageIndex)}
                    />

                    {/* Navigation gauche */}
                    {doleance.images.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) =>
                            prev === 0 ? doleance.images.length - 1 : prev - 1
                          );
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}

                    {/* Navigation droite */}
                    {doleance.images.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) =>
                            prev === doleance.images.length - 1 ? 0 : prev + 1
                          );
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Indicateurs (points) */}
                    {doleance.images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                        {doleance.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(index);
                            }}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                              index === currentImageIndex
                                ? "bg-white scale-110"
                                : "bg-white/60 hover:bg-white/80"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Compteur d'images */}
                    {doleance.images.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        {currentImageIndex + 1}/{doleance.images.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          <div className="p-5 space-y-6">
            {/* Boutons de validation pour les agents */}
            {user?.role === "agent" && !isValidated && !isRejeter && (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={handleValidate}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-400 hover:bg-green-500 text-white font-medium rounded-xl shadow-md transition-all duration-200"
                >
                  <CheckCircle className="h-5 w-5" />
                  Valider la requête
                </button>

                <button
                  onClick={handleReject}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-400 hover:bg-red-500 text-white font-medium rounded-xl shadow-md transition-all duration-200"
                >
                  <XCircle className="h-5 w-5" />
                  Rejeter la requête
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bascule détails */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-all"
      >
        {isOpen ? (
          <>
            <Minus className="h-4 w-4" />
            Moins de détails
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Plus de détails
          </>
        )}
      </button>
    </div>
  );
}