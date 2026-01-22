import { useState } from 'react';
import type { AcknowledgmentType, ExistingAcknowledgment } from '../types/emergency';
import { getAcknowledgmentDisplay } from '../utils/formatters';

interface AcknowledgmentButtonsProps {
  existingAcknowledgment: ExistingAcknowledgment | null;
  isAlertActive: boolean;
  onAcknowledge: (type: AcknowledgmentType, options?: { message?: string; etaMinutes?: number }) => Promise<boolean>;
}

interface AckOption {
  type: AcknowledgmentType;
  label: string;
  icon: string;
  color: string;
  showEta?: boolean;
}

const ackOptions: AckOption[] = [
  { type: 'received', label: 'Alert Received', icon: '✓', color: 'bg-blue-600' },
  { type: 'responding', label: "I'm Responding", icon: '📞', color: 'bg-success' },
  { type: 'on_the_way', label: "On My Way", icon: '🚗', color: 'bg-primary-yellow text-primary-background', showEta: true },
  { type: 'arrived', label: 'I Have Arrived', icon: '📍', color: 'bg-success' },
  { type: 'cannot_help', label: "Can't Help Right Now", icon: '❌', color: 'bg-gray-600' },
];

const etaOptions = [5, 10, 15, 30, 45, 60];

export function AcknowledgmentButtons({
  existingAcknowledgment,
  isAlertActive,
  onAcknowledge,
}: AcknowledgmentButtonsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<AcknowledgmentType | null>(null);
  const [showEtaSelector, setShowEtaSelector] = useState(false);

  const handleAcknowledge = async (type: AcknowledgmentType, etaMinutes?: number) => {
    setIsSubmitting(true);
    setSelectedType(type);

    try {
      const success = await onAcknowledge(type, etaMinutes ? { etaMinutes } : undefined);
      if (success) {
        setShowEtaSelector(false);
      }
    } finally {
      setIsSubmitting(false);
      setSelectedType(null);
    }
  };

  const handleOptionClick = (option: AckOption) => {
    if (option.showEta) {
      setShowEtaSelector(true);
      setSelectedType(option.type);
    } else {
      handleAcknowledge(option.type);
    }
  };

  // Show current status if already acknowledged
  if (existingAcknowledgment) {
    return (
      <div className="bg-secondary-background rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-white">Your Response</span>
        </div>

        <div className="bg-card-background rounded-lg p-3">
          <p className="text-primary-yellow font-medium">
            {getAcknowledgmentDisplay(existingAcknowledgment.acknowledgment_type)}
          </p>
          {existingAcknowledgment.eta_minutes && (
            <p className="text-gray-400 text-sm mt-1">
              ETA: {existingAcknowledgment.eta_minutes} minutes
            </p>
          )}
          {existingAcknowledgment.message && (
            <p className="text-gray-300 text-sm mt-2 italic">
              "{existingAcknowledgment.message}"
            </p>
          )}
        </div>

        {/* Allow updating status */}
        {isAlertActive && (
          <div className="pt-2">
            <p className="text-gray-400 text-sm mb-2">Update your status:</p>
            <div className="flex flex-wrap gap-2">
              {ackOptions
                .filter(opt => opt.type !== existingAcknowledgment.acknowledgment_type)
                .slice(0, 3)
                .map(option => (
                  <button
                    key={option.type}
                    onClick={() => handleOptionClick(option)}
                    disabled={isSubmitting}
                    className="btn-secondary text-sm py-2 px-3"
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not active alert - show disabled state
  if (!isAlertActive) {
    return (
      <div className="bg-secondary-background rounded-xl p-4">
        <p className="text-gray-400 text-center">
          This alert is no longer active
        </p>
      </div>
    );
  }

  // ETA selector
  if (showEtaSelector) {
    return (
      <div className="bg-secondary-background rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white">What's your ETA?</h3>
          <button
            onClick={() => setShowEtaSelector(false)}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {etaOptions.map(eta => (
            <button
              key={eta}
              onClick={() => handleAcknowledge('on_the_way', eta)}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              {eta < 60 ? `${eta} min` : '1 hour'}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleAcknowledge('on_the_way')}
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          Skip ETA
        </button>
      </div>
    );
  }

  // Main acknowledgment options
  return (
    <div className="bg-secondary-background rounded-xl p-4 space-y-3">
      <h3 className="font-medium text-white">How can you help?</h3>

      <div className="space-y-2">
        {ackOptions.map(option => (
          <button
            key={option.type}
            onClick={() => handleOptionClick(option)}
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 min-h-[48px] ${
              isSubmitting && selectedType === option.type
                ? 'opacity-50 cursor-not-allowed'
                : ''
            } ${option.color}`}
          >
            {isSubmitting && selectedType === option.type ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
