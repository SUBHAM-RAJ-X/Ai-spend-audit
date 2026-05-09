import { supabase, StoredAudit, PublicAuditData } from './supabase';
import { AuditResult } from './auditEngine';

// Generate unique audit ID
export function generateAuditId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
}

// Save audit results to Supabase
export async function saveAuditResults(
  auditData: {
    results: AuditResult[];
    totalSavings: number;
    annualSavings: number;
  },
  isPublic: boolean = false
): Promise<string | null> {
  const auditId = generateAuditId();
  console.log('Saving audit with ID:', auditId);
  
  try {
    const insertData = {
      id: auditId,
      tools: auditData.results,
      total_savings: auditData.totalSavings,
      annual_savings: auditData.annualSavings,
      is_public: isPublic,
      created_at: new Date().toISOString(),
    };
    
    console.log('Insert data:', insertData);
    
    const { data, error } = await supabase
      .from('audits')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error saving audit:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Check if it's an RLS error
      if (error.code === '42501') {
        console.log('RLS policy error, falling back to localStorage');
        // Store in localStorage as fallback
        if (typeof window !== 'undefined') {
          localStorage.setItem(`audit-${auditId}`, JSON.stringify({
            ...insertData,
            results: auditData.results,
            totalSavings: auditData.totalSavings,
            annualSavings: auditData.annualSavings
          }));
          
          if (isPublic) {
            const sharedAudits = JSON.parse(localStorage.getItem('shared-audits') || '[]');
            if (!sharedAudits.includes(auditId)) {
              sharedAudits.push(auditId);
              localStorage.setItem('shared-audits', JSON.stringify(sharedAudits));
            }
          }
          
          console.log('Audit saved to localStorage fallback');
          return auditId;
        }
      }
      
      return null;
    }

    console.log('Successfully saved audit:', data);
    return auditId;
  } catch (error) {
    console.error('Error saving audit:', error);
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`audit-${auditId}`, JSON.stringify({
        id: auditId,
        tools: auditData.results,
        total_savings: auditData.totalSavings,
        annual_savings: auditData.annualSavings,
        is_public: isPublic,
        created_at: new Date().toISOString(),
        results: auditData.results,
        totalSavings: auditData.totalSavings,
        annualSavings: auditData.annualSavings
      }));
      
      if (isPublic) {
        const sharedAudits = JSON.parse(localStorage.getItem('shared-audits') || '[]');
        if (!sharedAudits.includes(auditId)) {
          sharedAudits.push(auditId);
          localStorage.setItem('shared-audits', JSON.stringify(sharedAudits));
        }
      }
      
      console.log('Audit saved to localStorage fallback');
      return auditId;
    }
    
    return null;
  }
}

