import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Github, Twitter, Linkedin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-col" style={{ maxWidth: '320px' }}>
            <div className="nav-brand" style={{ marginBottom: '14px' }}>
              <Logo height={38} variant="dark" />
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--slate-500)', lineHeight: '1.6', marginBottom: '20px' }}>
              The marketplace where clients and freelancers connect, collaborate, and build great things together.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-600)' }}>
                <Github size={17} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-600)' }}>
                <Twitter size={17} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-600)' }}>
                <Linkedin size={17} />
              </a>
            </div>
          </div>

          {/* For Clients */}
          <div className="footer-col">
            <h4>For Clients</h4>
            <ul>
              <li><Link to="/post-project">Post a Project</Link></li>
              <li><Link to="/projects">Find Talent</Link></li>
              <li><a href="#how-it-works">How it Works</a></li>
            </ul>
          </div>

          {/* For Freelancers */}
          <div className="footer-col">
            <h4>For Freelancers</h4>
            <ul>
              <li><Link to="/projects">Find Work</Link></li>
              <li><Link to="/projects">Browse Projects</Link></li>
              <li><Link to="/profile">Create Profile</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© 2026 FreelanceHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
