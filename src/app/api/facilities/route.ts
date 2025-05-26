
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { FacilitySQL } from '@/lib/schema-types';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const facilities = await query('SELECT * FROM facilities ORDER BY created_at DESC');
    return NextResponse.json(facilities);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch facilities', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<FacilitySQL, 'id' | 'created_at'>;
    if (!data.name || !data.description || !data.detailedDescription || !data.iconName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    const newId = randomUUID();
    const sql = 'INSERT INTO facilities (id, name, description, iconName, imageUrl, imageHint, detailedDescription) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await query(sql, [newId, data.name, data.description, data.iconName, data.imageUrl || null, data.imageHint || null, data.detailedDescription]);
    
    const newFacilities = await query('SELECT * FROM facilities WHERE id = ?', [newId]) as FacilitySQL[];
    return NextResponse.json(newFacilities[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create facility', error: error.message }, { status: 500 });
  }
}
