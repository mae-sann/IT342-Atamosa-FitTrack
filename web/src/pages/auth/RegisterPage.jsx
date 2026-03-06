// src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/FormField';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthPage.module.css';

const ROLE_OPTIONS = [
  { value: 'ROLE_USER',  label: 'User — Track my own workouts' },
  { value: 'ROLE_ADMIN', label: 'Admin — Manage the system' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName:       '',
    lastName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
    role:            'ROLE_USER',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── field change ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.firstName.trim())  e.firstName = 'First name is required';
    if (!form.lastName.trim())   e.lastName  = 'Last name is required';
    if (!form.email.trim())      e.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password)          e.password  = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword)   e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.role)              e.role = 'Please select a role';
    return e;
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register({
        firstName:       form.firstName.trim(),
        lastName:        form.lastName.trim(),
        email:           form.email.trim().toLowerCase(),
        password:        form.password,
        confirmPassword: form.confirmPassword,
        role:            form.role,
      });
      navigate('/dashboard');
    } catch (err) {
      setErrors({ api: err?.response?.data?.error?.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  /* ── google oauth ── */
  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const EyeIcon = ({ visible }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ cursor:'pointer' }}>
      {visible
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>
      }
    </svg>
  );

  return (
    <div className={styles.authWrap}>
      <div className={styles.authBg} />
      <div className={styles.authGridLines} />

      <div className={styles.authCard}>
        {/* Logo */}
        <div className={styles.authLogo}>
          <Logo size="lg" />
        </div>

        {/* Header */}
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Create Account</h1>
          <p className={styles.authSub}>Start tracking your fitness journey</p>
        </div>

        {/* Google OAuth */}
        <button className={styles.googleBtn} onClick={handleGoogle} type="button">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Continue with Google
        </button>

        <div className={styles.divider}><span>or register with email</span></div>

        {/* API error */}
        {errors.api && (
          <div className={styles.apiError}>{errors.api}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name row */}
          <div className={styles.formRow}>
            <Input
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Charry Mae"
              error={errors.firstName}
              autoComplete="given-name"
            />
            <Input
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Atamosa"
              error={errors.lastName}
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@email.com"
            error={errors.email}
            autoComplete="email"
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            }
          />

          <Input
            label="Password"
            name="password"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            error={errors.password}
            autoComplete="new-password"
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            }
            rightIcon={
              <span onClick={() => setShowPass(v => !v)}>
                <EyeIcon visible={showPass} />
              </span>
            }
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            autoComplete="new-password"
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            }
            rightIcon={
              <span onClick={() => setShowConfirm(v => !v)}>
                <EyeIcon visible={showConfirm} />
              </span>
            }
          />

          {/* Role selector */}
          <Select
            label="Account Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            error={errors.role}
            options={ROLE_OPTIONS}
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            style={{ marginTop: 8 }}
          >
            Create Account
          </Button>
        </form>

        <p className={styles.authFooter}>
          Already have an account?{' '}
          <Link to="/login" className={styles.authLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}