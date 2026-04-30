import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Doleance from "../composant/doleanceDetailComposant";
import { ArrowLeft } from "lucide-react";

export default function DoleanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doleance, setDoleance] = useState(null);
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer l'utilisateur
        const resUser = await fetch(`http://localhost:5000/profil/${userId}`);
        const userData = await resUser.json();
        setUser(userData);

        // Récupérer la doléance par ID
        const resDoleance = await fetch(`http://localhost:5000/doleances/${id}`);
        const data = await resDoleance.json();
        setDoleance(data.doleance);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id, userId]);

  if (!doleance || !user) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="w-full flex justify-center p-2">
      <div className="bg-white rounded-xl shadow-md p-6 w-full">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group mb-6"
        >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Retour</span>
        </button>

        <Doleance doleance={doleance} user={user} />
      </div>
    </div>
  );
}
