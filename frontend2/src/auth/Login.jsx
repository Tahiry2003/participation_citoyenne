import { LogIn, CheckCircle, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showNotification = (type, message) => {
    if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 5000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("success", "Connexion réussie ! Redirection en cours...");

        // Sauvegarde en localStorage pour la session
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userId", data.user.id);
        if (data.user.role) {
          localStorage.setItem("userRole", data.user.role);
        }

        // Délai pour laisser voir la notification
        setTimeout(() => {
          switch (data.user.role) {
            case "citoyen":
              navigate("/DashboardCitoyen");
              break;
            case "agent":
              navigate("/DashboardAgent");
              break;
            case "admin":
              navigate("/DashboardAdmin");
              break;
            default:
              navigate("/Profil");
          }
        }, 1500);
      } else {
        showNotification("error", data.error || "Identifiants incorrects");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Erreur de connexion au serveur");
    }
  };

  return (
    <>
      {/* Notifications */}
      <div className="fixed top-10 right-4 z-50 max-w-md px-4 pointer-events-none">
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

      {/* Login Form */}
      <div className="flex min-h-screen items-center justify-center bg-blue-50 relative px-4">
        <div className="w-full max-w-md rounded-2xl p-8 shadow-xl bg-gradient-to-b from-blue-200 via-blue-50/25 to-blue-50/25">
          {/* Logo */}
          <div className="text-center mb-3">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-blue-50/100 shadow-lg flex items-center justify-center border border-gray-300">
              <LogIn className="w-8 h-8 text-gray-700 drop-shadow" />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-700">
              EParticipation
            </h1>
            <p className="mt-4 text-gray-500 text-sm">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Entrez votre email"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <a
                  onClick={() => navigate("/resetPassword")}
                  href="#"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <input
                type="password"
                placeholder="Entrez votre mot de passe"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 shadow-lg shadow-blue-100/50 hover:shadow-blue-200/60"
            >
              Se connecter
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Pas encore de compte ?
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="w-full justify-center mt-2 flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </>
  );
}