import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, UserRound, RefreshCw, ArrowUpRight } from 'lucide-react';
import { userApi } from '../api/client';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const response = await userApi.getAll();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load users. Check your admin access and try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter(user => {
      const matchesRole = roleFilter === 'ALL' || user.role?.toUpperCase() === roleFilter;
      const matchesSearch = !normalizedQuery || [user.displayName, user.email, user.role, user.location]
        .some(value => String(value || '').toLowerCase().includes(normalizedQuery));
      return matchesRole && matchesSearch;
    });
  }, [users, query, roleFilter]);

  const clients = users.filter(user => user.role?.toUpperCase() === 'CLIENT').length;
  const freelancers = users.filter(user => user.role?.toUpperCase() === 'FREELANCER').length;

  return (
    <section className="admin-users-page">
      <div className="container">
        <div className="admin-users-page__heading">
          <div>
            <Link to="/dashboard" className="admin-users-page__back">← Admin Dashboard</Link>
            <h1>User Directory</h1>
            <p>Registered accounts from the platform users table.</p>
          </div>
          <button className="btn btn-secondary" type="button" onClick={loadUsers} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        <div className="admin-users-page__summary">
          <div className="admin-users-page__summary-card">
            <span className="admin-users-page__summary-icon"><Users size={20} /></span>
            <span><strong>{users.length}</strong><small>All accounts</small></span>
          </div>
          <div className="admin-users-page__summary-card">
            <span className="admin-users-page__summary-icon admin-users-page__summary-icon--blue"><UserRound size={20} /></span>
            <span><strong>{clients}</strong><small>Clients</small></span>
          </div>
          <div className="admin-users-page__summary-card">
            <span className="admin-users-page__summary-icon admin-users-page__summary-icon--green"><UserRound size={20} /></span>
            <span><strong>{freelancers}</strong><small>Freelancers</small></span>
          </div>
        </div>

        <div className="admin-users-page__table-card">
          <div className="admin-users-page__toolbar">
            <label className="admin-users-page__search">
              <Search size={17} aria-hidden="true" />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, email, or location" />
            </label>
            <select value={roleFilter} onChange={event => setRoleFilter(event.target.value)} aria-label="Filter users by role">
              <option value="ALL">All roles</option>
              <option value="CLIENT">Clients</option>
              <option value="FREELANCER">Freelancers</option>
              <option value="ADMIN">Admins</option>
            </select>
            <span className="admin-users-page__result-count">{filteredUsers.length} shown</span>
          </div>

          {error && <div className="admin-users-page__error" role="alert">{error}</div>}
          <div className="admin-users-page__table-scroll">
            <table className="admin-users-page__table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Location</th><th>Joined</th><th aria-label="Profile link" /></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="admin-users-page__empty">Loading user records…</td></tr>
                ) : filteredUsers.length ? filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-users-page__user">
                        <span className="admin-users-page__avatar">{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
                        <span>{user.displayName || 'Unnamed user'}</span>
                      </div>
                    </td>
                    <td>{user.email || '—'}</td>
                    <td><span className={`badge badge-role-${user.role?.toLowerCase()}`}>{user.role || 'Unknown'}</span></td>
                    <td>{user.location || '—'}</td>
                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td><Link className="admin-users-page__profile-link" to={`/profile/${user.id}`} aria-label={`View ${user.displayName || 'user'} profile`}><ArrowUpRight size={17} /></Link></td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="admin-users-page__empty">{users.length ? 'No users match your search.' : 'No user records found.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
