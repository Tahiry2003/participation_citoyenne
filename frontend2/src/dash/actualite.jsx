import React, { useEffect, useState, useMemo } from "react";
import Publication from "../composant/publication";
import { 
  Search, 
  Newspaper, 
  Users,
  ListFilter,
  Heart,
  Bookmark,
  Filter,
  Clock,
  Flame,
} from "lucide-react";

export default function Actualite() {
  const [publications, setPublications] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSort, setFilterSort] = useState("recent");
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const [likes, setLikes] = useState({});
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    fetch(`http://localhost:5000/profil/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(console.error);

    fetch(`http://localhost:5000/publications`)
      .then((res) => res.json())
      .then((data) => setPublications(data))
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

  // Fonction pour supprimer une publication de la liste
  const handleDeletedPub = (id) => {
    setPublications(prev => prev.filter(pub => pub.id !== id));
  };

  // Calcul des statistiques pour le tri
  const publicationsWithStats = useMemo(() => {
    return publications.map(pub => ({
      ...pub,
      likeCount: pub.userLike?.length || 0,
      favoriteCount: pub.userFavoris?.length || 0,
      isLikedByUser: likes[pub.id] || false,
      isFavoriteByUser: favorites[pub.id] || false
    }));
  }, [publications, likes, favorites]);

  const searchAccounts = accounts.filter((account) => {
    if(searchTerm && account.nom.toLowerCase().includes(searchTerm.toLowerCase())){
      return true
    }

    return false
  });

  const filteredPublications = useMemo(() => {
    let filtered = publicationsWithStats.filter((pub) => {
      const name = `${pub.nom ?? ""} ${pub.prenoms ?? ""}`.toLowerCase();
      const description = (pub.description ?? "").toLowerCase();
      const titre = (pub.titre ?? "").toLowerCase();
      const term = searchTerm.toLowerCase();
      
      return name.includes(term) || description.includes(term) || titre.includes(term);
    });

    // Filtre par type
    if (filterType === "liked") {
      filtered = filtered.filter(pub => pub.isLikedByUser);
    } else if (filterType === "favorites") {
      filtered = filtered.filter(pub => pub.isFavoriteByUser);
    } else if (filterType === "myPosts") {
      filtered = filtered.filter(pub => pub.user_id === userId);
    }

    // Tri
    return [...filtered].sort((a, b) => {
      switch (filterSort) {
        case "recent":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "mostLiked":
          // Tri par nombre de likes (décroissant)
          return (b.likeCount || 0) - (a.likeCount || 0);
        case "mostFavorited":
          // Tri par nombre de favoris (décroissant)
          return (b.favoriteCount || 0) - (a.favoriteCount || 0);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  }, [publicationsWithStats, searchTerm, filterType, filterSort, userId]);

  if (!user) return <p className="text-center mt-10">Chargement...</p>;

  // Calcul des statistiques
  const totalLikes = Object.values(likes).filter(Boolean).length;
  const totalFavorites = Object.values(favorites).filter(Boolean).length;
  const myPostsCount = publications.filter(pub => pub.user_id === userId).length;

  return (
    <div className="w-full flex justify-center p-2">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 ">Actualites</h3>
          <div className="items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hidden">
            <Newspaper className="w-4 h-4" />
            <span className="font-semibold">{filteredPublications.length} publication(s)</span>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, titre ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
          />
        </div>

        {/* Filtres avec icônes */}
        <div className="space-y-2 mb-4">
          {/* Filtre Type - maintenant au-dessus */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              <span>Filtrer par :</span>
            </div>
            {[
              { value: "all", label: "Toutes", icon: Newspaper, bg: "bg-gray-500" },
              { value: "liked", label: "J'aime", icon: Heart, bg: "bg-pink-500" },
              ...(userRole !== "citoyen" ? [{ value: "myPosts", label: "Mes posts", icon: Users, bg: "bg-blue-500" }] : []),
            ]
            .map(({ value, label, icon: Icon, bg }) => (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border transition-all duration-300 ${
                  filterType === value
                    ? `${bg} text-white border-transparent shadow-lg`
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Filtre Tri */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ListFilter className="w-4 h-4" />
              <span>Trier par :</span>
            </div>
            {[
              { value: "recent", label: "Plus récent", icon: Clock, bg: "bg-gray-500" },
              { value: "oldest", label: "Plus ancien", icon: Clock, bg: "bg-purple-400" },
              { value: "mostLiked", label: "Plus populaires", icon: Flame, bg: "bg-red-500" },
            ].map(({ value, label, icon: Icon, bg }) => (
              <button
                key={value}
                onClick={() => setFilterSort(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border transition-all duration-300 ${
                  filterSort === value
                  ? `${bg} text-white border-transparent shadow-lg`
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Indicateurs de filtres actifs */}
        {(filterType !== "all" || filterSort !== "recent" || searchTerm) && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">
              Filtres actifs : 
              {filterType !== "all" && ` ${filterType === "myPosts" ? "Mes posts" : filterType === "liked" ? "J'aime" : "Favoris"}`}
              {filterSort !== "recent" && ` | Tri: ${filterSort === "mostLiked" ? "Plus populaires" : filterSort === "mostFavorited" ? "Plus favoris" : "Plus ancien"}`}
              {searchTerm && ` | Recherche: "${searchTerm}"`}
            </span>
            <button
              onClick={() => {
                setFilterType("all");
                setFilterSort("recent");
                setSearchTerm("");
              }}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Tout effacer
            </button>
          </div>
        )}

        {/* Liste des publications */}
        <div className="flex flex-col gap-6">
          {filteredPublications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Aucune publication trouvée</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || filterType !== "all" || filterSort !== "recent" 
                  ? "Essayez de modifier vos critères de recherche ou de filtres" 
                  : "Soyez le premier à publier !"
                }
              </p>
            </div>
          ) : (
            filteredPublications.map((pub) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}