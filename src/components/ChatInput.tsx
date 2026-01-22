import { useState, type FormEvent } from 'react';
import type { StatusTemplate } from '../types/emergency';

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  onSendStatus: (statusCode: string) => Promise<boolean>;
  statusTemplates: StatusTemplate[];
  disabled: boolean;
  isSending: boolean;
}

export function ChatInput({
  onSendMessage,
  onSendStatus,
  statusTemplates,
  disabled,
  isSending,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || isSending) return;

    const success = await onSendMessage(message.trim());
    if (success) {
      setMessage('');
    }
  };

  const handleQuickReply = async (statusCode: string) => {
    if (disabled || isSending) return;
    await onSendStatus(statusCode);
    setShowQuickReplies(false);
  };

  // Group templates by category
  const groupedTemplates = statusTemplates.reduce((acc, template) => {
    const category = template.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, StatusTemplate[]>);

  if (disabled) {
    return (
      <div className="bg-secondary-background rounded-xl p-4">
        <p className="text-gray-500 text-center text-sm">
          Chat is disabled for resolved alerts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick replies panel */}
      {showQuickReplies && statusTemplates.length > 0 && (
        <div className="bg-secondary-background rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Quick Replies</span>
            <button
              onClick={() => setShowQuickReplies(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(groupedTemplates).map(([category, templates]) => (
              <div key={category}>
                <p className="text-xs text-gray-500 uppercase mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {templates.map(template => (
                    <button
                      key={template.code}
                      onClick={() => handleQuickReply(template.code)}
                      disabled={isSending}
                      className="btn-secondary text-sm py-2 px-3 whitespace-nowrap"
                    >
                      {template.icon} {template.display_text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowQuickReplies(!showQuickReplies)}
          className="p-3 bg-card-background rounded-lg hover:bg-opacity-80 transition-colors"
          title="Quick replies"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="input-field flex-1"
          disabled={isSending}
        />

        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="p-3 bg-primary-yellow rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSending ? (
            <div className="w-6 h-6 border-2 border-primary-background border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6 text-primary-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
