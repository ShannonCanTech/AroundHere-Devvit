import React, { useState, useEffect } from 'react';
import { requestExpandedMode } from '@devvit/web/client';
import PolicyOverlay from '../components/PolicyOverlay';

const TermsScreen: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsConditions, setShowTermsConditions] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleAccept = async (event: React.MouseEvent) => {
    setIsAccepting(true);
    setError(null);

    try {
      const response = await fetch('/api/consent/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termsVersion: '1.0' }),
      });

      if (!response.ok) {
        throw new Error('Failed to record consent');
      }

      // Enter expanded mode with home entry point (main app interface)
      try {
        await requestExpandedMode(event.nativeEvent, 'home');
      } catch (expandError) {
        console.error('Failed to enter expanded mode, falling back to direct navigation:', expandError);
        // Fallback to direct navigation if requestExpandedMode fails
        window.location.href = '/index.html';
      }
    } catch (err) {
      console.error('Error accepting terms:', err);
      setError('Failed to accept terms. Please try again.');
      setIsAccepting(false);
    }
  };

  if (isCheckingConsent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Before You Continue</h1>
          <p className="text-gray-600">
            By using this app, you agree to our{' '}
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Privacy Policy
            </button>{' '}
            and{' '}
            <button
              onClick={() => setShowTermsConditions(true)}
              className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Terms & Conditions
            </button>
            .
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAccepting ? 'Processing...' : 'I Agree'}
          </button>

          <button
            onClick={() => (window.location.href = '/welcome.html')}
            disabled={isAccepting}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
        </div>
      </div>

      {/* Privacy Policy Overlay */}
      <PolicyOverlay
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        title="Privacy Policy"
        content={<PrivacyPolicyContent />}
      />

      {/* Terms & Conditions Overlay */}
      <PolicyOverlay
        isOpen={showTermsConditions}
        onClose={() => setShowTermsConditions(false)}
        title="Terms & Conditions"
        content={<TermsConditionsContent />}
      />
    </div>
  );
};

const PrivacyPolicyContent: React.FC = () => (
  <div className="space-y-4">
    <section>
      <h3 className="text-lg font-semibold mb-2">1. Introduction</h3>
      <p>
        Welcome to Happening. This Privacy Policy explains how we collect, use, and protect your
        information when you use our chat application on Reddit.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">2. Data Collection</h3>
      <p>We collect the following information:</p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>Your Reddit user ID and username</li>
        <li>Message content you send through the app</li>
        <li>Timestamps of your messages and activities</li>
        <li>Chat metadata (participants, creation dates)</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">3. Data Usage</h3>
      <p>We use your data to:</p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>Provide real-time chat functionality</li>
        <li>Store and retrieve your message history</li>
        <li>Enable message editing and deletion features</li>
        <li>Maintain chat conversations and participant lists</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">4. Data Storage</h3>
      <p>
        Your data is stored in Redis database provided by Reddit's Devvit platform. We implement
        automatic data retention policies:
      </p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>Messages are automatically deleted after 90 days</li>
        <li>Inactive chats (no messages for 180 days) are automatically removed</li>
        <li>Chat metadata is retained for 180 days for audit purposes</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">5. Data Sharing</h3>
      <p>
        We do not share your data with third parties. Your information is only accessible to:
      </p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>You and other participants in your chat conversations</li>
        <li>Reddit's Devvit platform infrastructure (for hosting and storage)</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">6. User Rights</h3>
      <p>You have the right to:</p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>Delete your messages at any time</li>
        <li>Edit your messages</li>
        <li>Leave chat conversations</li>
        <li>Request deletion of your account data</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">7. Contact Information</h3>
      <p>
        For questions about this Privacy Policy or to exercise your rights, please contact us
        through Reddit's messaging system.
      </p>
    </section>

    <section>
      <p className="text-sm text-gray-500 mt-6">Last updated: {new Date().toLocaleDateString()}</p>
    </section>
  </div>
);

const TermsConditionsContent: React.FC = () => (
  <div className="space-y-4">
    <section>
      <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
      <p>
        By using Happening, you agree to be bound by these Terms & Conditions. If you do not agree
        to these terms, please do not use the app.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">2. Description of Service</h3>
      <p>
        Happening is a real-time chat application that runs on Reddit's Devvit platform. It allows
        Reddit users to engage in direct messaging conversations with other users.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">3. User Responsibilities</h3>
      <p>You agree to:</p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>Use the app in compliance with Reddit's Content Policy and User Agreement</li>
        <li>Not post content that is illegal, harmful, or violates others' rights</li>
        <li>Not harass, abuse, or harm other users</li>
        <li>Not use the app for spam or commercial solicitation</li>
        <li>Respect the privacy and rights of other users</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">4. Prohibited Activities</h3>
      <p>The following activities are strictly prohibited:</p>
      <ul className="list-disc pl-5 mt-2 space-y-1">
        <li>Posting hate speech, threats, or violent content</li>
        <li>Sharing personal information of others without consent</li>
        <li>Attempting to hack, exploit, or disrupt the app</li>
        <li>Creating multiple accounts to evade bans or restrictions</li>
        <li>Using automated tools or bots</li>
      </ul>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">5. Content Ownership</h3>
      <p>
        You retain ownership of the content you post. By using the app, you grant us a license to
        store, display, and transmit your content as necessary to provide the service.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">6. Limitation of Liability</h3>
      <p>
        The app is provided "as is" without warranties of any kind. We are not liable for any
        damages arising from your use of the app, including but not limited to data loss, service
        interruptions, or user-generated content.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">7. Changes to Terms</h3>
      <p>
        We reserve the right to modify these terms at any time. Continued use of the app after
        changes constitutes acceptance of the new terms. We will notify users of significant
        changes.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">8. Termination</h3>
      <p>
        We reserve the right to suspend or terminate your access to the app at any time for
        violations of these terms or Reddit's policies.
      </p>
    </section>

    <section>
      <h3 className="text-lg font-semibold mb-2">9. Governing Law</h3>
      <p>
        These terms are governed by the laws applicable to Reddit's operations. Any disputes will
        be resolved in accordance with Reddit's dispute resolution procedures.
      </p>
    </section>

    <section>
      <p className="text-sm text-gray-500 mt-6">Last updated: {new Date().toLocaleDateString()}</p>
    </section>
  </div>
);

export default TermsScreen;
