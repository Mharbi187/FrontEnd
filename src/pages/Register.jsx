import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mdp: "",
    adresse: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nom.trim()) newErrors.nom = "Nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Prénom est requis";
    if (!formData.email.trim()) {
      newErrors.email = "Email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email est invalide";
    }
    if (!formData.adresse.trim()) newErrors.adresse = "Adresse est requise";
    if (!formData.mdp) {
      newErrors.mdp = "Mot de passe est requis";
    } else if (formData.mdp.length < 6) {
      newErrors.mdp = "Minimum 6 caractères";
    }
    if (formData.mdp !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;

      // Map to backend field names
      const payload = {
        ...userData,
        mdp: userData.mdp,
      };

      const response = await api.post("/users/register", payload);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        navigate("/login", {
          state: {
            registrationSuccess: true,
            email: formData.email,
          },
        });
      }
    } catch (err) {
      // Enhanced error handling
      const backendErrors = err.response?.data?.errors || [];
      const fieldErrors = {};

      backendErrors.forEach((error) => {
        fieldErrors[error.path] = error.message;
      });

      setErrors({
        ...fieldErrors,
        general: err.response?.data?.message || "Erreur lors de l'inscription",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              Inscription réussie!
            </h2>
            <p className="mt-2 text-gray-600">
              Votre compte a été créé avec succès. Redirection en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Original JSX for the registration form (unchanged)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Déjà membre?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
          {errors.general && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label
                  htmlFor="prenom"
                  className="block text-sm font-medium text-gray-700"
                >
                  Prénom *
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.prenom
                      ? "border-red-300 focus:border-red-300"
                      : "border-gray-300 focus:border-blue-500"
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 transition-colors`}
                  placeholder="Votre prénom"
                />
                {errors.prenom && (
                  <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
                )}
              </div>
              <div className="sm:col-span-1">
                <label
                  htmlFor="nom"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nom *
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.nom
                      ? "border-red-300 focus:border-red-300"
                      : "border-gray-300 focus:border-blue-500"
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 transition-colors`}
                  placeholder="Votre nom"
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.email
                    ? "border-red-300 focus:border-red-300"
                    : "border-gray-300 focus:border-blue-500"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 transition-colors`}
                placeholder="exemple@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="adresse"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse *
              </label>
              <input
                id="adresse"
                name="adresse"
                type="text"
                required
                value={formData.adresse}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.adresse
                    ? "border-red-300 focus:border-red-300"
                    : "border-gray-300 focus:border-blue-500"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 transition-colors`}
                placeholder="Votre adresse complète"
              />
              {errors.adresse && (
                <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="mdp"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe *
              </label>
              <input
                id="mdp"
                name="mdp"
                type="password"
                autoComplete="new-password"
                required
                minLength="6"
                value={formData.mdp}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.mdp
                    ? "border-red-300 focus:border-red-300"
                    : "border-gray-300 focus:border-blue-500"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 transition-colors`}
                placeholder="••••••••"
              />
              {errors.mdp ? (
                <p className="mt-1 text-sm text-red-600">{errors.mdp}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 6 caractères
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmer le mot de passe *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full border ${
                  errors.confirmPassword
                    ? "border-red-300 focus:border-red-300"
                    : "border-gray-300 focus:border-blue-500"
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 transition-colors`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
