
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { FacilitySQL } from '@/lib/schema-types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const facilities = await query('SELECT * FROM facilities WHERE id = ?', [id]) as FacilitySQL[];
    if (facilities.length === 0) return NextResponse.json({ message: 'Facility not found' }, { status: 404 });
    return NextResponse.json(facilities[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch facility', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const data = await request.json() as Partial<Omit<FacilitySQL, 'id' | 'created_at'>>;
    const fieldsToUpdate = [];
    const values = [];
    if (data.name !== undefined) { fieldsToUpdate.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fieldsToUpdate.push('description = ?'); values.push(data.description); }
    if (data.detailedDescription !== undefined) { fieldsToUpdate.push('detailedDescription = ?'); values.push(data.detailedDescription); }
    if (data.iconName !== undefined) { fieldsToUpdate.push('iconName = ?'); values.push(data.iconName); }
    if (data.imageUrl !== undefined) { fieldsToUpdate.push('imageUrl = ?'); values.push(data.imageUrl || null); }
    if (data.imageHint !== undefined) { fieldsToUpdate.push('imageHint = ?'); values.push(data.imageHint || null); }

    if (fieldsToUpdate.length === 0) return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    values.push(id);

    const sql = `UPDATE facilities SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result: any = await query(sql, values);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'Facility not found' }, { status: 404 });
    
    const updatedFacilities = await query('SELECT * FROM facilities WHERE id = ?', [id]) as FacilitySQL[];
    return NextResponse.json(updatedFacilities[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update facility', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const result: any = await query('DELETE FROM facilities WHERE id = ?', [id]);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'Facility not found' }, { status: 404 });
    return NextResponse.json({ message: 'Facility deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to delete facility', error: error.message }, { status: 500 });
  }
}
