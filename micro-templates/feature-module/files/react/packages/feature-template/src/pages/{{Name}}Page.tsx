import { Button, Card, useNotificationStore } from '@{{org}}/shared';
import { {{Name}}Card } from '../components/{{Name}}Card';
import { use{{Name}}Store } from '../stores/{{name}}';

export function {{Name}}Page() {
  const notifications = useNotificationStore();
  const { items, loading } = use{{Name}}Store();

  function handleAction() {
    notifications.show('Action completed!', 'success');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{{Name}}</h1>
          <p className="text-gray-500 mt-1">
            Manage your {{name}} items here.
          </p>
        </div>
        <Button onClick={handleAction}>
          New Item
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <{{Name}}Card key={item.id} item={item} />
        ))}

        {/* Empty state */}
        {items.length === 0 && (
          <Card className="col-span-full">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new item.</p>
              <div className="mt-6">
                <Button onClick={handleAction}>
                  Create Item
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
