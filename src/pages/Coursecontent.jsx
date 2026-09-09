import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
 
  const pattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(pattern);
 
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
export default function CourseContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);

  const [openModuleId, setOpenModuleId] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  const [completedLessons, setCompletedLessons] = useState([]);
  const [courseCompleted, setCourseCompleted] = useState(false);

  const [completing, setCompleting] = useState(false);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD COURSE + MODULES + LESSONS
  // =========================================================
  const fetchProgress = useCallback(async () => {
  try {
    const res = await api.get(`/progress/course/${id}`);

    const data = res.data?.data;

    setCompletedLessons(data?.completedLessons || []);

    setCourseCompleted(
      data?.courseCompleted === true
    );

  } catch (error) {
    console.error(
      'Error loading progress:',
      error.response?.data || error.message
    );
  }
}, [id]);
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);

      // Course
      const courseRes = await api.get(`/cours/${id}`);

      // Modules
      const modulesRes = await api.get(`/modules/course/${id}`);

      const courseData = courseRes.data?.data;
      const modulesData = modulesRes.data?.data || [];

      // Get lessons for every module
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (module) => {
          const lessonsRes = await api.get(
            `/modules/${module._id}/lessons`
          );

          return {
            ...module,
            lessons: lessonsRes.data?.data || []
          };
        })
      );

      // tartib modules
      modulesWithLessons.sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

      // tartib lessons
      modulesWithLessons.forEach((module) => {
        module.lessons.sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
      });

      setCourse(courseData);
      setModules(modulesWithLessons);

      // Open first module
      if (modulesWithLessons.length > 0) {
        const firstModule = modulesWithLessons[0];

        setOpenModuleId(firstModule._id);

        // Select first lesson
        if (firstModule.lessons.length > 0) {
          setActiveLesson(firstModule.lessons[0]);
        }
      }
    } catch (error) {
      console.error(
        'Error loading course:',
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
  fetchContent();
  fetchProgress();
}, [fetchContent, fetchProgress]);

  // =========================================================
  // COMPLETE LESSON
  // =========================================================

  const handleCompleteLesson = async () => {
    if (!activeLesson || completing) return;

    // Already completed
    if (completedLessons.includes(activeLesson._id)) {
      return;
    }

    try {
      setCompleting(true);

      const res = await api.post(
        `/progress/lesson/${activeLesson._id}/complete`
      );

      console.log('Lesson completed:', res.data);

      // Add lesson to completed lessons
      setCompletedLessons((prev) => {
        if (prev.includes(activeLesson._id)) {
          return prev;
        }

        return [...prev, activeLesson._id];
      });

      // Backend tells us if the whole course is completed
      if (res.data?.data?.courseCompleted === true) {
        setCourseCompleted(true);
      }

    } catch (error) {
      console.error(
        'Error completing lesson:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        'Unable to mark lesson as completed.'
      );
    } finally {
      setCompleting(false);
    }
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="p-10">
        <p className="text-slate-400 light:text-gray-500">
          Chargement...
        </p>
      </div>
    );
  }

  // =========================================================
  // COURSE NOT FOUND
  // =========================================================

  if (!course) {
    return (
      <div className="p-10">
        <p className="text-slate-400 light:text-gray-500">
          Course not found.
        </p>
      </div>
    );
  }
  const activeEmbedUrl = getYouTubeEmbedUrl(activeLesson?.videoUrl);
  const isDirectVideo = activeLesson?.videoUrl && !activeEmbedUrl;
  // =========================================================
  // PAGE
  // =========================================================

