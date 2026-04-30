import { 
  LogOut, 
  FileText, 
  Users, 
  Newspaper, 
  User2, 
  Home, 
  Bell,
  Heart,
  ChevronDown,
  BookDashed,
  LayoutDashboard,
  Info,
  ListCollapse,
  List,
  Search
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const userEmail = localStorage.getItem("userEmail") || "Utilisateur";
  const userId = localStorage.getItem("userId");

  // Vérifier les notifications non lues
  useEffect(() => {
    const checkUnreadNotifications = async () => {
      try {
        if (!userId) return;
        
        const res = await axios.get(`http://localhost:5000/notification/unread-count/${userId}`);
        const unreadCount = res.data.count || 0;
        
        setHasUnreadNotifications(unreadCount > 0);
      } catch (err) {
        console.error("Erreur vérification notifications:", err);
        setHasUnreadNotifications(false);
      }
    };

    checkUnreadNotifications();
    
    // Vérifier périodiquement (toutes les 30 secondes)
    const intervalId = setInterval(checkUnreadNotifications, 500);
    
    return () => clearInterval(intervalId);
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleNotificationClick = () => {
    navigate("/Notification");
  };

  // Définir les titres + icônes en fonction de la route
  const pages = {
    "/Notification": { label: "Notification", icon: <Bell className="w-5 h-5 text-blue-600" /> },
    "/Dashboard": { label: "Dashboard", icon: <Home className="w-5 h-5 text-blue-600" /> },
    "/Actualite": { label: "Actualité", icon: <Newspaper className="w-5 h-5 text-blue-600" /> },
    "/Doleance": { label: "Liste doléances", icon: <List className="w-5 h-5 text-blue-600" /> },
    "/Utilisateur": { label: "Compte utilisateur", icon: <Users className="w-5 h-5 text-blue-600" /> },
    "/Publication": { label: "Publication", icon: <FileText className="w-5 h-5 text-blue-600" /> },
    "/ApprouveAgent": { label: "Approuver les agents", icon: <Users className="w-5 h-5 text-blue-600" /> },
    "/Profil": { label: "Profil", icon: <User2 className="w-5 h-5 text-blue-600" /> },
    "/DashboardAdmin": { label: "Tableau de bord", icon: <LayoutDashboard className="w-5 h-5 text-blue-600" /> },
    "/DashboardCitoyen": { label: "Tableau de bord", icon: <LayoutDashboard className="w-5 h-5 text-blue-600" /> },
    "/DashboardAgent": { label: "Tableau de bord", icon: <LayoutDashboard className="w-5 h-5 text-blue-600" /> },
  };

  const currentPage = pages[location.pathname] || { label: "Detail", icon: <FileText className="w-5 h-5 text-blue-600" /> };

  return (
    <div className="w-full h-16 bg-white flex items-center justify-between px-8 border-b border-gray-100 shadow-sm">
      {/* Page courante */}
      <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg -ml-2">
        {currentPage.icon}
        <span>{currentPage.label}</span>
      </div>

      {/* Infos utilisateur + actions */}
      <div className="flex items-center gap-2">
        {/* Notification avec badge conditionnel */}
        <button 
          onClick={handleNotificationClick}
          className="relative p-2 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50 hover:shadow-blue-100/60 hover:border-blue-100 transition-all duration-300 group"
        >
          <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
          {hasUnreadNotifications && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
          )}
        </button>
        {/* Profil utilisateur */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-200">
          <div className="hidden w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {userEmail[0]?.toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800 leading-tight">
              {userEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}