import React, { useState, useRef, useEffect } from "react";
import { Heart, Bookmark, MoreVertical, Edit3, Trash2, X, Image as ImageIcon } from "lucide-react";

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
  userId,
  likes,
  favorites,
  setLikes,
  setFavorites,
  onDeleted,
}) {
  const [showAllImages, setShowAllImages] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [description, setDescription] = useState(pub.description || "");
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(pub.images || []);
  const [imageLoading, setImageLoading] = useState({});

  const menuRef = useRef(null);

  // Fermer menu si clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLike = async () => {
    try {
      const isLiked = likes[pub.id] || false;
      setLikes((prev) => ({ ...prev, [pub.id]: !isLiked }));

      await fetch(`http://localhost:5000/publications/${pub.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavorite = async () => {
    try {
      const isFav = favorites[pub.id] || false;
      setFavorites((prev) => ({ ...prev, [pub.id]: !isFav }));

      await fetch(`http://localhost:5000/publications/${pub.id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isValidated = pub.isValidated || false;

  // 🗑️ Suppression
  const handleDelete = async () => {
    if (isValidated) {
      alert("❌ Impossible de supprimer une doléance déjà validée.");
      return;
    }

    if (!window.confirm("⚠️ Voulez-vous vraiment supprimer cette publication ?")) return;

    try {
      const response = await fetch(`http://localhost:5000/publications/${pub.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        alert("🗑️ Publication supprimée avec succès !");
        if (onDeleted) onDeleted(pub.id);
      } else {
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    }
  };

  // ✏️ Modification
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
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
        alert("✅ Publication modifiée avec succès !");
        setIsEditModalOpen(false);
        window.location.reload();
      } else {
        alert(data.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    }
  };

  const handleAction = (action) => {
    if (action === "modifier") {
      setIsEditModalOpen(true);
    }
    if (action === "supprimer") {
      handleDelete();
    }
    setShowMenu(false);
  };

  const handleImageLoad = (imgIndex) => {
    setImageLoading(prev => ({ ...prev, [imgIndex]: false }));
  };

  const handleImageError = (imgIndex) => {
    setImageLoading(prev => ({ ...prev, [imgIndex]: false }));
  };

  return (
    <>
      {/* 📌 Carte de publication - Design plus moderne */}
      <div className="border border-gray-200/80 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 bg-white backdrop-blur-sm bg-opacity-95">
        
        {/* Header avec design amélioré */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
              {pub.nom?.[0] ?? "?"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <p className="font-bold text-gray-900 text-lg">
                  {pub.nom} {pub.prenoms}
                </p>
                <span className="inline-block px-3 py-1.5 text-xs font-semibold rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/60">
                  {pub.role}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">{formatDate(pub.created_at)}</p>
            </div>
          </div>

          {/* Menu contextuel amélioré */}
          {pub.user_id === userId && (
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

        {/* Texte avec meilleure typographie */}
        <p className="text-gray-800 mb-4 p-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed bg-gray-50/50 rounded-2xl border border-gray-100">
          {pub.description}
        </p>

        {/* Images avec design amélioré */}
        {pub.images && pub.images.length > 0 && (
          <div className="space-y-3">
            <div
              className="relative w-full cursor-pointer group"
              onClick={() => setShowAllImages(!showAllImages)}
            >
              <div className="relative overflow-hidden rounded-2xl">
                {imageLoading[0] !== false && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <img
                  src={`http://localhost:5000/${pub.images[0]}`}
                  alt="publication"
                  className="w-full h-auto"
                  onLoad={() => handleImageLoad(0)}
                  onError={() => handleImageError(0)}
                />
              </div>
              
              {pub.images.length > 1 && !showAllImages && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center text-white text-2xl font-bold rounded-2xl transition-all duration-300 group-hover:bg-black/30">
                  <div className="text-center">
                    <div className="text-3xl font-black">+{pub.images.length - 1}</div>
                    <div className="text-sm font-medium opacity-90">Voir plus</div>
                  </div>
                </div>
              )}
            </div>

            {showAllImages && pub.images.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                {pub.images.slice(1).map((img, idx) => (
                  <div key={idx} className="relative group">
                    <div className="relative overflow-hidden rounded-xl">
                      {imageLoading[idx + 1] !== false && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                      <img
                        src={`http://localhost:5000/${img}`}
                        alt="publication"
                        className="w-full h-auto"
                        onLoad={() => handleImageLoad(idx + 1)}
                        onError={() => handleImageError(idx + 1)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
            <span>J'aime</span>
          </button>

          <button
            onClick={handleFavorite}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 ${
              favorites[pub.id]
                ? "bg-yellow-50 text-yellow-600 border border-yellow-200 shadow-lg shadow-yellow-100/50 hover:shadow-yellow-200/60"
                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:shadow-lg"
            }`}
          >
            {favorites[pub.id] ? (
              <Bookmark className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
            <span>Favori</span>
          </button>
        </div>
      </div>

      {/* 🪟 MODAL DE MODIFICATION */}
      {isEditModalOpen && (
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
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Écrivez votre publication..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Ajout de nouvelles images */}
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 transition bg-gray-50">
                <span className="text-gray-500 font-medium">
                  Cliquez ici pour ajouter des photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    setFiles([...files, ...Array.from(e.target.files)])
                  }
                />
              </label>

              {/* Images existantes */}
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
                        onClick={() =>
                          setExistingImages(
                            existingImages.filter((_, idx) => idx !== i)
                          )
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Nouvelles images */}
              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="relative rounded-xl overflow-hidden shadow-md"
                    >
                      <img
                        src={URL.createObjectURL(f)}
                        alt="preview"
                        className="h-28 w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        onClick={() =>
                          setFiles(files.filter((_, idx) => idx !== i))
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}