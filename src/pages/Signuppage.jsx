import { useState,useEffect  } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios"; 

export default function SignupPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "student",
    studentCode: "",
    speciality: "",
    department: "",
  });

  useEffect(() => {
    api.get('/departments/')
      .then((res) => setDepartments(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch((err) => console.error('Fetch departments failed:', err.response?.data || err.message));
  }, []);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
    const res = await api.post("/auth/register", form);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    navigate(`/${res.data.user.role}`);
  } catch (err) {
    setError(err.response?.data?.message || "Échec de l'inscription");
  
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-2xl flex rounded-2xl overflow-hidden border border-slate-800 scale-[1]">
        {/* Left side — branding */}
        <div className="hidden lg:flex w-1/2 flex-col justify-between p-6 bg-gradient-to-br from-slate-900 to-blue-950">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] tracking-widest text-blue-400 border border-blue-800 rounded-full px-2 py-1">
                ÉDUCATION INTELLIGENTE
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white leading-tight mb-3">
              Donnez à chaque apprenant des données concrètes.
            </h1>
            <p className="text-slate-400 text-sm">
              Suivez l'engagement des cours, les résultats des quiz et la
              progression des étudiants dans un seul espace soigné.
            </p>
          </div>

          <div className="border border-slate-800 rounded-xl p-4">
            <p className="text-blue-400 font-medium mb-2 text-sm">
              Pourquoi choisir EduInsight
            </p>
            <ul className="text-slate-400 text-xs space-y-1 list-disc list-inside">
              <li>Analyses pédagogiques en temps réel</li>
              <li>Tableaux de bord clairs pour enseignants et étudiants</li>
              <li>Authentification sécurisée et interface moderne</li>
            </ul>
          </div>
        </div>

        {/* Right side — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 bg-slate-950">
          <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
            <p className="text-xs tracking-widest text-slate-500 mb-1">
              PORTAIL D'ACCÈS
            </p>
            <h2 className="text-slate-100 text-2xl font-bold mb-4">
              Créez votre compte
            </h2>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <label className="text-slate-400 text-sm">prénom</label>
            <input
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              required
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
            />
            <label className="text-slate-400 text-sm">nom</label>
            <input
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              required
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
            />

            <label className="text-slate-400 text-sm mt-2">Email</label>
            <input
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
            />
            <label className="text-slate-400 text-sm mt-2">Téléphone</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
            />
            <label className="text-slate-400 text-sm mt-2">Mot de passe</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
            />

            <label className="text-slate-400 text-sm mt-2">Je suis</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
            >
              <option value="student">Étudiant</option>
              <option value="teacher">Enseignant</option>
            </select>
            {form.role === "student" && (
          <>
          <label className="text-slate-400 text-sm mt-2">Code étudiant</label>
          <input
            name="studentCode"
            type="text"
            value={form.studentCode}
            onChange={handleChange}
            required
            placeholder="STU2026001"
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
          />
        </>
        )}

                        {form.role === "teacher" && (
              <>
                <label className="text-slate-400 text-sm mt-2">Spécialité</label>
                <input
                  name="speciality"
                  type="text"
                  value={form.speciality}
                  onChange={handleChange}
                  required
                  placeholder="mathematics"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />

                <label className="text-slate-400 text-sm mt-2">Département</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="" disabled>Sélectionner un département</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </>
            )}
            <button
              type="submit"
              
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg py-3"
            >
               S'inscrire
            </button>

            <p className="text-center text-sm text-slate-400 mt-2">
              Déjà un compte ?{" "}
              <a href="/login" className="text-blue-500">
                Connectez-vous
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}