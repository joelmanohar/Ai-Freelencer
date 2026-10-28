import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function ProjectCard({ project }) {
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    const diff = Math.floor((new Date() - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '24px',
        cursor: 'pointer',
        padding: '24px 28px',
        marginBottom: '16px',
        transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease'
      }}>
        {/* Left Side */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span className="badge badge-category" style={{ fontSize: '12px', padding: '3px 10px', background: '#eff6ff', color: '#2563eb' }}>
              {project.categoryName || 'General'}
            </span>
            <span className={`badge badge-${project.status?.toLowerCase() || 'open'}`} style={{ textTransform: 'capitalize' }}>
              {project.status || 'Open'}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--slate-400)' }}>
              {formatTimeAgo(project.createdAt)}
            </span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '8px' }}>
            {project.title}
          </h3>

          <p style={{
            fontSize: '14px',
            color: 'var(--slate-500)',
            lineHeight: '1.6',
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {project.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {project.skills && project.skills.map((skill, idx) => (
              <span key={idx} className="badge badge-skill" style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '12.5px' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          minWidth: '150px',
          alignSelf: 'stretch'
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
              {formatCurrency(project.budget)}
            </div>
            {project.deadline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--slate-500)', justifyContent: 'flex-end' }}>
                <Clock size={13} />
                <span>{project.deadline}</span>
              </div>
            )}
            {project.experienceLevel && (
              <div style={{ marginTop: '8px' }}>
                <span className="badge" style={{
                  backgroundColor: '#f1f5f9',
                  color: '#0284c7',
                  border: '1px solid #e0f2fe',
                  fontSize: '12px'
                }}>
                  {project.experienceLevel}
                </span>
              </div>
            )}
          </div>

          <div style={{ color: 'var(--slate-400)', marginTop: '20px' }}>
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
}
