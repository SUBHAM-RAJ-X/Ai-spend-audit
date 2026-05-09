import { AuditResult } from './auditEngine';

interface AuditData {
  results: AuditResult[];
  totalSavings: number;
  annualSavings: number;
}

interface SummaryResponse {
  summary: string;
  source: 'ai' | 'fallback';
}

export async function generateSummary(auditData: AuditData): Promise<SummaryResponse> {
  try {
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData),
    });

    if (!response.ok) {
      throw new Error(`Summary API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to generate summary:', error);
    
    // Return fallback summary
    const toolsCount = auditData.results.length;
    const savingsMonthly = auditData.totalSavings.toFixed(0);
    const savingsAnnual = auditData.annualSavings.toFixed(0);
    const optimizationsCount = auditData.results.filter((r: AuditResult) => r.savings > 0).length;
    
    return {
      summary: `Your AI spending analysis of ${toolsCount} tools reveals ${optimizationsCount} optimization opportunities. You can save $${savingsMonthly} monthly ($${savingsAnnual} annually) by switching to more cost-effective plans. The biggest savings come from right-sizing your team plans and exploring alternative tools. Implement these changes to optimize your AI budget without sacrificing productivity.`,
      source: 'fallback'
    };
  }
}
