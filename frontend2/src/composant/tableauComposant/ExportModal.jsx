import React, { useState, useEffect } from 'react';
import { FileDown, FileSpreadsheet, FileText, X, Download, Check } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, onExport, loading = false }) => {
  const [selectedFormat, setSelectedFormat] = useState('excel');
  
  // Mois et année actuels par défaut
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // État pour le dropdown mois/année combiné
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  
  // Filtres de statut
  const [selectedStatuses, setSelectedStatuses] = useState([
    'valide',
    'en attente', 
    'rejeter',
    'traiter',
    'resolue'
  ]);

  // Générer une plage d'années plus large
  const [availableYears, setAvailableYears] = useState([]);
  
  useEffect(() => {
    const currentYear = currentDate.getFullYear();
    // Générer de 2020 à l'année actuelle + 2
    const years = [];
    const startYear = 2020;
    const endYear = currentYear + 2;
    
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    setAvailableYears(years);
  }, []);

  if (!isOpen) return null;

  // Liste des 12 mois
  const months = [
    { id: 1, name: 'Janvier' },
    { id: 2, name: 'Février' },
    { id: 3, name: 'Mars' },
    { id: 4, name: 'Avril' },
    { id: 5, name: 'Mai' },
    { id: 6, name: 'Juin' },
    { id: 7, name: 'Juillet' },
    { id: 8, name: 'Août' },
    { id: 9, name: 'Septembre' },
    { id: 10, name: 'Octobre' },
    { id: 11, name: 'Novembre' },
    { id: 12, name: 'Décembre' }
  ];

  // Options de format
  const formatOptions = [
    {
      id: 'excel',
      name: 'Excel (XLSX)',
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
    {
      id: 'pdf',
      name: 'PDF',
      icon: <FileText className="w-5 h-5" />,
    }
  ];

  // Options de statut
  const statusOptions = [
    { id: 'valide', label: 'Validées', color: 'bg-green-100 text-green-800' },
    { id: 'en attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'rejeter', label: 'Rejetées', color: 'bg-red-100 text-red-800' },
    { id: 'traiter', label: 'En traitement', color: 'bg-blue-100 text-blue-800' },
    { id: 'resolue', label: 'Résolues', color: 'bg-purple-100 text-purple-800' }
  ];

  // Gérer la sélection/déselection des statuts
  const toggleStatus = (statusId) => {
    setSelectedStatuses(prev => {
      if (prev.includes(statusId)) {
        return prev.filter(id => id !== statusId);
      } else {
        return [...prev, statusId];
      }
    });
  };

  // Sélectionner/désélectionner tous les statuts
  const toggleAllStatuses = () => {
    if (selectedStatuses.length === statusOptions.length) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(statusOptions.map(option => option.id));
    }
  };

  // Navigation des années
  const handleYearChange = (increment) => {
    const currentIndex = availableYears.indexOf(selectedYear);
    const newIndex = currentIndex + increment;
    
    if (newIndex >= 0 && newIndex < availableYears.length) {
      setSelectedYear(availableYears[newIndex]);
    }
  };

  // Fonction pour télécharger un fichier blob
  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    const exportOptions = {
      format: selectedFormat,
      month: selectedMonth,
      year: selectedYear,
      statuses: selectedStatuses
    };
    
    if (onExport) {
      onExport(exportOptions);
    }
  };

  const handleClose = () => {
    setSelectedFormat('excel');
    setSelectedMonth(currentDate.getMonth() + 1);
    setSelectedYear(currentDate.getFullYear());
    setSelectedStatuses(statusOptions.map(option => option.id));
    setShowDateDropdown(false);
    
    if (onClose) {
      onClose();
    }
  };

  // Fonction pour obtenir le nom du mois
  const getMonthName = (monthId) => {
    return months.find(m => m.id === monthId)?.name || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-2xl font-semibold text-gray-800">Exporter les doléances</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu */}
        <div className="px-6 py-4 space-y-6">
          {/* Sélection du format */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Format d'export
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
                    selectedFormat === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFormat(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedFormat === option.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.icon}
                    </div>
                    <span className="font-medium text-gray-900">
                      {option.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sélection du mois et de l'année (combiné) */}
          <div className="relative">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Période (Mois/Année)
            </h3>
            
            {/* Bouton d'affichage combiné */}
            <div
              className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl font-medium 
                        bg-blue-600 text-white border border-blue-700 
                        hover:bg-blue-700 transition-all duration-300 shadow-md
                        cursor-pointer"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <span>{getMonthName(selectedMonth)} {selectedYear}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Dropdown combiné mois/année */}
            {showDateDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                {/* Contrôle d'année */}
                <div className="flex items-center justify-between p-3 border-b">
                  <div
                    className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => handleYearChange(-1)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  
                  <span className="font-semibold text-gray-700">{selectedYear}</span>
                  
                  <div
                    className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => handleYearChange(1)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Grille des mois */}
                <div className="grid grid-cols-3 gap-2 p-3">
                  {months.map((month) => (
                    <div
                      key={month.id}
                      className={`px-3 py-2 text-center rounded-lg cursor-pointer transition-all duration-200
                                ${selectedMonth === month.id 
                                  ? 'bg-blue-600 text-white font-medium' 
                                  : 'hover:bg-blue-50 text-gray-700 hover:text-blue-600'}`}
                      onClick={() => {
                        setSelectedMonth(month.id);
                        setShowDateDropdown(false);
                      }}
                    >
                      {month.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filtres par statut */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                Statut des doléances
              </h3>
              <div
                onClick={toggleAllStatuses}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                {selectedStatuses.length === statusOptions.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </div>
            </div>
            
            <div className="space-y-2">
              {statusOptions.map((status) => {
                const isSelected = selectedStatuses.includes(status.id);
                return (
                  <div
                    key={status.id}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleStatus(status.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {isSelected ? (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="sticky bottom-0 bg-white p-6 flex justify-end gap-3">
          <div
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Annuler
          </div>
          <div
            onClick={handleExport}
            className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              loading || selectedStatuses.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Génération...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Exporter ({selectedFormat.toUpperCase()})</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;