import { 
  LogOut, 
  Users, 
  FileText, 
  User2, 
  Newspaper, 
  Home, 
  Bell,
  Star
} from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import axios from "axios";
import audienceLogo from "../fichier/inclusion.png";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const userEmail = localStorage.getItem('userEmail');
  const userType = localStorage.getItem('userRole'); // admin, agent, citoyen
  const userId = localStorage.getItem("userId");

  const [unreadCount, setUnreadCount] = useState(0);

  // Charger le nombre de notifications non lues
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!userId) return;
        const res = await axios.get(`http://localhost:5000/notification/unread-count/${userId}`);
        setUnreadCount(res.data.count || 0);
      } catch (err) {
        console.error("Erreur récupération notifications:", err);
      }
    };

    fetchUnread();
    const intervalId = setInterval(fetchUnread, 500);
    return () => clearInterval(intervalId);
  }, [userId]);

  const handleNavigate = (path) => (event) => {
    event.preventDefault();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Menus par rôle avec le nouveau menu "Favoris"
  const menuItems = {
    admin: [
      { icon: <Home size={20} />, label: "Tableau de bord", path: "/DashboardAdmin" },
      { icon: <User2 size={20} />, label: "Profil", path: "/Profil" },
      { icon: <Newspaper size={20} />, label: "Actualités", path: "/Actualite" },
      { icon: <Users size={20} />, label: "Liste utilisateur", path: "/Utilisateur" },
      { icon: <Bell size={20} />, label: "Notification", path: "/Notification", badge: unreadCount },
    ],
    agent: [
      { icon: <Home size={20} />, label: "Tableau de bord", path: "/DashboardAgent" },
      { icon: <User2 size={20} />, label: "Profil", path: "/Profil" },
      { icon: <FileText size={20} />, label: "Liste doléance", path: "/Doleance" },
      { icon: <Newspaper size={20} />, label: "Actualités", path: "/Actualite" },
      { icon: <Bell size={20} />, label: "Notification", path: "/Notification", badge: unreadCount },
    ],
    citoyen: [
      { icon: <Home size={20} />, label: "Tableau de bord", path: "/DashboardCitoyen" },
      { icon: <User2 size={20} />, label: "Profil", path: "/Profil" },
      { icon: <FileText size={20} />, label: "Doléance existants", path: "/Doleance" },
      { icon: <Newspaper size={20} />, label: "Actualités", path: "/Actualite" },
      { icon: <Bell size={20} />, label: "Notification", path: "/Notification", badge: unreadCount },
    ]
  };

  const itemsToRender = menuItems[userType] || [];

  return (
    <div className="h-[100vh] w-72 bg-gradient-to-b from-white to-blue-50/30 shadow-xl p-4 flex flex-col border-r border-gray-100">
      {/* Logo */}
      <div className="mb-5 -mt-1 flex items-center gap-3">
        <img
          src={audienceLogo}
          alt="Logo EParticipation"
          className="w-10 h-10 object-contain"
        />

        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 -ml-2">
          EParticipation
        </h1>
      </div>

      {/* Infos utilisateur */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl mb-8 shadow-sm border border-blue-100">
        <p className="font-semibold text-gray-800 text-sm break-words mb-1 truncate">{userEmail}</p>
        <p className="text-gray-500 text-xs capitalize font-medium">{userType}</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {itemsToRender.map((item, idx) => (
          <NavItem 
            key={idx}
            icon={item.icon}
            label={item.label}
            onClick={handleNavigate(item.path)}
            active={location.pathname === item.path}
            badge={item.badge || 0}
          />
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="pt-4 border-t border-gray-200 mt-4">
        <NavItem
          icon={<LogOut size={20} />}
          label="Déconnexion"
          onClick={handleLogout}
          customClass="text-red-600 hover:bg-red-50 border border-red-200 shadow-red-100/50 hover:shadow-red-200/60"
        />
      </div>
    </div>
  );
}

function NavItem({ icon, label, onClick, customClass, active, badge }) {
  const getButtonStyle = () => {
    if (active) {
      return "bg-blue-400 text-white border border-blue-400 shadow-lg shadow-blue-100/50 hover:shadow-blue-200/60";
    }
    if (customClass) {
      return customClass;
    }
    return "bg-white text-gray-700 border border-gray-200 shadow-lg shadow-gray-100/50 hover:shadow-blue-100/60 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-100";
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-3 p-4 rounded-2xl font-semibold transition-all duration-300 w-full text-sm ${getButtonStyle()}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}