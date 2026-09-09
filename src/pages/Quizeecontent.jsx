import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [answers, setAnswers] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finalScore, setFinalScore] = useState(null);
  const [bestScore, setBestScore] = useState(null);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);

    try {
      const [quizRes, questionsRes, attemptRes] = await Promise.all([
        api.get(`/quizzes/${id}`),
        api.get(`/quizzes/${id}/questions`),
        api.post(`/quiz-attempts/start/${id}`),
      ]);

      setQuiz(quizRes.data?.data);
      setQuestions(questionsRes.data?.data || []);
      setAttemptId(attemptRes.data?.data?._id);
    } catch (err) {
      console.error(
        err.response?.data?.message || "Failed to load quiz"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const progress =
    questions.length > 0
      ? ((currentIndex + 1) / questions.length) * 100
      : 0;

  const handleNext = async () => {
    if (!selectedChoiceId || submitting) return;

    const newAnswer = {
      questionId: currentQuestion._id,
      selectedChoiceId,
    };

    const updatedAnswers = [...answers, newAnswer];

    setAnswers(updatedAnswers);
    setSelectedChoiceId(null);

    if (isLastQuestion) {
      await handleSubmit(updatedAnswers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    try {
      setSubmitting(true);

      const res = await api.post(
        `/quiz-attempts/${attemptId}/submit`,
        {
          answers: finalAnswers,
        }
      );

      setFinalScore(res.data?.score ?? 0);

      const bestRes = await api.get(`/quiz-attempts/best/${id}`);

      setBestScore(
        bestRes.data?.data?.bestScore ?? null
      );
    } catch (error) {
      console.error(
        "Error submitting quiz:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Unable to submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 light:bg-gray-50 p-6 md:p-10">
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">

          <div className="h-4 w-20 bg-slate-800 light:bg-gray-200 rounded" />

          <div className="h-8 w-72 bg-slate-800 light:bg-gray-200 rounded" />

          <div className="h-2 bg-slate-800 light:bg-gray-200 rounded-full" />

          <div className="h-96 bg-slate-800 light:bg-gray-200 rounded-2xl" />

        </div>
      </div>
    );
  }

  /* =========================
     QUIZ NOT FOUND
  ========================= */

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-950 light:bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">

          <div className="w-16 h-16 rounded-2xl bg-slate-800 light:bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>

          <h2 className="text-xl font-semibold text-slate-100 light:text-gray-900">
            Quiz not found
          </h2>

          <p className="text-sm text-slate-500 light:text-gray-400 mt-2">
            This quiz may no longer be available.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition"
          >
            Back to Quizzes
          </button>

        </div>
      </div>
    );
  }

  /* =========================
     RESULT
  ========================= */

  if (finalScore !== null) {
    const passed =
      quiz.passingScore != null &&
      finalScore >= quiz.passingScore;

    const isNewBest =
      bestScore !== null &&
      finalScore >= bestScore;

    return (
      <div className="min-h-screen bg-slate-950 light:bg-gray-50 p-6 md:p-10">

        <div className="max-w-xl mx-auto">

          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-400 light:text-gray-500 hover:text-blue-400 transition mb-8"
          >
             Back to Quizzes
          </button>

          <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-3xl p-8 md:p-10 text-center shadow-2xl">

            <div
              className={`
                w-20 h-20 rounded-full mx-auto
                flex items-center justify-center
                mb-6
                ${
                  passed
                    ? "bg-emerald-500/10"
                    : "bg-red-500/10"
                }
              `}
            >
              <span className="text-4xl">
                {passed ? "✓" : "!"}
              </span>
            </div>

            <p className="text-xs tracking-[0.2em] uppercase text-blue-400 mb-2">
              Quiz Completed
            </p>

            <h1 className="text-2xl font-bold text-slate-100 light:text-gray-900">
              {quiz.title}
            </h1>

            <p className="text-sm text-slate-500 light:text-gray-400 mt-2">
              Here is your final result.
            </p>

            {/* SCORE */}
            <div className="mt-8">

              <p className="text-sm text-slate-500 light:text-gray-400">
                Your Score
              </p>

              <p
                className={`
                  text-6xl font-bold mt-2
                  ${
                    passed
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                `}
              >
                {finalScore}%
              </p>

            </div>

            {/* STATUS */}
            <div
              className={`
                mt-6 inline-flex items-center gap-2
                px-4 py-2 rounded-full
                text-sm font-semibold
                ${
                  passed
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }
              `}
            >

              {passed ? "Passed" : "Not Passed"}
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-2 gap-4 mt-8">

              <div className="rounded-xl bg-slate-800/60 light:bg-gray-50 p-4">
                <p className="text-xs text-slate-500 light:text-gray-400">
                  Passing Score
                </p>

                <p className="text-lg font-bold text-slate-200 light:text-gray-900 mt-1">
                  {quiz.passingScore ?? "—"}%
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/60 light:bg-gray-50 p-4">
                <p className="text-xs text-slate-500 light:text-gray-400">
                  Best Score
                </p>

                <p className="text-lg font-bold text-slate-200 light:text-gray-900 mt-1">
                  {bestScore !== null
                    ? `${bestScore}%`
                    : "—"}
                </p>
              </div>

            </div>

            {/* BEST SCORE MESSAGE */}
            {bestScore !== null && (
              <p className="text-xs text-slate-500 light:text-gray-400 mt-6">

                {finalScore === bestScore &&
                finalScore > 0
                  ? " This matches your best score!"
                  : finalScore > bestScore
                  ? " New best score!"
                  : `Your best score is ${bestScore}%.`}

              </p>
            )}

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">

              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-5 py-3 rounded-xl
                  bg-blue-500 hover:bg-blue-600
                  text-white text-sm font-semibold
                  transition"
              >
                Back to Quizzes
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-5 py-3 rounded-xl
                  bg-slate-800 hover:bg-slate-700
                  light:bg-gray-100 light:hover:bg-gray-200
                  text-slate-200 light:text-gray-700
                  text-sm font-semibold
                  transition"
              >
                Try Again
              </button>

            </div>

          </div>

        </div>
      </div>
    );
  }

  /* =========================
     NO QUESTIONS
  ========================= */

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-950 light:bg-gray-50 flex items-center justify-center p-6">

        <div className="text-center">

          

          <h2 className="text-xl font-semibold text-slate-100 light:text-gray-900">
            No questions available
          </h2>

          <p className="text-sm text-slate-500 light:text-gray-400 mt-2">
            This quiz does not contain any questions yet.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
          >
            Back
          </button>

        </div>

      </div>
    );
  }

  /* =========================
     QUIZ
  ========================= */

  return (
    <div className="min-h-screen bg-slate-950 light:bg-gray-50 p-6 md:p-10">

      <div className="max-w-3xl mx-auto">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6">

          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-400 light:text-gray-500 hover:text-blue-400 transition"
          >
             Back
          </button>

          <span className="text-xs font-medium text-slate-500 light:text-gray-400">
            {currentIndex + 1} / {questions.length}
          </span>

        </div>

        {/* QUIZ TITLE */}
        <div className="mb-6">

          <p className="text-xs tracking-[0.2em] text-blue-400 uppercase mb-2">
            {quiz.title}
          </p>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 light:text-gray-900">
            Test your knowledge
          </h1>

        </div>

       


        {/* QUESTION CARD */}
        <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-3xl shadow-2xl overflow-hidden">

          {/* QUESTION HEADER */}
          <div className="px-6 md:px-8 pt-7">

            <div className="flex items-center gap-2 mb-5">

              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold">
                {currentIndex + 1}
              </span>

              <span className="text-xs font-medium text-slate-500 light:text-gray-400">
                Question {currentIndex + 1}
              </span>

            </div>

            <h2 className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-100 light:text-gray-900">
              {currentQuestion.statement}
            </h2>

          </div>

          {/* ANSWERS */}
          <div className="p-6 md:p-8 space-y-3">

            {currentQuestion.choices.map((choice, index) => {

              const selected =
                selectedChoiceId === choice._id;

              return (
                <button
                  key={choice._id}
                  onClick={() =>
                    setSelectedChoiceId(choice._id)
                  }
                  className={`
                    w-full text-left
                    p-4 rounded-xl
                    border
                    transition-all duration-200
                    flex items-center gap-4
                    ${
                      selected
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/5"
                        : "border-slate-800 light:border-gray-200 bg-slate-950/30 light:bg-gray-50 hover:border-slate-600 light:hover:border-gray-300 hover:bg-slate-800/60 light:hover:bg-gray-100"
                    }
                  `}
                >

                  <span
                    className={`
                      flex-shrink-0
                      w-9 h-9
                      rounded-lg
                      flex items-center justify-center
                      text-sm font-semibold
                      ${
                        selected
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 light:bg-white border border-slate-700 light:border-gray-200 text-slate-400 light:text-gray-500"
                      }
                    `}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span
                    className={`
                      text-sm md:text-base
                      ${
                        selected
                          ? "text-blue-400 font-medium"
                          : "text-slate-300 light:text-gray-700"
                      }
                    `}
                  >
                    {choice.text}
                  </span>

                  

                </button>
              );
            })}

          </div>

          {/* FOOTER */}
          <div className="px-6 md:px-8 py-5 border-t border-slate-800 light:border-gray-200 flex items-center justify-between gap-4">

            <p className="text-xs text-slate-500 light:text-gray-400">
              Select one answer
            </p>

            <button
              onClick={handleNext}
              disabled={!selectedChoiceId || submitting}
              className="
                inline-flex items-center gap-2
                px-5 py-2.5
                rounded-xl
                bg-blue-500
                hover:bg-blue-600
                disabled:opacity-40
                disabled:cursor-not-allowed
                text-white
                text-sm font-semibold
                transition
              "
            >
              {submitting
                ? "Submitting..."
                : isLastQuestion
                ? "Submit Quiz"
                : "Next Question"}


            </button>

          </div>

        </div>

      </div>

    </div>
  );
}