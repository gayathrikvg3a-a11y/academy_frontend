import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { ThemeProvider } from "@/app/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Enquiries from "./pages/Enquiries";
import Students from "./pages/Students";
import CourseProgress from "./pages/CourseProgress";
import Courses from "./pages/Courses";
import CourseView from "./pages/CourseView";
import CourseCategories from "./pages/CourseCategories";
import Batches from "./pages/Batches";
import BatchView from "./pages/BatchView";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import LifeAtCignes from "./pages/LifeAtCignes";
import InternshipPhotos from "./pages/InternshipPhotos";
import ContactInformation from "./pages/ContactInformation";
import Banners from "./pages/Banners";
import Blogs from "./pages/Blogs";
import CaseStudies from "./pages/CaseStudies";
import Testimonials from "./pages/Testimonials";
import WebsiteEnquiries from "./pages/WebsiteEnquiries";
import Internships from "./pages/Internships";
import Vacancies from "./pages/Vacancies";
import Payments from "./pages/Payments";
import Staff from "./pages/Staff";
import Announcements from "./pages/Announcements";
import PaymentTypes from "./pages/PaymentTypes";
import Layout from "./components/Layout";

import {
  academicInternshipApi,
  industryInternshipApi,
} from "./api/internshipPhotoApi";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <BrowserRouter basename="/admin">
        <Routes>

          {/* Public Route */}
          <Route
            path="/"
            element={<Login />}
          />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Enquiries */}
            <Route
              path="/enquiries"
              element={<Enquiries />}
            />

            <Route
              path="/website-enquiries"
              element={<WebsiteEnquiries />}
            />

            {/* Students */}
            <Route
              path="/students"
              element={<Students />}
            />

            <Route
              path="/students/:id/progress"
              element={<CourseProgress />}
            />

            {/* Course Module */}
            <Route
              path="/courses"
              element={<Courses />}
            />

            <Route
              path="/courses/:id"
              element={<CourseView />}
            />

            <Route
              path="/course-categories"
              element={<CourseCategories />}
            />

            {/* Events Module */}
            <Route
              path="/events"
              element={<Events />}
            />

            <Route
              path="/gallery"
              element={<Gallery />}
            />

            <Route
              path="/payment-type"
              element={<PaymentTypes />}
            />

            <Route
              path="/life-at-cignes"
              element={<LifeAtCignes />}
            />

            {/* Keyed so going from one to the other starts afresh rather than
                keeping the other one's photos. */}
            <Route
              path="/academic-internships"
              element={
                <InternshipPhotos
                  key="academic"
                  program="Academic Internship"
                  api={academicInternshipApi}
                />
              }
            />

            <Route
              path="/industry-internships"
              element={
                <InternshipPhotos
                  key="industry"
                  program="Industry Internship"
                  api={industryInternshipApi}
                />
              }
            />

            <Route
              path="/contact-information"
              element={<ContactInformation />}
            />

            <Route
              path="/banners"
              element={<Banners />}
            />

            <Route
              path="/blogs"
              element={<Blogs />}
            />

            <Route
              path="/case-studies"
              element={<CaseStudies />}
            />

            <Route
              path="/testimonials"
              element={<Testimonials />}
            />

            <Route
              path="/internships"
              element={<Internships />}
            />

            {/* Announcements */}
            <Route
              path="/announcements"
              element={<Announcements />}
            />

            {/* Careers */}
            <Route
              path="/vacancies"
              element={<Vacancies />}
            />

            <Route
              path="/payments"
              element={<Payments />}
            />

            {/* Team */}
            <Route
              path="/staff"
              element={<Staff />}
            />

            {/* Batch Module */}
            <Route
              path="/batches"
              element={<Batches />}
            />

            <Route
              path="/batches/:id"
              element={<BatchView />}
            />
          </Route>

          {/* Unknown Route */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />

        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}

export default App;
