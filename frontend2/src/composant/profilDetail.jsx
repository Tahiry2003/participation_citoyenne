import React from "react";
import { Mail, Phone, Map, CreditCard, UserCog, Edit, PlusCircle, MapPin} from "lucide-react";

export default function UserProfile({ 
  user, 
  userRole, 
  onEdit, 
  onAddDoleance, 
  onAddPublication 
}) {
  if (!user) return null;
  const currentUserId = localStorage.getItem("userId");
  const isOwnProfile = currentUserId && user.id && currentUserId.toString() === user.id.toString();

  return (
    <div className="border border-gray-200/80 rounded-xl p-6 hover:shadow-xl transition-all duration-300 bg-white backdrop-blur-sm bg-opacity-95">
      
      {/* Header avec design moderne */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg backdrop-blur-sm border border-white/20">
            {`${user.nom?.[0] || ""}${user.prenoms?.[0] || ""}`.toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {user.nom}
              </h2>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.prenoms}
              </h2>
              <span className="hidden px-3 py-1.5 text-xs font-semibold rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200/60">
                {user.prenoms}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grille d'informations modernisée */}
      <div className="space-y-4">
        <div className="hidden">
          {user?.region && user?.district && user?.commune && (
            <div className="flex flex-wrap gap-3">
              {[user.region, user.district, user.commune].map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-2xl border border-slate-300 bg-gradient-to-r from-slate-100 to-slate-100 text-slate-700 shadow-sm backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <MapPin className="h-4 w-4 text-slate-600" />
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {user.email && (
            <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-gray-800">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {user.email && (
            <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">localisation</p>
                  <p className="text-sm font-medium text-gray-800">{user.region} * {user.district} * {user.commune}</p>
                </div>
              </div>
            </div>
          )}
          {user.role && (
            <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <UserCog className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {user.tel && (
            <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Phone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Téléphone</p>
                  <p className="text-sm font-medium text-gray-800">{user.tel}</p>
                </div>
              </div>
            </div>
          )}


          {user.cin && (
            <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Carte d'identité</p>
                  <p className="text-sm font-medium text-gray-800">{user.cin}</p>
                </div>
              </div>
            </div>
          )}

        </div>      
      </div>

      {/* Boutons d'action modernisés - Afficher seulement si c'est l'utilisateur courant */}
      {isOwnProfile && (
        <div className="flex items-center mt-4 space-x-3">
          {userRole === "citoyen" ? (
            <button
              onClick={onAddDoleance}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-green-50 text-green-600 border border-green-200 shadow-lg shadow-green-100/50 hover:shadow-green-200/60"
            >
              <PlusCircle className="w-5 h-5" />
              Faire une doléance
            </button>
          ) : (
            <button
              onClick={onAddPublication}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-green-50 text-green-600 border border-green-200 shadow-lg shadow-green-100/50 hover:shadow-green-200/60"
            >
              <PlusCircle className="w-5 h-5" />
              Faire une publication
            </button>
          )}
        </div>
      )}

      {/* Informations supplémentaires */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Membre depuis</span>
          <span className="font-medium text-gray-700">
            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
          </span>
        </div>
      </div>
    </div>
  );
}