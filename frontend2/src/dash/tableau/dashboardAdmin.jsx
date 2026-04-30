import React, { useState, useEffect } from "react";
import {
  Users,
  User,
  Search,
  Loader2,
  Clock,
  Send,
  TrendingUp,
  Newspaper,
  TrendingDown,
  User2,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Wrench,
  Heart,
  Eye,
  MapPin,
  Hash,
  Award
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DemiDonutChart from "../../composant/tableauComposant/DemiDonutChart";
import TypeStats from "../../composant/tableauComposant/TypeStats";

export default function DashboardAdmin() {
  const [agents, setAgents] = useState([]);
  const [statsAdmin, setStatsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Utilisateur non trouvé");

        // Récupérer statistiques admin
        const statsRes = await axios.get(
          `http://localhost:5000/dash/statsadmin`
        );
        setStatsAdmin(statsRes.data);

        // Récupérer les agents avec nombre de doléances
        const agentsRes = await axios.get(
          `http://localhost:5000/dash/listeAgent`
        );
        setAgents(agentsRes.data);
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 🔍 Filtrer les agents par recherche
  const filteredAgent = agents.filter((agent) =>
    `${agent.email || ''} ${agent.nom || ''} ${agent.prenoms || ''} ${agent.matricule || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // 🌀 Calcul des données pour le graphique demi-donut (comme citoyen)
  const getChartData = () => {
    if (!statsAdmin) return null;

    const total = statsAdmin.totalDoleance || 0;
    const valide = statsAdmin.totalValideAdm || 0;
    const attente = statsAdmin.totalAttenteAdm || 0;
    const rejeter = statsAdmin.totalRejeterAdm || 0;
    const traiter = statsAdmin.totalTraiterAdm || 0;
    const resolue = statsAdmin.totalResolueAdm || 0;

    const totalSignalement = statsAdmin.totalSignalementAdm || 0;
    const totalDemande = statsAdmin.totalDemandeAdm || 0;

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

  // 🌀 Loader animé
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

  const chartData = getChartData();

  return (
    <div className="w-full min-h-full bg-blue-50 flex justify-center p-2">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Tableau de bord Admin</h1>

        {/* 🌟 Statistiques principales */}
        {statsAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              color="blue"
              label="Citoyens inscrits"
              value={statsAdmin.totalCitoyen}
              description="Total citoyens"
            />
            <StatCard
              icon={<User2 className="w-6 h-6" />}
              color="green"
              label="Agents inscrits"
              value={statsAdmin.totalAgent}
              description="Total agents"
            />
            <StatCard
              icon={<Send className="w-6 h-6" />}
              color="yellow"
              label="Doléances totales"
              value={statsAdmin.totalDoleance}
              description="Toutes doléances"
            />
            <StatCard
              icon={<Newspaper className="w-6 h-6" />}
              color="purple"
              label="Publications"
              value={statsAdmin.totalPublication}
              description="Total publications"
            />
          </div>
        )}

        {/* 📊 Section graphiques comme citoyen */}
        <div className="flex flex-col lg:flex-row gap-6 mb-4">
          <div className="lg:w-1/3 flex flex-col gap-3">
            {chartData && <DemiDonutChart chartData={chartData} />}
            {chartData && <TypeStats chartData={chartData} />}
          </div>

          {/* 📈 Statistiques détaillées */}
          <div className="lg:w-2/3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-3">
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-bold text-green-800">{statsAdmin?.totalValideAdm || 0}</span>
                </div>
                <p className="text-green-700 text-sm font-medium">Validées</p>
                <p className="text-green-600 text-xs">Approuvées</p>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <span className="text-lg font-bold text-yellow-800">{statsAdmin?.totalAttenteAdm || 0}</span>
                </div>
                <p className="text-yellow-700 text-sm font-medium">En attente</p>
                <p className="text-yellow-600 text-xs">À traiter</p>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-lg font-bold text-red-800">{statsAdmin?.totalRejeterAdm || 0}</span>
                </div>
                <p className="text-red-700 text-sm font-medium">Rejetées</p>
                <p className="text-red-600 text-xs">Non retenues</p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Wrench className="w-6 h-6 text-orange-600" />
                  <span className="text-lg font-bold text-orange-800">{statsAdmin?.totalTraiterAdm || 0}</span>
                </div>
                <p className="text-orange-700 text-sm font-medium">En traitement</p>
                <p className="text-orange-600 text-xs">Prises en charge</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  <span className="text-lg font-bold text-blue-800">{statsAdmin?.totalResolueAdm || 0}</span>
                </div>
                <p className="text-blue-700 text-sm font-medium">Résolues</p>
                <p className="text-blue-600 text-xs">Problèmes traités</p>
              </div>
            </div>

            {/* 📋 Section agents les plus actifs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Liste des agents communaux
                  </h2>
                  <span className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-2xl border shadow-sm ${
                    agents.length > 0 
                      ? "bg-green-100 text-green-800 border-green-300" 
                      : "bg-gray-100 text-gray-600 border-gray-300"
                    }`}>
                    <User className={`h-4 w-4 ${
                      agents.length > 0 
                        ? "text-green-500" 
                        : "text-gray-400"
                    }`} />
                    {agents.length} agent{agents.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div 
                  onClick={() => navigate(`/Utilisateur`)}
                  className="font-semibold text-blue-800 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  Voir toutes
                </div>
              </div>

              {/* Barre de recherche */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, prénom, matricule..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                  />
                </div>
              </div>

              {/* Table agents */}
              <div className="flex-1 overflow-x-auto max-h-[285px]">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
                        <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Commune
                        </th>
                        <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Matricule
                        </th>
                        <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Région / District / Commune
                        </th>
                        <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Doléances
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAgent.length > 0 ? (
                        filteredAgent.map((agent) => (
                          <tr
                            key={agent.id}
                            className="group hover:bg-blue-50/30 transition-all duration-200"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {agent.nom?.[0]}{agent.prenoms?.[0]}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {agent.nom} {agent.prenoms}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{agent.matricule}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-gray-700">{agent.region}</span>
                                <span className="text-xs text-gray-600">{agent.district} / {agent.commune}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-gray-900 text-sm">{agent.doleance_count || 0}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchTerm
                                  ? "Aucun agent trouvé"
                                  : "Aucun agent disponible"}
                              </h3>
                              <p className="text-gray-500 mb-4 max-w-md">
                                {searchTerm
                                  ? "Aucun agent ne correspond à votre recherche."
                                  : "Les agents apparaîtront ici."}
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
    </div>
  );
}

// Composant StatCard inchangé
function StatCard({ icon, color, label, value, description, percentage, trend }) {
  const colorConfig = {
    blue: {
      bg: "bg-blue-500",
      light: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200"
    },
    green: {
      bg: "bg-green-500", 
      light: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200"
    },
    yellow: {
      bg: "bg-yellow-500",
      light: "bg-yellow-100",
      text: "text-yellow-700", 
      border: "border-yellow-200"
    },
    red: {
      bg: "bg-red-500",
      light: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200"
    },
    purple: {
      bg: "bg-purple-500",
      light: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-200"
    }
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div className="bg-gray-50 rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-lg font-bold text-gray-500">{label}</p>
          <h3 className="text-2xl font-extrabold text-gray-500">{value ?? 0}</h3>
        </div>
        <div className={`p-5 rounded-xl ${config.bg} text-white shadow-md`}>
          {icon}
        </div>
      </div>
      <div className="space-y-3">      
        {(percentage !== undefined || trend) && (
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 text-sm font-semibold ${config.text}`}>
              {trend === "up" && <TrendingUp className="w-5 h-5" />}
              {trend === "down" && <TrendingDown className="w-5 h-5 font-bold" />}
              {percentage !== undefined && <span className="font-bold">{percentage}%</span>}
            </div>
            {percentage !== undefined && (
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${config.bg} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}