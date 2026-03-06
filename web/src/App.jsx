import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Simple Login Page
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Login successful!');
      } else {
        setMessage('❌ ' + (data.error?.message || 'Login failed'));
      }
    } catch (error) {
      setMessage('❌ Error connecting to server');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2>🔐 Login to FitTrack</h2>
      {message && <p style={{ padding: '10px', background: '#f0f0f0' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Login</button>
      </form>
      <p><Link to="/register">Don't have an account? Register</Link></p>
    </div>
  );
}

// Simple Register Page
function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'USER'
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Registration successful! You can now login.');
      } else {
        setMessage('❌ ' + (data.error?.message || 'Registration failed'));
      }
    } catch (error) {
      setMessage('❌ Error connecting to server');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h2>📝 Register for FitTrack</h2>
      {message && <p style={{ padding: '10px', background: '#f0f0f0' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm({...form, firstName: e.target.value})}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({...form, lastName: e.target.value})}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            name="password"
            type="password"
            placeholder="Password (min 8 chars)"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <select
            name="role"
            value={form.role}
            onChange={(e) => setForm({...form, role: e.target.value})}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Register</button>
      </form>
      <p><Link to="/">Already have an account? Login</Link></p>
    </div>
  );
}

// Main App
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;