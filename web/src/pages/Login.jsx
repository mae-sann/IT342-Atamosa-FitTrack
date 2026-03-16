import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService, setAuthToken, isAuthenticated } from '../services/authService';
import '../styles/auth.css';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyAuth = async () => {
      if (isAuthenticated()) {
        try {
          await authService.getCurrentUser();
          navigate('/dashboard');
        } catch {
          authService.logout();
        }
      }
    };
    verifyAuth();
    if (searchParams.get('registered')) {
      setSuccess('Registration successful! Please log in.');
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    try {
      setLoading(true);
      const response = await authService.login(formData.email, formData.password);
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        const backendUser = response.data.user || {};
        const normalizedName = (backendUser.name || '').trim();
        const normalizedUser = {
          ...backendUser,
          firstName: backendUser.firstName || normalizedName.split(' ')[0] || '',
          lastName:
            backendUser.lastName ||
            normalizedName.split(' ').slice(1).join(' ') ||
            backendUser.firstName ||
            '',
        };
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    window.location.href = `${apiBaseUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0F1E]" style={{ fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>
      <div className="blob1"></div>
      <div className="blob2"></div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="bebas text-3xl tracking-wider text-white">FitTrack</span>
          </a>
          <h1 className="bebas text-4xl text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-1 mb-4 text-sm">Log in to continue your fitness journey</p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit}>
           {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ pointerEvents: 'none' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field pl-11"
              />
            </div>
          </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <svg 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ pointerEvents: 'none' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end mb-6">
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition">Forgot password?</a>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm text-red-200" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg text-sm text-green-200" style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}>
                {success}
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Logging in...' : 'Log In to FitTrack'}
            </button>
          </form>

          {/* OR divider */}
          <div className="divider"><span>or</span></div>

          {/* Google button */}
          <button type="button" onClick={handleGoogleLogin} className="btn-google">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>

          {/* New here? */}
          <div className="divider mt-6"><span>new here?</span></div>
          <p className="text-center text-sm text-gray-400 inline-flex items-center justify-center gap-2 w-full">
            <span>Don't have an account?</span>
            <a href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">Create one free →</a>
          </p>
        </div>

        {/* Back to homepage */}
        <div className="text-center mt-6">
          <a href="/" className="text-xs text-gray-500 hover:text-gray-300 transition">← Back to Homepage</a>
        </div>
      </div>
    </div>
  );
}

