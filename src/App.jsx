import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import PageLoader from './components/PageLoader.jsx'
import AnalyticsHead from './components/AnalyticsHead.jsx'

// §8: Code-split each page into its own async chunk.
// Vite will emit separate files: Home-[hash].js, JobDetail-[hash].js, etc.
// Only the chunk for the current route is downloaded by the browser.
const Home           = lazy(() => import('./pages/Home.jsx'))
const JobDetail      = lazy(() => import('./pages/JobDetail.jsx'))
const TipDetail      = lazy(() => import('./pages/TipDetail.jsx'))
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
const CompanyProfile      = lazy(() => import('./pages/CompanyProfile.jsx'))

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsHead />
      <Navbar />
      <main>
        {/* §2: All 4 routes preserved exactly — paths, params, components unchanged */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/jobs/:id"   element={<JobDetail />} />
            <Route path="/tips/:slug" element={<TipDetail />} />
            <Route path="/admin"                element={<Admin />} />
            <Route path="/resume-analyzer"     element={<ResumeAnalyzer />} />
            <Route path="/resume-results/:id"  element={<ResumeResults />} />
            <Route path="/privacy"             element={<Privacy />} />
            <Route path="/terms"               element={<Terms />} />
            <Route path="/track/:token"        element={<TrackApplication />} />
            <Route path="/saved"               element={<SavedJobs />} />
            <Route path="/alerts"              element={<Alerts />} />
            <Route path="/profile"             element={<Profile />} />
            <Route path="/my-applications"       element={<MyApplications />} />
            <Route path="/employer/dashboard"   element={<EmployerDashboard />} />
            <Route path="/company/:slug"        element={<CompanyProfile />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
