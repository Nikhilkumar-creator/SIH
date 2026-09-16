import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthProvider';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Repository } from './pages/Repository';
import { Articles } from './pages/Articles';
import { ArticleDetail } from './pages/ArticleDetail';
import { Expeditions } from './pages/Expeditions';
import { ExpeditionDetail } from './pages/ExpeditionDetail';
import { UploadPage } from './pages/Upload';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { ProtectedRoute } from './lib/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/repository" element={<Repository />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/expeditions" element={<Expeditions />} />
              <Route path="/expeditions/:id" element={<ExpeditionDetail />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Ingestion Studio (Researcher, Editor, Admin) */}
              <Route
                path="/upload"
                element={
                  <ProtectedRoute allowedRoles={['researcher', 'editor', 'admin']}>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Editorial Console (Editor, Admin) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['editor', 'admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
