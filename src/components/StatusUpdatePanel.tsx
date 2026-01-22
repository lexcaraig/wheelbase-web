import type { StatusTemplate } from '../types/emergency';

interface StatusUpdatePanelProps {
  statusTemplates: StatusTemplate[];
  onSendStatus: (statusCode: string) => Promise<boolean>;
  isSending: boolean;
  disabled: boolean;
}

// Category icons for visual grouping
const categoryIcons: Record<string, string> = {
  Acknowledgment: '✓',
  Response: '📞',
  Location: '📍',
  Time: '⏰',
  Other: '💬',
};

export function StatusUpdatePanel({
  statusTemplates,
  onSendStatus,
  isSending,
  disabled,
}: StatusUpdatePanelProps) {
  if (statusTemplates.length === 0 || disabled) {
    return null;
  }

  // Group templates by category
  const groupedTemplates = statusTemplates.reduce((acc, template) => {
    const category = template.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, StatusTemplate[]>);

  const handleStatusClick = async (statusCode: string) => {
    if (isSending) return;
    await onSendStatus(statusCode);
  };

  return (
    <div className="bg-secondary-background rounded-xl p-4 space-y-4">
      <h3 className="font-medium text-white flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Status Updates
      </h3>

      <div className="space-y-4">
        {Object.entries(groupedTemplates).map(([category, templates]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{categoryIcons[category] || '💬'}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wide">{category}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {templates.map(template => (
                <button
                  key={template.code}
                  onClick={() => handleStatusClick(template.code)}
                  disabled={isSending}
                  className="bg-card-background hover:bg-opacity-80 text-white text-sm py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>{template.icon}</span>
                  <span>{template.display_text}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
