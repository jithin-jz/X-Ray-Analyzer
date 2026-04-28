import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
