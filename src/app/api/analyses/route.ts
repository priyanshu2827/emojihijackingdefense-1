import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analyses } from '@/db/schema';
import { eq, gte, lte, and, desc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const riskGte = searchParams.get('risk_gte');
    const riskLte = searchParams.get('risk_lte');
    const policy = searchParams.get('policy');
    const source = searchParams.get('source');

    // Build where conditions
    const conditions = [];

    if (riskGte) {
      const riskGteValue = parseInt(riskGte);
      if (!isNaN(riskGteValue)) {
        conditions.push(gte(analyses.overallRisk, riskGteValue));
      }
    }

    if (riskLte) {
      const riskLteValue = parseInt(riskLte);
      if (!isNaN(riskLteValue)) {
        conditions.push(lte(analyses.overallRisk, riskLteValue));
      }
    }

    if (policy) {
      conditions.push(eq(analyses.policyMode, policy));
    }

    if (source) {
      conditions.push(eq(analyses.source, source));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(analyses)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Get items with pagination
    let query = db.select().from(analyses);
    
    if (whereClause) {
      query = query.where(whereClause);
    }

    const items = await query
      .orderBy(desc(analyses.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ items, total }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      input,
      options,
      commit,
      buildTime,
      result,
      source,
      batchId
    } = body;

    // Validate required fields
    if (!input) {
      return NextResponse.json({ 
        error: "Input is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!result || typeof result !== 'object') {
      return NextResponse.json({ 
        error: "Result object is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate result object nested fields
    const requiredResultFields = [
      'sanitized', 'normalized', 'tokens', 'rawTokens', 
      'tokenDriftRatio', 'overallRisk', 'alerts', 'summary', 'matrix', 'removed'
    ];

    for (const field of requiredResultFields) {
      if (result[field] === undefined || result[field] === null) {
        return NextResponse.json({ 
          error: `Result.${field} is required`,
          code: "MISSING_REQUIRED_FIELD" 
        }, { status: 400 });
      }
    }

    // Validate options object
    if (!options || typeof options !== 'object') {
      return NextResponse.json({ 
        error: "Options object is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!options.policyMode) {
      return NextResponse.json({ 
        error: "Options.policyMode is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate numeric fields
    if (typeof result.overallRisk !== 'number') {
      return NextResponse.json({ 
        error: "Result.overallRisk must be a number",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    if (typeof result.tokenDriftRatio !== 'number') {
      return NextResponse.json({ 
        error: "Result.tokenDriftRatio must be a number",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    // Validate batchId if provided
    if (batchId && (typeof batchId !== 'number' || batchId <= 0)) {
      return NextResponse.json({ 
        error: "BatchId must be a positive number",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      inputText: input.toString().trim(),
      sanitized: result.sanitized.toString(),
      normalized: result.normalized.toString(),
      overallRisk: result.overallRisk,
      tokenDriftRatio: result.tokenDriftRatio,
      rawTokens: result.rawTokens,
      tokens: result.tokens,
      alerts: result.alerts,
      summary: result.summary,
      matrix: result.matrix,
      removed: result.removed,
      policyMode: options.policyMode.toString(),
      commitSha: commit ? commit.toString() : null,
      buildTime: buildTime ? buildTime.toString() : null,
      batchId: batchId || null,
      source: source ? source.toString() : 'manual',
      createdAt: new Date().toISOString(),
    };

    const newAnalysis = await db.insert(analyses)
      .values(insertData)
      .returning();

    return NextResponse.json(newAnalysis[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}