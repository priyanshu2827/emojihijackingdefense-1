import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { batches } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const results = await db.select({
      id: batches.id,
      created_at: batches.createdAt,
      item_count: batches.itemCount,
      alert_count: batches.alertCount,
      notes: batches.notes
    })
    .from(batches)
    .orderBy(desc(batches.createdAt));

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
    const { itemCount, alertCount, notes } = requestBody;

    // Validate required fields
    if (itemCount === undefined || itemCount === null) {
      return NextResponse.json({ 
        error: "itemCount is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (alertCount === undefined || alertCount === null) {
      return NextResponse.json({ 
        error: "alertCount is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate field types
    if (!Number.isInteger(itemCount)) {
      return NextResponse.json({ 
        error: "itemCount must be an integer",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    if (!Number.isInteger(alertCount)) {
      return NextResponse.json({ 
        error: "alertCount must be an integer",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    // Validate non-negative values
    if (itemCount < 0) {
      return NextResponse.json({ 
        error: "itemCount must be non-negative",
        code: "INVALID_VALUE" 
      }, { status: 400 });
    }

    if (alertCount < 0) {
      return NextResponse.json({ 
        error: "alertCount must be non-negative",
        code: "INVALID_VALUE" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedNotes = notes ? notes.toString().trim() : null;

    // Create new batch
    const newBatch = await db.insert(batches)
      .values({
        itemCount,
        alertCount,
        notes: sanitizedNotes,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newBatch[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { itemCount, alertCount, notes } = requestBody;

    // Check if record exists
    const existingRecord = await db.select()
      .from(batches)
      .where(eq(batches.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Batch not found' 
      }, { status: 404 });
    }

    // Validate field types if provided
    if (itemCount !== undefined && !Number.isInteger(itemCount)) {
      return NextResponse.json({ 
        error: "itemCount must be an integer",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    if (alertCount !== undefined && !Number.isInteger(alertCount)) {
      return NextResponse.json({ 
        error: "alertCount must be an integer",
        code: "INVALID_FIELD_TYPE" 
      }, { status: 400 });
    }

    // Validate non-negative values if provided
    if (itemCount !== undefined && itemCount < 0) {
      return NextResponse.json({ 
        error: "itemCount must be non-negative",
        code: "INVALID_VALUE" 
      }, { status: 400 });
    }

    if (alertCount !== undefined && alertCount < 0) {
      return NextResponse.json({ 
        error: "alertCount must be non-negative",
        code: "INVALID_VALUE" 
      }, { status: 400 });
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (itemCount !== undefined) {
      updates.itemCount = itemCount;
    }

    if (alertCount !== undefined) {
      updates.alertCount = alertCount;
    }

    if (notes !== undefined) {
      updates.notes = notes ? notes.toString().trim() : null;
    }

    // Update batch
    const updated = await db.update(batches)
      .set(updates)
      .where(eq(batches.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(batches)
      .where(eq(batches.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Batch not found' 
      }, { status: 404 });
    }

    // Delete batch
    const deleted = await db.delete(batches)
      .where(eq(batches.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Batch deleted successfully',
      deleted: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}