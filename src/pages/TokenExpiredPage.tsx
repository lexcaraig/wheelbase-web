interface TokenExpiredPageProps {
  errorMessage?: string;
}

export function TokenExpiredPage({ errorMessage }: TokenExpiredPageProps) {
  return (
    <div className="min-h-screen bg-primary-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-secondary-background rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white">
          Link Expired or Invalid
        </h1>

        {/* Message */}
        <p className="text-gray-400">
          {errorMessage || 'This emergency response link has expired or is no longer valid.'}
        </p>

        {/* Additional Info */}
        <div className="bg-secondary-background rounded-xl p-4 text-left space-y-3">
          <p className="text-gray-300 text-sm">
            This can happen because:
          </p>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary-yellow">•</span>
              The emergency has been resolved
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-yellow">•</span>
              The link has expired (links are valid for 24 hours)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-yellow">•</span>
              The alert was cancelled by the user
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="bg-card-background rounded-xl p-4 text-center">
          <p className="text-gray-300 text-sm mb-2">
            If you believe this is an error, please contact the person directly.
          </p>
          <p className="text-gray-500 text-xs">
            If you continue to see this message and need assistance, please contact support.
          </p>
        </div>

        {/* Wheelbase Branding */}
        <div className="pt-4">
          <p className="text-gray-600 text-xs">
            Powered by Wheelbase
          </p>
        </div>
      </div>
    </div>
  );
}
