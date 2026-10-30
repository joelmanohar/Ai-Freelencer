import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import { paymentApi, userApi } from '../api/client';
import { formatCurrency } from '../utils/currency';

const RECORD_TYPES = [
  { value: 'USERS', label: 'Users' },
  { value: 'CLIENTS', label: 'Clients' },
  { value: 'FREELANCERS', label: 'Freelancers' },
  { value: 'PAYMENTS', label: 'Payments' }
];

export default function AdminRecordsPage() {
  const [recordType, setRecordType] = useState('USERS');
  const [minimumAmount, setMinimumAmount] = useState('500');
  const [records, setRecords] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSubmitted(false);

    try {
      if (recordType === 'PAYMENTS') {
        const amount = Number(minimumAmount);
        if (!Number.isFinite(amount) || amount < 0) {
          setError('Enter a valid minimum payment amount.');
          return;
        }
        const response = await paymentApi.getAll();
        const payments = Array.isArray(response.data) ? response.data : [];
        setRecords(payments.filter(payment => Number(payment.amount) >= amount));
      } else {
        const response = await userApi.getAll();
        const users = Array.isArray(response.data) ? response.data : [];
        setRecords(recordType === 'USERS'
          ? users
          : users.filter(user => user.role?.toUpperCase() === recordType.slice(0, -1)));
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load records. Check your admin access and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-users-page">
      <div className="container">
        <div className="admin-users-page__heading">
          <div>
            <Link to="/dashboard" className="admin-users-page__back">← Admin Dashboard</Link>
            <h1>Admin Records</h1>
            <p>Choose the records to view, then submit your selection.</p>
          </div>
        </div>

        <div className="admin-users-page__table-card">
          <form className="admin-records-page__filters" onSubmit={handleSubmit}>
            <label>
              <span>Show records</span>
              <select value={recordType} onChange={event => { setRecordType(event.target.value); setSubmitted(false); }}>
                {RECORD_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </label>
            {recordType === 'PAYMENTS' && (
              <label>
                <span>Minimum payment (₹)</span>
                <input type="number" min="0" step="0.01" value={minimumAmount} onChange={event => { setMinimumAmount(event.target.value); setSubmitted(false); }} placeholder="500" />
              </label>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <RefreshCw size={16} className="spin" /> : <Search size={16} />}
              {loading ? 'Loading…' : 'Submit'}
            </button>
          </form>

          {error && <div className="admin-users-page__error" role="alert">{error}</div>}
          {submitted && (
            <div className="admin-records-page__results">
              <div className="admin-records-page__result-heading">
                <h2>{RECORD_TYPES.find(type => type.value === recordType)?.label} results</h2>
                <span>{records.length} records</span>
              </div>
              <div className="admin-users-page__table-scroll">
                <table className="admin-users-page__table">
                  {recordType === 'PAYMENTS' ? (
                    <>
                      <thead><tr><th>Client who paid</th><th>Freelancer</th><th>Project</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {records.length ? records.map(payment => (
                          <tr key={payment.id}>
                            <td>{payment.clientName || '—'}</td><td>{payment.freelancerName || '—'}</td>
                            <td>{payment.projectTitle || 'Project payment'}</td><td className="admin-payments-page__amount">{formatCurrency(payment.amount)}</td>
                            <td><span className={`badge badge-${payment.status?.toLowerCase() || 'completed'}`}>{payment.status || 'completed'}</span></td>
                            <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                          </tr>
                        )) : <tr><td colSpan="6" className="admin-users-page__empty">No payments match this minimum amount.</td></tr>}
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Location</th><th>Joined</th></tr></thead>
                      <tbody>
                        {records.length ? records.map(user => (
                          <tr key={user.id}>
                            <td><Link to={`/profile/${user.id}`} className="admin-records-page__user-link">{user.displayName || 'Unnamed user'}</Link></td>
                            <td>{user.email || '—'}</td><td>{user.role || 'Unknown'}</td><td>{user.location || '—'}</td>
                            <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                          </tr>
                        )) : <tr><td colSpan="5" className="admin-users-page__empty">No matching records found.</td></tr>}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
