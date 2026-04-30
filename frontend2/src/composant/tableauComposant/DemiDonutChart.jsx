import React from "react";
import { BarChart3 } from "lucide-react";

export default function DemiDonutChart({ chartData }) {
  if (!chartData) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Statut des doléances
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Répartition par statut
          </p>
        </div>
        <div className="p-3 bg-blue-100 rounded-xl">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        <div className="relative w-64 h-32 mb-6">
          <svg viewBox="0 0 120 60" className="w-full h-full">
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {(() => {
              let currentAngle = -180;
              const segments = [
                { 
                  percentage: chartData.valide.percentage, 
                  color: chartData.valide.color,
                  gradient: chartData.valide.gradient
                },
                { 
                  percentage: chartData.attente.percentage, 
                  color: chartData.attente.color,
                  gradient: chartData.attente.gradient
                },
                { 
                  percentage: chartData.rejeter.percentage, 
                  color: chartData.rejeter.color,
                  gradient: chartData.rejeter.gradient
                },
                { 
                  percentage: chartData.traiter.percentage, 
                  color: chartData.traiter.color,
                  gradient: chartData.traiter.gradient
                },
                { 
                  percentage: chartData.resolue.percentage, 
                  color: chartData.resolue.color,
                  gradient: chartData.resolue.gradient
                },
              ].filter(seg => seg.percentage > 0);

              const gap = 2;

              return segments.map((segment, index) => {
                const startGap = index === 0 ? 0 : gap / 2;
                const endGap = index === segments.length - 1 ? 0 : gap / 2;
                
                const angle = (segment.percentage / 100) * 180;
                const effectiveAngle = Math.max(0, angle - (startGap + endGap));
                
                const startAngle = currentAngle + startGap;
                const endAngle = currentAngle + startGap + effectiveAngle;
                
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                
                const x1 = 60 + 48 * Math.cos(startRad);
                const y1 = 60 + 48 * Math.sin(startRad);
                const x2 = 60 + 48 * Math.cos(endRad);
                const y2 = 60 + 48 * Math.sin(endRad);
                
                const largeArcFlag = effectiveAngle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${x1} ${y1}`,
                  `A 48 48 0 ${largeArcFlag} 1 ${x2} ${y2}`
                ].join(' ');

                currentAngle = endAngle + endGap;

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="16"
                    strokeLinecap="butt"
                    className="drop-shadow-sm"
                  />
                );
              });
            })()}

            <circle
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke="white"
              strokeWidth="0"
              opacity="1"
            />
          </svg>

          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/3 text-center">
            <div className="text-3xl font-black text-gray-800 drop-shadow-sm">
              {chartData.total.count}
            </div>
            <div className="text-sm font-semibold text-gray-600 bg-white/80 rounded-full px-2 py-1 backdrop-blur-sm">
              Total doléances
            </div>
          </div>
        </div>

        <div className="flex justify-between w-full">
          <div className="flex flex-col items-center w-1/3">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-xs font-semibold text-gray-700">Validées</span>
            </div>
            <div className="text-base font-bold text-gray-900">
              {chartData.valide.count}
              <span className="ml-1 text-green-600 text-base">
                ({chartData.valide.percentage}%)
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center w-1/3">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300"></div>
              <span className="text-xs font-semibold text-gray-700">En attente</span>
            </div>
            <div className="text-base font-bold text-gray-900">
              {chartData.attente.count}
              <span className="ml-1 text-yellow-300 text-base">
                ({chartData.attente.percentage}%)
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center w-1/3">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-xs font-semibold text-gray-700">Rejetées</span>
            </div>
            <div className="text-base font-bold text-gray-900">
              {chartData.rejeter.count}
              <span className="ml-1 text-red-600 text-base">
                ({chartData.rejeter.percentage}%)
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center w-1/3">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <span className="text-xs font-semibold text-gray-700">En cours</span>
            </div>
            <div className="text-base font-bold text-gray-900">
              {chartData.traiter.count}
              <span className="ml-1 text-amber-600 text-base">
                ({chartData.traiter.percentage}%)
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center w-1/3">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-xs font-semibold text-gray-700">Résolues</span>
            </div>
            <div className="text-base font-bold text-gray-900">
              {chartData.resolue.count}
              <span className="ml-1 text-blue-600 text-base">
                ({chartData.resolue.percentage}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}