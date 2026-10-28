import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectApi, proposalApi, reviewApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/currency';
import { 
  ArrowLeft, Clock, Calendar, CheckCircle2,
  MessageSquare, User, AlertCircle, Send, Star 
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Proposal form state (for Freelancers)
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalMsg, setProposalMsg] = useState('');

  const loadProjectData = async () => {
    try {
      const res = await projectApi.getById(id);
      setProject(res.data);
      if (res.data) {
        setBidAmount(res.data.budget || '');
      }

      // Load proposals if authenticated
      if (isAuthenticated) {
        try {
          const propRes = await proposalApi.getByProject(id);
          setProposals(propRes.data || []);
        } catch (err) {
          console.log("No proposals or unauthorized to view all");
        }
      }

      // Load reviews if project completed
      if (res.data.status === 'completed') {
        const revRes = await reviewApi.getByProject(id);
        setReviews(revRes.data || []);
      }
    } catch (err) {
      setError('Project not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id, isAuthenticated]);

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!coverLetter || !bidAmount || !estimatedDays) {
      setProposalMsg('Please fill in all fields');
      return;
    }

    setSubmittingProposal(true);
    setProposalMsg('');
    try {
      await proposalApi.submit(id, {
        coverLetter,
        bidAmount: parseFloat(bidAmount),
        estimatedDays: parseInt(estimatedDays, 10)
      });
      setProposalMsg('Proposal submitted successfully!');
      loadProjectData();
    } catch (err) {
      setProposalMsg(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      await proposalApi.accept(proposalId);
      loadProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept proposal');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      await proposalApi.reject(proposalId);
      loadProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject proposal');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--slate-500)' }}>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>{error || 'Project not found'}</h2>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Browse
        </Link>
      </div>
    );
  }

  const isClient = user && user.id === project.clientId;
  const isHiredFreelancer = user && user.id === project.hiredFreelancerId;
  const myProposal = user && proposals.find(p => p.freelancerId === user.id);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 68px)', padding: '36px 0 80px 0' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate-600)',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Projects</span>
          </button>
        </div>

        {/* 2-Column Grid: Details Left, Sidebar Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
          {/* Main Info Column */}
          <div>
            <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span className="badge badge-category" style={{ fontSize: '13px', padding: '4px 12px' }}>
                  {project.categoryName || 'General'}
                </span>
                <span className={`badge badge-${project.status}`} style={{ fontSize: '13px', padding: '4px 12px', textTransform: 'capitalize' }}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '16px' }}>
                {project.title}
              </h1>

              <div style={{ fontSize: '14px', color: 'var(--slate-500)', marginBottom: '24px' }}>
                Posted by <strong style={{ color: 'var(--slate-800)' }}>{project.clientName}</strong>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '10px' }}>
                Description
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--slate-600)', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: '28px' }}>
                {project.description}
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '12px' }}>
                Required Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {project.skills && project.skills.map((s, i) => (
                  <span key={i} className="badge badge-skill" style={{ padding: '5px 12px', fontSize: '13px' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Workspace Banner if In Progress or Completed */}
            {(isClient || isHiredFreelancer) && (project.status === 'in_progress' || project.status === 'completed') && (
              <div className="card" style={{
                padding: '24px',
                marginBottom: '28px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid #bfdbfe',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>
                    Project Workspace Active
                  </h3>
                  <p style={{ fontSize: '14px', color: '#1e40af' }}>
                    Collaborate in real-time chat, exchange updates, and release payments.
                  </p>
                </div>
                <Link to={`/workspace/${project.id}`} className="btn btn-primary btn-md">
                  <MessageSquare size={16} />
                  <span>Open Workspace</span>
                </Link>
              </div>
            )}

            {/* Client: Review Proposals */}
            {isClient && (
              <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '20px' }}>
                  Submitted Proposals ({proposals.length})
                </h3>

                {proposals.length === 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--slate-500)' }}>
                    No proposals submitted yet. Freelancers will submit their bids soon.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {proposals.map(prop => (
                      <div key={prop.id} style={{
                        padding: '20px',
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#ffffff'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--slate-900)' }}>
                              {prop.freelancerName}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
                              Bid: <strong style={{ color: 'var(--primary)' }}>{formatCurrency(prop.bidAmount)}</strong> • Est: {prop.estimatedDays} days
                            </div>
                          </div>
                          <span className={`badge badge-${prop.status}`} style={{ textTransform: 'capitalize' }}>
                            {prop.status}
                          </span>
                        </div>

                        <p style={{ fontSize: '14px', color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: '16px' }}>
                          {prop.coverLetter}
                        </p>

                        {project.status === 'open' && prop.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => handleAcceptProposal(prop.id)}
                              className="btn btn-primary btn-sm"
                            >
                              Accept Proposal
                            </button>
                            <button
                              onClick={() => handleRejectProposal(prop.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Freelancer: Submit Proposal or Proposal Status */}
            {user && user.role === 'FREELANCER' && !isClient && (
              <div className="card" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '18px' }}>
                  {myProposal ? 'Your Proposal' : 'Submit a Proposal'}
                </h3>

                {proposalMsg && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    backgroundColor: proposalMsg.includes('success') ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: proposalMsg.includes('success') ? 'var(--success-text)' : 'var(--danger-text)'
                  }}>
                    {proposalMsg}
                  </div>
                )}

                {myProposal ? (
                  <div style={{ padding: '18px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '14px', color: 'var(--slate-700)' }}>
                        Your Bid: <strong style={{ color: 'var(--primary)' }}>{formatCurrency(myProposal.bidAmount)}</strong> • Est: {myProposal.estimatedDays} days
                      </div>
                      <span className={`badge badge-${myProposal.status}`} style={{ textTransform: 'capitalize' }}>
                        {myProposal.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                      {myProposal.coverLetter}
                    </p>
                  </div>
                ) : project.status === 'open' ? (
                  <form onSubmit={handleProposalSubmit}>
                    <div className="form-group">
                      <label className="form-label">Cover Letter</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Explain why you're a great fit for this project and your relevant past experience..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Your Bid Amount (INR)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Estimated Delivery (Days)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="e.g. 14"
                          value={estimatedDays}
                          onChange={(e) => setEstimatedDays(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingProposal}
                      className="btn btn-primary"
                      style={{ padding: '12px 28px', marginTop: '10px' }}
                    >
                      <Send size={16} />
                      <span>{submittingProposal ? 'Submitting...' : 'Submit Proposal'}</span>
                    </button>
                  </form>
                ) : (
                  <p style={{ fontSize: '14px', color: 'var(--slate-500)' }}>
                    This project is currently {project.status.replace('_', ' ')} and not accepting new proposals.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar Info Card */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '20px' }}>
              Project Overview
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ fontSize: '12.5px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Budget
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatCurrency(project.budget)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12.5px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Deadline
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px' }}>
                  {project.deadline || 'Flexible'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12.5px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Experience Level
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px' }}>
                  {project.experienceLevel || 'Intermediate'}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '16px' }}>
                <div style={{ fontSize: '12.5px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Client Information
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                    {project.clientName ? project.clientName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate-800)' }}>
                      {project.clientName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--slate-400)' }}>
                      Verified Client
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
