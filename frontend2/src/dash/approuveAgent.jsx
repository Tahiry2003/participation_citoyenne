import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Search, Mail, User, Shield, Users } from "lucide-react";

const Utilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_URL = "http://localhost:5000/gestionUtil";

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await axios.put(`${API_URL}/${userId}/approve`);
      setSuccessMessage("Utilisateur approuvé avec succès ✅");
      setUsers(users.map((u) => 
        u.id === userId ? { ...u, approved: true } : u
      ));
    } catch (err) {
      setErrorMessage("Erreur lors de l'approbation ❌");
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.email} ${u.nom} ${u.prenoms}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full w-full flex justify-center p-2">
      <div className="w-full bg-white rounded-xl shadow-md p-6">
        {/* Messages */}
        {successMessage && (
          <p className="bg-green-100 text-green-700 p-2 rounded mb-2">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-2">{errorMessage}</p>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Liste des Agents</h2>
        </div>

        {/* Barre de recherche améliorée */}
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

        {/* Table moderne */}
        <div className="flex-1 overflow-x-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nom et Prénoms
                    </div>
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      Matricule
                    </div>
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      e-mail
                    </div>
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      telephone
                    </div>
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      REGION / DISTRICT / COMMUNE
                    </div>
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    DATE DE CREATION
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const isApproved = u.approved || u.is_confirmed;
                    const needsApproval = u.role === "agent" && !isApproved;
                    
                    return (
                      <tr
                        key={u.id}
                        className="group hover:bg-blue-50/30 transition-all duration-200"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                              {u.nom?.[0] || "?"}
                            </div>
                            <p className="font-medium text-gray-900 text-sm">
                              {u.nom} {u.prenoms}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-500">
                            {u.matricule}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-500">
                            {u.email}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-500">
                            {u.tel}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-500">
                            {u.region} / {u.district} / {u.commune} 
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-600">
                            {new Date(u.created_at).toLocaleString('fr-FR')}
                          </p>
                        </td>
                        <td className="p-3 justify-start flex">
                          {needsApproval && (
                            <button
                              onClick={() => handleApprove(u.id)}
                              className="flex items-center gap-2.5 px-5 py-2 rounded-2xl font-semibold transition-all duration-300 bg-green-50 text-green-600 border border-green-200 shadow-lg shadow-green-100/50 hover:shadow-green-200/60 hover:bg-green-100"
                            >
                              <CheckCircle className="w-5 h-5" />
                              Approuver
                            </button>
                          )}
                          {u.role === "agent" && isApproved && (
                            <span className="flex items-center gap-2.5 px-5 py-2 rounded-2xl font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                              <CheckCircle className="w-5 h-5" />
                              Deja approuvé
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Aucun utilisateur trouvé
                        </h3>
                        <p className="text-gray-500 mb-4 max-w-md">
                          Aucun utilisateur ne correspond à votre recherche. Essayez de modifier vos critères de recherche.
                        </p>
                        <button
                          onClick={() => setSearchTerm('')}
                          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          Réinitialiser la recherche
                        </button>
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
  );
};

export default Utilisateurs;