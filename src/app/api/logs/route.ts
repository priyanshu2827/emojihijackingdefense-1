import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { logs } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, meta, analysisId, route, ip, userAgent } = body;

    // Validate required fields
    if (!level) {
      return NextResponse.json({ 
        error: "Level is required",
        code: "MISSING_LEVEL" 
      }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ 
        error: "Message is required",
        code: "MISSING_MESSAGE" 
      }, { status: 400 });
    }

    // Validate field types
    if (typeof level !== 'string') {
      return NextResponse.json({ 
        error: "Level must be a string",
        code: "INVALID_LEVEL_TYPE" 
      }, { status: 400 });
    }

    if (typeof message !== 'string') {
      return NextResponse.json({ 
        error: "Message must be a string",
        code: "INVALID_MESSAGE_TYPE" 
      }, { status: 400 });
    }

    // Validate optional fields
    if (analysisId !== undefined && (typeof analysisId !== 'number' || !Number.isInteger(analysisId))) {
      return NextResponse.json({ 
        error: "Analysis ID must be an integer",
        code: "INVALID_ANALYSIS_ID" 
      }, { status: 400 });
    }

    if (route !== undefined && typeof route !== 'string') {
      return NextResponse.json({ 
        error: "Route must be a string",
        code: "INVALID_ROUTE_TYPE" 
      }, { status: 400 });
    }

    if (ip !== undefined && typeof ip !== 'string') {
      return NextResponse.json({ 
        error: "IP must be a string",
        code: "INVALID_IP_TYPE" 
      }, { status: 400 });
    }

    if (userAgent !== undefined && typeof userAgent !== 'string') {
      return NextResponse.json({ 
        error: "User agent must be a string",
        code: "INVALID_USER_AGENT_TYPE" 
      }, { status: 400 });
    }

    // Validate meta field if provided
    if (meta !== undefined && (typeof meta !== 'object' || meta === null || Array.isArray(meta))) {
      return NextResponse.json({ 
        error: "Meta must be a JSON object",
        code: "INVALID_META_TYPE" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData: any = {
      level: level.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (meta !== undefined) {
      insertData.meta = meta;
    }

    if (analysisId !== undefined) {
      insertData.analysisId = analysisId;
    }

    if (route !== undefined) {
      insertData.route = route.trim();
    }

    if (ip !== undefined) {
      insertData.ip = ip.trim();
    }

    if (userAgent !== undefined) {
      insertData.userAgent = userAgent.trim();
    }

    // Insert new log entry
    const newLog = await db.insert(logs)
      .values(insertData)
      .returning();

    return NextResponse.json(newLog[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}