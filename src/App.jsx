import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './index.css';
import AuthRedirect from './pages/AuthRedirect';
import EmailVerification from './components/EmailVerification';
import Login from "./pages/Login";
import Signup from "./pages/signup";
import CandidateProfile from "./pages/CandidateProfile";
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/auth-redirect" element={<AuthRedirect />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ Only keep the dynamic route for individual candidate profile */}
        <Route path="/candidate-profile/:id" element={<CandidateProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
