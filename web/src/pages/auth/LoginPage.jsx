// src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setErrors({ api: err?.response?.data?.error?.message || 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#050a15',
      backgroundImage: `
        linear-gradient(rgba(25, 34, 53, 0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(25, 34, 53, 0.3) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0d1526',
        border: '1px solid rgba(30, 41, 59, 0.8)',
        boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.8), 0 0 1px rgba(59, 130, 246, 0.1)',
        width: '100%',
        maxWidth: '460px',
        borderRadius: '20px',
        padding: '52px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #2b7fff 0%, #1d66e5 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
        }}>
          <span style={{ fontSize: '28px' }}>💪</span>
        </div>

        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
          Welcome Back
        </h1>
        
        <p style={{ color: '#9ca3af', fontSize: '15px', marginBottom: '32px', textAlign: 'center', fontWeight: '500' }}>
          Log in to continue your fitness journey
        </p>

        {errors.api && (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            color: '#fca5a5',
            padding: '14px 16px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '14px',
            width: '100%',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              style={{
                width: '100%',
                backgroundColor: 'rgba(22, 32, 51, 0.6)',
                border: errors.email ? '1.5px solid rgba(220, 38, 38, 0.5)' : '1.5px solid rgba(45, 55, 72, 0.5)',
                color: '#e2e8f0',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!errors.email) {
                  e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.9)';
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                }
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.6)';
                e.target.style.borderColor = errors.email ? 'rgba(220, 38, 38, 0.5)' : 'rgba(45, 55, 72, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.email && <span style={{ fontSize: '13px', color: '#f87171', fontWeight: '500' }}>✕ {errors.email}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              style={{
                width: '100%',
                backgroundColor: 'rgba(22, 32, 51, 0.6)',
                border: errors.password ? '1.5px solid rgba(220, 38, 38, 0.5)' : '1.5px solid rgba(45, 55, 72, 0.5)',
                color: '#e2e8f0',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!errors.password) {
                  e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.9)';
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                }
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.6)';
                e.target.style.borderColor = errors.password ? 'rgba(220, 38, 38, 0.5)' : 'rgba(45, 55, 72, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.password && <span style={{ fontSize: '13px', color: '#f87171', fontWeight: '500' }}>✕ {errors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#1d66e5' : 'linear-gradient(135deg, #2b7fff 0%, #1e6fff 100%)',
              color: 'white',
              fontWeight: '600',
              padding: '14px 20px',
              borderRadius: '10px',
              fontSize: '15px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: loading ? 0.8 : 1,
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => { if (!loading) { e.target.style.background = 'linear-gradient(135deg, #1e6fff 0%, #1555d5 100%)'; e.target.style.boxShadow = '0 12px 28px rgba(59, 130, 246, 0.35)'; } }}
            onMouseLeave={(e) => { if (!loading) { e.target.style.background = 'linear-gradient(135deg, #2b7fff 0%, #1e6fff 100%)'; e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.25)'; } }}
            onMouseDown={(e) => { if (!loading) e.target.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { e.target.style.transform = 'scale(1)'; }}
          >
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
            Don't have an account?
          </p>
          <Link to="/register" style={{ 
            color: '#3b82f6', 
            fontWeight: '600', 
            textDecoration: 'none',
            fontSize: '14px',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            display: 'inline-block'
          }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
}