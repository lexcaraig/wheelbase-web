import { formatDistanceToNow, format, parseISO } from 'date-fns';

/**
 * Format a timestamp as relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(timestamp: string): string {
  try {
    const date = parseISO(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
}

/**
 * Format a timestamp as a short time (e.g., "2:30 PM")
 */
export function formatShortTime(timestamp: string): string {
  try {
    const date = parseISO(timestamp);
    return format(date, 'h:mm a');
  } catch {
    return '';
  }
}

/**
 * Format a timestamp as full date and time
 */
export function formatFullDateTime(timestamp: string): string {
  try {
    const date = parseISO(timestamp);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch {
    return 'Unknown';
  }
}

/**
 * Format ETA in a human-readable way
 */
export function formatEta(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get alert type display text
 */
export function getAlertTypeDisplay(alertType: string): string {
  const types: Record<string, string> = {
    manual: 'Manual SOS',
    crash_detected: 'Crash Detected',
  };
  return types[alertType] || 'Emergency Alert';
}

/**
 * Get alert status display with color class
 */
export function getAlertStatusInfo(status: string): { text: string; colorClass: string } {
  const statusMap: Record<string, { text: string; colorClass: string }> = {
    active: { text: 'Active Emergency', colorClass: 'text-error' },
    resolved: { text: 'Resolved', colorClass: 'text-success' },
    cancelled: { text: 'Cancelled', colorClass: 'text-gray-400' },
  };
  return statusMap[status] || { text: 'Unknown', colorClass: 'text-gray-400' };
}

/**
 * Get acknowledgment type display text
 */
export function getAcknowledgmentDisplay(type: string): string {
  const types: Record<string, string> = {
    received: 'Alert Received',
    responding: 'Responding',
    on_the_way: 'On The Way',
    arrived: 'Arrived',
    cannot_help: 'Unable to Help',
  };
  return types[type] || type;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
