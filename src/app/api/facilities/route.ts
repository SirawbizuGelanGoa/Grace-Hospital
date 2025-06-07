import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { FacilitySQL } from '@/lib/schema-types';

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
    if (!data.name || !data.description) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // Use description as detailedDescription if not provided
    const detailedDescription = data.detailedDescription || data.description;
    
    // Use default iconName if not provided
    const iconName = data.iconName || 'Building';
    
    // Remove the id field from the SQL query to let the database auto-increment it
    const sql = 'INSERT INTO facilities (name, description, iconName, imageUrl, imageHint, detailedDescription) VALUES (?, ?, ?, ?, ?, ?)';
    const result: any = await query(sql, [
      data.name, 
      data.description, 
      iconName, 
      data.imageUrl || null, 
      data.imageHint || null, 
      detailedDescription
    ]);
    
    // Get the newly inserted ID from the result
    const newId = result.insertId;
    
    // Fetch the newly created facility
    const newFacilities = await query('SELECT * FROM facilities WHERE id = ?', [newId]) as FacilitySQL[];
    
    if (newFacilities.length > 0) {
      return NextResponse.json(newFacilities[0], { status: 201 });
    } else {
      // Fallback if we can't find the newly created facility by ID
      const fetchBackSql = 'SELECT * FROM facilities WHERE name = ? AND description = ? ORDER BY created_at DESC LIMIT 1';
      const fetchParams = [data.name, data.description];
      const fallbackFacilities = await query(fetchBackSql, fetchParams) as FacilitySQL[];
      
      if (fallbackFacilities.length > 0) {
        return NextResponse.json(fallbackFacilities[0], { status: 201 });
      } else {
        return NextResponse.json({ message: 'Facility created, but could not fetch it back immediately.' }, { status: 201 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create facility', error: error.message }, { status: 500 });
  }
}

