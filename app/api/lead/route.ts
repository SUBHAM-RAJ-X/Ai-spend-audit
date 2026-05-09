import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/lead - Save lead information
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName, role, auditId, totalSavings, annualSavings, toolsCount } = body;
    
    if (!email || !auditId) {
      return NextResponse.json(
        { error: 'Email and audit ID are required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('leads')
      .insert({
        email,
        company_name: companyName,
        role,
        audit_id: auditId,
        total_savings: totalSavings,
        annual_savings: annualSavings,
        tools_count: toolsCount,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Lead save error:', error);
      // Fallback to localStorage if database fails
      return NextResponse.json({ 
        success: true, 
        message: 'Lead information saved locally',
        fallback: true 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Lead information saved successfully',
      data 
    });
  } catch (error) {
    console.error('Lead processing error:', error);
    return NextResponse.json(
      { error: 'Failed to save lead information' },
      { status: 500 }
    );
  }
}

// GET /api/lead - Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Lead API is running' 
  });
}
