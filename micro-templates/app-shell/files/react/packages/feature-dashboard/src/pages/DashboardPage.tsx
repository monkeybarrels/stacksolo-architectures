import { useEffect } from 'react';
import { Card } from '@{{org}}/shared';
import { StatsCard } from '../components/StatsCard';
import { useDashboardStore } from '../stores/dashboard';

export function DashboardPage() {
  const { stats, loading, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome to your dashboard overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.users}
          icon="users"
          trend={{ value: 12, direction: 'up' }}
        />
        <StatsCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon="dollar"
          trend={{ value: 8, direction: 'up' }}
        />
        <StatsCard
          title="Orders"
          value={stats.orders}
          icon="cart"
          trend={{ value: 3, direction: 'down' }}
        />
        <StatsCard
          title="Active Sessions"
          value={stats.sessions}
          icon="activity"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">{i}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Activity item {i}</p>
                  <p className="text-xs text-gray-500">{i} hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {['Create Report', 'Add User', 'View Analytics', 'Settings'].map((action) => (
              <button
                key={action}
                className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">{action}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
