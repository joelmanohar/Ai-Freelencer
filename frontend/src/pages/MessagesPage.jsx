import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../api/client';
import EmptyState from '../components/EmptyState';
import { MessageSquare, ArrowRight } from 'lucide-react';

export default function MessagesPage() {
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await projectApi.getMy();
        const active = (res.data || []).filter(p => p.status === 'in_progress' || p.status === 'completed');
        setActiveProjects(active);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 68px)', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Header matching screenshot 10 */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
            Messages
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate-500)' }}>
            Your active conversations
          </p>
        </div>

        {/* Content */}
        {activeProjects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeProjects.map(proj => (
              <div
                key={proj.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  cursor: 'pointer'
                }}
                onClick={() => window.location.href = `/workspace/${proj.id}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16.5px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '2px' }}>
                      {proj.title}
                    </h3>
                    <div style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
                      Workspace with {proj.hiredFreelancerName || proj.clientName} • <span className={`badge badge-${proj.status}`}>{proj.status}</span>
                    </div>
                  </div>
                </div>

                <Link to={`/workspace/${proj.id}`} className="btn btn-secondary btn-sm">
                  <span>Open Chat</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="message"
            title="No conversations yet"
            description="When you start working on a project, your chat conversations will appear here."
          />
        )}
      </div>
    </div>
  );
}
