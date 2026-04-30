import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  MapPin,
  MapPinned,
  Image,
  CheckCircle,
  MoreVertical,
  Edit3,
  Trash2,
  XCircle,
  Clock,
  ThumbsUp,
  CheckCircle2,
  Wrench,
  FileText,
  AlertTriangle,
} from "lucide-react";
import Map from "./Map";
import { useNavigate } from "react-router-dom";
import EditDoleanceModal from "../composant/modifieDoleance"; // Ajoutez cette importation

// Déplacer la fonction en dehors du composant
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
  const [isValidated, setIsValidated] = useState(doleance?.status === "valide");
  const [isRejeter, setIsRejeter] = useState(doleance?.status === "rejeter");
  const [isTraiter, setIsTraiter] = useState(doleance?.status === "traiter");
  const [isResolue, setIsResolue] = useState(doleance?.status === "resolue");
  const [showMenu, setShowMenu] = useState(false);
  const [userSupport, setUserSupport] = useState(doleance?.userSupport || []);
  const [isSupporting, setIsSupporting] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Nouvel état pour le modal
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Utiliser useMemo pour les valeurs calculées
  const supportCount = useMemo(() => userSupport?.length || 0, [userSupport]);
  const isAuthor = useMemo(() => user && user.id === doleance.user_id, [user, doleance.user_id]);
  const canSupport = useMemo(() => user && user.role === "citoyen" && !isAuthor, [user, isAuthor]);
  const currentUserId = localStorage.getItem("userId");
  
  const initials = useMemo(() => 
    `${doleance.nom?.[0] || ""}${doleance.prenoms?.[0] || ""}`.toUpperCase(),
    [doleance.nom, doleance.prenoms]
  );

  const locationItems = useMemo(() => 
    [doleance.region, doleance.district, doleance.commune].filter(Boolean),
    [doleance.region, doleance.district, doleance.commune]
  );

  const hasImages = useMemo(() => 
    doleance.images && doleance.images.length > 0,
    [doleance.images]
  );

  const hasMap = useMemo(() => 
    doleance.lat && doleance.lng,
    [doleance.lat, doleance.lng]
  );

  // Utiliser useCallback pour les fonctions
  const handleClickOutside = useCallback((event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.id && userSupport) {
      setIsSupporting(userSupport.includes(user.id));
    }
  }, [user, userSupport]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleValidate = useCallback(async () => {
    try {
      const user_id = localStorage.getItem('userId');
      if (!user_id) {
        alert("Utilisateur non connecté");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/doleances/${doleance.id}/valider`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id })
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
  }, [doleance.id]);

  // Fonction pour gérer la modification
  const handleEdit = useCallback(() => {
    setShowMenu(false);
    setIsEditModalOpen(true);
  }, []);

  // Fonction pour fermer le modal d'édition
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  // Fonction pour soumettre les modifications
  const handleUpdateDoleance = useCallback(async (formData) => {
    try {
      console.log("Envoi de la modification pour la doléance:", doleance.id);
      
      const response = await fetch(`http://localhost:5000/doleances/${doleance.id}`, {
        method: "PUT",
        body: formData,
        // Note: Ne pas mettre 'Content-Type' header, le navigateur le fera automatiquement
        // avec le bon boundary pour FormData
      });

      console.log("Réponse du serveur:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("Doléance mise à jour avec succès:", result);
        alert("✅ Doléance mise à jour avec succès !");
        setIsEditModalOpen(false);
        
        // Rafraîchir les données si nécessaire
        if (onSupportUpdate) {
          onSupportUpdate(result.doleance);
        }
        
        // Rafraîchir la page pour voir les changements
        window.location.reload();
      } else {
        const error = await response.json();
        console.error("Erreur du serveur:", error);
        alert(`❌ ${error.error || "Erreur lors de la mise à jour"}\nDétails: ${error.details || ''}`);
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      alert("Erreur de connexion au serveur. Vérifiez que le serveur est en cours d'exécution.");
    }
  }, [doleance.id, onSupportUpdate]);

  const handleReject = useCallback(async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id) {
      alert("Utilisateur non connecté");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/doleances/${doleance.id}/rejeter`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id })
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsRejeter(true);
        alert("Doléance rejetée avec succès !");
      } else {
        alert(data.error || "Erreur lors de la rejet");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    }
  }, [doleance.id]);

  const handleStartTraitement = useCallback(async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id) {
      alert("Utilisateur non connecté");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/doleances/${doleance.id}/traiter`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id })
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsTraiter(true);
        setIsValidated(false);
        alert("Doléance en cours de traitement !");
      } else {
        alert(data.error || "Erreur lors de la modification");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    }
  }, [doleance.id]);

  const handleResolu = useCallback(async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id) {
      alert("Utilisateur non connecté");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/doleances/${doleance.id}/resolue`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id })
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsResolue(true);
        setIsTraiter(false);
        alert("Doléance resolue !");
      } else {
        alert(data.error || "Erreur lors de la resolution");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    }
  }, [doleance.id]);

  const handleDelete = useCallback(async () => {
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
  }, [doleance.id, isValidated, onDeleted]);

  const handleSupport = useCallback(async () => {
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
  }, [doleance.id, user, isSupporting]);

  const handleAction = useCallback((action) => {
    setShowMenu(false);
    if (action === "modifier") {
      handleEdit();
    }
    if (action === "supprimer") {
      handleDelete();
    }
  }, [handleEdit, handleDelete]);


  const handleImageLoad = useCallback((imgIndex) => {
    setImageLoading(prev => ({ ...prev, [imgIndex]: false }));
  }, []);

  const handleImageError = useCallback((imgIndex) => {
    setImageLoading(prev => ({ ...prev, [imgIndex]: false }));
  }, []);

  const renderSupportButton = useMemo(() => {
    if (!user?.id) {
      // Utilisateur non connecté - peut seulement voir le nombre
      return (
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                      bg-gray-100 text-gray-500 border border-gray-200">
          <ThumbsUp className="h-5 w-5" />
          Soutiens : {supportCount}
        </div>
      );
    }
    
    if (isAuthor) {
      // L'auteur ne peut pas soutenir sa propre doléance
      return (
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                      bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed">
          <ThumbsUp className="h-5 w-5" />
          Vous êtes l'auteur • Soutiens : {supportCount}
        </div>
      );
    }
    
    // Vérifier si l'utilisateur est un citoyen
    const isCitoyen = user?.role === 'citoyen';
    
    if (!isCitoyen) {
      // Utilisateur connecté mais pas citoyen (admin/agent) - peut seulement voir
      return (
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                      bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed">
          <ThumbsUp className="h-5 w-5" />
          Soutiens : {supportCount} (réservé aux citoyens)
        </div>
      );
    }
    
    // Citoyen connecté - peut soutenir
    return (
      <button
        onClick={handleSupport}
        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                  border shadow-md transition-all duration-200 hover:scale-[1.02]
                  ${
                    isSupporting
                      ? "bg-blue-100 text-blue-600 border-blue-200 shadow-blue-200/50 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:shadow-lg"
                  }`}
      >
        <ThumbsUp className={`h-5 w-5 ${isSupporting ? "fill-blue-500 text-blue-500" : ""}`} />
        {isSupporting ? "Soutenu" : "Soutenir"} ({supportCount})
      </button>
    );
  }, [user, isAuthor, supportCount, isSupporting, handleSupport]);

  const prepareDoleanceDataForEdit = useMemo(() => {
    return {
      ...doleance,
      images: doleance.images || []
    };
  }, [doleance]);
  
  const renderStatusButton = useMemo(() => {
    if (isValidated) {
      return (
        <button
          disabled
          className="inline-flex items-center gap-2 px-3 py-1.5 text-base font-semibold rounded-xl border transition-all duration-300
                    bg-green-100 text-green-500 border-green-200 cursor-not-allowed"
        >
          <CheckCircle className="h-4 w-4" />
          validée
        </button>
      );
    }
    
    if (isRejeter) {
      return (
        <button
          disabled
          className="inline-flex items-center gap-2 px-3 py-1.5 text-base font-semibold rounded-xl border transition-all duration-300
                    bg-red-100 text-red-500 border-red-200 cursor-not-allowed"
        >
          <XCircle className="h-4 w-4" />
          rejetée
        </button>
      );
    }

    if (isTraiter) {
      return (
        <button
          disabled
          className="inline-flex items-center gap-2 px-3 py-1.5 text-base font-semibold rounded-xl border transition-all duration-300
                    bg-amber-100 text-amber-500 border-amber-200 cursor-not-allowed"
        >
          <Wrench className="h-4 w-4" />
          En cours de traitement
        </button>
      );
    }
    
    if (isResolue) {
      return (
        <button
          disabled
          className="inline-flex items-center gap-2 px-3 py-1.5 text-base font-semibold rounded-xl border transition-all duration-300
                    bg-blue-100 text-blue-500 border-blue-200 cursor-not-allowed"
        >
          <CheckCircle2 className="h-4 w-4" />
          Resolue
        </button>
      );
    }
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-3 py-1.5 text-base font-semibold rounded-xl border transition-all duration-300
                  bg-yellow-50 text-yellow-400 border-yellow-200 cursor-not-allowed"
      >
        <Clock className="h-4 w-4" />
        En attente
      </button>
    );
  }, [isValidated, isRejeter, isTraiter, isResolue]);

  const renderAgentButtons = useMemo(() => {
    if (!isValidated && !isRejeter && !isTraiter && !isResolue && user?.role === "agent") {
      return (
        <>
          <button
            onClick={handleValidate}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                      bg-green-50 text-green-600 border border-green-200 shadow-lg 
                      hover:shadow-green-200/60"
          >
            <CheckCircle className="h-5 w-5" />
            Valider
          </button>
          <button
            onClick={handleReject}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                      bg-red-50 text-red-600 border border-red-200 shadow-lg 
                      hover:shadow-red-200/60"
          >
            <XCircle className="h-5 w-5" />
            Rejeter
          </button>
        </>
      );
    }

    if (isValidated && !isTraiter && user?.role === "agent") {
      return (
        <button
          onClick={handleStartTraitement}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                  bg-amber-50 text-amber-600 border border-amber-200 shadow-lg 
                  hover:shadow-amber-200/60"
        >
          <Wrench className="h-5 w-5" />
          Démarrer le traitement
        </button>
      );
    }

    if (isTraiter && !isResolue && user?.role === "agent") {
      return (
        <button
          onClick={handleResolu}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                  bg-blue-50 text-blue-600 border border-blue-200 shadow-lg 
                  hover:shadow-blue-200/60"
        >
          <CheckCircle2 className="h-5 w-5" />
          Marquer comme resolue
        </button>
      );
    }

    return null;
  }, [
    isValidated, 
    isRejeter, 
    isTraiter,
    isResolue,
    user, 
    handleValidate, 
    handleReject,
    handleStartTraitement,
    handleResolu,
  ]);

  const renderImages = useMemo(() => {
    if (!hasImages) return null;

    return (
      <div className="-mx-6 mb-4 bg-white border-t border-b border-gray-200 overflow-hidden transition-all duration-300">
        <div className="bg-white w-full p-4 font-bold text-gray-900 text-base flex items-center gap-3 border-b">
          <Image className="h-6 w-6 text-blue-500 ml-2"/>
          <p>Images associées à la doléance ({doleance.images.length})</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-gray-50">
          {doleance.images.map((image, index) => (
            <div 
              key={index}
              className="relative group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              {imageLoading[index] !== false && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}

              <img
                src={`http://localhost:5000/${image}`}
                alt={`doleance ${index + 1}`}
                className="w-full h-auto max-h-[400px] object-contain bg-white transition-opacity duration-300"
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Image {index + 1}
                </div>
              </div>

              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        {doleance.images.length % 2 !== 0 && (
          <div className="md:col-span-2"></div>
        )}
      </div>
    );
  }, [hasImages, doleance.images, imageLoading, handleImageLoad, handleImageError]);

  const renderMap = useMemo(() => {
    if (!hasMap) return null;

    return (
      <div className="mt-4 -mx-6 bg-white border-t border-b border-gray-200 overflow-hidden transition-all duration-300">
        <div>
          <div className="bg-white p-4 font-bold text-gray-900 text-base flex items-center gap-3">
            <MapPinned className="h-6 w-6 text-blue-500 ml-2" />
            <p>Position sur la carte</p>
          </div>
          <div className="w-full h-96 overflow-hidden">
            <Map lat={doleance.lat} lng={doleance.lng} />
          </div>
        </div>
      </div>
    );
  }, [hasMap, doleance.lat, doleance.lng]);

  return (
    <>
      <div className="border border-gray-200/80 rounded-xl p-6 hover:shadow-xl transition-all duration-300 bg-white backdrop-blur-sm bg-opacity-95">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => {
                if (doleance.user_id === currentUserId) {
                  navigate("/Profil");
                } else {
                  navigate(`/ProfilUtil/${doleance.user_id}/${doleance.role}`);
                }
              }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg backdrop-blur-sm border border-white/20 cursor-pointer">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <p 
                  onClick={() => {
                    if (doleance.user_id === currentUserId) {
                      navigate("/Profil");
                    } else {
                      navigate(`/ProfilUtil/${doleance.user_id}/${doleance.role}`);
                    }
                  }}
                  className="font-semibold text-gray-900 text-lg cursor-pointer">
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
          {isAuthor && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2.5 rounded-2xl hover:bg-gray-100/80 transition-all duration-200 backdrop-blur-sm"
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white/80 backdrop-blur-md shadow-xl border border-gray-100 rounded-2xl overflow-hidden z-50 animate-fadeIn">
                  <button
                    onClick={() => handleAction("modifier")}
                    disabled={isValidated || isRejeter || isTraiter || isResolue}
                    className={`flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isValidated || isRejeter || isTraiter || isResolue
                        ? "text-gray-400 cursor-not-allowed bg-gray-50"
                        : "text-blue-600 hover:bg-blue-500/10"
                    }`}               >
                    <Edit3 className={`w-4 h-4 ${isValidated || isRejeter || isTraiter || isResolue ? "text-gray-400" : "text-blue-500"}`} />
                    Modifier
                  </button>

                  <div className="h-px bg-gray-100" />

                  <button
                    onClick={() => handleAction("supprimer")}
                    disabled={isValidated || isRejeter || isTraiter || isResolue}
                    className={`flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isValidated || isRejeter || isTraiter || isResolue
                        ? "text-gray-400 cursor-not-allowed bg-gray-50"
                        : "text-red-600 hover:bg-red-500/10"
                    }`}
                  >
                    <Trash2 className={`w-4 h-4 ${isValidated || isRejeter || isTraiter || isResolue ? "text-gray-400" : "text-red-500"}`} />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-base font-semibold rounded-xl border transition-all duration-300 ${
              doleance.type?.toLowerCase() === "signalement"
                ? "bg-red-500/10 text-red-700 border-red-300/50 shadow-sm"
                : doleance.type?.toLowerCase() === "demande"
                ? "bg-blue-500/10 text-blue-700 border-blue-300/50 shadow-sm"
                : "bg-gray-500/10 text-gray-700 border-gray-300/50 shadow-sm"
            }`}
          >
            {doleance.type?.toLowerCase() === "demande" ? (
              <FileText className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}

            {doleance.type}
          </span>
          <div className="flex items-center gap-2">
            {renderStatusButton}
          </div>
        </div>

        <div className="space-y-4 mb-3">
          {/* Type */}
          <span
            className="font-bold text-xl text-green-500"
          >
            Numero de suivi : {doleance.numero}
          </span>
        </div>

        {/* Infos */}
        <div className="space-y-3 mb-6">
          <div className="hidden flex-wrap gap-2">
            {locationItems.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-slate-300/80 bg-gradient-to-r from-slate-50 to-slate-100/80 text-slate-700 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <MapPin className="h-4 w-4 text-slate-500" />
                {item}
              </span>
            ))}
          </div>

          <div>
            <span className="text-sm font-semibold text-gray-500 tracking-wide">Region * District * Commune</span>
          </div>
          <span className="text-lg text-gray-900 font-medium">{doleance.region} * {doleance.district} * {doleance.commune}</span>

          <div>
            <span className="text-sm font-semibold text-gray-500 tracking-wide">Adresse</span>
          </div>
          <span className="text-lg text-gray-900 font-medium">{doleance.adresse}</span>

          <div>
            <span className="text-sm font-semibold text-gray-500 tracking-wide">Catégorie</span>
          </div>
          <span className="text-lg text-gray-900 font-medium">{doleance.categorie}</span>

          <div>
            <span className="text-sm font-semibold text-gray-500 tracking-wide">Sous-catégorie</span>
          </div>
          <span className="text-lg text-gray-900 font-medium">{doleance.sousCategorie}</span>

          <div>
            <span className="text-sm font-semibold text-gray-500 tracking-wide">Description</span>
          </div>
          <span className="text-lg text-gray-900 font-medium">{doleance.description}</span>
        </div>

        {/* Carte et Images */}
        {renderMap}
        {renderImages}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2 items-center">
            {renderSupportButton}
            {renderAgentButtons}
          </div>
        </div>
      </div>
      <EditDoleanceModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateDoleance}
        user={user}
        doleanceData={prepareDoleanceDataForEdit}
      />
    </>
  );
}