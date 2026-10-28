import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { projectApi, proposalApi, paymentApi, categoryApi, userApi, adminApi } from '../api/client';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatCurrencyTotals } from '../utils/currency';
import { 
  Briefcase, CheckCircle2, Clock, IndianRupee, Plus,
  Users, UserCheck, Layers, Trash2, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role?.toUpperCase();

  if (role === 'ADMIN') return <AdminDashboard user={user} />;
  if (role === 'FREELANCER') return <FreelancerDashboard user={user} />;
  return <ClientDashboard user={user} />;
}

/* ==================== CLIENT DASHBOARD ==================== */
function ClientDashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClientData() {
      try {
        const [projRes, payRes] = await Promise.all([
          projectApi.getMy(),
          paymentApi.getMy()
        ]);
        setProjects(projRes.data || []);
        setPayments(payRes.data || []);
      } catch (err) {
        console.error("Failed to load client dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadClientData();
  }, []);

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const openProjects = projects.filter(p => p.status === 'open').length;
  const totalSpent = formatCurrencyTotals(payments);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 68px)', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
              Dashboard
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--slate-500)' }}>
              Welcome back, {user?.displayName || 'Client'}! Here's your client overview.
            </p>
          </div>

          <Link to="/post-project" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '10px' }}>
            <Plus size={18} />
            <span>Post a Project</span>
          </Link>
        </div>

        {/* 4 Stat Cards matching screenshot 06 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Briefcase size={22} /></div>
            <div>
              <div className="stat-value">{totalProjects}</div>
              <div className="stat-label">Total Projects</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}><CheckCircle2 size={22} /></div>
            <div>
              <div className="stat-value">{activeProjects}</div>
              <div className="stat-label">Active Projects</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Clock size={22} /></div>
            <div>
              <div className="stat-value">{openProjects}</div>
              <div className="stat-label">Open Projects</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><IndianRupee size={22} /></div>
            <div>
              <div className="stat-value">{totalSpent}</div>
              <div className="stat-label">Total Spent</div>
            </div>
          </div>
        </div>

        {/* My Projects List */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '20px' }}>
            My Projects
          </h2>

          {projects.length > 0 ? (
            projects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))
          ) : (
            <EmptyState
              icon="briefcase"
              title="No projects posted yet"
              description="Create your first project to connect with skilled freelancers."
              actionText="Post a Project"
              onAction={() => window.location.href = '/post-project'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================== FREELANCER DASHBOARD ==================== */
function FreelancerDashboard({ user }) {
  const [proposals, setProposals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFreelancerData() {
      try {
        const [propRes, payRes] = await Promise.all([
          proposalApi.getMy(),
          paymentApi.getMy()
        ]);
        setProposals(propRes.data || []);
        setPayments(payRes.data || []);
      } catch (err) {
        console.error("Failed to load freelancer dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFreelancerData();
  }, []);

  const totalProposals = proposals.length;
  const acceptedProposals = proposals.filter(p => p.status === 'accepted').length;
  const pendingProposals = proposals.filter(p => p.status === 'pending').length;
  const totalEarned = formatCurrencyTotals(payments);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 68px)', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Top Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate-500)' }}>
            Welcome back, {user?.displayName || 'Freelancer'}! Here's your freelancer overview.
          </p>
        </div>

        {/* 4 Stat Cards matching screenshot 15 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Briefcase size={22} /></div>
            <div>
              <div className="stat-value">{totalProposals}</div>
              <div className="stat-label">Total Proposals</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}><CheckCircle2 size={22} /></div>
            <div>
              <div className="stat-value">{acceptedProposals}</div>
              <div className="stat-label">Accepted</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Clock size={22} /></div>
            <div>
              <div className="stat-value">{pendingProposals}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><IndianRupee size={22} /></div>
            <div>
              <div className="stat-value">{totalEarned}</div>
              <div className="stat-label">Total Earned</div>
            </div>
          </div>
        </div>

        {/* My Proposals List */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '20px' }}>
            My Proposals
          </h2>

          {proposals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {proposals.map(prop => (
                <div key={prop.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className={`badge badge-${prop.status}`} style={{ textTransform: 'capitalize' }}>
                        {prop.status}
                      </span>
                    </div>
                    <Link to={`/projects/${prop.projectId}`} style={{ fontSize: '17px', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {prop.projectTitle}
                    </Link>
                    <div style={{ fontSize: '13.5px', color: 'var(--slate-500)', marginTop: '4px' }}>
                      Your bid: <strong style={{ color: 'var(--primary)' }}>{formatCurrency(prop.bidAmount)}</strong> • {prop.estimatedDays} days delivery
                    </div>
                  </div>

                  <Link to={`/projects/${prop.projectId}`} className="btn btn-secondary btn-sm">
                    <span>View Project</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="file"
              title="No proposals yet"
              description="Browse projects and submit proposals to start finding work."
              actionText="Browse Projects"
              onAction={() => window.location.href = '/projects'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================== ADMIN DASHBOARD ==================== */
function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    clients: 0,
    freelancers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    categories: 0
  });

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, projects, categories
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAdminData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const results = await Promise.allSettled([
        adminApi.getStats(),
        userApi.getAll(),
        projectApi.getAll(),
        categoryApi.getAll(),
        paymentApi.getAll()
      ]);
      const [statsRes, usersRes, projRes, catRes, payRes] = results;
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || {});
      else console.error('Failed to load admin stats:', statsRes.reason);
      if (usersRes.status === 'fulfilled') setUsersList(usersRes.value.data || []);
      if (projRes.status === 'fulfilled') setProjectsList(projRes.value.data || []);
      if (catRes.status === 'fulfilled') setCategoriesList(catRes.value.data || []);
      if (payRes.status === 'fulfilled') setPaymentsList(payRes.value.data || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
    const refreshInterval = window.setInterval(loadAdminData, 30000);
    window.addEventListener('focus', loadAdminData);
    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', loadAdminData);
    };
  }, [loadAdminData]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await categoryApi.create({ name: newCatName, description: newCatDesc, icon: 'Folder' });
      setNewCatName('');
      setNewCatDesc('');
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryApi.delete(id);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 68px)', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Header matching screenshot 17 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--slate-500)' }}>
              Monitor and manage the platform
            </p>
          </div>
          <button className="btn btn-secondary" onClick={loadAdminData} disabled={isRefreshing}>
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* 6 Stat Cards matching screenshot 17 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '16px',
          marginBottom: '36px'
        }}>
          <div className="stat-card" style={{ padding: '18px' }}>
            <div className="stat-icon"><Users size={20} /></div>
            <div>
              <div className="stat-value" style={{ fontSize: '22px' }}>{stats.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: '18px' }}>
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><UserCheck size={20} /></div>
            <div>
              <div className="stat-value" style={{ fontSize: '22px' }}>{stats.clients || 0}</div>
              <div className="stat-label">Clients</div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: '18px' }}>
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}><Users size={20} /></div>
            <div>
              <div className="stat-value" style={{ fontSize: '22px' }}>{stats.freelancers || 0}</div>
              <div className="stat-label">Freelancers</div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: '18px' }}>
            <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Briefcase size={20} /></div>
            <div>
              <div className="stat-value" style={{ fontSize: '22px' }}>{stats.totalProjects || 0}</div>
              <div className="stat-label">Total Projects</div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: '18px' }}>
            <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><IndianRupee size={20} /></div>
            <div>
              <div className="stat-value" style={{ fontSize: '22px' }}>{formatCurrency(stats.totalRevenue || 0)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: '18px' }}>
            <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><Layers size={20} /></div>
            <div>
              <div className="stat-value" style={{ fontSize: '22px' }}>{stats.categories || 0}</div>
              <div className="stat-label">Categories</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation matching screenshot 17, 18, 19, 21 */}
        <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--slate-200)', marginBottom: '32px' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'projects', label: 'Projects' },
            { id: 'categories', label: 'Categories' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 6px',
                fontSize: '15px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--slate-500)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            <div className="card">
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Recent Projects</h3>
              {projectsList.slice(0, 4).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--slate-100)' }}>
                  <Link to={`/projects/${p.id}`} style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{p.title}</Link>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Recent Payments</h3>
              {paymentsList.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--slate-400)' }}>No payments yet.</p>
              ) : (
                paymentsList.slice(0, 5).map((pay, idx) => (
                  <div key={pay.id || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--slate-100)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--slate-900)' }}>
                        {pay.projectTitle || 'Project Payment'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--slate-400)' }}>
                        {pay.clientName || ''} → {pay.freelancerName || ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#16a34a' }}>{formatCurrency(pay.amount)}</div>
                      <span className="badge badge-completed" style={{ fontSize: '11px' }}>paid</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
                  <th style={{ padding: '14px 24px', fontSize: '12.5px', textTransform: 'uppercase', color: 'var(--slate-500)' }}>Name</th>
                  <th style={{ padding: '14px 24px', fontSize: '12.5px', textTransform: 'uppercase', color: 'var(--slate-500)' }}>Email</th>
                  <th style={{ padding: '14px 24px', fontSize: '12.5px', textTransform: 'uppercase', color: 'var(--slate-500)' }}>Role</th>
                  <th style={{ padding: '14px 24px', fontSize: '12.5px', textTransform: 'uppercase', color: 'var(--slate-500)' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar-circle" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
                        {u.displayName ? u.displayName.charAt(0) : 'U'}
                      </div>
                      <span>{u.displayName || 'User'}</span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--slate-600)', fontSize: '14px' }}>{u.email}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge badge-role-${u.role?.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--slate-500)', fontSize: '13.5px' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            {projectsList.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '32px', alignItems: 'start' }}>
            {/* Add Category Form matching screenshot 21 */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Add Category</h3>
              <form onSubmit={handleAddCategory}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Photography"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Short description"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                  Add Category
                </button>
              </form>
            </div>

            {/* Existing Categories matching screenshot 21 */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Existing Categories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categoriesList.map(cat => (
                  <div key={cat.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
                        {cat.description}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
