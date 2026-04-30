import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
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
  User,
  Clock,
  Navigation,
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
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function Doleance({ doleance, user, onDeleted, onSupportUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isValidated, setIsValidated] = useState(doleance?.is_valide);
  const [showMenu, setShowMenu] = useState(false);
  const [userSupport, setUserSupport] = useState(doleance?.userSupport || []);
  const [isSupporting, setIsSupporting] = useState(false);
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
        alert("✅ Doléance validée avec succès !");
      } else {
        alert(data.error || "Erreur lors de la validation");
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
        if (onSupportUpdate) onSupportUpdate(doleance.id, data.doleance.userSupport);
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

  const isAuthor = user && user.id === doleance.user_id;
  const canSupport = user && user.role === "citoyen" && !isAuthor;

  const getTypeStyles = (type) => {
    const styles = {
      signalement: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600",
      demande: "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600",
      default: "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-600"
    };
    return styles[type?.toLowerCase()] || styles.default;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-6 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm relative group">
      {/* Effet de bordure subtile */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Header avec avatar et métadonnées */}
      <div className="flex items-start justify-between mb-6 relative">
        <div className="flex items-start gap-4 flex-1">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
              {doleance.nom?.[0] || "?"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-gray-900 text-lg truncate">
                {doleance.nom} {doleance.prenoms}
              </h3>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatDate(doleance.created_at)}</span>
              </div>
            </div>
            
            {/* Badge type avec design moderne */}
            <div className="mt-2">
              <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-2xl border shadow-lg transition-all duration-300 ${getTypeStyles(doleance.type)}`}>
                <Tag className="w-4 h-4" />
                {doleance.type}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Bouton Soutenir */}
          {canSupport && (
            <button
              onClick={handleSupport}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isSupporting
                  ? "bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg shadow-red-200 hover:shadow-red-300"
                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:shadow-md"
              }`}
            >
              <Heart className={`w-5 h-5 transition-all ${isSupporting ? "fill-current animate-pulse" : ""}`} />
              <span className="hidden sm:inline">{isSupporting ? "Soutenu" : "Soutenir"}</span>
              {userSupport.length > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isSupporting ? "bg-white/20 text-white" : "bg-pink-100 text-pink-700"
                }`}>
                  {userSupport.length}
                </span>
              )}
            </button>
          )}

          {/* Menu options pour l'auteur */}
          {isAuthor && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 group/menu"
              >
                <MoreVertical className="h-5 w-5 text-gray-600 group-hover/menu:text-gray-800" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-12 w-56 bg-white/95 backdrop-blur-lg shadow-2xl border border-gray-200/50 rounded-2xl overflow-hidden z-50 animate-fadeIn">
                  <button
                    onClick={() => handleAction("modifier")}
                    className="flex items-center gap-3 w-full text-left px-5 py-4 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border-b border-gray-100"
                  >
                    <Edit3 className="w-4 h-4 text-blue-500" />
                    Modifier la doléance
                  </button>

                  <button
                    onClick={() => handleAction("supprimer")}
                    disabled={isValidated}
                    className={`flex items-center gap-3 w-full text-left px-5 py-4 text-sm font-medium transition-all duration-200 ${
                      isValidated
                        ? "text-gray-400 cursor-not-allowed bg-gray-50"
                        : "text-red-600 hover:bg-red-50 hover:text-red-700"
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

      {/* Contenu principal */}
      <div className="space-y-4 mb-6">
        {/* Titre et catégorie */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl">
            <Tag className="w-4 h-4" />
            <span className="font-semibold">{doleance.titre}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 rounded-2xl p-5 shadow-sm">
          <p className="text-gray-800 leading-relaxed text-base font-medium">
            {doleance.description}
          </p>
        </div>

        {/* Informations géographiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
            <Globe className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-600 font-medium">Localisation</p>
              <p className="text-gray-900 font-semibold truncate">
                {doleance.region} • {doleance.district} • {doleance.commune}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200/50">
            <MapPin className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-600 font-medium">Adresse précise</p>
              <p className="text-gray-900 font-semibold truncate">{doleance.adresse}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section détails expansible */}
      {isOpen && (
        <div className="mt-6 space-y-6 animate-slideDown">
          {/* Carte */}
          {doleance.lat && doleance.lng && (
            <div className="rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg">
              <div className="w-full h-80">
                <Map lat={doleance.lat} lng={doleance.lng} />
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-t border-gray-200/50">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  <span>Localisation précise de la doléance</span>
                </div>
              </div>
            </div>
          )}

          {/* Galerie d'images */}
          {doleance.images && doleance.images.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/30 rounded-2xl p-6 border border-gray-200/50">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Image className="h-5 w-5 text-blue-500" />
                Photos associées
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {doleance.images.length}
                </span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doleance.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <img
                      src={`http://localhost:5000/${img}`}
                      alt={`doleance-${idx}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50">
            {user?.role === "agent" ? (
              !isValidated ? (
                <button
                  onClick={handleValidate}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200 hover:shadow-green-300 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <CheckCircle className="h-6 w-6" />
                  Valider cette doléance
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-bold rounded-2xl border border-green-300 shadow-sm">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Doléance validée
                </div>
              )
            ) : (
              <div
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 font-bold rounded-2xl border shadow-sm ${
                  isValidated
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300"
                    : "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-300"
                }`}
              >
                <CheckCircle
                  className={`h-6 w-6 ${
                    isValidated ? "text-green-600" : "text-yellow-500"
                  }`}
                />
                {isValidated ? "Doléance validée" : "En attente de validation"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer avec bouton détails */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Heart className={`w-4 h-4 ${userSupport.length > 0 ? 'text-pink-500 fill-current' : 'text-gray-400'}`} />
          <span>{userSupport.length} soutien{userSupport.length !== 1 ? 's' : ''}</span>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all duration-300 transform hover:scale-105"
        >
          {isOpen ? (
            <>
              <Minus className="h-4 w-4" />
              Réduire
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Voir les détails
            </>
          )}
        </button>
      </div>
    </div>
  );
}