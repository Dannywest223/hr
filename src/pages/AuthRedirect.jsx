import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const token = params.get('token');
    const userId = params.get('userId');
    const firstName = params.get('firstName');
    const lastName = params.get('lastName');
    const email = params.get('email');

    if (token && userId) {
      localStorage.setItem('authToken', token);

      const user = {
        id: userId,
        firstName,
        lastName,
        email,
      };
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // Redirect to login with error
      navigate('/login', {
        state: {
          message: 'Authentication failed. Please try again.',
          type: 'error',
        },
      });
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Authenticating...</h1>
        <p className="text-center">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default AuthRedirect;
