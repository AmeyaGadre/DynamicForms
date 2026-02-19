import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import FormBuilder from './pages/FormBuilder';
import MyForms from './pages/MyForms';
import FormAccessManager from './pages/FormAccessManager';
import FormSubmission from './pages/FormSubmission';
import FormResponses from './pages/FormResponses';


import Navbar from './components/Navbar';


const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !user.is_admin) return <Navigate to="/" />;

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />

      <Route path="/" element={
        <ProtectedRoute>
          <LandingPage />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />


      <Route path="/forms" element={
        <ProtectedRoute adminOnly={true}>
          <MyForms />
        </ProtectedRoute>
      } />


      <Route path="/forms/new" element={
        <ProtectedRoute adminOnly={true}>
          <FormBuilder />
        </ProtectedRoute>
      } />


      <Route path="/forms/edit/:id" element={
        <ProtectedRoute adminOnly={true}>
          <FormBuilder />
        </ProtectedRoute>
      } />

      <Route path="/forms/access/:id" element={
        <ProtectedRoute adminOnly={true}>
          <FormAccessManager />
        </ProtectedRoute>
      } />

      <Route path="/fill/:id" element={
        <ProtectedRoute>
          <FormSubmission />
        </ProtectedRoute>
      } />

      <Route path="/responses/:id" element={
        <ProtectedRoute>
          <FormResponses />
        </ProtectedRoute>
      } />



      <Route path="/admin" element={

        <ProtectedRoute adminOnly={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}



export default App;
