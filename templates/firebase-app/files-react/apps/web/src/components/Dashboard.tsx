/**
 * Dashboard Component
 *
 * Protected page showing user info and calling the authenticated API.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  uid: string;
  email: string;
  createdAt?: string;
}

export function Dashboard() {
  const { user, signOut, getIdToken } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = await getIdToken();
        if (!token) {
          setError('Not authenticated');
          return;
        }

        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [getIdToken]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleSignOut} className="btn-secondary">
          Sign Out
        </button>
      </header>

      <main className="dashboard-content">
        <div className="card">
          <h2>Welcome!</h2>
          <p>You're signed in as <strong>{user?.email}</strong></p>
        </div>

        <div className="card">
          <h2>Your Profile</h2>
          {loading && <p>Loading profile...</p>}
          {error && <p className="error-message">{error}</p>}
          {profile && (
            <dl className="profile-details">
              <dt>User ID</dt>
              <dd>{profile.uid}</dd>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
              {profile.createdAt && (
                <>
                  <dt>Member since</dt>
                  <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
                </>
              )}
            </dl>
          )}
        </div>
      </main>
    </div>
  );
}
