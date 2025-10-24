"use client";

import { useRef, useState } from "react";
import { redirect, RedirectType } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid';
import { setUserCookie } from "@/app/components/cookie";
import { useAppContext } from "@/app/AppContext";
import Modal from "./Modal";

export default function Home() {
  const usernameRef = useRef(null);
  const { setCtxUser } = useAppContext();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showUserAgreementModal, setShowUserAgreementModal] = useState(false);

  const handleSubmit = () => {
    if (!usernameRef.current.value.trim()) {
      alert('Please enter a username');
      return;
    }
    if (!agreedToTerms) {
      alert('Please agree to the Privacy Policy and User Agreement');
      return;
    }

    const user = {
      userId: uuidv4(),
      username: usernameRef.current.value
    };
    setUserCookie(user);
    setCtxUser(user);
    redirect('/pool', RedirectType.push);
  };

  const privacyPolicyText = "We only store your username and user ID on our server. Messages and connections will be stored in cookies on your device. Please note that these are not encrypted. We collect minimal information needed to provide messaging functionality and enhance your experience. Your data is never shared with third parties without your consent. You have the right to access, modify, or delete your data at any time. For questions about our privacy practices, please contact our support team.";

  const userAgreementText = "By using this application, you agree to our policies. We will not be sued under any circumstance. You're on your own. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. The service is provided 'as is' without warranties of any kind.";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Enter your username to get started
          </p>
        </div>

        {/* Form Section */}
        <div className="rounded-3xl p-6">
          <div className="space-y-6">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                maxLength={10}
                placeholder="your_username"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-all"
                ref={usernameRef}
              />
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                id="agreement"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-violet-500 border-gray-300 rounded focus:ring-violet-500 focus:ring-2"
              />
              <label htmlFor="agreement" className="text-sm text-gray-700 leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-violet-500 hover:text-violet-600 underline font-medium cursor-pointer"
                >
                  Privacy Policy
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={() => setShowUserAgreementModal(true)}
                  className="text-violet-500 hover:text-violet-600 underline font-medium cursor-pointer"
                >
                  User Agreement
                </button>
              </label>
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleSubmit}
              className="cursor-pointer w-full bg-violet-500 hover:bg-violet-600 text-white font-semibold py-3 px-6 rounded-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
        content={privacyPolicyText}
      />

      <Modal
        isOpen={showUserAgreementModal}
        onClose={() => setShowUserAgreementModal(false)}
        title="User Agreement"
        content={userAgreementText}
      />
    </div>
  );
}
