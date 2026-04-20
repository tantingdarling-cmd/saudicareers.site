import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import PageLoader from './components/PageLoader.jsx'
import AnalyticsHead from './components/AnalyticsHead.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const Home           = lazy(() => import('./pages/Home.jsx'))
const JobDetail      = lazy(() => import('./pages/JobDetail.jsx'))
const TipDetail      = lazy(() => import('./pages/TipDetail.jsx'))
const Tips           = lazy(() => import('./pages/Tips.jsx'))
const Admin          = lazy(() => import('./pages/Admin.jsx'))
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer.jsx'))
const ResumeResults  = lazy(() => import('./pages/ResumeResults.jsx'))
const Privacy           = lazy(() => import('./pages/Privacy.jsx'))
const Terms             = lazy(() => import('./pages/Terms.jsx'))
const TrackApplication  = lazy(() => import('./pages/TrackApplication.jsx'))
const SavedJobs         = lazy(() => import('./pages/SavedJobs.jsx'))
const Alerts            = lazy(() => import('./pages/Alerts.jsx'))
const Profile           = lazy(() => import('./pages/Profile.jsx'))
const MyApplications      = lazy(() => import('./pages/MyApplications.jsx'))
const EmployerDashboard   = lazy(() => import('./pages/EmployerDashboard.jsx'))
const EmployerApplicants  = lazy(() => import('./pages/EmployerApplicants.jsx'))
const CompanyProfile      = lazy(() => import('./pages/CompanyProfile.jsx'))
const Login               = lazy(() => import('./pages/Login.jsx'))
const Register            = lazy(() => import('./pages/Register.jsx'))
const SalaryInsights      = lazy(() => import('./pages/SalaryInsights.jsx'))
const ResumeBuilder       = lazy(() => import('./pages/ResumeBuilder.jsx'))
const ResumeDashboard     = lazy(() => import('./pages/ResumeDashboard.jsx'))
const Notifications       = lazy(() => import('./pages/Notifications.jsx'))

export default function App() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref && !localStorage.getItem(`ref_${ref}`)) {
      localStorage.setItem(`ref_${ref}`, '1')
      fetch(`/api/v1/referral/${ref}`, { method: 'POST' }).catch(() => {})
    }
  }, [])

  return (
    <BrowserRouter>
      <AnalyticsHead />
      <Navbar />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/jobs/:id"   element={<JobDetail />} />
            <Route path="/tips"        element={<Tips />} />
            <Route path="/tips/:slug" element={<TipDetail />} />
            <Route path="/admin"                element={<Admin />} />
            <Route path="/login"               element={<Login />} />
            <Route path="/register"            element={<Register />} />
            <Route path="/resume-analyzer"     element={<ResumeAnalyzer />} />
            <Route path="/resume-results/:id"  element={<ResumeResults />} />
            <Route path="/privacy"             element={<Privacy />} />
            <Route path="/terms"               element={<Terms />} />
            <Route path="/track/:token"        element={<TrackApplication />} />
            <Route path="/company/:slug"       element={<CompanyProfile />} />
            <Route path="/salary-insights"     element={<SalaryInsights />} />
            <Route path="/resume/editor"       element={<ResumeBuilder />} />
            <Route path="/dashboard/resumes"   element={<ProtectedRoute><ResumeDashboard /></ProtectedRoute>} />
            <Route path="/notifications"       element={<Notifications />} />
            <Route path="/saved"               element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
            <Route path="/alerts"              element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/profile"             element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-applications"     element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
            <Route path="/employer/dashboard"            element={<ProtectedRoute><EmployerDashboard /></ProtectedRoute>} />
            <Route path="/employer/jobs/:id/applicants"  element={<ProtectedRoute><EmployerApplicants /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
