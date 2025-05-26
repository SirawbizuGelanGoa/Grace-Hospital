
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { GalleryItemSQL } from '@/lib/schema-types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const items = await query('SELECT * FROM gallery_items WHERE id = ?', [id]) as GalleryItemSQL[];
    if (items.length === 0) return NextResponse.json({ message: 'Gallery item not found' }, { status: 404 });
    return NextResponse.json(items[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch gallery item', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const data = await request.json() as Partial<Omit<GalleryItemSQL, 'id' | 'created_at'>>;
    const fieldsToUpdate = [];
    const values = [];
    if (data.type !== undefined) { 
        if (!['photo', 'video'].includes(data.type)) {
            return NextResponse.json({ message: "Invalid type. Must be 'photo' or 'video'." }, { status: 400 });
        }
        fieldsToUpdate.push('type = ?'); values.push(data.type); 
    }
    if (data.src !== undefined) { fieldsToUpdate.push('src = ?'); values.push(data.src); }
    if (data.alt !== undefined) { fieldsToUpdate.push('alt = ?'); values.push(data.alt); }
    if (data.hint !== undefined) { fieldsToUpdate.push('hint = ?'); values.push(data.hint || null); }
    if (data.position !== undefined) { fieldsToUpdate.push('position = ?'); values.push(data.position || 0); }
    
    if (fieldsToUpdate.length === 0) return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    values.push(id);

    const sql = `UPDATE gallery_items SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result: any = await query(sql, values);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'Gallery item not found' }, { status: 404 });
    
    const updatedItems = await query('SELECT * FROM gallery_items WHERE id = ?', [id]) as GalleryItemSQL[];
    return NextResponse.json(updatedItems[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update gallery item', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const result: any = await query('DELETE FROM gallery_items WHERE id = ?', [id]);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'Gallery item not found' }, { status: 404 });
    return NextResponse.json({ message: 'Gallery item deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to delete gallery item', error: error.message }, { status: 500 });
  }
}
