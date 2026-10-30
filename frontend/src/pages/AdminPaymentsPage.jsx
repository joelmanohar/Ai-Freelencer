import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, RefreshCw, Search } from 'lucide-react';
import { paymentApi } from '../api/client';
import { formatCurrency } from '../utils/currency';

const AMOUNT_THRESHOLD = 5000;
const PAGE_SIZE = 15;

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [query, setQuery] = useState('');
  const [amountFilter, setAmountFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPayments() {
    setLoading(true);
    setError('');
    try {
      const response = await paymentApi.getAll();
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load payments. Check your admin access and try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPayments(); }, []);

  const aboveThreshold = payments.filter(payment => Number(payment.amount) > AMOUNT_THRESHOLD);
  const atOrBelowThreshold = payments.filter(payment => Number(payment.amount) <= AMOUNT_THRESHOLD);
  const filteredPayments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return payments.filter(payment => {
      const amount = Number(payment.amount) || 0;
      const matchesAmount = amountFilter === 'ALL'
        || (amountFilter === 'ABOVE' && amount > AMOUNT_THRESHOLD)
        || (amountFilter === 'BELOW' && amount <= AMOUNT_THRESHOLD);
      const matchesQuery = !normalizedQuery || [payment.clientName, payment.freelancerName, payment.projectTitle, payment.status]
        .some(value => String(value || '').toLowerCase().includes(normalizedQuery));
      return matchesAmount && matchesQuery;
    });
  }, [payments, amountFilter, query]);

  useEffect(() => { setPage(0); }, [query, amountFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const visiblePayments = filteredPayments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className="admin-users-page">
      <div className="container">
        <div className="admin-users-page__heading">
          <div>
            <Link to="/dashboard" className="admin-users-page__back">← Admin Dashboard</Link>
            <h1>Payment Records</h1>
            <p>See who paid and who received each marketplace payment.</p>
          </div>
          <button className="btn btn-secondary" type="button" onClick={loadPayments} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        <div className="admin-users-page__summary">
          <div className="admin-users-page__summary-card">
            <span className="admin-users-page__summary-icon"><IndianRupee size={20} /></span>
            <span><strong>{payments.length}</strong><small>All payments</small></span>
          </div>
          <div className="admin-users-page__summary-card">
            <span className="admin-users-page__summary-icon admin-users-page__summary-icon--green"><IndianRupee size={20} /></span>
            <span><strong>{aboveThreshold.length}</strong><small>Above ₹5,000</small></span>
          </div>
          <div className="admin-users-page__summary-card">
            <span className="admin-users-page__summary-icon admin-users-page__summary-icon--blue"><IndianRupee size={20} /></span>
            <span><strong>{atOrBelowThreshold.length}</strong><small>₹5,000 or below</small></span>
          </div>
        </div>

        <div className="admin-users-page__table-card">
          <div className="admin-users-page__toolbar">
            <label className="admin-users-page__search">
              <Search size={17} aria-hidden="true" />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search client, freelancer, or project" />
            </label>
            <select value={amountFilter} onChange={event => setAmountFilter(event.target.value)} aria-label="Filter payments by amount">
              <option value="ALL">All amounts</option>
              <option value="ABOVE">Above ₹5,000</option>
              <option value="BELOW">₹5,000 or below</option>
            </select>
            <span className="admin-users-page__result-count">{filteredPayments.length} shown</span>
          </div>

          {error && <div className="admin-users-page__error" role="alert">{error}</div>}
          {filteredPayments.length > PAGE_SIZE && (
            <div className="admin-users-page__pagination" aria-label="Payment table pagination">
              <span>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredPayments.length)} of {filteredPayments.length}</span>
              <div>
                <button type="button" className="btn btn-secondary" onClick={() => setPage(current => Math.max(0, current - 1))} disabled={page === 0}>Previous</button>
                <span>Page {page + 1} of {pageCount}</span>
                <button type="button" className="btn btn-secondary" onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))} disabled={page >= pageCount - 1}>Next</button>
              </div>
            </div>
          )}

          <div className="admin-users-page__table-scroll">
            <table className="admin-users-page__table">
              <thead><tr><th>Client who paid</th><th>Freelancer paid</th><th>Project</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="admin-users-page__empty">Loading payment records…</td></tr>
                ) : visiblePayments.length ? visiblePayments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.clientName || '—'}</td>
                    <td>{payment.freelancerName || '—'}</td>
                    <td>{payment.projectTitle || 'Project payment'}</td>
                    <td className="admin-payments-page__amount">{formatCurrency(payment.amount)}</td>
                    <td><span className={`badge badge-${payment.status?.toLowerCase() || 'completed'}`}>{payment.status || 'completed'}</span></td>
                    <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="admin-users-page__empty">{payments.length ? 'No payments match this filter.' : 'No payment records found.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
