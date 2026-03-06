// src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.role) e.role = 'Please select a role';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role === 'admin' ? 'ROLE_ADMIN' : 'ROLE_USER',
      });
      navigate('/dashboard');
    } catch (err) {
      setErrors({ api: err?.response?.data?.error?.message || 'Registration failed. Please try again.' });
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
      padding: '20px',
      paddingTop: '40px',
      paddingBottom: '40px'
    }}>
      <div style={{
        backgroundColor: '#0d1526',
        border: '1px solid rgba(30, 41, 59, 0.8)',
        boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.8), 0 0 1px rgba(52, 211, 153, 0.1)',
        width: '100%',
        maxWidth: '520px',
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
          background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          boxShadow: '0 8px 24px rgba(52, 211, 153, 0.3)'
        }}>
          <span style={{ fontSize: '28px' }}>✨</span>
        </div>

        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
          Create Account
        </h1>
        
        <p style={{ color: '#9ca3af', fontSize: '15px', marginBottom: '32px', textAlign: 'center', fontWeight: '500' }}>
          Join our fitness community and start tracking
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

        <form onSubmit={handleSubmit} noValidate style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(22, 32, 51, 0.6)',
                  border: errors.firstName ? '1.5px solid rgba(220, 38, 38, 0.5)' : '1.5px solid rgba(45, 55, 72, 0.5)',
                  color: '#e2e8f0',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.firstName) {
                    e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.9)';
                    e.target.style.borderColor = 'rgba(52, 211, 153, 0.6)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(52, 211, 153, 0.15)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.6)';
                  e.target.style.borderColor = errors.firstName ? 'rgba(220, 38, 38, 0.5)' : 'rgba(45, 55, 72, 0.5)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.firstName && <span style={{ fontSize: '12px', color: '#f87171', fontWeight: '500' }}>✕ {errors.firstName}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(22, 32, 51, 0.6)',
                  border: errors.lastName ? '1.5px solid rgba(220, 38, 38, 0.5)' : '1.5px solid rgba(45, 55, 72, 0.5)',
                  color: '#e2e8f0',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.lastName) {
                    e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.9)';
                    e.target.style.borderColor = 'rgba(52, 211, 153, 0.6)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(52, 211, 153, 0.15)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.6)';
                  e.target.style.borderColor = errors.lastName ? 'rgba(220, 38, 38, 0.5)' : 'rgba(45, 55, 72, 0.5)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.lastName && <span style={{ fontSize: '12px', color: '#f87171', fontWeight: '500' }}>✕ {errors.lastName}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
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
                  e.target.style.borderColor = 'rgba(52, 211, 153, 0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 211, 153, 0.15)';
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
                  e.target.style.borderColor = 'rgba(52, 211, 153, 0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 211, 153, 0.15)';
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              style={{
                width: '100%',
                backgroundColor: 'rgba(22, 32, 51, 0.6)',
                border: errors.confirmPassword ? '1.5px solid rgba(220, 38, 38, 0.5)' : '1.5px solid rgba(45, 55, 72, 0.5)',
                color: '#e2e8f0',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!errors.confirmPassword) {
                  e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.9)';
                  e.target.style.borderColor = 'rgba(52, 211, 153, 0.6)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(52, 211, 153, 0.15)';
                }
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.6)';
                e.target.style.borderColor = errors.confirmPassword ? 'rgba(220, 38, 38, 0.5)' : 'rgba(45, 55, 72, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.confirmPassword && <span style={{ fontSize: '13px', color: '#f87171', fontWeight: '500' }}>✕ {errors.confirmPassword}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              User Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{
                width: '100%',
                backgroundColor: 'rgba(22, 32, 51, 0.6)',
                border: '1.5px solid rgba(45, 55, 72, 0.5)',
                color: '#e2e8f0',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%239ca3af' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: '36px'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.9)';
                e.target.style.borderColor = 'rgba(52, 211, 153, 0.6)';
                e.target.style.boxShadow = '0 0 0 3px rgba(52, 211, 153, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(22, 32, 51, 0.6)';
                e.target.style.borderColor = 'rgba(45, 55, 72, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="user" style={{ backgroundColor: '#162033', color: '#e2e8f0' }}>👤 User</option>
              <option value="admin" style={{ backgroundColor: '#162033', color: '#e2e8f0' }}>⚙️ Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#10b981' : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
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
              boxShadow: '0 8px 20px rgba(52, 211, 153, 0.25)',
              letterSpacing: '0.3px',
              marginTop: '6px'
            }}
            onMouseEnter={(e) => { if (!loading) { e.target.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; e.target.style.boxShadow = '0 12px 28px rgba(52, 211, 153, 0.35)'; } }}
            onMouseLeave={(e) => { if (!loading) { e.target.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'; e.target.style.boxShadow = '0 8px 20px rgba(52, 211, 153, 0.25)'; } }}
            onMouseDown={(e) => { if (!loading) e.target.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { e.target.style.transform = 'scale(1)'; }}
          >
            {loading ? '⏳ Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
            Already have an account?
          </p>
          <Link to="/login" style={{ 
            color: '#34d399', 
            fontWeight: '600', 
            textDecoration: 'none',
            fontSize: '14px',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            display: 'inline-block'
          }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(52, 211, 153, 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}