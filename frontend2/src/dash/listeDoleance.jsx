import React, { useState, useEffect } from "react";
import Doleance from "../composant/doleance";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  MessageSquare, 
  Clock,
  List,
  Shield,
  ShieldCheck,
  XCircle,
  SortAsc,
  ListFilter,
  FileText
} from "lucide-react";

export default function ListeDoleance() {
  const [doleances, setDoleances] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Récupérer les infos de l'utilisateur
    fetch(`http://localhost:5000/profil/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
 
        // Une fois le user récupéré, choisir la bonne route selon le rôle
        const doleanceUrl =
          data.role === "agent"
            ? `http://localhost:5000/doleances/agent/${userId}`
            : `http://localhost:5000/doleances`;
 
        fetch(doleanceUrl)
        .then((res) => res.json())
        .then((doleancesData) => setDoleances(doleancesData))
        .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  }, [userId]);

  if (!user) return <p className="text-center mt-10">Chargement...</p>;

  // Définir les statuts à afficher selon le rôle
  const isCitizen = user.role !== "agent";
  const statusFilters = isCitizen 
    ? [
        { value: "all", label: "Tous statuts", icon: Filter, bg: "bg-gray-500" },
        { value: "valide", label: "Validées", icon: ShieldCheck, bg: "bg-green-500" },
        { value: "traiter", label: "En cours de traitement", icon: XCircle, bg: "bg-amber-500" },
        { value: "resolue", label: "Resolue", icon: XCircle, bg: "bg-blue-500" }
      ]
    : [
        { value: "all", label: "Tous statuts", icon: Filter, bg: "bg-gray-500" },
        { value: "en attente", label: "En attente", icon: Clock, bg: "bg-yellow-500" },
        { value: "valide", label: "Validées", icon: ShieldCheck, bg: "bg-green-500" },
        { value: "rejeter", label: "Rejetées", icon: XCircle, bg: "bg-red-500" },
        { value: "traiter", label: "En cours de traitement", icon: XCircle, bg: "bg-amber-500" },
        { value: "resolue", label: "Resolue", icon: XCircle, bg: "bg-blue-500" }
      ];

  const filteredDoleances = doleances
    .filter((d) => {
      const name = `${d.nom ?? ""} ${d.prenoms ?? ""} ${d.type ?? ""} ${d.numero ?? ""} ${d.region ?? ""} ${d.district ?? ""} ${d.commune ?? ""}`.toLowerCase();
      const description = (d.description ?? "").toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || description.includes(term);
    })
    .filter((d) => (filterType === "all" ? true : d.type?.toLowerCase() === filterType))
    .filter((d) => {
      if (filterStatus === "all") return true;
      return d.status === filterStatus;
    })
    .sort((a, b) => {
      const statusOrder = { "en attente": 0, "valide": 1, "traitre": 2, "resolue": 3, "rejeter": 4 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  return (
    <div className="w-full flex justify-center p-2">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
         <h3 className="text-xl font-semibold text-gray-800 ">Toutes les Doléances</h3>
         <div className="items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hidden">
           <Shield className="w-5 h-5" />
           <span className="font-semibold">{filteredDoleances.length} doléance(s)</span>
         </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, type ou description..."
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
              { value: "all", label: "Tous types", icon: List, bg: "bg-gray-500" },
              { value: "signalement", label: "Signalements", icon: AlertTriangle, bg: "bg-red-500" },
              { value: "demande", label: "Demandes", icon: FileText, bg: "bg-blue-500" }
            ].map(({ value, label, icon: Icon, bg }) => (
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

          {/* Filtre Statut - conditionnel selon le rôle */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ListFilter className="w-4 h-4" />
              <span>Trier par :</span>
            </div>
            {statusFilters.map(({ value, label, icon: Icon, bg }) => (
              <button
                key={value}
                onClick={() => setFilterStatus(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border transition-all duration-300 ${
                  filterStatus === value
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
        {(filterType !== "all" || filterStatus !== "all") && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">
              Filtres actifs : 
              {filterType !== "all" && ` Type: ${filterType === "signalement" ? "Signalements" : "Demandes"}`}
              {filterStatus !== "all" && ` | Statut: ${
                filterStatus === "valide" ? "Validées" : 
                filterStatus === "rejeter" ? "Rejetées" : 
                filterStatus === "traiter" ? "En cours de traitement" : 
                filterStatus === "resolue" ? "Resolue" : 
                "En attente"
              }`}
            </span>
            <button
              onClick={() => {
                setFilterType("all");
                setFilterStatus("all");
              }}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Tout effacer
            </button>
          </div>
        )}

        {/* Liste des doléances */}
        <div className="flex flex-col gap-6">
          {filteredDoleances.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Aucune doléance trouvée</p>
              <p className="text-gray-400 text-sm mt-1">
                Essayez de modifier vos critères de recherche ou de filtres
              </p>
            </div>
          ) : (
            filteredDoleances.map((doleance) => (
              <Doleance key={doleance.id} doleance={doleance} user={user} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
