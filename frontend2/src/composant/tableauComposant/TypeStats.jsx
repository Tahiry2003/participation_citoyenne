import React from "react";
import { Type, AlertTriangle, MessageSquare } from "lucide-react";

export default function TypeStats({ chartData }) {
  if (!chartData) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Types de doléances
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Répartition par type
          </p>
        </div>
        <div className="p-3 bg-indigo-100 rounded-xl">
          <Type className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Barre de progression Signalements */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Signalements</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {chartData.signalement.count}({chartData.signalement.percentage}%)
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
              style={{ width: `${chartData.signalement.percentage}%` }}
            ></div>
          </div>
          <div className="justify-between text-xs text-gray-500 hidden">
            <span className={chartData.signalement.percentage <= 33 ? "font-bold text-red-600" : ""}>
              Faible
            </span>
            <span className={chartData.signalement.percentage > 33 && chartData.signalement.percentage <= 66 ? "font-bold text-red-600" : ""}>
              Moyen
            </span>
            <span className={chartData.signalement.percentage > 66 ? "font-bold text-red-600" : ""}>
              Élevé
            </span>
          </div>
        </div>

        {/* Barre de progression Demandes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Demandes</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {chartData.demande.count}({chartData.demande.percentage}%)
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${chartData.demande.percentage}%` }}
            ></div>
          </div>
          <div className="hidden justify-between text-xs text-gray-500">
            <span className={chartData.demande.percentage <= 33 ? "font-bold text-blue-600" : ""}>
              Peu de demandes
            </span>
            <span className={chartData.demande.percentage > 33 && chartData.demande.percentage <= 66 ? "font-bold text-blue-600" : ""}>
              Moyenne
            </span>
            <span className={chartData.demande.percentage > 66 ? "font-bold text-blue-600" : ""}>
              Nombreuses
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}