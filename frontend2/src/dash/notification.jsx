import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ import useNavigate

// Fonction pour afficher "Il y a X" ou date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "À l’instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) return `Il y a ${diffHour} h`;
  if (diffDay < 7) return `Il y a ${diffDay} j`;
  return date.toLocaleString();
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" ou "unread"
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  /*useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/notification?userId=${userId}`
        );
        setNotifications(res.data);
      } catch (err) {
        console.error("Erreur récupération notifications:", err);
      }
    };
    fetchNotifications();
  }, [userId]);*/

  useEffect(() => {
    if (!userId) return;
  
    const fetchNotifications = async () => {
      const res = await axios.get(
        `http://localhost:5000/notification?userId=${userId}`
      );
      setNotifications(res.data);
    };
  
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 500);
  
    return () => clearInterval(interval);
  }, [userId]);
  


  const handleClickNotification = async (notif) => {
    if (!userId) return;
    try {
      await axios.post(
        `http://localhost:5000/notification/read/${notif.id}/${userId}`
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id
            ? { ...n, read_by: [...n.read_by, userId] }
            : n
        )
      );
      if (notif.type === "publication") {
        navigate(`/PublicationDetail/${notif.objet_id}`);
      } else if (notif.type === "doleance") {
        navigate(`/DoleanceDetail/${notif.objet_id}`);
      }
    } catch (err) {
      console.error("Erreur marquage notification:", err);
    }
  };

  // Filtrer les notifications selon le filtre sélectionné
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((notif) => !notif.read_by.includes(userId))
      : notifications;

  return (
    <div className="w-full flex justify-center p-2">
      <div className="bg-white rounded-xl shadow-md p-6 w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>

        {/* 🟢 Filtres */}
        <div className="flex gap-3 mb-4">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border transition-all duration-300 ${
              filter === "all"
                ? "bg-gray-500 text-white shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
            onClick={() => setFilter("all")}
          >
            Tout
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border transition-all duration-300  ${
              filter === "unread"
                ? "bg-gray-500 text-white shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
            onClick={() => setFilter("unread")}
          >
            Non lu(s)
          </button>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">Aucune notification</p>
            <p className="text-gray-400 text-sm mt-1">
              Vous serez notifié dès qu'il y aura de nouvelles activités.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => {
              const isRead = notif.read_by.includes(userId);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleClickNotification(notif)}
                  className={`group cursor-pointer relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                    isRead
                      ? "bg-white border-gray-100 hover:border-gray-200"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 shadow-sm"
                  }`}
                >
                  {/* Avatar et contenu restent inchangés */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                      {`${notif.nom?.[0] || ""}${notif.prenoms?.[0] || ""}`.toUpperCase()}
                    </div>
                    {!isRead && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full animate-pulse shadow-sm"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg leading-tight ${isRead ? "text-gray-700" : "text-gray-900"}`}>
                          {notif.nom} {notif.prenoms}
                        </h3>
                        <p className={`mt-2 leading-relaxed ${isRead ? "text-gray-600" : "text-gray-800 font-medium"}`}>
                          {notif.message}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 mt-1 flex-shrink-0 transition-all duration-300 group-hover:translate-x-1 ${isRead ? "text-gray-400" : "text-blue-500"}`} />
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 font-medium">
                          {formatDate(notif.created_at)}
                        </span>
                      </div>
                      {isRead ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                          <Eye className="w-3 h-3" />
                          Lu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 animate-pulse">
                          <EyeOff className="w-3 h-3" />
                          Nouveau
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

