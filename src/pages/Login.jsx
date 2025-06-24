import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import config from '../config.js';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formAnimating, setFormAnimating] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Use consistent backend URL
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';


  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});

  // Check for messages from other components but don't auto-login
  useEffect(() => {
    if (location.state?.message) {
      setMessage({
        type: location.state.type || 'info',
        text: location.state.message
      });
      
      if (location.state.email) {
        setFormData(prev => ({
          ...prev,
          email: location.state.email
        }));
      }

      navigate(location.pathname, { replace: true });
    }

    // Animation trigger
    setFormAnimating(true);
    const timer = setTimeout(() => setFormAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password && !forgotPasswordMode) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Utility function to store auth data consistently
  const storeAuthData = (token, user, rememberMe) => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');

    if (rememberMe) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          rememberMe: formData.rememberMe
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        storeAuthData(data.token, data.user, formData.rememberMe);

        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting...'
        });

        setFormAnimating(true);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);

      } else {
        setFormAnimating(true);
        setTimeout(() => setFormAnimating(false), 1000);
        
        setMessage({
          type: 'error',
          text: data.message || 'Login failed. Please check your credentials.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setFormAnimating(true);
      setTimeout(() => {
        window.location.href = `${backendUrl}/api/auth/google`;
      }, 500);
    } catch (error) {
      console.error('Google login error:', error);
      setMessage({
        type: 'error',
        text: 'Google login failed. Please try again.'
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordMode) {
      setForgotPasswordMode(true);
      return;
    }

    if (!formData.email.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter your email address'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({
          type: 'success',
          text: 'Password reset link sent to your email!'
        });
        setForgotPasswordMode(false);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to send reset link. Please try again.'
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-4 sm:p-5 fixed top-0 left-0 overflow-hidden">
      {/* Background Decorative Shapes */}
      <div className="absolute inset-0 pointer-events-none z-1">
        {/* Floating shapes with animations - Reduced number on mobile */}
        {[...Array(window.innerWidth < 768 ? 4 : 8)].map((_, i) => (
          <div 
            key={`shape-${i}`}
            className={`absolute rounded-full opacity-10 ${
              i % 3 === 0 ? 'bg-blue-400' : 
              i % 3 === 1 ? 'bg-yellow-400' : 'bg-sky-300'
            } ${
              i === 0 ? 'w-12 h-12 sm:w-20 sm:h-20 top-[10%] left-[5%] animate-float-6' :
              i === 1 ? 'w-10 h-10 sm:w-16 sm:h-16 top-[20%] right-[10%] animate-float-8-reverse' :
              i === 2 ? 'w-16 h-16 sm:w-24 sm:h-24 bottom-[15%] left-[8%] animate-float-7' :
              i === 3 ? 'w-8 h-8 sm:w-10 sm:h-10 top-[60%] right-[5%] animate-float-5' :
              i === 4 ? 'w-14 h-14 sm:w-18 sm:h-18 top-[5%] left-[50%] animate-float-9-reverse' :
              i === 5 ? 'w-10 h-10 sm:w-12 sm:h-12 bottom-[30%] right-[15%] animate-float-6' :
              i === 6 ? 'w-16 h-16 sm:w-22 sm:h-22 bottom-[5%] left-[60%] animate-float-8-reverse' :
              'w-7 h-7 sm:w-9 sm:h-9 top-[40%] left-[2%] animate-float-7'
            }`}
          />
        ))}
        
        {/* Floating stars - Reduced number on mobile */}
        {[...Array(window.innerWidth < 768 ? 3 : 5)].map((_, i) => (
          <div
            key={`star-${i}`}
            className={`absolute text-lg sm:text-xl text-blue-300/30 animate-twinkle ${
              i === 0 ? 'top-[15%] left-[15%]' :
              i === 1 ? 'top-[25%] right-[20%] delay-1000' :
              i === 2 ? 'bottom-[20%] left-[10%] delay-2000' :
              i === 3 ? 'bottom-[40%] right-[8%] delay-500' :
              'top-[50%] left-[5%] delay-1500'
            }`}
          >
            {i % 2 === 0 ? '✦' : '✧'}
          </div>
        ))}
      </div>

      {/* Header - Responsive Fix */}
      <div className="absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2 z-10 w-full px-4">
        <div className="flex items-center justify-center gap-2 sm:gap-3 max-w-md mx-auto">
        <img 
  src="/src/assets/logo.png"  // ✅ Adjust this path if you're using import
  alt="HR Logo"
  className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
/>

          <h1 className="text-lg sm:text-xl font-semibold text-blue-900">HR Management</h1>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/50 flex flex-col lg:flex-row w-full max-w-[90vw] sm:max-w-[95vw] md:w-[800px] lg:w-[1000px] min-h-[500px] relative z-5 overflow-hidden">
        {/* Corner Triangle Elements - Adjusted for mobile */}
        <div className="absolute top-0 left-0 w-16 h-16 sm:w-28 sm:h-28 bg-gradient-to-br from-white/90 to-white/60 clip-path-triangle-top-left shadow-[inset_-2px_-2px_8px_rgba(255,255,255,0.8),2px_2px_15px_rgba(0,0,0,0.1)] z-8"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-28 sm:h-28 bg-gradient-to-tl from-black/8 to-black/4 clip-path-triangle-bottom-right shadow-[inset_2px_2px_8px_rgba(0,0,0,0.15),-2px_-2px_15px_rgba(0,0,0,0.1)] z-8"></div>
        <div className="absolute top-0 right-0 w-14 h-14 sm:w-24 sm:h-24 bg-gradient-to-bl from-white/70 to-white/40 clip-path-triangle-top-right shadow-[inset_2px_-2px_6px_rgba(255,255,255,0.6),-2px_2px_12px_rgba(0,0,0,0.08)] z-7"></div>
        <div className="absolute bottom-0 left-0 w-14 h-14 sm:w-24 sm:h-24 bg-gradient-to-tr from-black/6 to-black/3 clip-path-triangle-bottom-left shadow-[inset_-2px_2px_6px_rgba(0,0,0,0.1),2px_-2px_12px_rgba(0,0,0,0.08)] z-7"></div>
        
        {/* Left Side - Illustration - Hidden on small screens */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-400/60 to-blue-400/30 items-center justify-center p-8 sm:p-14 relative">
  <div className="relative w-[250px] h-[200px] sm:w-[300px] sm:h-[250px]">
    <img
      src="/src/assets/side.png" // 🔁 or use import if using Vite + src/assets
      alt="HR Illustration"
      className="w-full h-full object-contain rounded-lg shadow-md"
    />
  </div>
</div>

        {/* Right Side - Login Form */}
        <div className={`flex-1 p-6 sm:p-8 md:p-10 lg:p-14 flex flex-col justify-center transition-all duration-500 ease-in-out ${formAnimating ? 'animate-pulse' : ''}`}>
          {/* Tab Navigation */}
          <div className="flex mb-6 sm:mb-8 justify-start">
            <button className="text-2xl sm:text-3xl font-semibold pb-2 px-1 border-b-4 border-transparent transition-all duration-300 text-blue-500 border-b-yellow-400">
              {forgotPasswordMode ? 'Reset Password' : 'Login'}
            </button>
            {!forgotPasswordMode && (
              <Link 
                to="/signup"
                className="text-2xl sm:text-3xl font-semibold pb-2 px-1 border-b-4 border-transparent transition-all duration-300 text-gray-400 ml-6 sm:ml-8 hover:text-gray-500"
              >
                Sign Up
              </Link>
            )}
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-center text-xs sm:text-sm font-medium ${
              message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
              message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
              'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              {message.text}
            </div>
          )}

          {forgotPasswordMode ? (
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-2 sm:p-3 border-2 rounded-lg outline-none text-gray-700 transition-all duration-300 ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-blue-300/30 bg-blue-100/70'
                  } placeholder-blue-900 focus:border-blue-500 focus:scale-[1.01]`}
                  disabled={loading}
                  required
                />
                {errors.email && (
                  <span className="absolute -bottom-4 sm:-bottom-5 left-0 text-xs text-red-500">{errors.email}</span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(false)}
                  className="flex-1 bg-gray-200 text-gray-700 p-2 sm:p-3 rounded-lg font-medium transition-all hover:bg-gray-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="flex-1 bg-blue-500 text-white p-2 sm:p-3 rounded-lg font-medium transition-all hover:bg-blue-600 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleLogin}>
              {/* Email Field */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-2 sm:p-3 border-2 rounded-lg outline-none text-gray-700 transition-all duration-300 ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-blue-300/30 bg-blue-100/70'
                  } placeholder-blue-900 focus:border-blue-500 focus:scale-[1.01]`}
                  disabled={loading}
                  required
                />
                {errors.email && (
                  <span className="absolute -bottom-4 sm:-bottom-5 left-0 text-xs text-red-500">{errors.email}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-3 border-2 rounded-lg outline-none text-gray-700 transition-all duration-300 ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-blue-300/30 bg-blue-100/70'
                    } placeholder-blue-900 focus:border-blue-500 focus:scale-[1.01]`}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 sm:right-4 transform -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-500 hover:text-gray-700 transition-colors duration-300 hover:scale-110"
                    disabled={loading}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
                  <span className="absolute -bottom-4 sm:-bottom-5 left-0 text-xs text-red-500">{errors.password}</span>
                )}
              </div>

              {/* Remember & Forgot Password */}
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-300">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-3 h-3 sm:w-4 sm:h-4 accent-blue-500 hover:scale-110 transition-transform duration-200"
                  />
                  <span>Remember Me</span>
                </label>
                <button 
                  type="button" 
                  className="text-blue-500 bg-transparent border-none cursor-pointer hover:text-blue-700 transition-all duration-300 text-xs sm:text-sm hover:underline hover:scale-105"
                  onClick={() => setForgotPasswordMode(true)}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                className="bg-yellow-400 text-white p-2 sm:p-3 rounded-lg font-semibold border-none cursor-pointer transition-all duration-300 shadow-md shadow-yellow-300/30 hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-300/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-95"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="block transform transition-transform duration-200 hover:scale-105">
                    Login
                  </span>
                )}
              </button>

              {/* Google Login Button */}
              <button 
                type="button" 
                className="bg-blue-500 text-white p-2 sm:p-3 rounded-lg font-semibold border-none cursor-pointer transition-all duration-300 shadow-md shadow-blue-300/30 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-300/40 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 sm:gap-3 transform hover:scale-[1.01] active:scale-95"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <span className="transform transition-transform duration-200 hover:scale-105">Login with Google</span>
                <div className="bg-white text-blue-500 rounded-full p-0.5 sm:p-1 font-bold text-xs min-w-6 h-6 sm:min-w-7 sm:h-7 flex items-center justify-center transform transition-transform duration-200 hover:scale-110">G</div>
              </button>

              {/* Demo Link */}
              <div className="mt-3 sm:mt-5 text-center">
                <Link 
                  to="/candidates" 
                  className="text-blue-500 no-underline text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4 border border-blue-500 rounded inline-block hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                >
                  View Candidate Profile (Demo)
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 transform -translate-x-1/2 z-10 text-center text-gray-500 text-xs leading-tight">
        <a href="#" className="text-blue-500 no-underline block mb-0.5 hover:underline hover:scale-105 transition-transform duration-200">Release Notes</a>
        <div className="mb-0.5">Version 2.0.22.11</div>
        <div className="text-gray-400">Copyright © 2023-24 HRM and services</div>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-6 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        @keyframes float-7 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-17px) rotate(180deg); }
        }
        @keyframes float-8 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-9 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-22px) rotate(180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-6-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(15px) rotate(-180deg); }
        }
        @keyframes float-7-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(17px) rotate(-180deg); }
        }
        @keyframes float-8-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-180deg); }
        }
        @keyframes float-9-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(22px) rotate(-180deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .clip-path-triangle-top-left {
          clip-path: polygon(0 0, 100% 0, 0 100%);
        }
        .clip-path-triangle-bottom-right {
          clip-path: polygon(100% 0, 100% 100%, 0 100%);
        }
        .clip-path-triangle-top-right {
          clip-path: polygon(100% 0, 100% 100%, 0 0);
        }
        .clip-path-triangle-bottom-left {
          clip-path: polygon(0 0, 100% 100%, 0 100%);
        }
        .clip-path-document {
          clip-path: polygon(
            0% 10px, 10px 0%, calc(50% - 5px) 0%, 50% 10px, 
            calc(50% + 5px) 0%, calc(100% - 10px) 0%, 100% 10px, 
            100% calc(50% - 5px), calc(100% - 10px) 50%, 
            100% calc(50% + 5px), 100% calc(100% - 10px), 
            calc(100% - 10px) 100%, calc(50% + 5px) 100%, 
            50% calc(100% - 10px), calc(50% - 5px) 100%, 
            10px 100%, 0% calc(100% - 10px), 0% calc(50% + 5px), 
            10px 50%, 0% calc(50% - 5px)
          );
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .clip-path-document {
            clip-path: polygon(
              0% 8px, 8px 0%, calc(50% - 4px) 0%, 50% 8px, 
              calc(50% + 4px) 0%, calc(100% - 8px) 0%, 100% 8px, 
              100% calc(50% - 4px), calc(100% - 8px) 50%, 
              100% calc(50% + 4px), 100% calc(100% - 8px), 
              calc(100% - 8px) 100%, calc(50% + 4px) 100%, 
              50% calc(100% - 8px), calc(50% - 4px) 100%, 
              8px 100%, 0% calc(100% - 8px), 0% calc(50% + 4px), 
              8px 50%, 0% calc(50% - 4px)
            );
          }
        }
      `}</style>
    </div>
  );
};

export default Login;