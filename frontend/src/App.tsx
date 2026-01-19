import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { LoginPage } from './pages/login';
import { InterviewPage } from './pages/interviews';
import { FeedbackPage } from './pages/fedback';
import { HistoryPage } from './pages/history';
import { InterviewDetailPage } from './pages/interviewdetailed';
import { AuthedPage } from './components/authPage';
import { HomePage } from './pages/home';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Root: send users to home; ProtectedRoute will redirect to /login */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/home"
          element={
            <AuthedPage>
              <HomePage />
            </AuthedPage>
          }
        />

        <Route
          path="/interview"
          element={
            <AuthedPage>
              <InterviewPage />
            </AuthedPage>
          }
        />

        <Route
          path="/feedback/:id"
          element={
            <AuthedPage>
              <FeedbackPage />
            </AuthedPage>
          }
        />

        <Route
          path="/history"
          element={
            <AuthedPage>
              <HistoryPage />
            </AuthedPage>
          }
        />

        <Route
          path="/history/:id"
          element={
            <AuthedPage>
              <InterviewDetailPage />
            </AuthedPage>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  );
}