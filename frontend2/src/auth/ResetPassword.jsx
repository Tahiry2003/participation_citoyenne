import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
        alert("✅ Connexion réussie");

        // Sauvegarde en localStorage pour la session
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userId", data.user.id);
        if (data.user.role) {
          localStorage.setItem("userRole", data.user.role);
        }

        // 👉 Redirection vers Publication
        navigate("/Profil");
      } else {
        alert(data.error || "❌ Identifiants incorrects");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 relative px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-3">
          <div className="mx-auto h-12 w-40 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            E-Participation
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Recuperer votre compte
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

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Envoyer code de verification
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Pas encore de compte ?
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 w-full py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition border"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}
