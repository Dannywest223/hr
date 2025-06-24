import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './EmailVerification.css'; // You'll need to create this CSS file

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing');
        setLoading(false);
        return;
      }

      try {
        const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        // Make sure this matches your backend URL
        const response = await fetch(`${backendUrl}/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate('/login', {
              state: {
                message: 'Email verified successfully! You can now log in.',
                verified: true
              }
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="verification-container">
      <div className="verification-box">
        <div className="verification-content">
          {loading && (
            <>
              <div className="spinner"></div>
              <h2>Verifying your email...</h2>
              <p>Please wait while we verify your account.</p>
            </>
          )}

          {!loading && status === 'success' && (
            <>
              <div className="success-icon">✅</div>
              <h2>Email Verified Successfully!</h2>
              <p>{message}</p>
              <p className="redirect-info">You will be redirected to login in a few seconds...</p>
              <button onClick={handleGoToLogin} className="login-button">
                Go to Login Now
              </button>
            </>
          )}

          {!loading && status === 'error' && (
            <>
              <div className="error-icon">❌</div>
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <button onClick={handleGoToLogin} className="login-button">
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;