import React, { useState } from 'react';
import './signup.css';
import { Link, useNavigate } from "react-router-dom";
import yourImage from '/public/side.png'; // Update this path
import logo from '/public/logo.png'; // adjust path if needed


const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation - Updated to match backend requirements
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || 'Account created successfully! Please check your email to verify your account.',
        });

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });

        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Please check your email and verify your account before logging in.',
              email: formData.email.trim().toLowerCase(),
            },
          });
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      window.location.href = `${backendUrl}/api/auth/google`;
    } catch (error) {
      console.error('Google signup error:', error);
      setMessage({
        type: 'error',
        text: 'Google signup failed. Please try again.'
      });
    }
  };

  return (
    <div className="signup-container">
      {/* Background Decorative Shapes */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
        <div className="shape shape-6"></div>
        <div className="shape shape-7"></div>
        <div className="shape shape-8"></div>
        <div className="floating-star star-1">✦</div>
        <div className="floating-star star-2">✧</div>
        <div className="floating-star star-3">✦</div>
        <div className="floating-star star-4">✧</div>
        <div className="floating-star star-5">✦</div>
      </div>

      {/* Header */}
      <div className="header">
  <div className="header-content">
    <img src={logo} alt="Logo" className="logo-image" />
    <h1 className="header-title">HR Management</h1>
  </div>
</div>


      {/* Main Container */}
      <div className="signup-box">
        {/* Additional Corner Triangle Elements */}
        <div className="triangle-top-right"></div>
        <div className="triangle-bottom-left"></div>
        
        {/* Left Side - Your Image (hidden on mobile) */}
        <div className="signup-left">
          <div className="image-container">
            <img 
              src={yourImage} 
              alt="Signup Illustration" 
              className="signup-image"
            />
          </div>
        </div>

        {/* Right Side - SignUp Form */}
        <div className="signup-right">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <Link to="/login" className="tab-button">
              Login
            </Link>
            <button className="tab-button active">
              Sign Up
            </button>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* Message Display */}
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* First Name Field */}
            <div className="input-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`signup-input ${errors.firstName ? 'error' : ''}`}
                disabled={loading}
                required
              />
              {errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            {/* Last Name Field */}
            <div className="input-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`signup-input ${errors.lastName ? 'error' : ''}`}
                disabled={loading}
                required
              />
              {errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className={`signup-input ${errors.email ? 'error' : ''}`}
                disabled={loading}
                required
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className={`signup-input ${errors.password ? 'error' : ''}`}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`signup-input ${errors.confirmPassword ? 'error' : ''}`}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                disabled={loading}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            {/* SignUp Button */}
            <button 
              type="submit" 
              className="signup-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            {/* Google SignUp Button */}
            <button 
              type="button" 
              className="google-signup-button"
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <span>Sign Up with Google</span>
              <div className="google-icon">G</div>
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-content">
          <a href="#" className="release-notes">Release Notes</a>
          <div className="version">Version 2.0.22.11</div>
          <div className="copyright">Copyright © 2023-24 HRM and services</div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;