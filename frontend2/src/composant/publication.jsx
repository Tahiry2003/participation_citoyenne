import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Heart, Bookmark, MoreVertical, Edit3, Trash2, X, Image as ImageIcon, Shield, UserCheck, UserCircle, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) return `Il y a ${diffHour} h`;
  if (diffDay < 7) return `Il y a ${diffDay} j`;
  return date.toLocaleString();
}

export default function Publication({
  pub,
  likes,
  userId,
  setLikes,
  onDeleted,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [titre, setTitre] = useState(pub.titre || "");
  const [description, setDescription] = useState(pub.description || "");
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(pub.images || []);
  const [imageLoading, setImageLoading] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likeCount, setLikeCount] = useState(pub.userLike?.length || 0);
  const navigate = useNavigate();
  const location = useLocation();
  const isInProfilUtil = location.pathname.includes("/ProfilUtil/");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalDetails, setModalDetails] = useState({ 
    title: '', 
    message: '',
    actionType: '',
  });
  const [selectedAction, setSelectedAction] = useState(null);

  const menuRef = useRef(null);
  const currentUserId = localStorage.getItem("userId");

  const isAuthor = currentUserId && pub.user_id && currentUserId.toString() === pub.user_id.toString();

  const isValidated = useMemo(() => pub.isValidated || false, [pub.isValidated]);
  const hasImages = useMemo(() => pub.images && pub.images.length > 0, [pub.images]);
  const initials = useMemo(() => 
    `${pub.nom?.[0] || ""}${pub.prenoms?.[0] || ""}`.toUpperCase(),
    [pub.nom, pub.prenoms]
  );

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

  const openConfirmModal = (actionType, actionFunction, details) => {
    setSelectedAction(() => actionFunction);
    setModalDetails({
      ...details,
    });
    setShowConfirmModal(true);
    setShowMenu(false);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedAction(null);
    setModalDetails({ title: '', message: '', actionType: '' });
  };

  const executeAction = async () => {
    if (selectedAction) {
      await selectedAction();
    }
    closeConfirmModal();
  };

  useEffect(() => {
    setLikeCount(pub.userLike?.length || 0);
  }, [pub.userLike]);

  const handleClickOutside = useCallback((event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleLike = useCallback(async () => {
    try {
      const isLiked = likes[pub.id] || false;

      if (isLiked) {
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        setLikeCount(prev => prev + 1);
      }
      
      setLikes((prev) => ({ ...prev, [pub.id]: !isLiked }));

      await fetch(`http://localhost:5000/publications/${pub.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
      
    } catch (err) {
      console.error(err);
      // En cas d'erreur, annuler la mise à jour optimiste
      const isLiked = likes[pub.id] || false;
      if (isLiked) {
        setLikeCount(prev => prev + 1);
      } else {
        setLikeCount(prev => Math.max(0, prev - 1));
      }
      showError("❌ Erreur lors de l'ajout du like");
    }
  }, [pub.id, currentUserId, likes, setLikes]);

  const handleDelete = useCallback(async () => {
    if (isValidated) {
      showError("❌ Impossible de supprimer une publication déjà validée.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/publications/${pub.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        showSuccess("Publication supprimée avec succès !");
        if (onDeleted) onDeleted(pub.id);
      } else {
        showError(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      showError("Erreur de connexion au serveur");
    }
  }, [pub.id, isValidated, onDeleted]);

  const handleEditSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("titre", titre);
      formData.append("description", description);

      files.forEach((file) => {
        formData.append("images", file);
      });

      formData.append("existingImages", JSON.stringify(existingImages));

      const response = await fetch(`http://localhost:5000/publications/${pub.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Publication modifiée avec succès !");
        setIsEditModalOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showError(data.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error(err);
      showError("Erreur de connexion au serveur");
    }
  }, [titre, description, files, existingImages, pub.id]);

  const handleAction = useCallback((action) => {
    if (action === "modifier") {
      setIsEditModalOpen(true);
    }
    if (action === "supprimer") {
      openConfirmModal(
        'delete',
        handleDelete,
        {
          title: "Confirmer la suppression",
          message: `Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.`,
          actionType: 'delete'
        }
      );
    }
    setShowMenu(false);
  }, [handleDelete]);

  const handleImageLoad = useCallback((imgIndex) => {
    setImageLoading(prev => ({ ...prev, [imgIndex]: false }));
  }, []);

  const handleImageError = useCallback((imgIndex) => {
    setImageLoading(prev => ({ ...prev, [imgIndex]: false }));
  }, []);

  const nextImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === pub.images.length - 1 ? 0 : prev + 1
    );
  }, [pub.images.length]);

  const prevImage = useCallback((e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? pub.images.length - 1 : prev - 1
    );
  }, [pub.images.length]);

  const goToImage = useCallback((index, e) => {
    e?.stopPropagation();
    setCurrentImageIndex(index);
  }, []);

  const handleFileChange = useCallback((e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  }, []);

  const removeExistingImage = useCallback((index) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== index));
  }, []);

  const removeNewFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
  }, []);

  const renderImageCarousel = useMemo(() => {
    if (!hasImages) return null;

    return (
      <div className="space-y-3 -mx-6">
        <div className="relative w-full group">
          <div className="relative overflow-hidden bg-gray-100 flex items-center justify-center aspect-[4/3] max-h-[800px] w-full">
            {imageLoading[currentImageIndex] !== false && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            <img
              src={`http://localhost:5000/${pub.images[currentImageIndex]}`}
              alt={`publication ${currentImageIndex + 1}`}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
              onLoad={() => handleImageLoad(currentImageIndex)}
              onError={() => handleImageError(currentImageIndex)}
            />

            {pub.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5">
                  {pub.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => goToImage(index, e)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? "bg-blue-500 scale-110"
                          : "bg-white/60 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  {currentImageIndex + 1}/{pub.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }, [hasImages, pub.images, currentImageIndex, imageLoading, handleImageLoad, handleImageError, prevImage, nextImage, goToImage]);

  const renderEditModal = useMemo(() => {
    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
        <div className="relative max-h-[90vh] overflow-y-auto w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
          <div className="flex items-center justify-between mb-2 -mt-2">
            <h2 className="text-xl font-semibold text-gray-800">Modifier la publication</h2>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="flex flex-col gap-2" onSubmit={handleEditSubmit}>
            <div>
              <label className="text-sm font-medium text-gray-700">Titre</label>
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
                rows={4}
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
                onChange={handleFileChange}
              />
            </label>

            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden shadow-md">
                    <img
                      src={`http://localhost:5000/${img}`}
                      alt="existing"
                      className="h-28 w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      onClick={() => removeExistingImage(i)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-2">
                {files.map((f, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden shadow-md">
                    <img
                      src={URL.createObjectURL(f)}
                      alt="preview"
                      className="h-28 w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      onClick={() => removeNewFile(i)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-blue-50 text-blue-600 border border-blue-200 shadow-lg shadow-blue-100/50 hover:shadow-blue-200/60"
            >
              Enregistrer les modifications
            </button>
          </form>
        </div>
      </div>
    );
  }, [isEditModalOpen, titre, description, existingImages, files, handleEditSubmit, handleFileChange, removeExistingImage, removeNewFile]);

  return (
    <>
      {/* Notifications - Même style que dans Doleance */}
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

      {/* Modal de confirmation unifié - Même style que dans Doleance */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl text-center font-semibold text-gray-900 mb-4">
              {modalDetails.title}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {modalDetails.message}
            </p>
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
                  modalDetails.actionType === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirmer
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
                if (pub.user_id === userId) {
                  navigate("/Profil");
                } else {
                  navigate(`/ProfilUtil/${pub.user_id}/${pub.role}`);
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
                    if (pub.user_id === userId) {
                      navigate("/Profil");
                    } else {
                      navigate(`/ProfilUtil/${pub.user_id}/${pub.role}`);
                    }
                  }}
                  className="font-semibold text-gray-900 text-lg cursor-pointer">
                  {pub.nom} {pub.prenoms}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-2xl border 
                    ${
                      pub.role?.toLowerCase() === "agent"
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200/60"
                        : "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 border-blue-200/60"
                    }
                  `}
                >
                  {pub.role}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">{formatDate(pub.created_at)}</p>
            </div>
          </div>

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
                    <Trash2
                      className={`w-4 h-4 ${
                        isValidated ? "text-gray-400" : "text-red-500"
                      }`}
                    />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2 mb-4">
          <p className="flex items-center gap-3">
            <span className="text-gray-500 text-xl font-bold">{pub.titre}</span>
          </p>
          <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line break-words">
            {pub.description}
          </p>
        </div>

        {/* Images avec carousel */}
        {renderImageCarousel}

        {/* Boutons avec design moderne */}
        <div className="flex items-center mt-4 space-x-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 ${
              likes[pub.id]
                ? "bg-red-50 text-red-600 border border-red-200 shadow-lg shadow-red-100/50 hover:shadow-red-200/60"
                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:shadow-lg"
            }`}
          >
            {likes[pub.id] ? (
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            ) : (
              <Heart className="h-5 w-5" />
            )}
            <span>J'aime ({likeCount})</span>
          </button>
        </div>
      </div>

      {/* Modal de modification */}
      {renderEditModal}
    </>
  );
}