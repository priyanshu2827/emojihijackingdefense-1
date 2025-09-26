import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rulePacks } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    let query = db.select().from(rulePacks).orderBy(desc(rulePacks.createdAt));

    if (active === '1') {
      query = query.where(eq(rulePacks.active, true));
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { name, yaml, active, version, description } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!yaml) {
      return NextResponse.json({ 
        error: "YAML is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (active === undefined || active === null) {
      return NextResponse.json({ 
        error: "Active is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!version) {
      return NextResponse.json({ 
        error: "Version is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate field types
    if (typeof name !== 'string') {
      return NextResponse.json({ 
        error: "Name must be a string",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    if (typeof yaml !== 'string') {
      return NextResponse.json({ 
        error: "YAML must be a string",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    if (typeof active !== 'boolean') {
      return NextResponse.json({ 
        error: "Active must be a boolean",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    if (typeof version !== 'string') {
      return NextResponse.json({ 
        error: "Version must be a string",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return NextResponse.json({ 
        error: "Description must be a string",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedYaml = yaml.trim();
    const sanitizedVersion = version.trim();
    const sanitizedDescription = description ? description.trim() : null;

    // Check if rule pack with same name exists
    const existingRulePack = await db.select()
      .from(rulePacks)
      .where(eq(rulePacks.name, sanitizedName))
      .limit(1);

    const currentTimestamp = new Date().toISOString();

    if (existingRulePack.length > 0) {
      // Update existing rule pack
      const updated = await db.update(rulePacks)
        .set({
          yaml: sanitizedYaml,
          active,
          version: sanitizedVersion,
          description: sanitizedDescription,
          createdAt: currentTimestamp
        })
        .where(eq(rulePacks.name, sanitizedName))
        .returning();

      return NextResponse.json(updated[0]);
    } else {
      // Create new rule pack
      const newRulePack = await db.insert(rulePacks)
        .values({
          name: sanitizedName,
          yaml: sanitizedYaml,
          active,
          version: sanitizedVersion,
          description: sanitizedDescription,
          createdAt: currentTimestamp
        })
        .returning();

      return NextResponse.json(newRulePack[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "A rule pack with this name already exists",
        code: "DUPLICATE_NAME" 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}