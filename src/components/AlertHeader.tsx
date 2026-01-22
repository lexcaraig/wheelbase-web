import type { EmergencyAlert } from '../types/emergency';
import {
  formatRelativeTime,
  getAlertTypeDisplay,
  getAlertStatusInfo,
} from '../utils/formatters';

interface AlertHeaderProps {
  alert: EmergencyAlert;
}

export function AlertHeader({ alert }: AlertHeaderProps) {
  const statusInfo = getAlertStatusInfo(alert.status);
  const isActive = alert.status === 'active';

  return (
    <div className="bg-secondary-background rounded-xl p-4 space-y-4">
      {/* Status Banner */}
      <div className={`flex items-center gap-2 ${isActive ? 'animate-pulse' : ''}`}>
        {isActive && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-error" />
          </span>
        )}
        <span className={`font-semibold ${statusInfo.colorClass}`}>
          {statusInfo.text}
        </span>
        <span className="text-gray-400 text-sm">
          • {formatRelativeTime(alert.triggered_at)}
        </span>
      </div>

      {/* User Info */}
      <div>
        <h1 className="text-xl font-bold text-white">
          {alert.userName} needs help
        </h1>
        <p className="text-gray-400 text-sm">
          {getAlertTypeDisplay(alert.alert_type)}
        </p>
      </div>

      {/* Alert Message */}
      {alert.message && (
        <div className="bg-card-background rounded-lg p-3">
          <p className="text-gray-300 text-sm italic">"{alert.message}"</p>
        </div>
      )}

      {/* Response Stats */}
      {alert.has_acknowledgments && (
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-300">
              {alert.acknowledgment_count} acknowledged
            </span>
          </div>
          {alert.responders_count > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-primary-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="text-gray-300">
                {alert.responders_count} responding
              </span>
            </div>
          )}
          {alert.earliest_eta_minutes && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-300">
                ETA ~{alert.earliest_eta_minutes} min
              </span>
            </div>
          )}
        </div>
      )}

      {/* Resolved Banner */}
      {alert.status === 'resolved' && alert.resolved_at && (
        <div className="bg-success/20 border border-success/30 rounded-lg p-3">
          <p className="text-success text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This emergency has been resolved
          </p>
        </div>
      )}

      {/* Cancelled Banner */}
      {alert.status === 'cancelled' && (
        <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-3">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            This alert was cancelled by {alert.userName}
          </p>
        </div>
      )}
    </div>
  );
}
