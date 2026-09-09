import { useState, useEffect } from "react";
import api from "../api/axios";

export default function AssignStudentInfo() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [form, setForm] = useState({ level: "", group: "", department: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, deptRes] = await Promise.all([
          api.get("/users/students/lists"),
          api.get("/departments"),
        ]);
        setStudents(studentsRes.data.users || studentsRes.data.data || []);
        setDepartments(deptRes.data.data || deptRes.data || []);
      } catch (err) {
        setError("Échec du chargement des données");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const currentStudent = students.find((s) => s._id === selectedStudent);

  const sortedStudents = [...students].sort((a, b) => {
    const aMissing = !a.level || !a.department;
    const bMissing = !b.level || !b.department;
    if (aMissing !== bMissing) return aMissing ? -1 : 1;
    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
  });

  const handleSelectStudent = (id) => {
    setSelectedStudent(id);
    const student = students.find((s) => s._id === id);
    setForm({
      level: student?.level || "",
      group: student?.group || "",
      department: student?.department?._id || student?.department || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedStudent) {
      setError("Veuillez sélectionner un étudiant");
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${selectedStudent}/assign-info`, form);
      setSuccess("Informations mises à jour avec succès");
    } catch (err) {
      setError(err.response?.data?.message || "Échec de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 light:bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <p className="text-xs tracking-widest text-slate-500 mb-1">
          ADMINISTRATION
        </p>
        <h2 className="text-slate-100 light:text-gray-900 text-2xl font-bold mb-6">
          Assigner les informations étudiant
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border border-slate-800 light:border-gray-200 rounded-2xl p-6 bg-slate-900 light:bg-white"
        >
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <label className="text-slate-400 light:text-gray-500 text-sm">
            Étudiant
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => handleSelectStudent(e.target.value)}
            required
            className="bg-slate-900 light:bg-gray-100/50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900"
          >
            <option value="">Sélectionner un étudiant</option>
            {sortedStudents.map((s) => (
              <option key={s._id} value={s._id}>
                {(!s.level || !s.department) ? "!" : ""}
                {s.firstName} {s.lastName} — {s.email}
              </option>
            ))}
          </select>

          {currentStudent && (
            <div className="text-xs text-slate-500 light:text-gray-400 bg-slate-950/50 light:bg-gray-100 border border-slate-800 light:border-gray-200 rounded-lg px-3 py-2 -mt-1">
              Actuellement : niveau{" "}
              <span className="text-slate-300 light:text-gray-700 font-medium">
                {currentStudent.level || "non défini"}
              </span>
              , groupe{" "}
              <span className="text-slate-300 light:text-gray-700 font-medium">
                {currentStudent.group || "non défini"}
              </span>
            </div>
          )}

          <label className="text-slate-400 light:text-gray-500 text-sm mt-2">
            Niveau
          </label>
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            required
            className="bg-slate-900 light:bg-gray-100/50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900"
          >
            <option value="" disabled>Sélectionner un niveau</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="M1">M1</option>
            <option value="M2">M2</option>
          </select>

          <label className="text-slate-400 light:text-gray-500 text-sm mt-2">
            Groupe
          </label>
          <input
            name="group"
            type="text"
            value={form.group}
            onChange={handleChange}
            placeholder="ex: Groupe A"
            className="bg-slate-900 light:bg-gray-100/50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900"
          />

          <label className="text-slate-400 light:text-gray-500 text-sm mt-2">
            Département
          </label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            className="bg-slate-900 light:bg-gray-100/50 border border-slate-700 light:border-gray-300 rounded-lg px-3 py-2 text-slate-100 light:text-gray-900"
          >
            <option value="">Sélectionner un département</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg py-3 disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}