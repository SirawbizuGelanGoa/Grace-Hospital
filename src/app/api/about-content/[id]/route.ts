
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { AboutContentSQL } from '@/lib/schema-types';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const data = await request.json() as Partial<Omit<AboutContentSQL, 'id' | 'created_at'>>;
    const fieldsToUpdate = [];
    const values = [];
    if (data.title !== undefined) { fieldsToUpdate.push('title = ?'); values.push(data.title); }
    if (data.description !== undefined) { fieldsToUpdate.push('description = ?'); values.push(data.description); }
    if (data.mission !== undefined) { fieldsToUpdate.push('mission = ?'); values.push(data.mission); }
    if (data.vision !== undefined) { fieldsToUpdate.push('vision = ?'); values.push(data.vision); }
    if (data.imageUrl !== undefined) { fieldsToUpdate.push('imageUrl = ?'); values.push(data.imageUrl || null); }
    if (data.imageHint !== undefined) { fieldsToUpdate.push('imageHint = ?'); values.push(data.imageHint || null); }

    if (fieldsToUpdate.length === 0) return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    values.push(id);

    const sql = `UPDATE about_content SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result: any = await query(sql, values);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'About content not found' }, { status: 404 });
    
    const updatedContent = await query('SELECT * FROM about_content WHERE id = ?', [id]) as AboutContentSQL[];
    return NextResponse.json(updatedContent[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update about content', error: error.message }, { status: 500 });
  }
}
// DELETE is usually not needed for a single-entry table like about_content
