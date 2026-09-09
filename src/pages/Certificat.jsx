
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(null);
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const MIN_CERTIFICATE_GRADE = 50;

  const fetchCertificates = async () => {
    try {
      const res = await api.get("/certificates/mine");

      const allCertificates =
        res.data.data.certificates || [];

      // Only show certificates with grade >= 50
      const eligibleCertificates = allCertificates.filter(
        (certificate) =>
          Number(certificate.grade || 0) >=
          MIN_CERTIFICATE_GRADE
      );

      setCertificates(eligibleCertificates);
    } catch (error) {
      console.error(
        "Error fetching certificates:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to load your certificates."
      );
    }
  };

  const autoCheckEligibleCourses = async () => {
    try {
      const res = await api.get(
        "/cours/inscriptions/mine"
      );

      const completedInscriptions = (
        res.data.data.inscriptions || []
      ).filter(
        (inscription) =>
          inscription.status === "completed"
      );

      await Promise.all(
        completedInscriptions.map(
          async (inscription) => {
            const courseId =
              inscription.course?._id ||
              inscription.course;

            if (!courseId) return;

            try {
              const certificateRes =
                await api.get(
                  `/certificates/course/${courseId}/check`
                );

              const certificate =
                certificateRes.data.data?.certificate;

              if (
                certificate &&
                Number(certificate.grade || 0) <
                  MIN_CERTIFICATE_GRADE
              ) {
                console.log(
                  `Certificate for course ${courseId} has grade below ${MIN_CERTIFICATE_GRADE}%.`
                );
              }
            } catch (error) {
              console.error(
                `Error checking certificate for course ${courseId}:`,
                error
              );
            }
          }
        )
      );
    } catch (error) {
      console.error(
        "Error auto-checking certificates:",
        error
      );
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      await autoCheckEligibleCourses();
      await fetchCertificates();

      setLoading(false);
    };

    init();
  }, []);

  const checkCertificate = async (courseId) => {
    try {
      setChecking(courseId);
      setMessage("");

      const res = await api.get(
        `/certificates/course/${courseId}/check`
      );

      const certificate =
        res.data.data?.certificate;

      if (
        certificate &&
        Number(certificate.grade || 0) <
          MIN_CERTIFICATE_GRADE
      ) {
        setMessage(
          `Certificate not available. You need a grade of at least ${MIN_CERTIFICATE_GRADE}%. Your current grade is ${Math.round(
            Number(certificate.grade || 0)
          )}%.`
        );

        return;
      }

      if (res.data.data?.eligible === false) {
        setMessage(
          "You have not completed this course yet."
        );

        return;
      }


      setMessage(
        res.data.message ||
          "Certificate issued successfully!"
      );

      await fetchCertificates();
    } catch (error) {
      console.error(
        "Error checking certificate:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to check certificate eligibility."
      );
    } finally {
      setChecking(null);
    }
  };

  const downloadCertificate = async (
    certificateId
  ) => {
    try {
      const response = await api.get(
        `/certificates/${certificateId}/download`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `certificate-${certificateId}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Download error:",
        error
      );

      setMessage(
        "Unable to download certificate."
      );
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setMessage("");

      await autoCheckEligibleCourses();
      await fetchCertificates();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Loading certificates...
        </p>
      </div>
    );
  }


  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Certificates
          </h1>

          <p className="mt-2 text-gray-500">
            View and download your course completion certificates.(You must first pass the course quizzes.)
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {refreshing
            ? "Checking..."
            : "Refresh"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700">
          {message}
        </div>
      )}

      {/* No eligible certificates */}
      {certificates.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">

          <div className="mb-4 text-5xl">
            🎓
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            No certificates yet
          </h2>

          <p className="mt-2 text-gray-500">
            Complete your courses and achieve at least{" "}
            {MIN_CERTIFICATE_GRADE}% to earn a certificate.
          </p>

        </div>
      ) : (

        /* Certificates */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {certificates.map(
            (certificate) => (
              <div
                key={certificate._id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >

                {/* Certificate header */}
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-center">

                  <h2 className="mt-2 text-xl font-bold text-white">
                    Certificate of Completion
                  </h2>

                </div>

                {/* Certificate information */}
                <div className="p-6">

                  <p className="text-sm text-gray-500">
                    Course
                  </p>

                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    {certificate.course?.title ||
                      "Unknown Course"}
                  </h3>

                  <div className="space-y-3 text-sm">

                    {/* Grade */}
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Grade
                      </span>

                      <span className="font-semibold text-gray-900">
                        {Math.round(
                          Number(
                            certificate.grade || 0
                          )
                        )}
                        %
                      </span>
                    </div>

                    {/* Issued */}
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Issued
                      </span>

                      <span className="font-medium text-gray-900">
                        {certificate.issuedAt
                          ? new Date(
                              certificate.issuedAt
                            ).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>

                    {/* Certificate ID */}
                    <div>
                      <p className="text-gray-500">
                        Certificate ID
                      </p>

                      <p className="mt-1 break-all text-xs text-gray-700">
                        {
                          certificate.certificateId
                        }
                      </p>
                    </div>

                  </div>

                  {/* Download */}
                  <button
                    onClick={() =>
                      downloadCertificate(
                        certificate._id
                      )
                    }
                    className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800"
                  >
                    Download Certificate
                  </button>

                </div>
              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

