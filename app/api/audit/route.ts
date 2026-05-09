import { NextRequest, NextResponse } from 'next/server';
import { runAudit } from '@/lib/auditEngine';

// POST /api/audit - Process audit data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tools } = body;
    
    if (!tools || !Array.isArray(tools)) {
      return NextResponse.json(
        { error: 'Invalid tools data' },
        { status: 400 }
      );
    }
    
    const results = runAudit(tools);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Audit processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process audit' },
      { status: 500 }
    );
  }
}

// GET /api/audit - Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Audit API is running' 
  });
}
