import { Card } from '@{{org}}/shared';

interface {{Name}}Item {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
}

interface {{Name}}CardProps {
  item: {{Name}}Item;
}

export function {{Name}}Card({ item }: {{Name}}CardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {item.description}
          </p>
        </div>
        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
          {item.status}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Created {item.createdAt.toLocaleDateString()}
        </span>
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          View details →
        </button>
      </div>
    </Card>
  );
}
