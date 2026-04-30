import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Eye,
  FileDown,
  Wrench
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DemiDonutChart from "../../composant/tableauComposant/DemiDonutChart";
import TypeStats from "../../composant/tableauComposant/TypeStats";
import StatCards from "../../composant/tableauComposant/StatCards"; // On utilise le même composant
import ExportModal from "../../composant/tableauComposant/ExportModal"; // Importez le moda

export default function DashboardAgent() {
  const [doleances, setDoleances] = useState([]);
  const [statsAgent, setStatsAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Utilisateur non trouvé");

        const statsRes = await axios.get(
          `http://localhost:5000/dash/statsagent/${userId}`
        );
        setStatsAgent(statsRes.data);

        const doleancesRes = await axios.get(
          `http://localhost:5000/dash/my-doleance-recent/${userId}`
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

  const filteredDoleances = doleances.filter((doleance) =>
    `${doleance.email || ''} ${doleance.nom || ''} ${doleance.prenoms || ''} ${doleance.titre || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // 🌀 Calcul des données pour le graphique demi-donut
  const getChartData = () => {
    if (!statsAgent) return null;

    const total = statsAgent.totalDoleanceCom || 0;
    const valide = statsAgent.totalValideCom || 0;
    const attente = statsAgent.totalAttenteCom || 0;
    const rejeter = statsAgent.totalRejeterCom || 0;
    const traiter = statsAgent.totalTraiterCom || 0;
    const resolue = statsAgent.totalResolueCom || 0;

    const totalSignalement = statsAgent.totalSignalementCom || 0;
    const totalDemande = statsAgent.totalDemandeCom || 0;

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

  const handleExport = async (exportOptions) => {
    try {
      setExportLoading(true);
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        alert("Utilisateur non connecté");
        return;
      }
      
      // Construire l'URL avec les paramètres
      const baseUrl = `http://localhost:5000/export`;
      const endpoint = exportOptions.format === 'excel' ? 'excel' : 'pdf';
      const url = `${baseUrl}/${endpoint}/${userId}`;
      
      // Construire les paramètres de requête
      const params = new URLSearchParams({
        month: exportOptions.month,
        year: exportOptions.year,
        statuses: exportOptions.statuses.join(',')
      });
      
      const fullUrl = `${url}?${params.toString()}`;
      
      console.log('Export URL:', fullUrl);
      
      // Faire la requête avec axios
      const response = await axios.get(fullUrl, {
        responseType: 'blob', // Important pour les fichiers
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Récupérer le nom du fichier depuis les headers ou le créer
      let filename = '';
      const contentDisposition = response.headers['content-disposition'];
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      if (!filename) {
        // Créer un nom de fichier par défaut
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const monthName = monthNames[exportOptions.month - 1];
        const date = new Date().toISOString().split('T')[0];
        const extension = exportOptions.format === 'excel' ? 'xlsx' : 'pdf';
        filename = `doleances_${monthName}_${exportOptions.year}_${date}.${extension}`;
      }
      
      // Créer le blob et télécharger
      const blob = new Blob([response.data], {
        type: exportOptions.format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf'
      });
      
      // Créer un lien de téléchargement
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = filename;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      
      // Fermer le modal
      setShowExportModal(false);
      
      // Afficher un message de succès
      console.log(`Export ${exportOptions.format} réussi: ${filename}`);
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      
      // Essayer de lire le message d'erreur du backend
      if (error.response) {
        if (error.response.status === 404) {
          alert('Aucune doléance trouvée pour les critères sélectionnés');
        } else if (error.response.status === 400) {
          alert('Paramètres invalides: mois et année sont requis');
        } else {
          // Essayer de lire le JSON d'erreur
          try {
            const errorData = JSON.parse(await error.response.data.text());
            alert(`Erreur: ${errorData.message || 'Erreur lors de l\'export'}`);
          } catch {
            alert('Erreur lors de l\'export du fichier');
          }
        }
      } else {
        alert('Erreur de connexion au serveur');
      }
    } finally {
      setExportLoading(false);
    }
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

  return (
    <div className="w-full min-h-full bg-blue-50 flex justify-center p-2">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 -mt-3">Tableau de bord</h1>
          </div>
          
          {/* Bouton Exporter PDF */}
          <div>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium 
                        bg-blue-600 text-white border border-blue-700 
                        hover:bg-blue-700 transition-all duration-300 shadow-md"
            >
              <FileDown className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* 🌟 Statistiques principales - Utilisation du composant StatCards */}
        {statsAgent && <StatCards stats={statsAgent} type="agent" />}

        {/* 📊 Section graphique et doléances récentes */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Colonne gauche avec les deux graphiques */}
          <div className="lg:w-1/3 flex flex-col gap-3">
            {/* Graphique demi-donut */}
            {chartData && <DemiDonutChart chartData={chartData} />}

            {/* Graphique des types */}
            {chartData && <TypeStats chartData={chartData} />}
          </div>

          {/* Colonne droite : Doléances récentes */}
          <div className="lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  Doléances récentes dans ma commune
                </h2>
                <span className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-2xl border shadow-sm ${
                  doleances.length > 0 
                    ? "bg-blue-100 text-blue-800 border-blue-300" 
                    : "bg-gray-100 text-gray-600 border-gray-300"
                  }`}>
                  <Send className={`h-4 w-4 ${
                    doleances.length > 0 
                      ? "text-blue-500" 
                      : "text-gray-400"
                  }`} />
                  {doleances.length} doléance{doleances.length > 1 ? 's' : ''}
                </span>
              </div>
              <div 
                onClick={() => (navigate(`/Doleance`))}
                className="font-semibold text-blue-800 cursor-pointer">
                Voir toutes
              </div>
            </div>

            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, nom, prénom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto  max-h-[410px]">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Citoyen
                        </div>
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Numero
                        </div>
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Statut
                        </div>
                      </th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          Date
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
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                {`${doleance.nom?.[0] || ""}${doleance.prenoms?.[0] || ""}`.toUpperCase()}
                              </div>
                              <p className="font-medium text-gray-900 text-sm">
                                {doleance.nom} {doleance.prenoms}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-lg text-green-500">
                              {doleance.numero}
                            </p>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${
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
                            <p className="text-sm text-gray-600">
                              {new Date(doleance.created_at).toLocaleString('fr-FR')}
                            </p>
                          </td>
                          <td className="p-4 text-left">
                            <button
                              className="p-2 rounded-2xl hover:bg-gray-100 transition"
                              onClick={() => navigate(`/DoleanceDetail/${doleance.id}`)}
                            >
                              <Eye className="h-5 w-5 text-gray-600" />
                            </button>
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
                                ? "Aucune doléance trouvée"
                                : "Aucune doléance récente"}
                            </h3>
                            <p className="text-gray-500 mb-4 max-w-md">
                              {searchTerm
                                ? "Aucune doléance ne correspond à votre recherche."
                                : "Les doléances de votre zone apparaîtront ici."}
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
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        loading={exportLoading}
      />
    </div>
  );
}