import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Search, Mail, User, Shield, Users, MoreVertical, Eye, Ban, Check, X, Clock, Filter, List, AlertTriangle, MessageSquare, ListFilter } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Utilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalDetails, setModalDetails] = useState({ title: '', message: '' });
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem("userId");

  const API_URL = "http://localhost:5000/gestionUtil/util";

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs");
      showError("Erreur lors du chargement des utilisateurs");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fermer les messages après 5 secondes
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

  const openConfirmModal = (action, user, details) => {
    setSelectedUser(user);
    setModalAction(() => action);
    setModalDetails(details);
    setShowConfirmModal(true);
    setActiveMenu(null);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedUser(null);
    setModalAction(null);
    setModalDetails({ title: '', message: '' });
  };

  const handleApprove = async (userId) => {
    try {
      await axios.put(`${API_URL}/${userId}/approve`);
      showSuccess("Utilisateur approuvé avec succès");
      setUsers(users.map((u) => 
        u.id === userId ? { ...u, approved: true, is_confirmed: true } : u
      ));
    } catch (err) {
      showError("Erreur lors de l'approbation ❌");
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await axios.put(`${API_URL}/${userId}/suspend`);
      showSuccess("Utilisateur suspendu avec succès");
      setUsers(users.map((u) => 
        u.id === userId ? { ...u, is_suspended: true } : u
      ));
    } catch (err) {
      showError("Erreur lors de la suspension ❌");
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      await axios.put(`${API_URL}/${userId}/unsuspend`);
      showSuccess("Utilisateur réactivé avec succès");
      setUsers(users.map((u) => 
        u.id === userId ? { ...u, is_suspended: false } : u
      ));
    } catch (err) {
      showError("Erreur lors de la réactivation ❌");
    }
  };

  const executeAction = () => {
    if (modalAction && selectedUser) {
      modalAction(selectedUser.id);
    }
    closeConfirmModal();
  };

  // Filtres
  const typeFilters = [
    { value: "all", label: "Tous", icon: List, bg: "bg-gray-500" },
    { value: "agent", label: "Agents", icon: User, bg: "bg-blue-500" },
    { value: "citoyen", label: "Citoyens", icon: Users, bg: "bg-green-500" }
  ];

  const statusFilters = [
    { value: "all", label: "Tous statuts", icon: ListFilter, bg: "bg-gray-500" },
    { value: "pending", label: "En attente", icon: Clock, bg: "bg-yellow-500" },
    { value: "approved", label: "Approuvés", icon: CheckCircle, bg: "bg-green-500" },
    { value: "suspended", label: "Suspendus", icon: Ban, bg: "bg-red-500" },
    { value: "active", label: "Actifs", icon: Check, bg: "bg-blue-500" }
  ];

  const filteredUsers = users.filter((u) => {
    // Filtre par recherche
    const matchesSearch = `${u.email} ${u.nom} ${u.prenoms}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par type
    const matchesType = filterType === 'all' || u.role === filterType;
    
    // Filtre par statut
    let matchesStatus = true;
    switch(filterStatus) {
      case 'pending':
        matchesStatus = u.role === 'agent' && !(u.approved || u.is_confirmed) && !u.is_suspended;
        break;
      case 'approved':
        matchesStatus = u.role === 'agent' && (u.approved || u.is_confirmed) && !u.is_suspended;
        break;
      case 'suspended':
        matchesStatus = u.is_suspended;
        break;
      case 'active':
        matchesStatus = !u.is_suspended && (u.role !== 'agent' || (u.role === 'agent' && (u.approved || u.is_confirmed)));
        break;
      default:
        matchesStatus = true;
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleMenu = (e, user) => {
    e.stopPropagation();
    
    if (activeMenu === user.id) {
      setActiveMenu(null);
      setSelectedUser(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        x: rect.right - 192,
        y: rect.bottom + 5
      });
      setSelectedUser(user);
      setActiveMenu(user.id);
    }
  };

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
      setSelectedUser(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Variables pour le menu
  const isAgent = selectedUser?.role === "agent";
  const isCitizen = selectedUser?.role === "citoyen";
  const isAdmin = selectedUser?.role === "admin";
  const isSuspended = selectedUser?.is_suspended;
  const isApproved = selectedUser?.approved || selectedUser?.is_confirmed;
  const needsApproval = isAgent && !isApproved;

  return (
    <div className="w-full flex justify-center p-2">
      {/* Messages de notification en haut à droite */}
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

      {/* Modal de confirmation */}
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
                className="px-4 w-full py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Gestion des Utilisateurs</h2>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par email, nom ou prénom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
          />
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              <span>Type d'utilisateur :</span>
            </div>
            {typeFilters.map(({ value, label, icon: Icon, bg }) => (
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

          {/* Filtre Statut */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ListFilter className="w-4 h-4" />
              <span>Statut :</span>
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

          {/* Indicateurs de filtres actifs */}
          {(filterType !== "all" || filterStatus !== "all") && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                Filtres actifs : 
                {filterType !== "all" && ` Type: ${
                  filterType === "admin" ? "Administrateurs" : 
                  filterType === "agent" ? "Agents" : 
                  "Citoyens"
                }`}
                {filterStatus !== "all" && ` | Statut: ${
                  filterStatus === "pending" ? "En attente" : 
                  filterStatus === "approved" ? "Approuvés" : 
                  filterStatus === "suspended" ? "Suspendus" : 
                  "Actifs"
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
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto relative">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      Nom et Prénoms
                    </div>
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Matricule
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Compte
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const userIsApproved = u.approved || u.is_confirmed;
                    const userIsAgent = u.role === "agent";
                    const userIsCitizen = u.role === "citoyen";
                    const userIsAdmin = u.role === "admin";
                    const userIsSuspended = u.is_suspended;
                    const userNeedsApproval = userIsAgent && !userIsApproved;
                    
                    return (
                      <tr
                        key={u.id}
                        className="group hover:bg-blue-50/30 transition-all duration-200"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {u.nom?.[0]}{u.prenoms?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {u.nom} {u.prenoms}
                              </p>
                              {userIsSuspended && (
                                <span className="text-xs text-red-500">Suspendu</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-500">
                            {u.email}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-500">
                            {u.matricule || (userIsCitizen ? "N/A" : "-")}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-500">
                            {u.region || "N/A"} / {u.district || "N/A"} / {u.commune || "N/A"} 
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-600">
                            {new Date(u.created_at).toLocaleString('fr-FR')}
                          </p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${
                              userIsAdmin
                                ? "bg-red-50 text-red-700 border-red-200"
                                : userIsAgent
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : userIsCitizen
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {userIsAdmin && <Shield className="w-3 h-3 mr-2" />}
                            {userIsAgent && <User className="w-3 h-3 mr-2" />}
                            {userIsCitizen && <Users className="w-3 h-3 mr-2" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {userIsAgent && !userIsApproved && !userIsSuspended && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-yellow-700">
                                <Clock className="w-3 h-3 mr-2" />
                                En attente
                              </span>
                            )}
                            {userIsAgent && userIsApproved && !userIsSuspended && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-green-700">
                                <Check className="w-3 h-3 mr-2" />
                                Approuvé
                              </span>
                            )}
                            {userIsSuspended && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-red-700">
                                <Ban className="w-3 h-3 mr-2" />
                                Suspendu
                              </span>
                            )}
                            {userIsCitizen && !userIsSuspended && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-green-700">
                                <Check className="w-3 h-3 mr-2" />
                                Actif
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">                           
                            <div className="relative">
                              <button
                                onClick={(e) => toggleMenu(e, u)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Aucun utilisateur trouvé
                        </h3>
                        <p className="text-gray-500 mb-4 max-w-md">
                          Aucun utilisateur ne correspond à vos critères de recherche et de filtrage.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Menu déroulant */}
          {activeMenu && selectedUser && (
            <div 
              className="fixed bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1 w-48"
              style={{
                left: `${menuPosition.x}px`,
                top: `${menuPosition.y}px`,
                position: 'fixed'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  if (selectedUser.id === currentUserId) {
                    navigate("/Profil");
                  } else {
                    navigate(`/ProfilUtil/${selectedUser.id}/${selectedUser.role}`);
                  }
                  setActiveMenu(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Voir le profil
              </button>
              
              {isAgent && needsApproval && !isSuspended ? (
                <button
                  onClick={() => openConfirmModal(
                    handleApprove,
                    selectedUser,
                    {
                      title: "Confirmer l'approbation",
                      message: `Êtes-vous sûr de vouloir approuver l'utilisateur ${selectedUser.nom} ${selectedUser.prenoms} ? Cet utilisateur pourra alors accéder à toutes les fonctionnalités d'agent.`
                    }
                  )}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approuver
                </button>
              ) : !isSuspended ? (
                <button
                  onClick={() => openConfirmModal(
                    handleSuspend,
                    selectedUser,
                    {
                      title: "Confirmer la suspension",
                      message: `Êtes-vous sûr de vouloir suspendre l'utilisateur ${selectedUser.nom} ${selectedUser.prenoms} ? Cet utilisateur ne pourra plus se connecter à son compte.`
                    }
                  )}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  Suspendre
                </button>
              ) : (
                <button
                  onClick={() => openConfirmModal(
                    handleUnsuspend,
                    selectedUser,
                    {
                      title: "Confirmer la réactivation",
                      message: `Êtes-vous sûr de vouloir réactiver l'utilisateur ${selectedUser.nom} ${selectedUser.prenoms} ? Cet utilisateur pourra à nouveau se connecter à son compte.`
                    }
                  )}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Réactiver
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Utilisateurs;