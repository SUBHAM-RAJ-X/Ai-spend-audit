import { supabase } from './supabase';

export interface LeadData {
  email: string;
  companyName?: string;
  role?: string;
  auditId: string;
  totalSavings: number;
  annualSavings: number;
  toolsCount: number;
}

export async function captureLead(leadData: LeadData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('leads').insert({
      email: leadData.email.toLowerCase(),
      company_name: leadData.companyName || null,
      role: leadData.role || null,
      audit_id: leadData.auditId,
      total_savings: leadData.totalSavings,
      annual_savings: leadData.annualSavings,
      tools_count: leadData.toolsCount,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error capturing lead:', error);
      return { success: false, error: 'Failed to save your information' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error capturing lead:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateForm(data: { email: string; companyName?: string; role?: string }): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (data.companyName && data.companyName.trim().length > 100) {
    errors.companyName = 'Company name must be less than 100 characters';
  }

  if (data.role && data.role.trim().length > 50) {
    errors.role = 'Role must be less than 50 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
