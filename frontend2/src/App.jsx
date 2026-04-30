import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './composant/sideBar';
import Navbar from './composant/navBar';
import PublicationDetail from './dash/publicationDetail';
import DoleanceDetail from './dash/doleanceDetail';
import Utilisateur from './dash/utilisateur';
import ApprouveAgent from './dash/approuveAgent';
import Profil from './dash/profil';
import ProfilUtil from './dash/profilUtil';
import Actualite from './dash/actualite';
import Doleance from './dash/listeDoleance';
import DashboardCitoyen from './dash/tableau/dashboardCitoyen';
import DashboardAgent from './dash/tableau/dashboardAgent';
import DashboardAdmin from './dash/tableau/dashboardAdmin';
import Notification from './dash/notification';
import Login from './auth/Login';
import SignUp from './auth/SignUp';
import ResetPassword from './auth/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        
        <Route
          path="/PublicationDetail/:id"
          element={
            <WithSidebar>
              <PublicationDetail />
            </WithSidebar>
          }
        />
        <Route
          path="/DoleanceDetail/:id"
          element={
            <WithSidebar>
              <DoleanceDetail />
            </WithSidebar>
          }
        />
        <Route
          path="/Utilisateur"
          element={
            <WithSidebar>
              <Utilisateur />
            </WithSidebar>
          }
        />
        <Route
          path="ApprouveAgent"
          element={
            <WithSidebar>
              <ApprouveAgent />
            </WithSidebar>
          }
        />
        <Route
          path="/Profil"
          element={
            <WithSidebar>
              <Profil />
            </WithSidebar>
          }
        />
        <Route
          path="/ProfilUtil/:userId/:userRole"
          element={
            <WithSidebar>
              <ProfilUtil />
            </WithSidebar>
          }
        />
        <Route
          path="/Actualite"
          element={
            <WithSidebar>
              <Actualite />
            </WithSidebar>
          }
        />
        <Route
          path="/Doleance"
          element={
            <WithSidebar>
              <Doleance />
            </WithSidebar>
          }
        />
        <Route
          path="/DashboardCitoyen"
          element={
            <WithSidebar>
              <DashboardCitoyen />
            </WithSidebar>
          }
        />
        <Route
          path="/DashboardAgent"
          element={
            <WithSidebar>
              <DashboardAgent />
            </WithSidebar>
          }
        />
        <Route
          path="/DashboardAdmin"
          element={
            <WithSidebar>
              <DashboardAdmin />
            </WithSidebar>
          }
        />
        <Route
          path="/Notification"
          element={
            <WithSidebar>
              <Notification />
            </WithSidebar>
          }
        />
      </Routes>
    </Router>
  );
}

// 👉 Layout avec Sidebar + Navbar
function WithSidebar({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-lg rounded-2xl h-full">
        <Sidebar />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col h-full">
        {/* Navbar en haut */}
        <Navbar />

        {/* Page */}
        <div className="flex-1 bg-blue-50 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default App;