return (
  <div className="p-6">
    <button
      onClick={() => navigate('/student')}
      className="text-xs text-blue-400 hover:text-blue-300 mb-4"
    >
       Back to dashboard
    </button>

    <p className="text-[10px] tracking-widest text-blue-400 uppercase mb-1">
      Course
    </p>

    <h1 className="text-2xl font-bold text-slate-100 light:text-gray-900 mb-8">
      {course.title}
    </h1>

    {courseCompleted && (
      <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
         Congratulations! You completed this course.
      </div>
    )}

    <div className="grid grid-cols-[280px_1fr] gap-6">

      {/* Modules & Lessons Sidebar */}
      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl overflow-hidden self-start">

        {modules.length === 0 ? (
          <p className="p-4 text-sm text-slate-500 light:text-gray-400">
            No modules yet
          </p>
        ) : (
          modules.map((m) => (
            <div
              key={m._id}
              className="border-b border-slate-800 light:border-gray-200 last:border-0"
            >
              {/* Module */}
              <button
                onClick={() =>
                  setOpenModuleId(
                    openModuleId === m._id ? null : m._id
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-100 light:text-gray-900 hover:bg-slate-800/50 light:hover:bg-gray-50"
              >
                <span>{m.title}</span>

                
              </button>

              {/* Lessons */}
              {openModuleId === m._id && (
                <div className="pb-2">

                  {m.lessons.length === 0 ? (
                    <p className="px-4 py-2 text-xs text-slate-500 light:text-gray-400">
                      No lessons yet
                    </p>
                  ) : (
                    m.lessons.map((l) => {
                      const isCompleted =
                        completedLessons.includes(l._id);

                      return (
                        <button
                          key={l._id}
                          onClick={() => setActiveLesson(l)}
                          className={`w-full text-left px-6 py-2 text-xs flex items-center gap-2 ${
                            activeLesson?._id === l._id
                              ? 'text-blue-400 bg-blue-500/10'
                              : 'text-slate-400 light:text-gray-500 hover:bg-slate-800/50 light:hover:bg-gray-50'
                          }`}
                        >
                          <span>
                            {isCompleted ? '✓' : 'O'}
                          </span>
                          
                          <span className="flex-1">
                            {l.title}
                          </span>

                        </button>
                      );
                    })
                  )}

                </div>
              )}
            </div>
          ))
        )}

      </div>

      {/* Active Lesson Content */}
      <div className="bg-slate-900 light:bg-white border border-slate-800 light:border-gray-200 rounded-xl p-6">

        {!activeLesson ? (
          <p className="text-sm text-slate-500 light:text-gray-400">
            Select a lesson to begin.
          </p>
        ) : (
          <div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-slate-100 light:text-gray-900">
                {activeLesson.title}
              </h2>

              {completedLessons.includes(activeLesson._id) && (
                <span className="text-xs text-green-400 whitespace-nowrap">
                   Completed
                </span>
              )}
            </div>

            {activeEmbedUrl && (
                <div className="mb-4 rounded-lg overflow-hidden aspect-video bg-black">
                  <iframe
                    className="w-full h-full"
                    src={activeEmbedUrl}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
 
              {isDirectVideo && (
                <video
                  key={activeLesson._id}
                  src={activeLesson.videoUrl}
                  controls
                  className="w-full rounded-lg mb-4 bg-black"
                />
              )}

            {/* PDF */}
            {activeLesson.pdfUrl && (
              <a
                href={activeLesson.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 mb-4"
              >
                Open PDF
              </a>
            )}

            {/* Lesson Content */}
            {activeLesson.content && (
              <div
                className="prose prose-invert light:prose-slate max-w-none text-sm text-slate-300 light:text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: activeLesson.content
                }}
              />
            )}

            {/* Complete Lesson Button */}
            <div className="mt-8 pt-5 border-t border-slate-800 light:border-gray-200">

              {completedLessons.includes(activeLesson._id) ? (
                <button
                  disabled
                  className="px-4 py-2 rounded-lg text-sm bg-green-500/20 text-green-400 cursor-default"
                >
                   Lesson Completed
                </button>
              ) : (
                <button
                  onClick={handleCompleteLesson}
                  disabled={completing}
                  className="px-4 py-2 rounded-lg text-sm bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  {completing
                    ? 'Completing...'
                    : 'Mark as Completed'}
                </button>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  </div>
)}