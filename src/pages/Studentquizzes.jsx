import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function StudentQuizzes() {
  const navigate = useNavigate();
const limit = 10;
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  useEffect(() => {
    Promise.all([
      api.get(`/quizzes/listQuizzes?page=${page}&limit=${limit}`),
      api.get("/quiz-attempts/best-scores"),
    ])
      .then(([quizzesRes, bestScoresRes]) => {
        const list = quizzesRes.data.data;
        const bestScoresByQuiz = bestScoresRes.data?.data || {};

        setQuizzes(
          list
            .filter((q) => q.isPublished)
            .map((q) => {
              const bestScore = bestScoresByQuiz[q._id] ?? null;
              const score = bestScore !== null ? Number(bestScore) : null;
              const passing = q.passingScore != null ? Number(q.passingScore) : null;

              let status = "not_tested";
              if (score !== null && passing !== null) {
                status = score >= passing ? "passed" : "not_passed";
              }

              return {
                _id: q._id,
                course: q.course?.title || "Unknown",
                quiz: q.title,
                duration: q.duration ? `${q.duration} min` : "—",
                passingScore: q.passingScore != null ? `${q.passingScore}%` : "—",
                bestScore: score,
                status,
              };
            })
        );
        setPages(quizzesRes.data.pages || 1);
        setTotalQuizzes(quizzesRes.data.total || 0);
      })
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, [page]);

  const filteredQuizzes = quizzes.filter((q) => {
    if (filter === "all") return true;
    return q.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 light:bg-gray-50 p-6 md:p-8">
        <div className="animate-pulse space-y-6">

          <div>
            <div className="h-3 w-24 bg-slate-800 light:bg-gray-200 rounded mb-3" />
            <div className="h-8 w-52 bg-slate-800 light:bg-gray-200 rounded" />
          </div>

          <div className="h-20 bg-slate-800 light:bg-gray-200 rounded-2xl" />

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
            My Quizzes
          </p>

          <h1 className="text-3xl font-bold text-slate-100 light:text-gray-900">
            Test Yourself
          </h1>

          <p className="mt-2 text-sm text-slate-400 light:text-gray-500">
            Challenge yourself and track your quiz performance.
          </p>
        </div>

        {/* QUIZ COUNT */}
        <div className="flex items-center gap-3 bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl px-4 py-3">

          <div>
            <p className="text-xs text-slate-500 light:text-gray-400">
              Available quizzes
            </p>

            <p className="text-lg font-bold text-slate-100 light:text-gray-900">
              {totalQuizzes}
            </p>
          </div>

        </div>
      </div>

      {/* QUIZ TABLE */}
      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-2xl overflow-hidden shadow-xl">

        {/* TABLE HEADER */}
        <div className="px-6 py-5 border-b border-slate-800 light:border-gray-200">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 light:text-gray-900">
                Available Quizzes
              </h2>

              <p className="text-sm text-slate-500 light:text-gray-400 mt-1">
                Choose a quiz and test your knowledge.
              </p>
            </div>

            <div className="text-xs text-slate-500 light:text-gray-400">
              {filteredQuizzes.length} quiz
              {filteredQuizzes.length !== 1 ? "zes" : ""}
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex gap-2 mt-4">
            {[
              { key: "all", label: "All" },
              { key: "passed", label: "Passed" },
              { key: "not_passed", label: "Not Passed" },
              { key: "not_tested", label: "Not Tested" },
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

        {/* RESPONSIVE TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr
                className="
                  text-left text-xs uppercase tracking-wider
                  text-slate-500 light:text-gray-400
                  bg-slate-950/50 light:bg-gray-50
                  border-b border-slate-800 light:border-gray-200
                "
              >

                <th className="px-6 py-4 font-medium">
                  Course
                </th>

                <th className="px-6 py-4 font-medium">
                  Quiz
                </th>

                <th className="px-6 py-4 font-medium">
                  Duration
                </th>

                <th className="px-6 py-4 font-medium">
                  Passing Score
                </th>

                <th className="px-6 py-4 font-medium">
                  Best Score
                </th>

                <th className="px-6 py-4 font-medium text-right">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredQuizzes.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <p className="font-medium text-slate-300 light:text-gray-700">
                        No quizzes found
                      </p>

                      <p className="text-sm text-slate-500 light:text-gray-400 mt-1">
                        {filter === "all"
                          ? "There are no published quizzes available."
                          : "No quizzes match this filter."}
                      </p>

                    </div>

                  </td>
                </tr>

              ) : (

                filteredQuizzes.map((q) => {

                  const passed = q.status === "passed";

                  return (
                    <tr
                      key={q._id}
                      className="
                        group
                        border-b border-slate-800
                        light:border-gray-200
                        last:border-0
                        hover:bg-slate-800/50
                        light:hover:bg-gray-50
                        transition-colors duration-150
                      "
                    >

                      {/* COURSE */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div
                            className="
                              w-10 h-10 rounded-xl
                              bg-blue-500/10
                              flex items-center justify-center
                              text-blue-400
                              font-semibold
                            "
                          >
                            {q.course?.charAt(0)?.toUpperCase() || "C"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-100 light:text-gray-900">
                              {q.course}
                            </p>

                            <p className="text-xs text-slate-500 light:text-gray-400 mt-1">
                              Course
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* QUIZ */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200 light:text-gray-800">
                            {q.quiz}
                          </span>

                        </div>

                      </td>

                      {/* DURATION */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-slate-400 light:text-gray-500">

                          <span>
                            {q.duration}
                          </span>

                        </div>

                      </td>

                      {/* PASSING SCORE */}
                      <td className="px-6 py-5">

                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800 light:bg-gray-100 text-slate-300 light:text-gray-600 text-xs font-medium">
                          {q.passingScore}
                        </span>

                      </td>

                      {/* BEST SCORE */}
                      <td className="px-6 py-5">

                        {q.bestScore !== null ? (

                          <div className="flex items-center gap-2">

                            <span
                              className={`
                                inline-flex items-center
                                px-2.5 py-1 rounded-lg
                                text-xs font-semibold
                                ${
                                  passed
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-red-500/10 text-red-400"
                                }
                              `}
                            >
                              {q.bestScore}%
                            </span>

                            <span className="text-xs text-slate-500">
                              {passed
                                ? "Passed"
                                : "Not passed"}
                            </span>

                          </div>

                        ) : (

                          <span className="text-slate-500 light:text-gray-400">
                            —
                          </span>

                        )}

                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-5 text-right">

                        <button
                          onClick={() =>
                            navigate(`/quiz/${q._id}`)
                          }
                          className="
                            inline-flex items-center gap-2
                            text-xs font-medium
                            rounded-xl px-4 py-2.5
                            bg-blue-500
                            hover:bg-blue-600
                            text-white
                            shadow-lg shadow-blue-500/10
                            transition-all duration-200
                          "
                        >
                          Start
                        </button>

                      </td>

                    </tr>
                  );
                })

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