import React from "react";
import {
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Wrench
} from "lucide-react";

export default function StatCards({ stats, type = "citoyen" }) {
  if (!stats) return null;

  // Pour le dashboard citoyen
  if (type === "citoyen") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-4">
        <StatCard
          icon={<Send className="w-6 h-6" />}
          color="blue"
          label="Doleances"
          value={stats.totalEnvoye}
          description="Total de vos doléances"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
          label="validées"
          value={stats.totalValide}
          description="Approuvées par les agents"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
          label="En attente"
          value={stats.totalAttente}
          description="En cours de traitement"
        />
        <StatCard
          icon={<XCircle className="w-6 h-6" />}
          color="red"
          label="Rejeter"
          value={stats.totalRejeter}
          description="Rejetées par les agents"
        />
        <StatCard
          icon={<Wrench className="w-6 h-6" />}
          color="amber"
          label="En cours"
          value={stats.totalTraiter}
          description="En cours de traitement"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="blue"
          label="Resolue"
          value={stats.totalResolue}
          description="Doléances résolues"
        />
      </div>
    );
  }

  // Pour le dashboard agent
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-4">
      <StatCard
        icon={<Send className="w-6 h-6" />}
        color="blue"
        label="Doléances"
        value={stats.totalDoleanceCom}
        description="Total de vos doléances"
      />
      <StatCard
        icon={<CheckCircle2 className="w-6 h-6" />}
        color="green"
        label="validées"
        value={stats.totalValideCom}
        description="Approuvées par les agents"
      />
      <StatCard
        icon={<Clock className="w-6 h-6" />}
        color="yellow"
        label="En attente"
        value={stats.totalAttenteCom || 0}
        description="En cours de traitement"
      />
      <StatCard
        icon={<XCircle className="w-6 h-6" />}
        color="red"
        label="Rejetées"
        value={stats.totalRejeterCom}
        description="Rejetées par les agents"
      />
      <StatCard
        icon={<Wrench className="w-6 h-6" />}
        color="amber"
        label="En cours"
        value={stats.totalTraiterCom}
        description="En cours de traitement"
      />
      <StatCard
        icon={<CheckCircle2 className="w-6 h-6" />}
        color="blue"
        label="Resolue"
        value={stats.totalResolueCom}
        description="Doléances résolues"
      />
    </div>
  );
}

function StatCard({ icon, color, label, value, description }) {
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
      bg: "bg-yellow-300",
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
    amber: {
      bg: "bg-amber-500",
      light: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200"
    },
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
    </div>
  );
}