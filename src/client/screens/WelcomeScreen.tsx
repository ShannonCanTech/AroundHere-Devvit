import React, { useState, useEffect } from 'react';

const WelcomeScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);

  // Check if user has already accepted terms
  useEffect(() => {
    const checkConsent = async () => {
      try {
        const response = await fetch('/api/consent/check');
        if (response.ok) {
          const data = await response.json();
          if (data.hasConsent) {
            // User has already accepted, navigate to home
            window.location.href = '/index.html';
            return;
          }
        }
      } catch (error) {
        console.error('Error checking consent:', error);
      } finally {
        setIsCheckingConsent(false);
      }
    };

    checkConsent();
  }, []);

  const handleGetStarted = () => {
    setIsLoading(true);
    window.location.href = '/terms.html';
  };

  if (isCheckingConsent) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 text-center overflow-y-auto max-h-full">
        {/* App Logo/Icon */}
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>

        {/* App Name and Tagline */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Happening</h1>
        <p className="text-gray-600 mb-4 text-sm">Real-time chat for Reddit communities</p>

        {/* Feature Highlights */}
        <div className="space-y-3 mb-6 text-left">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Real-time messaging</h3>
              <p className="text-xs text-gray-600">Instant message delivery</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Multiple chats</h3>
              <p className="text-xs text-gray-600">Manage conversations</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center mr-2">
              <svg
                className="w-4 h-4 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Edit and delete</h3>
              <p className="text-xs text-gray-600">Full message control</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Persistent history</h3>
              <p className="text-xs text-gray-600">Messages saved</p>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? 'Loading...' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
