import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userApi, reviewApi } from '../api/client';
import { Star, MapPin, IndianRupee, Calendar, Edit, Award } from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const targetId = id || currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!targetId) return;
      try {
        const [userRes, revRes] = await Promise.all([
          userApi.getProfile(targetId),
          reviewApi.getByUser(targetId)
        ]);
        setProfile(userRes.data);
        setReviews(revRes.data || []);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [targetId]);

  // Compute average rating from reviews
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--slate-500)' }}>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>User not found</h2>
      </div>
    );
  }

  const isMe = currentUser?.id === profile.id;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 68px)', padding: '40px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: '36px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div className="avatar-circle" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px' }}>
                  {profile.displayName}
                </h1>
                <div style={{ fontSize: '15px', color: 'var(--slate-600)', fontWeight: 500 }}>
                  {profile.title || (profile.role === 'CLIENT' ? 'Project Client' : 'Professional Freelancer')}
                </div>
              </div>
            </div>

            {isMe && (
              <Link to="/edit-profile" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit size={15} />
                <span>Edit Profile</span>
              </Link>
            )}
          </div>

          {/* Key Meta Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '16px 0', borderTop: '1px solid var(--slate-100)', borderBottom: '1px solid var(--slate-100)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--slate-600)' }}>
              <Star size={16} color="#eab308" fill="#eab308" />
              {avgRating
                ? <span><strong>{avgRating}</strong> ({reviews.length} reviews)</span>
                : <span style={{ color: 'var(--slate-400)' }}>No reviews yet</span>
              }
            </div>

            {profile.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--slate-600)' }}>
                <MapPin size={16} />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.hourlyRate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--slate-600)' }}>
                <IndianRupee size={16} />
                <span><strong>₹{Number(profile.hourlyRate).toLocaleString('en-IN')}</strong> / hr</span>
              </div>
            )}

            {profile.experienceLevel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--slate-600)' }}>
                <Award size={16} />
                <span>{profile.experienceLevel} Level</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--slate-900)' }}>
                About
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--slate-600)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {profile.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--slate-900)' }}>
                Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.skills.map((s, idx) => (
                  <span key={idx} className="badge badge-skill" style={{ padding: '6px 14px', fontSize: '13px' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="card" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '20px' }}>
            Client Reviews ({reviews.length})
          </h2>

          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map(r => (
                <div key={r.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--slate-100)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--slate-800)' }}>
                      {r.reviewerName}
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(r.rating || 5)].map((_, i) => (
                        <Star key={i} size={15} color="#eab308" fill="#eab308" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--slate-600)', lineHeight: '1.6' }}>
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: 'var(--slate-500)' }}>
              No reviews yet. Completed projects will have verified reviews displayed here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
