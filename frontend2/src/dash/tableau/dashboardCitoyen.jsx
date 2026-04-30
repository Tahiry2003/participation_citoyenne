import React, { useState, useEffect } from "react";
import {
  Search,
  Heart,
  Loader2,
  Eye,
  FileDown,
  Users,
  MapPin,
  Hash,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Wrench
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DemiDonutChart from "../../composant/tableauComposant/DemiDonutChart";
import TypeStats from "../../composant/tableauComposant/TypeStats";
import StatCards from "../../composant/tableauComposant/StatCards";

export default function Dashboard() {
  const [doleances, setDoleances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Utilisateur non trouvé");

        // Récupérer statistiques
        const statsRes = await axios.get(
          `http://localhost:5000/dash/stats/${userId}`
        );
        setStats(statsRes.data);

        // Récupérer les doléances avec nombre de soutiens
        const doleancesRes = await axios.get(
          `http://localhost:5000/dash/my-supporters/${userId}`
        );
        setDoleances(doleancesRes.data);
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 🔍 Filtrer les doléances par recherche
  const filteredDoleances = doleances.filter((doleance) =>
    `${doleance.numero} ${doleance.type} ${doleance.commune}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Calcul du total des soutiens
  const totalSoutiens = doleances.reduce((total, doleance) => 
    total + (parseInt(doleance.nombre_soutiens) || 0), 0
  );

  // 🌀 Calcul des données pour le graphique demi-donut (inchangé)
  const getChartData = () => {
    if (!stats) return null;

    const total = stats.totalEnvoye || 0;
    const valide = stats.totalValide || 0;
    const attente = stats.totalAttente || 0;
    const rejeter = stats.totalRejeter || 0;
    const traiter = stats.totalTraiter || 0;
    const resolue = stats.totalResolue || 0;

    const totalSignalement = stats.totalSignalement || 0;
    const totalDemande = stats.totalDemande || 0;
    
    // Calculer les pourcentages
    const validePercentage = Math.round((valide / total) * 100);
    const attentePercentage = Math.round((attente / total) * 100);
    const rejeterPercentage = Math.round((rejeter / total) * 100);

    return {
      valide: {
        count: valide,
        percentage: total > 0 ? Math.round((valide / total) * 100) : 0,
        color: "#10B981",
        gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)"
      },
      attente: {
        count: attente,
        percentage: total > 0 ? Math.round((attente / total) * 100) : 0,
        color: "#FCD34D",
        gradient: "linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)"
      },
      rejeter: {
        count: rejeter,
        percentage: total > 0 ? Math.round((rejeter / total) * 100) : 0,
        color: "#EF4444",
        gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
      },      
      traiter: {
        count: traiter,
        percentage: total > 0 ? Math.round((traiter / total) * 100) : 0,
        color: "#D97706",
        gradient: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)"
      },
      resolue: {
        count: resolue,
        percentage: total > 0 ? Math.round((resolue / total) * 100) : 0,
        color: "#2563EB",
        gradient: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)"
      },
      total: {
        count: total,
      },
      signalement: {
        count: totalSignalement,
        percentage: total > 0 ? Math.round((totalSignalement / total) * 100) : 0,
      },
      demande: {
        count: totalDemande,
        percentage: total > 0 ? Math.round((totalDemande / total) * 100) : 0,
      }
    };
  };

  const chartData = getChartData();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
          <p className="text-gray-600 font-medium">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-blue-50 flex justify-center p-2">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Tableau de bord</h1>
        {stats && <StatCards stats={stats} />}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 flex flex-col gap-3">
            {chartData && <DemiDonutChart chartData={chartData} />}
            {chartData && <TypeStats chartData={chartData} />}
          </div>
          <div className="lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mes doléances avec nombre de soutiens
                </h2>
                <span className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-2xl border shadow-sm ${
                  totalSoutiens > 0 
                    ? "bg-pink-100 text-pink-800 border-pink-300" 
                    : "bg-gray-100 text-gray-600 border-gray-300"
                  }`}>
                  <Heart className={`h-4 w-4 ${
                    totalSoutiens > 0 
                      ? "fill-pink-500 text-pink-500" 
                      : "fill-gray-400 text-gray-400"
                  }`} />
                  {totalSoutiens} soutien{totalSoutiens > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro, type ou commune..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                />
              </div>
            </div>

            {/* Table doléances */}
            <div className="flex-1 overflow-x-auto max-h-[410px]">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Numéro
                        </div>
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Type
                        </div>
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Status
                        </div>
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Commune
                        </div>
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Soutiens
                        </div>
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Création
                        </div>
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Action
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDoleances.length > 0 ? (
                      filteredDoleances.map((doleance) => (
                        <tr
                          key={doleance.id}
                          className="group hover:bg-blue-50/30 transition-all duration-200"
                        >
                          <td className="p-4">
                            <p className="font-bold text-lg text-green-500">
                              {doleance.numero}
                            </p>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-xl border transition-all duration-300 ${
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
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${
                                doleance.status === 'valide'
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : doleance.status === 'en attente'
                                  ? "bg-yellow-50 text-yellow-500 border-yellow-200"
                                  : doleance.status === 'rejeter'
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : doleance.status === 'traiter'
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : doleance.status === 'resolue'
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                              }`}
                            >
                              {doleance.status === 'valide' && <CheckCircle2 className="w-3 h-3 mr-2" />}
                              {doleance.status === 'en attente' && <Clock className="w-3 h-3 mr-2" />}
                              {doleance.status === 'rejeter' && <XCircle className="w-3 h-3 mr-2" />}
                              {doleance.status === 'traiter' && <Wrench className="w-3 h-3 mr-2" />}
                              {doleance.status === 'resolue' && <CheckCircle2 className="w-3 h-3 mr-2" />}
                              {doleance.status === 'valide' 
                                ? 'Validée' 
                                : doleance.status === 'en attente' 
                                  ? 'En attente' 
                                  : doleance.status === 'rejeter' 
                                    ? 'Rejetée' 
                                    : doleance.status || 'Non défini'
                              }
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-sm text-gray-800">
                              {doleance.commune || "Non spécifiée"}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center text-sm rounded-full text-pink-600 font-bold">
                              {doleance.nombre_soutiens || 0}
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-gray-600">
                              {new Date(doleance.created_at).toLocaleString('fr-FR')}
                            </p>
                          </td>
                          <td className="p-4">
                            <button
                              className="p-2 rounded-2xl hover:bg-gray-100 transition"
                              onClick={() => navigate(`/DoleanceDetail/${doleance.id}`)}
                              title="Voir les détails"
                            >
                              <Eye className="h-5 w-5 text-gray-600" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {searchTerm
                                ? "Aucune doléance trouvée"
                                : "Aucune doléance pour le moment"}
                            </h3>
                            <p className="text-gray-500 mb-4 max-w-md">
                              {searchTerm
                                ? "Aucune doléance ne correspond à votre recherche."
                                : "Vos doléances avec leur nombre de soutiens apparaîtront ici."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}