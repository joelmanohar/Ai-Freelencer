import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectApi, categoryApi } from '../api/client';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';
import { Search } from 'lucide-react';

export default function BrowseProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All Categories';

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBudget, setSelectedBudget] = useState('Any Budget');
  const [selectedExp, setSelectedExp] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, catRes] = await Promise.all([
          projectApi.getAll(),
          categoryApi.getAll()
        ]);
        setProjects(projRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter & sort logic
  const filteredProjects = projects.filter(p => {
    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchSkill = p.skills?.some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSkill) return false;
    }

    // Category
    if (selectedCategory !== 'All Categories' && p.categoryName !== selectedCategory) {
      return false;
    }

    // All stored and displayed project budgets are INR.
    if (selectedBudget === 'under' && p.budget >= 1000) return false;
    if (selectedBudget === '1000-3000' && (p.budget < 1000 || p.budget > 3000)) return false;
    if (selectedBudget === '3000-5000' && (p.budget < 3000 || p.budget > 5000)) return false;
    if (selectedBudget === '5000+' && p.budget < 5000) return false;

    // Experience Level
    if (selectedExp !== 'All' && p.experienceLevel?.toLowerCase() !== selectedExp.toLowerCase()) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'budget_high' || sortBy === 'budget_low') {
      return sortBy === 'budget_high' ? (b.budget || 0) - (a.budget || 0) : (a.budget || 0) - (b.budget || 0);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 68px)', padding: '40px 0 80px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '6px' }}>
            Browse Projects
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate-500)' }}>
            Find the perfect project that matches your skills
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div className="input-with-icon">
            <Search size={18} />
            <input
              type="text"
              className="form-control"
              style={{ height: '48px', fontSize: '15px', borderRadius: '10px' }}
              placeholder="Search projects, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Projects List */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Left Sidebar Filters */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '20px' }}>
              Filters
            </h3>

            {/* Category */}
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Category</label>
              <select
                className="form-control"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSearchParams(e.target.value === 'All Categories' ? {} : { category: e.target.value });
                }}
              >
                <option value="All Categories">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Budget Range */}
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Budget Range</label>
              <select
                className="form-control"
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
              >
                <option value="Any Budget">Any Budget</option>
                <option value="under">Under ₹1,000</option>
                <option value="1000-3000">₹1,000 - ₹3,000</option>
                <option value="3000-5000">₹3,000 - ₹5,000</option>
                <option value="5000+">₹5,000+</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', marginBottom: '10px' }}>
                Experience Level
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['All', 'Beginner', 'Intermediate', 'Expert'].map(level => (
                  <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--slate-700)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="expLevel"
                      checked={selectedExp === level}
                      onChange={() => setSelectedExp(level)}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Project Count & List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '14.5px', color: 'var(--slate-600)', fontWeight: 500 }}>
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
              </div>

              <div>
                <select
                  className="form-control"
                  style={{ width: '160px', padding: '6px 12px', fontSize: '13.5px' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="budget_high">Budget: High to Low</option>
                  <option value="budget_low">Budget: Low to High</option>
                </select>
              </div>
            </div>

            {/* Project List or Empty State */}
            {filteredProjects.length > 0 ? (
              filteredProjects.map(p => (
                <ProjectCard key={p.id} project={p} />
              ))
            ) : (
              <EmptyState
                icon="briefcase"
                title="No projects found"
                description="Try adjusting your filters or search terms to find more projects."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
