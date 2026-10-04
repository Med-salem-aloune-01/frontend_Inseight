import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate(`/${res.data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Échec de la connexion");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6">
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="hidden lg:flex w-[58%] flex-col p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950">

          {/* Brand */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">
                  E
                </span>
              </div>

              <div>
                <h1 className="text-white font-bold text-lg">
                  EduInsight
                </h1>
                <p className="text-slate-500 text-[10px]">
                  SMART EDUCATION
                </p>
              </div>
            </div>

            <span className="inline-flex text-[10px] tracking-widest text-blue-400 border border-blue-500/30 bg-blue-500/5 rounded-full px-3 py-1.5">
              ÉDUCATION INTELLIGENTE
            </span>

            <h2 className="text-3xl font-bold text-white leading-tight mt-5 mb-3 max-w-lg">
              Donnez à chaque apprenant des données concrètes.
            </h2>

            <p className="text-slate-400 text-sm leading-6 max-w-xl">
              Suivez l'engagement des cours, les résultats des quiz et
              la progression des étudiants dans un seul espace intelligent.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-7">

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                📊
              </div>

              <p className="text-white text-xs font-semibold mb-1">
                Analyses
              </p>

              <p className="text-slate-500 text-[10px] leading-4">
                Analysez les performances en temps réel.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                📈
              </div>

              <p className="text-white text-xs font-semibold mb-1">
                Dashboard
              </p>

              <p className="text-slate-500 text-[10px] leading-4">
                Des tableaux de bord simples et clairs.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                🔐
              </div>

              <p className="text-white text-xs font-semibold mb-1">
                Sécurisé
              </p>

              <p className="text-slate-500 text-[10px] leading-4">
                Authentification sécurisée et moderne.
              </p>
            </div>

          </div>

          {/* Demo accounts */}
          <div className="mt-auto">

            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white text-sm font-semibold">
                  Comptes de démonstration
                </p>

                <p className="text-slate-500 text-[10px] mt-1">
                  Utilisez un compte pour découvrir chaque espace.
                </p>
              </div>

              <span className="text-[9px] px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                DEMO
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">

              {/* ADMIN */}
              <div className="group rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-slate-900/40 p-4 hover:border-red-500/40 transition">

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    👑
                  </div>

                  <div>
                    <p className="text-white text-xs font-bold">
                      Admin
                    </p>
                    <p className="text-red-400 text-[9px]">
                      Administration
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-slate-300 text-[10px] break-all mt-0.5">
                      salemaloune024@gmail.com
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                      Password
                    </p>
                    <p className="text-slate-300 text-[10px] mt-0.5 font-mono">
                      000000
                    </p>
                  </div>
                </div>
              </div>

              {/* TEACHER */}
              <div className="group rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-slate-900/40 p-4 hover:border-blue-500/40 transition">

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    👨‍🏫
                  </div>

                  <div>
                    <p className="text-white text-xs font-bold">
                      Teacher
                    </p>
                    <p className="text-blue-400 text-[9px]">
                      Enseignant
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-slate-300 text-[10px] break-all mt-0.5">
                      professeurali@gmail.com
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                      Password
                    </p>
                    <p className="text-slate-300 text-[10px] mt-0.5 font-mono">
                      000000
                    </p>
                  </div>
                </div>
              </div>

              {/* STUDENT */}
              <div className="group rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-slate-900/40 p-4 hover:border-emerald-500/40 transition">

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    🎓
                  </div>

                  <div>
                    <p className="text-white text-xs font-bold">
                      Student
                    </p>
                    <p className="text-emerald-400 text-[9px]">
                      Étudiant
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-slate-300 text-[10px] break-all mt-0.5">
                      salemaloune023@gmail.com
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-[9px] uppercase tracking-wide">
                      Password
                    </p>
                    <p className="text-slate-300 text-[10px] mt-0.5 font-mono">
                      123456
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="w-full lg:w-[42%] flex items-center justify-center px-6 sm:px-10 py-10 bg-slate-950">

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm flex flex-col"
          >

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">
                  E
                </span>
              </div>

              <span className="text-white font-bold">
                EduInsight
              </span>
            </div>

            <p className="text-[10px] tracking-[0.2em] text-blue-400 mb-2">
              PORTAIL D'ACCÈS
            </p>

            <h2 className="text-slate-100 text-2xl font-bold mb-2">
              Content de vous revoir
            </h2>

            <p className="text-slate-500 text-xs mb-7">
              Connectez-vous à votre espace EduInsight.
            </p>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                <p className="text-red-400 text-xs">
                  {error}
                </p>
              </div>
            )}

            {/* Email */}
            <label className="text-slate-400 text-xs font-medium mb-2">
              Email
            </label>

            <input
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />

            {/* Password */}
            <label className="text-slate-400 text-xs font-medium mt-5 mb-2">
              Mot de passe
            </label>

            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />

            {/* Login button */}
            <button
              type="submit"
              className="mt-6 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl py-3 transition shadow-lg shadow-blue-500/10"
            >
              Se connecter
            </button>

            {/* Signup */}
            <p className="text-center text-xs text-slate-500 mt-5">
              Pas encore de compte ?{" "}
              <Link
                to="/Signuppage.jsx"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Créez-en un
              </Link>
            </p>

          </form>
        </div>

      </div>
    </div>
  );
}

