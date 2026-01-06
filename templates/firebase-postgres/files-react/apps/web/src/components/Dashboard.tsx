/**
 * Dashboard Component
 *
 * Protected page showing user info and items from PostgreSQL.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  bio?: string;
  createdAt?: string;
}

interface Item {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
}

export function Dashboard() {
  const { user, signOut, getIdToken } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const token = await getIdToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch profile and items in parallel
      const [profileRes, itemsRes] = await Promise.all([
        fetch('/api/profile', { headers }),
        fetch('/api/items', { headers }),
      ]);

      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      if (!itemsRes.ok) throw new Error('Failed to fetch items');

      const profileData = await profileRes.json();
      const itemsData = await itemsRes.json();

      setProfile(profileData);
      setItems(itemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [getIdToken]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    setCreating(true);
    try {
      const token = await getIdToken();
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newItemTitle }),
      });

      if (!response.ok) throw new Error('Failed to create item');

      const item = await response.json();
      setItems([item, ...items]);
      setNewItemTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const token = await getIdToken();
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete item');

      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
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

        {error && <div className="card error-message">{error}</div>}

        <div className="card">
          <h2>Your Profile</h2>
          {loading && <p>Loading profile...</p>}
          {profile && (
            <dl className="profile-details">
              <dt>User ID</dt>
              <dd>{profile.id}</dd>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
              {profile.name && (
                <>
                  <dt>Name</dt>
                  <dd>{profile.name}</dd>
                </>
              )}
              {profile.createdAt && (
                <>
                  <dt>Member since</dt>
                  <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
                </>
              )}
            </dl>
          )}
        </div>

        <div className="card">
          <h2>Your Items</h2>
          <form onSubmit={handleCreateItem} className="item-form">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Add a new item..."
              disabled={creating}
            />
            <button type="submit" className="btn-primary" disabled={creating || !newItemTitle.trim()}>
              {creating ? 'Adding...' : 'Add'}
            </button>
          </form>

          {loading && <p>Loading items...</p>}
          {!loading && items.length === 0 && (
            <p className="empty-state">No items yet. Add one above!</p>
          )}
          <ul className="items-list">
            {items.map((item) => (
              <li key={item.id} className="item">
                <div className="item-content">
                  <span className="item-title">{item.title}</span>
                  <span className="item-date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="btn-delete"
                  aria-label="Delete item"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}