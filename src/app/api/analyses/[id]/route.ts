import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analyses } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Fetch single analysis by ID
    const analysis = await db.select()
      .from(analyses)
      .where(eq(analyses.id, parseInt(id)))
      .limit(1);

    // Check if analysis exists
    if (analysis.length === 0) {
      return NextResponse.json({ 
        error: 'Analysis not found',
        code: "ANALYSIS_NOT_FOUND" 
      }, { status: 404 });
    }

    // Return the analysis record
    return NextResponse.json(analysis[0], { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}