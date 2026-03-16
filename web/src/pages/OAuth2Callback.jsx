import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService, setAuthToken } from '../services/authService';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const provider = searchParams.get('provider');

      if (!token || provider !== 'GOOGLE') {
        setError('Google login failed. Please try again.');
        return;
      }

      try {
        setAuthToken(token);

        const userResponse = await authService.getCurrentUser();
        if (userResponse?.data) {
          localStorage.setItem('user', JSON.stringify(userResponse.data));
        }

        navigate('/dashboard', { replace: true });
      } catch {
        setAuthToken(null);
        localStorage.removeItem('user');
        setError('Unable to finish Google sign-in. Please log in again.');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        {error ? (
          <>
            <h1 className="text-xl font-bold mb-2">Google Sign-in Error</h1>
            <p className="text-sm text-red-300 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-2">Signing you in...</h1>
            <p className="text-sm text-gray-300">Please wait while we complete your Google login.</p>
          </>
        )}
      </div>
    </div>
  );
}
