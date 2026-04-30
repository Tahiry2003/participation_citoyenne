import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SelectRegionDistrict from "../composant/SelectRegionDistrict";
import { CheckCircle, Shield, UserRoundPlus, Users, X } from "lucide-react";

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("citoyen");

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

  // Champs communs
  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
  const [prenoms, setPrenoms] = useState("");
  const [tel, setTel] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Spécifique agent communal
  const [matricule, setMatricule] = useState("");

  // Nouvelle variable combinée pour région/district/commune
  const [regionDistrictCommune, setRegionDistrictCommune] = useState(null);

  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // ✅ États de validation
  const [errors, setErrors] = useState({
    nom: "",
    prenoms: "",
    email: "",
    tel: "",
    matricule: "",
    password: "",
    confirm: "",
    region: ""
  });

  // ✅ États pour suivre si les champs ont été touchés
  const [touched, setTouched] = useState({
    nom: false,
    prenoms: false,
    email: false,
    tel: false,
    matricule: false,
    password: false,
    confirm: false,
    region: false
  });

  const navigate = useNavigate();

  // ✅ Regex pour chaque champ
  const regexPatterns = {
    nom: /^[A-Z][a-zA-ZÀ-ÿ\s'-]{3,50}$/, 
    prenoms: /^[A-Z][a-zA-ZÀ-ÿ\s'-]{3,50}$/,    
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email standard
    tel: /^(\+261|0)?[3-7]\d{8}$/, // Téléphone Madagascar (+261 ou 0 suivi de 9 chiffres)
    matricule: /^\d{6}$/,
    password: /^[A-Za-z0-9]{8}$/
  };

  // ✅ Fonction de validation complète
  const validateField = (name, value) => {
    let error = "";

    if (!value.trim()) {
      return "Ce champ est obligatoire";
    }

    switch (name) {
      case "nom":
        if (!regexPatterns.nom.test(value)) {
          error = "Nom invalide (majuscule initiale, lettres uniquement)";
        }
        break;
      case "prenoms":
        if (!regexPatterns.prenoms.test(value)) {
          error = "Prénom invalide (majuscule initiale, lettres uniquement)";
        }
        break;
      case "email":
        if (!regexPatterns.email.test(value)) {
          error = "Email invalide";
        }
        break;
      case "tel":
        if (!regexPatterns.tel.test(value)) {
          error = "Téléphone invalide (+261 ou 0 suivi de 9 chiffres)";
        }
        break;
      case "matricule":
        if (role === "agent" && !regexPatterns.matricule.test(value)) {
          error = "Matricule invalide (ex: AB1234C)";
        }
        break;
      case "password":
        if (!regexPatterns.password.test(value)) {
          error = "Mot de passe doit contenir exactement 8 caractères alphanumériques";
        }
        break;
      case "confirm":
        if (value !== password) {
          error = "Les mots de passe ne correspondent pas";
        }
        break;
      case "region":
        if (!regionDistrictCommune?.region) {
          error = "Veuillez sélectionner une région";
        }
        break;
    }

    return error;
  };

  // ✅ Validation en temps réel
  useEffect(() => {
    const newErrors = { ...errors };

    // Valider chaque champ qui a été touché
    if (touched.nom || nom) newErrors.nom = validateField("nom", nom);
    if (touched.prenoms || prenoms) newErrors.prenoms = validateField("prenoms", prenoms);
    if (touched.email || email) newErrors.email = validateField("email", email);
    if (touched.tel || tel) newErrors.tel = validateField("tel", tel);
    if (touched.matricule || matricule) newErrors.matricule = validateField("matricule", matricule);
    if (touched.password || password) newErrors.password = validateField("password", password);
    if (touched.confirm || confirm) newErrors.confirm = validateField("confirm", confirm);
    if (touched.region) newErrors.region = validateField("region", "");

    setErrors(newErrors);
  }, [nom, prenoms, email, tel, matricule, password, confirm, regionDistrictCommune, role, touched]);

  // ✅ Vérifie si l'étape est valide
  const isStepValid = () => {
    // D'abord, marquer tous les champs de l'étape comme touchés pour afficher les erreurs
    const newTouched = { ...touched };
    let stepValid = true;

    switch (step) {
      case 1:
        return true; // Choix rôle toujours valide

      case 2:
        // Valider les champs de l'étape 2
        if (!nom.trim()) {
          newTouched.nom = true;
          stepValid = false;
        }
        if (!prenoms.trim()) {
          newTouched.prenoms = true;
          stepValid = false;
        }
        if (role === "agent" && !matricule.trim()) {
          newTouched.matricule = true;
          stepValid = false;
        }
        setTouched(newTouched);
        
        // Vérifier aussi les erreurs de validation
        if (errors.nom || errors.prenoms || (role === "agent" && errors.matricule)) {
          return false;
        }
        return stepValid;

      case 3:
        // Valider les champs de l'étape 3
        if (!email.trim()) {
          newTouched.email = true;
          stepValid = false;
        }
        if (!tel.trim()) {
          newTouched.tel = true;
          stepValid = false;
        }
        setTouched(newTouched);
        
        if (errors.email || errors.tel) {
          return false;
        }
        return stepValid;

      case 4:
        // Valider les champs de l'étape 4
        if (!password.trim()) {
          newTouched.password = true;
          stepValid = false;
        }
        if (!confirm.trim()) {
          newTouched.confirm = true;
          stepValid = false;
        }
        setTouched(newTouched);
        
        if (errors.password || errors.confirm) {
          return false;
        }
        return stepValid;

      default:
        return false;
    }
  };

  // ✅ Gérer le changement de champ
  const handleFieldChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // ✅ Gérer le changement de région
  const handleRegionChange = (e) => {
    const value = e.target.value ? JSON.parse(e.target.value) : null;
    setRegionDistrictCommune(value);
    setTouched(prev => ({ ...prev, region: true }));
  };

  // ✅ Passer à l'étape suivante avec validation
  const nextStep = () => {
    if (isStepValid()) {
      setStep((prev) => prev + 1);
    }
  };

  // ✅ Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marquer tous les champs comme touchés
    const allTouched = {
      nom: true,
      prenoms: true,
      email: true,
      tel: true,
      matricule: role === "agent",
      password: true,
      confirm: true,
      region: true
    };
    setTouched(allTouched);

    // Valider tous les champs
    if (!isStepValid()) {
      showNotification("error", "Veuillez corriger les erreurs avant de créer le compte.");
      return;
    }

    // Vérification finale
    if (password !== confirm) {
      showNotification("error", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          email,
          nom,
          prenoms,
          tel,
          password,
          matricule: role === "agent" ? matricule : null,
          region: regionDistrictCommune?.region || "",
          district: regionDistrictCommune?.district || "",
          commune: regionDistrictCommune?.commune || "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification("success", " Compte créé avec succès");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        showNotification("error", data.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      showNotification("error", "Erreur de connexion au serveur");
    }
  };

  // Simulation d'envoi d'email
  const handleSendEmail = async () => {
    if (!email.trim()) {
      setTouched(prev => ({ ...prev, email: true }));
      alert("Veuillez entrer un email valide d'abord.");
      return;
    }
    
    if (errors.email) {
      alert("Veuillez corriger l'email avant d'envoyer.");
      return;
    }
    
    setIsSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSent(true);
      alert("📩 Email de confirmation envoyé !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de l'email");
    } finally {
      setIsSending(false);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <>
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

      <div className="flex min-h-screen items-center justify-center bg-blue-50 relative px-4">
      <div className="w-full max-w-lg rounded-2xl p-8 shadow-xl bg-gradient-to-b from-blue-200 via-blue-50/25 to-blue-50/25">
        {/* Logo + titre */}
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-blue-50/100 shadow-lg flex items-center justify-center border border-gray-300">
            <UserRoundPlus className="w-8 h-8 text-gray-700 drop-shadow" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-700">
            EParticipation
          </h1>
          <p className="mt-4 text-gray-500 text-sm">
            Créez votre compte en quelques étapes simples
          </p>
        </div>

        {/* Barre de progression */}
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 mx-1 rounded-full ${
                step >= s ? "bg-blue-500" : "bg-gray-50"
              }`}
            />
          ))}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Étape 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Étape 1 : Choisir le type de compte
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de compte <span className="text-red-500">*</span>
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Bouton Citoyen */}
                  <button
                    type="button"
                    onClick={() => setRole("citoyen")}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                      role === "citoyen"
                        ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      role === "citoyen" ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      <Users className={`w-6 h-6 ${
                        role === "citoyen" ? "text-blue-500" : "text-gray-400"
                      }`} />
                    </div>
                    <span className="text-base font-semibold">Citoyen</span>
                    <p className="text-xs mt-1 text-gray-500 text-center">
                      Pour soumettre des doléances et participer.
                    </p>
                  </button>

                  {/* Bouton Agent communal */}
                  <button
                    type="button"
                    onClick={() => setRole("agent")}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                      role === "agent"
                        ? "border-green-500 bg-green-50 text-green-600 shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      role === "agent" ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      <Shield className={`w-6 h-6 ${
                        role === "agent" ? "text-green-500" : "text-gray-400"
                      }`} />
                    </div>
                    <span className="text-base font-semibold">Agent communal</span>
                    <p className="text-xs mt-1 text-gray-500 text-center">
                      Pour traiter et gérer les doléances.
                    </p>
                  </button>
                </div>
              </div>

              {/* Bouton suivant */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={nextStep}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300 shadow-lg shadow-blue-100/50 hover:shadow-blue-200/60"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Étape 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Étape 2 : Informations personnelles
              </h2>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nom}
                      onChange={handleFieldChange(setNom, "nom")}
                      onBlur={() => setTouched(prev => ({ ...prev, nom: true }))}
                      className={`w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                        (touched.nom && errors.nom) ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      required
                    />
                    {touched.nom && errors.nom && (
                      <p className="mt-1 text-xs text-red-600">{errors.nom}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Prénoms <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={prenoms}
                      onChange={handleFieldChange(setPrenoms, "prenoms")}
                      onBlur={() => setTouched(prev => ({ ...prev, prenoms: true }))}
                      className={`w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                        (touched.prenoms && errors.prenoms) ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      required
                    />
                    {touched.prenoms && errors.prenoms && (
                      <p className="mt-1 text-xs text-red-600">{errors.prenoms}</p>
                    )}
                  </div>
                </div>

                {role === "agent" && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Matricule <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={matricule}
                      onChange={handleFieldChange(setMatricule, "matricule")}
                      onBlur={() => setTouched(prev => ({ ...prev, matricule: true }))}
                      className={`w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all uppercase ${
                        (touched.matricule && errors.matricule) ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      required={role === "agent"}
                      placeholder="Ex: AB1234C"
                    />
                    {touched.matricule && errors.matricule && (
                      <p className="mt-1 text-xs text-red-600">{errors.matricule}</p>
                    )}
                  </div>
                )}

                {/* Sélecteur Région/District/Commune */}
                <div>
                  <SelectRegionDistrict
                    label="Région, District et Commune"
                    name="regionDistrictCommune"
                    onChange={(e) => setRegionDistrictCommune(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300 shadow-lg shadow-blue-100/50 hover:shadow-blue-200/60"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Étape 3 : Contact
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Adresse email <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={handleFieldChange(setEmail, "email")}
                      onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                      className={`flex-1 mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                        (touched.email && errors.email) ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      required
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={tel}
                    onChange={handleFieldChange(setTel, "tel")}
                    onBlur={() => setTouched(prev => ({ ...prev, tel: true }))}
                    className={`w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                      (touched.tel && errors.tel) ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="+261 34 12 345 67"
                    required
                  />
                  {touched.tel && errors.tel && (
                    <p className="mt-1 text-xs text-red-600">{errors.tel}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-300 shadow-lg shadow-blue-100/50 hover:shadow-blue-200/60"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* Étape 4 */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Étape 4 : Sécurité du compte
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={handleFieldChange(setPassword, "password")}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                    className={`w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                      (touched.password && errors.password) ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    required
                  />
                  {touched.password && errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={handleFieldChange(setConfirm, "confirm")}
                    onBlur={() => setTouched(prev => ({ ...prev, confirm: true }))}
                    className={`w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                      (touched.confirm && errors.confirm) ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    required
                  />
                  {touched.confirm && errors.confirm && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
                >
                  Précédent
                </button>
                <button
                  type="submit"
                  className="justify-center flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 shadow-lg shadow-green-100/50 hover:shadow-green-200/60"
                >
                  Créer le compte
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Déjà inscrit ?
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full justify-center mt-2 flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 shadow-lg shadow-gray-100/50 hover:shadow-gray-200/60"
        >
          Se connecter
        </button>
      </div>
    </div>
    </>
  );
}