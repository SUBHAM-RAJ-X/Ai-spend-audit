'use client';

import { useState } from 'react';
import { captureLead, validateForm } from '@/lib/leadCapture';

interface LeadData {
  email: string;
  companyName?: string;
  role?: string;
  auditId: string;
  totalSavings: number;
  annualSavings: number;
  toolsCount: number;
}

interface LeadCaptureProps {
  auditId: string;
  totalSavings: number;
  annualSavings: number;
  toolsCount: number;
  onCaptureComplete?: () => void;
}

export default function LeadCapture({ 
  auditId, 
  totalSavings, 
  annualSavings, 
  toolsCount, 
  onCaptureComplete 
}: LeadCaptureProps) {
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    role: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic spam prevention - check submission rate
    const lastSubmission = localStorage.getItem('lastLeadSubmission');
    if (lastSubmission) {
      const timeSinceLastSubmission = Date.now() - parseInt(lastSubmission);
      if (timeSinceLastSubmission < 5000) { // 5 seconds
        setErrors({ email: 'Please wait a moment before submitting again' });
        return;
      }
    }

    // Validate form
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const leadData: LeadData = {
        email: formData.email,
        companyName: formData.companyName || undefined,
        role: formData.role || undefined,
        auditId,
        totalSavings,
        annualSavings,
        toolsCount,
      };

      const result = await captureLead(leadData);
      
      if (result.success) {
        setIsSubmitted(true);
        localStorage.setItem('lastLeadSubmission', Date.now().toString());
        onCaptureComplete?.();
      } else {
        setErrors({ email: result.error || 'Submission failed. Please try again.' });
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      setErrors({ email: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border border-emerald-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
          <p className="text-slate-600">
            Your results have been saved. We'll send updates about AI spending optimizations to your email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Save Your Results</h3>
        <p className="text-sm text-slate-600">
          Get personalized AI spending insights and optimization tips delivered to your inbox
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="john@company.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.companyName ? 'border-red-300 bg-red-50' : 'border-slate-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="Acme Corp"
            disabled={isLoading}
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
            Your Role
          </label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.role ? 'border-red-300 bg-red-50' : 'border-slate-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            placeholder="Engineering Manager"
            disabled={isLoading}
          />
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Results & Get Insights'
          )}
        </button>

        <p className="text-xs text-slate-500 text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}
