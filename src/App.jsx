import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Loginpage';
import Signuppage from './pages/Signuppage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/Teacherdashboard';
import Studentdashboard from './pages/Studentdashboard';
import StudentQuizzes from './pages/Studentquizzes';
import Admincourses from "./pages/AdminCourse";
import AdminListUser from "./pages/AdminListUser";
import AdminListquizze from "./pages/Adminquizzes";
import TeacherListquizze from "./pages/Teacherlistquiz";
import AdminListstudent from "./pages/Adminliststudent";
import Teacherstudent from "./pages/Teacherpagestudent";
import Analyticdashbord from "./pages/AnalyticsDashboard";
import Studentanalitycs from "./pages/AnalytcStudent";
import CourseContent from "./pages/Coursecontent";
import QuizPage from "./pages/Quizeecontent";
import Certificates from './pages/Certificat';
import SettingsPage from './pages/SettingsPage';
import AssignStudentInfo from './pages/Assignstudentinfo';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/unauthorized" element={<p className="p-10">Not authorized.</p>} />

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<Admincourses />} />
            <Route path="/admin/users" element={<AdminListUser />} />
            <Route path="/admin/quizzes" element={<AdminListquizze />} />
            <Route path="/admin/students" element={<AdminListstudent />} />
            <Route path="/admin/analytics" element={<Analyticdashbord />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/assign" element={<AssignStudentInfo />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['teacher', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/quizzes" element={<TeacherListquizze />} />
            <Route path="/teacher/students" element={<Teacherstudent />} />
            <Route path="/teacher/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student" element={<Studentdashboard />} />
          <Route path="/student/quizzes" element={<StudentQuizzes />} />
          <Route path="/student/progress" element={<Studentanalitycs />} />
          <Route path="/student/courses/:id" element={<CourseContent />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path='student/certificates' element={<Certificates/>}/>
          <Route path='student/settings' element={<SettingsPage/>}/>
        </Route>
      </Route>
        <Route path="/Signuppage" element={<Signuppage />} />
        <Route path="*" element={<Signuppage />} />
      </Routes>
    </BrowserRouter>
  );
}
