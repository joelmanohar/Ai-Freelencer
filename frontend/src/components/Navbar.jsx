import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Briefcase, User, LayoutDashboard, MessageSquare, LogOut, ChevronDown, Globe2 } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const role = user?.role?.toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <Logo height={43} variant="dark" />
        </Link>

        {/* Dynamic Nav Links */}
        <div className="nav-links">
          {!isAuthenticated && (
            <>
              <Link to="/projects" className="nav-link">Browse Projects</Link>
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm nav-post-project" style={{ borderRadius: '9999px', padding: '8px 20px' }}>
                Get Started
              </Link>
            </>
          )}

          {isAuthenticated && role === 'CLIENT' && (
            <>
              <Link to="/projects" className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}>
                Browse Projects
              </Link>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                My Projects
              </Link>
              <Link to="/post-project" className={`nav-link ${location.pathname === '/post-project' ? 'active' : ''}`}>
                Post a Project
              </Link>
            </>
          )}

          {isAuthenticated && role === 'FREELANCER' && (
            <>
              <Link to="/projects" className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}>
                Browse Projects
              </Link>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                My Proposals
              </Link>
              <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                My Profile
              </Link>
            </>
          )}

          {isAuthenticated && role === 'ADMIN' && (
            <>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/projects" className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}>
                All Projects
              </Link>
            </>
          )}

          {/* User Avatar & Menu Dropdown */}
          {isAuthenticated && user && (
            <div className="user-profile-badge" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="avatar-circle">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate-700)' }}>
                {user.displayName || 'User'}
              </span>

              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <User size={16} />
                    <span>View Profile</span>
                  </Link>
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/messages" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <MessageSquare size={16} />
                    <span>Messages</span>
                  </Link>
                  <div className="dropdown-item danger" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
