import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (result.user.role === 'ADMIN') navigate('/dashboard');
      else if (result.user.role === 'CLIENT') navigate('/dashboard');
      else navigate('/dashboard');
    } else {
      setErrorMsg(result.error);
    }
  };



  return (
    <div className="auth-split-wrapper">
      {/* Left Form Side */}
      <div className="auth-form-side">
        <div style={{ marginBottom: '28px' }}>
          <div className="nav-brand" style={{ justifyContent: 'center' }}>
            <Logo height={42} variant="light" />
          </div>
        </div>

        <div className="auth-box">
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '6px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginBottom: '24px' }}>
            Sign in to your account to continue
          </p>

          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              borderRadius: '8px',
              fontSize: '13.5px',
              marginBottom: '16px'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          <p style={{ fontSize: '13.5px', color: 'var(--slate-500)', textAlign: 'center', marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign up free
            </Link>
          </p>


        </div>
      </div>

      {/* Right Gradient Side */}
      <div className="auth-gradient-side">
        <h2 style={{ fontSize: '42px', fontWeight: 800, lineHeight: '1.2', marginBottom: '18px' }}>
          Where talent meets <br />opportunity
        </h2>
        <p style={{ fontSize: '17px', opacity: 0.9, lineHeight: '1.6', maxWidth: '480px' }}>
          Join thousands of clients and freelancers building amazing projects together on FreelanceHub.
        </p>

        <ul className="auth-feature-list">
          <li className="auth-feature-item">
            <div className="auth-feature-icon">
              <ArrowRight size={15} />
            </div>
            <span>Post projects and receive proposals in minutes</span>
          </li>
          <li className="auth-feature-item">
            <div className="auth-feature-icon">
              <ArrowRight size={15} />
            </div>
            <span>Chat in real-time with your team</span>
          </li>
          <li className="auth-feature-item">
            <div className="auth-feature-icon">
              <ArrowRight size={15} />
            </div>
            <span>Secure payments and trusted reviews</span>
          </li>
        </ul>

      </div>
    </div>
  );
}
