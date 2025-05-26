
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { ContactInfoSQL } from '@/lib/schema-types';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const data = await request.json() as Partial<Omit<ContactInfoSQL, 'id' | 'created_at'>>;
    const fieldsToUpdate = [];
    const values = [];

    if (data.address !== undefined) { fieldsToUpdate.push('address = ?'); values.push(data.address); }
    if (data.phone !== undefined) { fieldsToUpdate.push('phone = ?'); values.push(data.phone); }
    if (data.email !== undefined) { fieldsToUpdate.push('email = ?'); values.push(data.email); }
    if (data.mapPlaceholder !== undefined) { fieldsToUpdate.push('mapPlaceholder = ?'); values.push(data.mapPlaceholder || null); }

    if (fieldsToUpdate.length === 0) return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    values.push(id);

    const sql = `UPDATE contact_info SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result: any = await query(sql, values);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'Contact info not found' }, { status: 404 });
    
    const updatedInfo = await query('SELECT * FROM contact_info WHERE id = ?', [id]) as ContactInfoSQL[];
    return NextResponse.json(updatedInfo[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update contact info', error: error.message }, { status: 500 });
  }
}
// DELETE is usually not needed for a single-entry table like contact_info
