import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/client';
import { X, Plus, Check } from 'lucide-react';

export default function EditProfilePage() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Remote');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Expert');
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function loadCurrent() {
      if (user?.id) {
        try {
          const res = await userApi.getProfile(user.id);
          const u = res.data;
          setDisplayName(u.displayName || '');
          setTitle(u.title || '');
          setBio(u.bio || '');
          setLocation(u.location || 'Remote');
          setHourlyRate(u.hourlyRate || '');
          setExperienceLevel(u.experienceLevel || 'Expert');
          setSkills(u.skills || []);
        } catch (e) {
          console.error("Failed to load user profile:", e);
        }
      }
    }
    loadCurrent();
  }, [user]);

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleKeyDownSkill = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (sToRemove) => {
    setSkills(skills.filter(s => s !== sToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await userApi.updateProfile({
        displayName,
        title,
        bio,
        location,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        experienceLevel,
        skills
      });
      await refreshUser();
      setMsg('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 800);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 68px)', padding: '40px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        {/* Header matching screenshot 11 */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
            Edit Profile
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate-500)' }}>
            Update your profile information
          </p>
        </div>

        {msg && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            backgroundColor: msg.includes('success') ? 'var(--success-bg)' : 'var(--danger-bg)',
            color: msg.includes('success') ? 'var(--success-text)' : 'var(--danger-text)'
          }}>
            {msg}
          </div>
        )}

        {/* Form Card matching screenshot 11 */}
        <div className="card" style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-control"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Professional Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="Full Stack Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-control"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hourly Rate (USD)</label>
                <input
                  type="number"
                  className="form-control"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select
                className="form-control"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            {/* Skills tag input */}
            <div className="form-group">
              <label className="form-label">Skills</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a skill and press Enter"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={handleKeyDownSkill}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddSkill}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              {/* Skills Tag Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skills.map((s, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      backgroundColor: '#eff6ff',
                      color: 'var(--primary)',
                      border: '1px solid #bfdbfe',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    <span>{s}</span>
                    <X
                      size={14}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveSkill(s)}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ padding: '12px 28px' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/profile')}
                style={{ padding: '12px 24px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
