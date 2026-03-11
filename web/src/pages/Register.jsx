import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, isAuthenticated } from '../services/authService';
import '../styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const navigate = useNavigate();

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
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      setLoading(true);
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await authService.register(fullName, formData.email, formData.password, formData.role);
      navigate('/login?registered=true');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Email already exists');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid input');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10 bg-[#0A0F1E]" style={{ fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>
      <div className="blob1-reg"></div>
      <div className="blob2-reg"></div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="bebas text-3xl tracking-wider text-white">FitTrack</span>
          </a>
          <h1 className="bebas text-4xl text-white">Create Your Account</h1>
          <p className="text-gray-400 mt-1 text-sm">Start tracking your fitness journey today — it's free!</p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Juan"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Dela Cruz"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input
                  type="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-11"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Must be at least 8 characters long</p>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Role selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-3">Select Role</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`role-btn ${selectedRole === 'user' ? 'active' : ''}`}
                  onClick={() => selectRole('user')}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: 'rgba(37,99,235,0.3)' }}>
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">User</div>
                    <div className="text-xs text-gray-400">Track workouts & goals</div>
                  </div>
                </div>
                <div
                  className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => selectRole('admin')}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: 'rgba(37,99,235,0.3)' }}>
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Admin</div>
                    <div className="text-xs text-gray-400">Manage system & exercises</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="terms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4"
                style={{ accentColor: '#2563EB' }}
              />
              <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed">
                By registering, you agree to our{' '}
                <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>.
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm text-red-200" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating Account...' : 'Create My FitTrack Account'}
            </button>
          </form>

          {/* OR divider */}
          <div className="divider"><span>or</span></div>

          {/* Google button */}
          <button type="button" onClick={handleGoogleRegister} className="btn-google">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign up with Google
          </button>

          {/* Already a member? */}
          <div className="divider mt-4"><span>already a member?</span></div>
          <a href="/login" className="block text-center text-blue-400 hover:text-blue-300 font-semibold transition text-sm">
            Log in to your account →
          </a>
        </div>

        {/* Back to homepage */}
        <div className="text-center mt-6">
          <a href="/" className="text-xs text-gray-500 hover:text-gray-300 transition">← Back to Homepage</a>
        </div>
      </div>
    </div>
  );
}
