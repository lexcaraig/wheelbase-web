import { useParams } from 'react-router-dom';
import { useEmergencyAlert } from '../hooks/useEmergencyAlert';
import { useChat } from '../hooks/useChat';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertHeader } from '../components/AlertHeader';
import { LocationMap } from '../components/LocationMap';
import { AcknowledgmentButtons } from '../components/AcknowledgmentButtons';
import { ChatWindow } from '../components/ChatWindow';
import { ChatInput } from '../components/ChatInput';
import { TokenExpiredPage } from './TokenExpiredPage';

export function EmergencyResponsePage() {
  const { token } = useParams<{ token: string }>();

  const {
    loading,
    error,
    alert,
    contact,
    existingAcknowledgment,
    messages: initialMessages,
    statusTemplates,
    location,
    acknowledge,
  } = useEmergencyAlert(token || null);

  const {
    messages,
    sendTextMessage,
    sendQuickStatus,
    isSending,
  } = useChat(token || null, alert?.id || null, initialMessages);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-background flex items-center justify-center p-4">
        <LoadingSpinner message="Loading emergency details..." size="lg" />
      </div>
    );
  }

  // Error state (expired/invalid token)
  if (error || !alert || !contact) {
    return <TokenExpiredPage errorMessage={error || undefined} />;
  }

  const isAlertActive = alert.status === 'active';

  return (
    <div className="min-h-screen bg-primary-background">
      {/* Header bar */}
      <header className="bg-secondary-background border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo placeholder */}
            <div className="w-8 h-8 bg-primary-yellow rounded-lg flex items-center justify-center">
              <span className="text-primary-background font-bold text-sm">W</span>
            </div>
            <div>
              <h1 className="font-semibold text-white text-sm">Wheelbase</h1>
              <p className="text-xs text-gray-400">Emergency Response</p>
            </div>
          </div>

          {/* Contact name */}
          <div className="text-right">
            <p className="text-xs text-gray-400">Responding as</p>
            <p className="text-sm font-medium text-white">{contact.name}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Alert Header */}
        <AlertHeader alert={alert} />

        {/* Location Map */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location
          </h2>
          <LocationMap
            location={location}
            userName={alert.userName}
            isActive={isAlertActive}
          />
        </section>

        {/* Acknowledgment Buttons */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your Response
          </h2>
          <AcknowledgmentButtons
            existingAcknowledgment={existingAcknowledgment}
            isAlertActive={isAlertActive}
            onAcknowledge={acknowledge}
          />
        </section>

        {/* Chat Section */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat with {alert.userName}
          </h2>
          <ChatWindow
            messages={messages}
            userName={alert.userName}
            contactName={contact.name}
          />

          {/* Chat Input - fixed at bottom on mobile */}
          <div className="mt-4">
            <ChatInput
              onSendMessage={sendTextMessage}
              onSendStatus={sendQuickStatus}
              statusTemplates={statusTemplates}
              disabled={!isAlertActive}
              isSending={isSending}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-primary-background border-t border-gray-800 py-2">
        <p className="text-center text-xs text-gray-600">
          Powered by Wheelbase • ridewheelbase.app
        </p>
      </footer>
    </div>
  );
}
