import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  CheckCircle,
  MoreVertical,
  Edit3,
  Trash2,
  XCircle,
  Clock,
  ThumbsUp,
  Wrench,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  X,
} from "lucide-react";
import EditDoleanceModal from "../composant/modifieDoleance";

// Déplacer la fonction en dehors du composant pour éviter les recréations
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

export default function Doleance({ doleance, user, onDeleted, onSupportUpdate, userRole }) {
  const navigate = useNavigate();
  const [isValidated, setIsValidated] = useState(doleance?.status === "valide");
  const [isRejeter, setIsRejeter] = useState(doleance?.status === "rejeter");
  const [isTraiter, setIsTraiter] = useState(doleance?.status === "traiter");
  const [isResolue, setIsResolue] = useState(doleance?.status === "resolue");
  const [showMenu, setShowMenu] = useState(false);
  const [userSupport, setUserSupport] = useState(doleance?.userSupport || []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const isInProfilUtil = location.pathname.includes("/ProfilUtil/");
  const roleToUse = isInProfilUtil ? userRole : user?.role;
  const currentUserId = localStorage.getItem("userId");

  // États pour les notifications et modal de confirmation
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalDetails, setModalDetails] = useState({ 
    title: '', 
    message: '',
    actionType: '', // 'validate', 'reject', 'traitement', 'resolution', 'delete'
    numeroDoleance: '',
    userName: ''
  });
  const [selectedAction, setSelectedAction] = useState(null);

  // Fermer les messages après 5 secondes
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const showSuccess = (message) => {
    setSuccessMessage(message);
  };

  const showError = (message) => {
    setErrorMessage(message);
  };

  // Fonction pour ouvrir le modal de confirmation
  const openConfirmModal = (actionType, actionFunction, details) => {
    setSelectedAction(() => actionFunction);
    setModalDetails({
      ...details,
      numeroDoleance: doleance.numero,
      userName: `${doleance.nom} ${doleance.prenoms}`
    });
    setShowConfirmModal(true);
    setShowMenu(false);
  };

  // Fonction pour fermer le modal de confirmation
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedAction(null);
    setModalDetails({ 
      title: '', 
      message: '',
      actionType: '',
      numeroDoleance: '',
      userName: ''
    });
  };

  // Fonction pour exécuter l'action après confirmation
  const executeAction = async () => {
    if (selectedAction) {
      await selectedAction();
    }
    closeConfirmModal();
  };

  useEffect(() => {
    setUserSupport(doleance?.userSupport || []);
  }, [doleance.userSupport]);

  const supportCount = useMemo(() => userSupport?.length || 0, [userSupport]);

  const isAuthor = useMemo(() => 
    currentUserId && doleance.user_id && 
    currentUserId.toString() === doleance.user_id.toString(), 
    [currentUserId, doleance.user_id]
  );

  const hasSupported = useMemo(() => {
    if (!currentUserId || !userSupport || !Array.isArray(userSupport)) {
      return false;
    }
    return userSupport.includes(currentUserId.toString());
  }, [userSupport, currentUserId]);

  const canSupport = useMemo(() => 
    user && user.role === "citoyen" && !isAuthor, 
    [user, isAuthor]
  );

  const initials = useMemo(() => 
    `${doleance.nom?.[0] || ""}${doleance.prenoms?.[0] || ""}`.toUpperCase(),
    [doleance.nom, doleance.prenoms]
  );

  const locationItems = useMemo(() => 
    [doleance.region, doleance.district, doleance.commune].filter(Boolean),
    [doleance.region, doleance.district, doleance.commune]
  );

  const handleClickOutside = useCallback((event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleViewDetails = useCallback(() => {
    navigate(`/DoleanceDetail/${doleance.id}`);
  }, [navigate, doleance.id]);

  const handleEdit = useCallback(() => {
    setShowMenu(false);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleUpdateDoleance = useCallback(async (formData) => {
    try {
      console.log("Envoi de la modification pour la doléance:", doleance.id);
      
      const response = await fetch(`http://localhost:5000/doleances/${doleance.id}`, {
        method: "PUT",
        body: formData,
      });

      console.log("Réponse du serveur:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("Doléance mise à jour avec succès:", result);
        showSuccess("✅ Doléance mise à jour avec succès !");
        setIsEditModalOpen(false);
        
        if (onSupportUpdate) {
          onSupportUpdate(result.doleance);
        }
        
        window.location.reload();
      } else {
        const error = await response.json();
        console.error("Erreur du serveur:", error);
        showError(`❌ ${error.error || "Erreur lors de la mise à jour"}`);
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      showError("Erreur de connexion au serveur");
    }
  }, [doleance.id, onSupportUpdate]);

  // Fonction de suppression
  const handleDelete = useCallback(async () => {
    if (isValidated) {
      showError("❌ Impossible de supprimer une doléance déjà validée.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/doleances/${doleance.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        showSuccess("🗑️ Doléance supprimée avec succès !");
        if (onDeleted) onDeleted(doleance.id);
      } else {
        showError(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      showError("Erreur de connexion au serveur");
    }
  }, [doleance.id, isValidated, onDeleted]);

  const handleSupport = useCallback(async () => {
    if (!currentUserId) {
      showError("⚠️ Vous devez être connecté pour soutenir une doléance.");
      return;
    }

    if (currentUserId === doleance.user_id.toString()) {
      showError("ℹ️ Vous ne pouvez pas soutenir votre propre doléance.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/doleances/${doleance.id}/soutenir`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        }
      );
      const data = await response.json();
      
      if (response.ok) {
        setUserSupport(data.doleance.userSupport || []);
        if (onSupportUpdate) {
          onSupportUpdate(data.doleance);
        }
      } else {
        showError(data.error || "Erreur lors du soutien");
      }
    } catch (err) {
      console.error(err);
      showError("Erreur de connexion au serveur");
    }
  }, [doleance.id, currentUserId, onSupportUpdate]);

  const handleAction = useCallback((action) => {
    setShowMenu(false);
    if (action === "modifier") {
      handleEdit();
    }
  }, [handleEdit]);

  const handleValidate = useCallback(async () => {
    try {
      const user_id = localStorage.getItem('userId');
      if (!user_id) {
        showError("Utilisateur non connecté");
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
        showSuccess("Doléance validée avec succès !");
      } else {
        showError(data.error || "Erreur lors de la validation");
      }
    } catch (err) {
      console.error(err);
      showError("Erreur de connexion au serveur");
    }
  }, [doleance.id]);

  const handleReject = useCallback(async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id) {
      showError("Utilisateur non connecté");
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
        showSuccess("Doléance rejetée avec succès !");
      } else {
        showError(data.error || "Erreur lors de la rejet");
      }
    } catch (err) {
      console.error(err);
      showError("Erreur de connexion au serveur");
    }
  }, [doleance.id]);

  const handleStartTraitement = useCallback(async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id) {
      showError("Utilisateur non connecté");
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
        showSuccess("Doléance en cours de traitement !");
      } else {
        showError(data.error || "Erreur lors de la modification");
      }
    } catch (err) {
      console.error(err);
      showError("Erreur de connexion au serveur");
    }
  }, [doleance.id]);

  const handleResolu = useCallback(async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id) {
      showError("Utilisateur non connecté");
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
        showSuccess("Doléance resolue");
      } else {
        showError(data.error || "Erreur lors de la resolution");
      }
    } catch (err) {
      console.error(err);
      showError("Erreur de connexion au serveur");
    }
  }, [doleance.id]);

  // Préparer les données pour le modal d'édition
  const prepareDoleanceDataForEdit = useMemo(() => {
    return {
      ...doleance,
      images: doleance.images || []
    };
  }, [doleance]);

  // Fonctions pour ouvrir les modales de confirmation pour chaque action
  const confirmValidate = useCallback(() => {
    openConfirmModal(
      'validate',
      handleValidate,
      {
        title: "Confirmer la validation",
        message: `Êtes-vous sûr de vouloir valider cette doléance ? Cette action changera son statut en "validée".`,
        actionType: 'validate'
      }
    );
  }, [handleValidate]);

  const confirmReject = useCallback(() => {
    openConfirmModal(
      'reject',
      handleReject,
      {
        title: "Confirmer le rejet",
        message: `Êtes-vous sûr de vouloir rejeter cette doléance ? Cette action changera son statut en "rejetée".`,
        actionType: 'reject'
      }
    );
  }, [handleReject]);

  const confirmStartTraitement = useCallback(() => {
    openConfirmModal(
      'traitement',
      handleStartTraitement,
      {
        title: "Démarrer le traitement",
        message: `Êtes-vous sûr de vouloir démarrer le traitement de cette doléance ? Elle passera en "en cours de traitement".`,
        actionType: 'traitement'
      }
    );
  }, [handleStartTraitement]);

  const confirmResolu = useCallback(() => {
    openConfirmModal(
      'resolution',
      handleResolu,
      {
        title: "Marquer comme résolue",
        message: `Êtes-vous sûr de vouloir marquer cette doléance comme résolue ? Cette action clôturera le traitement.`,
        actionType: 'resolution'
      }
    );
  }, [handleResolu]);

  const confirmDelete = useCallback(() => {
    openConfirmModal(
      'delete',
      handleDelete,
      {
        title: "Confirmer la suppression",
        message: `Êtes-vous sûr de vouloir supprimer définitivement cette doléance ? Cette action est irréversible et toutes les données associées seront perdues.`,
        actionType: 'delete'
      }
    );
  }, [handleDelete]);

  // Rendu conditionnel optimisé
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

  const renderSupportButton = useMemo(() => {
    if (!currentUserId) {
      return (
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                      bg-gray-100 text-gray-500 border border-gray-200">
          <ThumbsUp className="h-5 w-5" />
          Soutiens : {supportCount}
        </div>
      );
    }
    
    if (isAuthor) {
      return (
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                      bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed">
          <ThumbsUp className="h-5 w-5" />
          Vous êtes l'auteur • Soutiens : {supportCount}
        </div>
      );
    }
    
    const userRole = localStorage.getItem("userRole") || user?.role;
    const isCitoyen = userRole === 'citoyen';
    
    if (!isCitoyen) {
      return (
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                      bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed">
          <ThumbsUp className="h-5 w-5" />
          Soutiens : {supportCount} (réservé aux citoyens)
        </div>
      );
    }
    
    return (
      <button
        onClick={handleSupport}
        disabled={isAuthor}
        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                  border shadow-md transition-all duration-200 hover:scale-[1.02]
                  ${
                    hasSupported
                      ? "bg-blue-100 text-blue-600 border-blue-200 shadow-blue-200/50 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:shadow-lg"
                  } ${
                    isAuthor 
                      ? "opacity-50 cursor-not-allowed hover:bg-gray-100 hover:shadow-none" 
                      : ""
                  }`}
      >
        <ThumbsUp className={`h-5 w-5 ${hasSupported ? "fill-blue-500 text-blue-500" : ""}`} />
        {hasSupported ? "Soutenu" : "Soutenir"} ({supportCount})
      </button>
    );
  }, [currentUserId, isAuthor, supportCount, hasSupported, handleSupport, user?.role]);

  const renderAgentButtons = useMemo(() => {
    if (!isValidated && !isRejeter && !isTraiter && !isResolue && roleToUse === "agent") {
      return (
        <>
          <button
            onClick={confirmValidate}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                      bg-green-50 text-green-600 border border-green-200 shadow-lg 
                      hover:shadow-green-200/60"
          >
            <CheckCircle className="h-5 w-5" />
            Valider
          </button>
  
          <button
            onClick={confirmReject}
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

    if (isValidated && !isTraiter && roleToUse === "agent") {
      return (
        <button
          onClick={confirmStartTraitement}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                  bg-amber-50 text-amber-600 border border-amber-200 shadow-lg 
                  hover:shadow-amber-200/60"
        >
          <Wrench className="h-5 w-5" />
          Démarrer le traitement
        </button>
      );
    }

    if (isTraiter && !isResolue && roleToUse === "agent") {
      return (
        <button
          onClick={confirmResolu}
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
    roleToUse,
    confirmValidate,
    confirmReject,
    confirmStartTraitement,
    confirmResolu,
  ]);

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

      {/* Modal de confirmation unifié */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {/* Numéro de doléance en vert */}
            <div className="mb-4 text-center">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 rounded-lg mb-3">
                <span className="text-green-700 font-bold text-lg">
                  Numéro : <span className="text-green-600">{modalDetails.numeroDoleance}</span>
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Auteur : <span className="font-medium">{modalDetails.userName}</span>
              </p>
            </div>

            <h3 className="text-2xl text-center font-semibold text-gray-900 mb-4">
              {modalDetails.title}
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-600 text-center">
                {modalDetails.message}
              </p>
            </div>

            {/* Message spécifique pour la suppression */}
            {modalDetails.actionType === 'delete' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium text-sm">
                    ⚠️ Attention : Cette action est irréversible
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 w-full py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={executeAction}
                className={`px-4 w-full py-3 text-sm font-medium text-white rounded-lg transition-colors ${
                  modalDetails.actionType === 'delete' || modalDetails.actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {modalDetails.actionType === 'delete' ? 'Supprimer' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border border-gray-200/80 rounded-xl p-6 hover:shadow-xl transition-all duration-300 bg-white backdrop-blur-sm bg-opacity-95">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => {
                if (isInProfilUtil) {
                  return;
                }
                
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
                    if (isInProfilUtil) {
                      return;
                    }
                    
                    if (doleance.user_id === currentUserId) {
                      navigate("/Profil");
                    } else {
                      navigate(`/ProfilUtil/${doleance.user_id}/${doleance.role}`);
                    }
                  }}
                  className="font-semibold text-gray-900 text-lg cursor-pointer">
                  {doleance.nom} {doleance.prenoms}
                </p>
              </div>
              <p className="text-xs text-gray-400 font-medium">{formatDate(doleance.created_at)}</p>
            </div>
          </div>

          {/* Bouton + menu - Afficher seulement si l'utilisateur connecté est l'auteur */}
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
                    }`}                >
                    <Edit3 className={`w-4 h-4 ${isValidated || isRejeter || isTraiter || isResolue ? "text-gray-400" : "text-blue-500"}`} />
                    Modifier
                  </button>

                  <div className="h-px bg-gray-100" />

                  <button
                    onClick={confirmDelete}
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
          <span className="font-bold text-xl text-green-500">
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
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2 items-center">
            {renderSupportButton}
            {renderAgentButtons}
          </div>

          <button
            onClick={handleViewDetails}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold 
                      bg-gray-100 text-gray-600 border border-gray-200 shadow 
                      hover:shadow-gray-200/60"
          >
            Voir les détails
          </button>
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