export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-primary-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-secondary-background rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Error code */}
        <p className="text-6xl font-bold text-primary-yellow">404</p>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white">
          Page Not Found
        </h1>

        {/* Message */}
        <p className="text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Expected URL format hint */}
        <div className="bg-secondary-background rounded-xl p-4 text-left">
          <p className="text-gray-300 text-sm mb-2">
            Emergency response links should look like:
          </p>
          <code className="text-primary-yellow text-xs bg-card-background px-2 py-1 rounded block overflow-x-auto">
            /emergency/respond/your-token-here
          </code>
        </div>

        {/* Wheelbase Branding */}
        <div className="pt-8">
          <p className="text-gray-600 text-xs">
            Powered by Wheelbase
          </p>
        </div>
      </div>
    </div>
  );
}
