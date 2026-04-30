import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Publication from "../composant/publication";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // ✅ Import de l'icône Lucide

export default function PublicationDetail() {
  const { id } = useParams(); // On récupère l'id depuis l'URL
  const [pub, setPub] = useState(null);
  const [likes, setLikes] = useState({});
  const [favorites, setFavorites] = useState({});
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  const navigate = useNavigate(); // ✅ créer instance navigate

  // Récupérer la publication par ID
  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const res = await fetch(`http://localhost:5000/publications/publicationDetail/${id}`);
        const data = await res.json();
        if (data.publication) {
          setPub(data.publication);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [id]);

  // Initialiser likes/favorites une fois la publication récupérée
  useEffect(() => {
    if (pub && userId) {
      setLikes({ [pub.id]: (pub.userLike || []).includes(userId) });
      setFavorites({ [pub.id]: (pub.userFavoris || []).includes(userId) });
    }
  }, [pub, userId]);

  if (loading) return <p>Chargement...</p>;
  if (!pub) return <p>Publication non trouvée.</p>;

  return (
    <div className="w-full flex justify-center p-2">
      <div className="bg-white rounded-xl shadow-md p-6 w-full">
        {/* ✅ Bouton avec vraie icône Lucide */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group mb-6"
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Retour</span>
        </button>
        
        <div className="flex flex-col gap-6">
          <Publication
            pub={pub}
            userId={userId}
            likes={likes}
            favorites={favorites}
            setLikes={setLikes}
            setFavorites={setFavorites}
          />
        </div>
      </div>
    </div>
  );
}