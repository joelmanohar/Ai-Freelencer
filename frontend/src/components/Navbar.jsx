import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Briefcase, User, LayoutDashboard, MessageSquare, LogOut, ChevronDown, Globe2, Bell, CheckCheck, CreditCard } from 'lucide-react';
import { notificationApi } from '../api/client';
import Logo from './Logo';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount()
      ]);
      setNotifications(listRes.data || []);
      setUnreadCount(countRes.data?.unreadCount || 0);
    } catch (err) {
      // silently ignore if not logged in
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id, link) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link) {
        setNotifOpen(false);
        navigate(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

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
              <Link to="/admin/users" className={`nav-link ${location.pathname.startsWith('/admin/users') ? 'active' : ''}`}>
                Users
              </Link>
            </>
          )}

          {/* Notifications Bell */}
          {isAuthenticated && user && (
            <div className="notifications-wrapper" ref={notifRef}>
              <button
                className="notifications-btn"
                title="Notifications"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen) fetchNotifications();
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notifications-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--slate-800)' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '13px' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`notification-item ${!n.read ? 'unread' : ''}`}
                          onClick={() => handleMarkAsRead(n.id, n.link)}
                        >
                          <div style={{ marginTop: '2px', color: n.type?.includes('PAYMENT') ? '#16a34a' : '#2563eb' }}>
                            <CreditCard size={18} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: !n.read ? 700 : 500, color: 'var(--slate-900)' }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--slate-600)', marginTop: '2px', wordBreak: 'break-word' }}>
                              {n.message}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--slate-400)', marginTop: '4px' }}>
                              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>
                          {!n.read && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', marginTop: '6px' }} />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
