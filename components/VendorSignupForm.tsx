'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Mail, FileText, CheckCircle } from 'lucide-react';

interface VendorSignupFormProps {
  userId: string;
}

export default function VendorSignupForm({ userId }: VendorSignupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/vendor/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.get('businessName'),
          description: formData.get('description'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit application');
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Application Submitted!
        </h2>
        <p className="text-gray-600 mb-2">
          Your vendor application has been submitted for review.
        </p>
        <p className="text-gray-600">
          You will be able to access your dashboard once approved by our admin team.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Redirecting to homepage...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-3">
          <Store className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold">Vendor Information</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tell us about your business
        </p>
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Store className="h-4 w-4 mr-2 text-gray-400" />
          Business Name *
        </label>
        <input
          type="text"
          name="businessName"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., Tech Essentials, Fashion Hub"
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be displayed to customers on your products
        </p>
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <FileText className="h-4 w-4 mr-2 text-gray-400" />
          Business Description *
        </label>
        <textarea
          name="description"
          required
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Describe what you sell and what makes your business unique..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Help customers understand your brand and products
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your application will be reviewed by our admin team</li>
          <li>• You&apos;ll receive approval notification via email</li>
          <li>• Once approved, you can start adding products</li>
          <li>• Start selling and reach thousands of customers!</li>
        </ul>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="terms"
          required
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
          I agree to the{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Vendor Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Selling Policies
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