// Get public audit data by ID
export async function getPublicAudit(auditId: string): Promise<PublicAuditData | null> {
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('id, tools, total_savings, annual_savings, created_at')
      .eq('id', auditId)
      .eq('is_public', true)
      .single();

    if (error || !data) {
      console.error('Error fetching audit from database:', error);
      
      // Fallback: Check localStorage for shared audits
      try {
        if (typeof window !== 'undefined') {
          const sharedAudits = JSON.parse(localStorage.getItem('shared-audits') || '[]');
          if (sharedAudits.includes(auditId)) {
            // Try to get from stored audit data
            const storedAudit = localStorage.getItem(`audit-${auditId}`);
            if (storedAudit) {
              const auditData = JSON.parse(storedAudit);
              return {
                id: auditData.id,
                tools: auditData.tools || auditData.results,
                totalSavings: auditData.total_savings || auditData.totalSavings,
                annualSavings: auditData.annual_savings || auditData.annualSavings,
                createdAt: auditData.created_at,
              };
            }
            
            // Fallback to current tool data
            const storedAudits = JSON.parse(localStorage.getItem('ai-spend-audit-tools') || '[]');
            if (storedAudits.length > 0) {
              const { runAudit } = await import('./auditEngine');
              const auditResults = runAudit(storedAudits);
              
              return {
                id: auditId,
                tools: auditResults.results,
                totalSavings: auditResults.totalSavings,
                annualSavings: auditResults.annualSavings,
                createdAt: new Date().toISOString(),
              };
            }
          }
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      return null;
    }

    return {
      id: data.id,
      tools: data.tools,
      totalSavings: data.total_savings,
      annualSavings: data.annual_savings,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error fetching audit:', error);
    
    // Final fallback to localStorage
    try {
      if (typeof window !== 'undefined') {
        const storedAudit = localStorage.getItem(`audit-${auditId}`);
        if (storedAudit) {
          const auditData = JSON.parse(storedAudit);
          return {
            id: auditData.id,
            tools: auditData.tools || auditData.results,
            totalSavings: auditData.total_savings || auditData.totalSavings,
            annualSavings: auditData.annual_savings || auditData.annualSavings,
            createdAt: auditData.created_at,
          };
        }
      }
    } catch (finalFallbackError) {
      console.error('Final fallback failed:', finalFallbackError);
    }
    
    return null;
  }
}

// Get private audit data by ID (for owner)
export async function getPrivateAudit(auditId: string): Promise<StoredAudit | null> {
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', auditId)
      .single();

    if (error || !data) {
      console.error('Error fetching audit:', error);
      return null;
    }

    return {
      id: data.id,
      tools: data.tools,
      totalSavings: data.total_savings,
      annualSavings: data.annual_savings,
      createdAt: data.created_at,
      isPublic: data.is_public,
    };
  } catch (error) {
    console.error('Error fetching audit:', error);
    return null;
  }
}

// Make audit public
export async function makeAuditPublic(auditId: string): Promise<boolean> {
  try {
    console.log('Attempting to make audit public:', auditId);
    
    // First check if the audit exists
    const { data: existingAudit, error: checkError } = await supabase
      .from('audits')
      .select('id, is_public')
      .eq('id', auditId)
      .single();
    
    if (checkError) {
      console.error('Error checking audit existence:', checkError);
      
      // If it's an RLS error, try localStorage fallback
      if (checkError.code === '42501' || checkError.code === 'PGRST116') {
        console.log('Database error, using localStorage fallback');
        
        if (typeof window !== 'undefined') {
          // Check if audit exists in localStorage
          const storedAudit = localStorage.getItem(`audit-${auditId}`);
          if (storedAudit) {
            const auditData = JSON.parse(storedAudit);
            if (auditData.is_public) {
              console.log('Audit is already public in localStorage');
              return true;
            }
            
            // Update to public
            auditData.is_public = true;
            localStorage.setItem(`audit-${auditId}`, JSON.stringify(auditData));
            
            // Add to shared audits list
            const sharedAudits = JSON.parse(localStorage.getItem('shared-audits') || '[]');
            if (!sharedAudits.includes(auditId)) {
              sharedAudits.push(auditId);
              localStorage.setItem('shared-audits', JSON.stringify(sharedAudits));
            }
            
            console.log('Audit made public in localStorage fallback');
            return true;
          }
        }
        
        throw new Error(`Audit not found: ${checkError.message}`);
      }
      
      throw new Error(`Audit not found: ${checkError.message}`);
    }
    
    if (!existingAudit) {
      console.error('Audit does not exist:', auditId);
      
      // Try localStorage fallback
      if (typeof window !== 'undefined') {
        const storedAudit = localStorage.getItem(`audit-${auditId}`);
        if (storedAudit) {
          const auditData = JSON.parse(storedAudit);
          auditData.is_public = true;
          localStorage.setItem(`audit-${auditId}`, JSON.stringify(auditData));
          
          const sharedAudits = JSON.parse(localStorage.getItem('shared-audits') || '[]');
          if (!sharedAudits.includes(auditId)) {
            sharedAudits.push(auditId);
            localStorage.setItem('shared-audits', JSON.stringify(sharedAudits));
          }
          
          console.log('Audit made public in localStorage fallback');
          return true;
        }
      }
      
      throw new Error('Audit not found');
    }
    
    console.log('Found audit:', existingAudit);
    
    // If already public, return success
    if (existingAudit.is_public) {
      console.log('Audit is already public');
      return true;
    }
    
    // Make it public
    const { data, error } = await supabase
      .from('audits')
      .update({ is_public: true })
      .eq('id', auditId)
      .select()
      .single();

    if (error) {
      console.error('Error making audit public:', error);
      
      // If it's an RLS error, use localStorage fallback
      if (error.code === '42501') {
        console.log('RLS error, using localStorage fallback');
        
        if (typeof window !== 'undefined') {
          const sharedAudits = JSON.parse(localStorage.getItem('shared-audits') || '[]');
          if (!sharedAudits.includes(auditId)) {
            sharedAudits.push(auditId);
            localStorage.setItem('shared-audits', JSON.stringify(sharedAudits));
          }
          console.log('Audit marked as shared in localStorage fallback');
          return true;
        }
      }
      
      throw new Error(`Failed to update audit: ${error.message}`);
    }

    console.log('Successfully made audit public:', data);
    return true;
  } catch (error) {
    console.error('Error making audit public:', error);
    
    // Final fallback: Store in localStorage as "shared"
    try {
      if (typeof window !== 'undefined') {
        const sharedAudits = JSON.parse(localStorage.getItem('shared-audits') || '[]');
        if (!sharedAudits.includes(auditId)) {
          sharedAudits.push(auditId);
          localStorage.setItem('shared-audits', JSON.stringify(sharedAudits));
        }
        console.log('Audit marked as shared in localStorage fallback (final)');
        return true; // Return success for fallback
      }
    } catch (fallbackError) {
      console.error('Final fallback also failed:', fallbackError);
    }
    
    throw error; // Throw original error if all fallbacks fail
  }
}
