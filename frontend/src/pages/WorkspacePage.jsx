import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi, messageApi, paymentApi, reviewApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/currency';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { 
  Send, CheckCircle, Star, ArrowLeft,
  MessageSquare, ShieldCheck, Clock 
} from 'lucide-react';

export default function WorkspacePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const [projRes, msgRes] = await Promise.all([
          projectApi.getById(projectId),
          messageApi.getProjectMessages(projectId)
        ]);
        setProject(projRes.data);
        setMessages(msgRes.data || []);
      } catch (err) {
        console.error("Failed to load workspace data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspace();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Setup WebSocket STOMP connection
  useEffect(() => {
    let client = null;
    try {
      client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        reconnectDelay: 5000,
        onConnect: () => {
          setStompClient(client);
          client.subscribe(`/topic/project/${projectId}`, (msg) => {
            if (msg.body) {
              const newMsg = JSON.parse(msg.body);
              setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            }
          });
        },
        onStompError: (frame) => {
          console.warn("STOMP error:", frame);
        }
      });

      client.activate();
    } catch (e) {
      console.warn("WebSocket init error:", e);
    }

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [projectId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const content = inputMessage.trim();
    setInputMessage('');

    if (stompClient && stompClient.connected) {
      const payload = {
        projectId,
        senderId: user.id,
        senderName: user.displayName,
        senderRole: user.role,
        content
      };
      stompClient.publish({
        destination: `/app/chat/${projectId}`,
        body: JSON.stringify(payload)
      });
    } else {
      try {
        const res = await messageApi.sendMessage(projectId, content);
        setMessages(prev => [...prev, res.data]);
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };

  // Payment Release — Razorpay Test Mode
  const handleReleasePayment = async () => {
    if (!window.confirm(`Release payment of ${formatCurrency(project.budget)} to ${project.hiredFreelancerName}?\n\nThis will open Razorpay checkout to complete the payment.`)) {
      return;
    }

    if (!window.Razorpay) {
      alert('Razorpay checkout script is not loaded. Please refresh the page and try again.');
      return;
    }

    try {
      const orderRes = await paymentApi.createOrder(projectId, project.budget, token);
      const { orderId, amount, currency, keyId } = orderRes.data;

      if (!keyId || !orderId) {
        throw new Error('Invalid order response from server. Please check backend configuration.');
      }

      const options = {
        key: keyId,
        amount: Math.round(amount * 100), // smallest currency unit
        currency: currency || 'INR',
        name: 'FreelanceHub',
        description: `Payment Release: ${project.title}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await paymentApi.verify({
              projectId,
              razorpayOrderId: response.razorpay_order_id || orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount
            });
            alert('✅ Payment released successfully! Project marked as completed.');
            const updated = await projectApi.getById(projectId);
            setProject(updated.data);
            setShowReviewModal(true);
          } catch (e) {
            alert('❌ Payment verification failed: ' + (e.response?.data?.message || e.message));
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Razorpay checkout dismissed');
          }
        },
        prefill: {
          name: user?.displayName || '',
          email: user?.email || ''
        },
        notes: {
          projectId: projectId
        },
        theme: { color: '#2563eb' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('❌ Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      alert('❌ Failed to initiate payment: ' + msg);
      console.error('Payment error:', err);
    }
  };


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      await reviewApi.create(projectId, {
        rating: reviewRating,
        comment: reviewComment
      });
      alert("Thank you! Your verified review has been submitted.");
      setShowReviewModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--slate-500)' }}>Loading project workspace...</p>
      </div>
    );
  }

  const isClient = user?.id === project.clientId;

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', minHeight: 'calc(100vh - 68px)', padding: '24px 0' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Back</span>
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)' }}>
              {project.title}
            </h2>
            <span className={`badge badge-${project.status}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {isClient && project.status === 'in_progress' && (
              <button
                onClick={handleReleasePayment}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
              >
                <ShieldCheck size={16} />
                <span>Release Payment ({formatCurrency(project.budget)})</span>
              </button>
            )}

            {project.status === 'completed' && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="btn btn-secondary btn-sm"
              >
                <Star size={15} color="#eab308" />
                <span>Leave Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Workspace Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', height: '620px' }}>
          <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--slate-200)', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={17} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: '14.5px' }}>Project Workspace Chat</span>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff' }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--slate-400)', fontSize: '14px' }}>
                  No messages yet. Send a message to start communicating!
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id || idx}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ fontSize: '11.5px', color: 'var(--slate-400)', marginBottom: '3px' }}>
                        {m.senderName} ({m.senderRole})
                      </div>
                      <div style={{
                        padding: '10px 16px',
                        borderRadius: '14px',
                        backgroundColor: isMe ? 'var(--primary)' : 'var(--slate-100)',
                        color: isMe ? '#ffffff' : 'var(--slate-800)',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '14px 20px', borderTop: '1px solid var(--slate-200)', backgroundColor: '#ffffff', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
                <Send size={16} />
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)' }}>Workspace Details</h4>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700 }}>Agreed Budget</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                {formatCurrency(project.budget)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700 }}>Client</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px' }}>
                {project.clientName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700 }}>Hired Freelancer</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate-800)', marginTop: '2px' }}>
                {project.hiredFreelancerName || 'Not assigned'}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '14px' }}>
              <div style={{ fontSize: '12px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Status</div>
              <span className={`badge badge-${project.status}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{ width: '440px', padding: '30px', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Leave a Review</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--slate-500)', marginBottom: '20px' }}>
                Share your experience working on this project.
              </p>

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Rating (1 to 5 Stars)</label>
                  <div style={{ display: 'flex', gap: '8px', margin: '6px 0' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={28}
                        style={{ cursor: 'pointer', fill: star <= reviewRating ? '#eab308' : 'none', color: '#eab308' }}
                        onClick={() => setReviewRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Write your feedback..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" disabled={reviewSubmitting} className="btn btn-primary" style={{ flex: 1 }}>
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
