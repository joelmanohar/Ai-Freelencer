import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Briefcase, Search, User, Mail, Lock, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const [role, setRole] = useState('CLIENT'); // 'CLIENT' or 'FREELANCER'
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);
    const result = await register({
      displayName,
      email,
      password,
      role
    });
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Form Side */}
      <div className="auth-form-side">
        <div style={{ marginBottom: '24px' }}>
          <div className="nav-brand" style={{ justifyContent: 'center' }}>
            <Logo height={42} variant="light" />
          </div>
        </div>

        <div className="auth-box">
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '6px' }}>
            Create your account
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginBottom: '20px' }}>
            Join FreelanceHub and start building
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

          <div style={{ marginBottom: '14px' }}>
            <label className="form-label">I want to</label>
            <div className="role-cards-container">
              <div
                className={`role-card-option ${role === 'CLIENT' ? 'active' : ''}`}
                onClick={() => setRole('CLIENT')}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: role === 'CLIENT' ? 'var(--primary)' : 'var(--slate-100)',
                  color: role === 'CLIENT' ? '#ffffff' : 'var(--slate-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Briefcase size={18} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--slate-900)' }}>Hire Talent</div>
                <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>I'm a client</div>
              </div>

              <div
                className={`role-card-option ${role === 'FREELANCER' ? 'active' : ''}`}
                onClick={() => setRole('FREELANCER')}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: role === 'FREELANCER' ? 'var(--primary)' : 'var(--slate-100)',
                  color: role === 'FREELANCER' ? '#ffffff' : 'var(--slate-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Search size={18} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--slate-900)' }}>Find Work</div>
                <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>I'm a freelancer</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={16} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
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
              style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            >
              <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          <p style={{ fontSize: '13.5px', color: 'var(--slate-500)', textAlign: 'center', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Gradient Side */}
      <div className="auth-gradient-side">
        <h2 style={{ fontSize: '42px', fontWeight: 800, lineHeight: '1.2', marginBottom: '18px' }}>
          Start your journey <br />today
        </h2>
        <p style={{ fontSize: '17px', opacity: 0.9, lineHeight: '1.6', maxWidth: '480px' }}>
          Whether you're looking to hire top talent or find your next great project, FreelanceHub has you covered.
        </p>

        <ul className="auth-feature-list">
          <li className="auth-feature-item">
            <div className="auth-feature-icon">
              <ArrowRight size={15} />
            </div>
            <span>Free to join — no hidden fees</span>
          </li>
          <li className="auth-feature-item">
            <div className="auth-feature-icon">
              <ArrowRight size={15} />
            </div>
            <span>Unlimited project posts and proposals</span>
          </li>
          <li className="auth-feature-item">
            <div className="auth-feature-icon">
              <ArrowRight size={15} />
            </div>
            <span>Build your reputation with reviews</span>
          </li>
        </ul>

      </div>
    </div>
  );
}
