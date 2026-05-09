import { createClient } from '@supabase/supabase-js';
import { AuditResult } from './auditEngine';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export interface StoredAudit {
  id: string;
  tools: AuditResult[];
  totalSavings: number;
  annualSavings: number;
  createdAt: string;
  isPublic: boolean;
}

export interface PublicAuditData {
  id: string;
  tools: AuditResult[];
  totalSavings: number;
  annualSavings: number;
  createdAt: string;
}
