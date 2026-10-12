import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi, categoryApi, adminApi } from '../api/client';
import ProjectCard from '../components/ProjectCard';
import promoVideo from '../../../ai-contest-hero.mp4';
import { 
  ArrowRight, Briefcase, Users, Star, TrendingUp,
  Search, MessageSquare, Shield, CheckCircle, Code, Palette, 
  Server, Smartphone, Video, FileText, BarChart2
} from 'lucide-react';

export default function LandingPage() {
  const [latestProjects, setLatestProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, catRes] = await Promise.all([
          projectApi.getAll({ status: 'open' }),
          categoryApi.getAll()
        ]);
        setLatestProjects((projRes.data || []).slice(0, 4));
        setCategories(catRes.data || []);
        // Fetch real public platform stats
        try {
          const statsRes = await projectApi.getPublicStats();
          setPlatformStats(statsRes.data);
        } catch (_) {
          // Fallback if stats request fails: calculate from projects count
          setPlatformStats({
            totalProjects: projRes.data?.length || 0,
            freelancers: 0,
            clients: 0,
            totalUsers: 0
          });
        }
      } catch (err) {
        console.error("Error loading landing page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getCategoryIcon = (name) => {
    if (name.includes('Code') || name.includes('Web')) return <Code size={20} color="#2563eb" />;
    if (name.includes('Design')) return <Palette size={20} color="#2563eb" />;
    if (name.includes('DevOps') || name.includes('Cloud')) return <Server size={20} color="#2563eb" />;
    if (name.includes('Mobile')) return <Smartphone size={20} color="#2563eb" />;
    if (name.includes('Video')) return <Video size={20} color="#2563eb" />;
    if (name.includes('Writing')) return <FileText size={20} color="#2563eb" />;
    if (name.includes('Data')) return <BarChart2 size={20} color="#2563eb" />;
    return <Search size={20} color="#2563eb" />;
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <video className="hero-background-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src={promoVideo} type="video/mp4" />
        </video>
        <div className="hero-video-shade" />
        <div className="container hero-layout">
          <div className="hero-copy">
            <h1 className="hero-title">
              Hire the best freelancers for<br />any job, online.
            </h1>
            <ul className="hero-benefits">
              <li>World's largest freelance marketplace</li>
              <li>Any job you can possibly think of</li>
              <li>Save up to 90% &amp; get quotes for free</li>
              <li>Pay only when you're 100% happy</li>
            </ul>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary hero-pink-cta">Hire a Freelancer</Link>
              <Link to="/register" className="btn btn-secondary hero-outline-cta">Earn Money Freelancing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats Row (Below Video) */}
      <section style={{ backgroundColor: '#ffffff', padding: '36px 0', borderBottom: '1px solid #eef2f6' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            <div className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '22px 24px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Briefcase size={22} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.1 }}>
                  {platformStats?.totalProjects != null ? platformStats.totalProjects.toLocaleString() : '...'}
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--slate-500)', fontWeight: 500, marginTop: '3px' }}>
                  Projects Posted
                </div>
              </div>
            </div>

            <div className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '22px 24px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Users size={22} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.1 }}>
                  {platformStats?.freelancers != null ? platformStats.freelancers.toLocaleString() : '...'}
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--slate-500)', fontWeight: 500, marginTop: '3px' }}>
                  Active Freelancers
                </div>
              </div>
            </div>

            <div className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '22px 24px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Star size={22} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.1 }}>
                  {platformStats?.clients != null ? platformStats.clients.toLocaleString() : '...'}
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--slate-500)', fontWeight: 500, marginTop: '3px' }}>
                  Clients
                </div>
              </div>
            </div>

            <div className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '22px 24px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <TrendingUp size={22} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.1 }}>
                  {platformStats?.totalUsers != null ? platformStats.totalUsers.toLocaleString() : '...'}
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--slate-500)', fontWeight: 500, marginTop: '3px' }}>
                  Total Users
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by Category */}
      <section style={{ padding: '64px 0', backgroundColor: '#fafbfc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '8px' }}>
              Explore by category
            </h2>
            <p style={{ fontSize: '15.5px', color: 'var(--slate-500)' }}>
              Find the right talent for any type of project.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            {categories.map((cat) => (
              <Link to={`/projects?category=${encodeURIComponent(cat.name)}`} key={cat.id} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getCategoryIcon(cat.name)}
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)' }}>{cat.name}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--slate-500)', lineHeight: '1.5' }}>{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '8px' }}>
              How it works
            </h2>
            <p style={{ fontSize: '15.5px', color: 'var(--slate-500)' }}>
              Simple steps to get your project done
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
            {/* Step 1 */}
            <div className="card" style={{ position: 'relative', paddingTop: '32px' }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '28px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px'
              }}>1</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Briefcase size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--slate-900)' }}>Post a Project</h3>
              <p style={{ fontSize: '14px', color: 'var(--slate-500)', lineHeight: '1.6' }}>
                Tell us what you need — budget, deadline, skills, and experience level. It takes less than 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ position: 'relative', paddingTop: '32px' }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '28px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px'
              }}>2</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Search size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--slate-900)' }}>Review Proposals</h3>
              <p style={{ fontSize: '14px', color: 'var(--slate-500)', lineHeight: '1.6' }}>
                Freelancers submit proposals with their bids. Compare profiles, rates, and cover letters to find your match.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ position: 'relative', paddingTop: '32px' }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '28px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px'
              }}>3</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <MessageSquare size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--slate-900)' }}>Chat & Pay</h3>
              <p style={{ fontSize: '14px', color: 'var(--slate-500)', lineHeight: '1.6' }}>
                Collaborate in real-time chat, track progress, and pay securely when the work is done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Projects Section */}
      <section style={{ padding: '64px 0', backgroundColor: '#fafbfc' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
                Latest projects
              </h2>
              <p style={{ fontSize: '14.5px', color: 'var(--slate-500)' }}>
                Fresh opportunities from clients
              </p>
            </div>
            <Link to="/projects" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>View all</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div>
            {latestProjects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose FreelanceHub Dark Navy Section */}
      <section className="dark-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
              Why choose FreelanceHub
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--slate-400)' }}>
              Everything you need to get work done
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Real-time Chat */}
            <div className="dark-card">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(37,99,235,0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <MessageSquare size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Real-time Chat</h3>
              <p style={{ fontSize: '14px', color: 'var(--slate-400)', lineHeight: '1.6' }}>
                Communicate instantly with built-in messaging. No more email back-and-forth.
              </p>
            </div>

            {/* Secure Payments */}
            <div className="dark-card">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(37,99,235,0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Secure Payments</h3>
              <p style={{ fontSize: '14px', color: 'var(--slate-400)', lineHeight: '1.6' }}>
                Your payments are protected. Pay only when you are satisfied with the work.
              </p>
            </div>

            {/* Verified Reviews */}
            <div className="dark-card">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(37,99,235,0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Star size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Verified Reviews</h3>
              <p style={{ fontSize: '14px', color: 'var(--slate-400)', lineHeight: '1.6' }}>
                Build your reputation with a transparent rating and review system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Get Started Bottom CTA */}
      <section style={{ padding: '80px 0', textAlign: 'center', backgroundColor: '#ffffff' }}>
        <div className="container">
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '12px' }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--slate-500)', marginBottom: '32px' }}>
            Join FreelanceHub today. It's free to sign up and start posting or finding projects.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginBottom: '32px' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ borderRadius: '10px' }}>
              <span>Create Free Account</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/projects" className="btn btn-secondary btn-lg" style={{ borderRadius: '10px' }}>
              <span>Explore Projects</span>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', fontSize: '14px', color: 'var(--slate-500)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} color="#059669" />
              <span>No credit card required</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} color="#059669" />
              <span>Free to join</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} color="#059669" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
