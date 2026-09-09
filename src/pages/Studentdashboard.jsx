import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import Tag from "../components/Tag";

export default function Studentdashboard() {
  const [data, setData] = useState({
    enrolled: 0,
    completed: 0,
    avgGrade: 0,
    courses: [],
  });
  const [filter, setFilter] = useState("all");

  const filteredCourses = data.courses.filter((c) => {
    if (filter === "completed") {
      return c.isEnrolled && c.status?.toLowerCase() === "completed";
    }
    if (filter === "enrolled") {
      return c.isEnrolled && c.status?.toLowerCase() !== "completed";
    }
    if (filter === "not_enrolled") {
      return !c.isEnrolled;
    }
    return true; 
  });

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [enrollingId, setEnrollingId] = useState(null);

  const limit = 10;
  const navigate = useNavigate();

  const fetchData = useCallback(() => {
    setLoading(true);

    return Promise.all([
      api.get(`/cours?page=${page}&limit=${limit}`),
      api.get("/analytics/student"),
    ])
      .then(([coursesRes, analyticsRes]) => {
        const courses = coursesRes.data.data;
        const stats = analyticsRes.data.data;

        setPages(coursesRes.data.pages || 1);

        setData({
          enrolled: stats.totalCourses ?? 0,
          completed: stats.completedCourses ?? 0,
          avgGrade: Math.round(stats.averageScore ?? 0),

          courses: courses.map((c) => ({
            _id: c._id,
            name: c.title,
            level:c.level,
            
            instructor: c.teacher
              ? `${c.teacher.firstName} ${c.teacher.lastName}`
              : "Unknown",

            status: c.isEnrolled
              ? c.status || "Active"
              : "Not enrolled",

            action: c.isEnrolled ? "Continue" : "Enroll",
            isEnrolled: c.isEnrolled,

            
          })),
        });
      })
      .catch(() => {
        setData({
          enrolled: 0,
          completed: 0,
          avgGrade: 0,
          courses: [],
        });
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);

    try {
      await api.post(`/cours/${courseId}/enroll`);
      await fetchData();
    } catch (err) {
      console.error(
        err.response?.data?.message || "Enroll failed"
      );
    } finally {
      setEnrollingId(null);
    }
  };

  const handleAction = (course) => {
    if (course.isEnrolled) {
      navigate(`/student/courses/${course._id}`);
    } else {
      handleEnroll(course._id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 light:bg-gray-50 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-24 bg-slate-800 light:bg-gray-200 rounded" />
          <div className="h-8 w-64 bg-slate-800 light:bg-gray-200 rounded" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="h-32 bg-slate-800 light:bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-slate-800 light:bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-slate-800 light:bg-gray-200 rounded-2xl" />
          </div>

          <div className="h-96 bg-slate-800 light:bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 light:bg-gray-50 p-6 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] text-blue-400 uppercase mb-2">
            My Learning
          </p>

          <h1 className="text-3xl font-bold text-slate-100 light:text-gray-900">
            Student Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-400 light:text-gray-500">
            Track your courses, progress and academic performance.
          </p>
        </div>

        
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        <div className="rounded-2xl border border-slate-700 light:border-gray-200 bg-slate-900/70 light:bg-white p-1">
          <StatCard
            label="Enrolled"
            value={data.enrolled}
          />
        </div>

        <div className="rounded-2xl border border-slate-700 light:border-gray-200 bg-slate-900/70 light:bg-white p-1">
          <StatCard
            label="Completed"
            value={data.completed}
          />
        </div>

        <div className="rounded-2xl border border-slate-700 light:border-gray-200 bg-slate-900/70 light:bg-white p-1">
          <StatCard
            label="Average Grade"
            value={`${data.avgGrade}%`}
          />
        </div>

      </div>

      {/* COURSES SECTION */}
      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-2xl overflow-hidden shadow-xl">

        {/* TABLE HEADER */}
      <div className="px-6 py-5 border-b border-slate-800 light:border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 light:text-gray-900">
              My Courses
            </h2>
            <p className="text-sm text-slate-500 light:text-gray-400 mt-1">
              Courses available to you and your current progress.
            </p>
          </div>

          <div className="text-xs text-slate-500 light:text-gray-400">
            {filteredCourses.length} course
            {filteredCourses.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-2 mt-4">
          {[
            { key: "all", label: "All" },
            { key: "enrolled", label: "Enrolled" },
            { key: "completed", label: "Completed" },
            { key: "not_enrolled", label: "Not Enrolled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === tab.key
                  ? "bg-blue-500 text-white"
                  : "bg-slate-800 light:bg-gray-100 text-slate-300 light:text-gray-600 hover:bg-slate-700 light:hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead>
              <tr className="text-left text-xs uppercase tracking-wider
                text-slate-500 light:text-gray-400
                bg-slate-950/50 light:bg-gray-50
                border-b border-slate-800 light:border-gray-200">

                <th className="px-6 py-5 font-medium">
                  Course
                </th>

                <th className="px-6 py-5 font-medium">
                  Instructor
                </th>

                <th className="px-6 py-5 font-medium">
                  Status
                </th>
                <th className="px-6 py-5 font-medium">
                  level
                </th>

                <th className="px-6 py-5 font-medium text-right">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredCourses.length === 0 ? (

                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">

                      <div className="w-14 h-14 rounded-2xl bg-slate-800 light:bg-gray-100 flex items-center justify-center mb-4">
                        <span className="text-2xl">📚</span>
                      </div>

                      <p className="font-medium text-slate-300 light:text-gray-700">
                        No courses yet
                      </p>



                    </div>
                  </td>
                </tr>

              ) : (

                filteredCourses.map((c) => (

                  <tr
                    key={c._id}
                    className="group border-b border-slate-800 light:border-gray-200 last:border-0
                    hover:bg-slate-800/50 light:hover:bg-gray-50
                    transition-colors duration-150"
                  >

                    {/* COURSE */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl
                          bg-blue-500/10
                          flex items-center justify-center
                          text-blue-400
                          font-semibold"
                        >
                          {c.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-100 light:text-gray-900">
                            {c.name}
                          </p>

                          <p className="text-xs text-slate-500 light:text-gray-400 mt-1">
                            Course
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* INSTRUCTOR */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        

                        <span className="text-slate-400 light:text-gray-600">
                          {c.instructor}
                        </span>

                      </div>

                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      <Tag status={c.status} />
                    </td>
                    {/* level */}
                    <td className="px-6 py-5">
                      <Tag status={c.level} />
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-5 text-right">

                      <button
                        onClick={() => handleAction(c)}
                        disabled={enrollingId === c._id}
                        className={`
                          inline-flex items-center gap-2
                          text-xs font-medium
                          rounded-xl px-4 py-2.5
                          transition-all duration-200
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          ${
                            c.isEnrolled
                              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                              : "bg-slate-800 hover:bg-slate-700 light:bg-gray-100 light:hover:bg-gray-200 text-slate-200 light:text-gray-700"
                          }
                        `}
                      >

                        {enrollingId === c._id ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          <>
                            {c.action}

                           
                          </>
                        )}

                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4
          border-t border-slate-800 light:border-gray-200
          bg-slate-950/30 light:bg-gray-50/50"
        >

          <p className="text-xs text-slate-500 light:text-gray-400">
            Page{" "}
            <span className="font-medium text-slate-300 light:text-gray-700">
              {page}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-300 light:text-gray-700">
              {pages}
            </span>
          </p>

          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              disabled={page === 1}
              className="px-4 py-2 rounded-lg
                text-xs font-medium
                bg-slate-800 light:bg-white
                border border-slate-700 light:border-gray-200
                text-slate-300 light:text-gray-700
                hover:bg-slate-700 light:hover:bg-gray-100
                disabled:opacity-30
                disabled:cursor-not-allowed
                transition"
            >
              Previous
            </button>

            <button
              onClick={() =>
                setPage((p) => Math.min(pages, p + 1))
              }
              disabled={page === pages}
              className="px-4 py-2 rounded-lg
                text-xs font-medium
                bg-blue-500 hover:bg-blue-600
                text-white
                disabled:opacity-30
                disabled:cursor-not-allowed
                transition"
            >
              Next 
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}