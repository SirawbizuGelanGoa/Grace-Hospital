
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { HeroSlideSQL } from '@/lib/schema-types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const slides = await query('SELECT * FROM hero_slides WHERE id = ?', [id]) as HeroSlideSQL[];
    if (slides.length === 0) return NextResponse.json({ message: 'Hero slide not found' }, { status: 404 });
    return NextResponse.json(slides[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch hero slide', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const data = await request.json() as Partial<Omit<HeroSlideSQL, 'id' | 'created_at'>>;
    const fieldsToUpdate = [];
    const values = [];
    if (data.src !== undefined) { fieldsToUpdate.push('src = ?'); values.push(data.src); }
    if (data.alt !== undefined) { fieldsToUpdate.push('alt = ?'); values.push(data.alt); }
    if (data.hint !== undefined) { fieldsToUpdate.push('hint = ?'); values.push(data.hint || null); }
    if (data.title !== undefined) { fieldsToUpdate.push('title = ?'); values.push(data.title || null); }
    if (data.subtitle !== undefined) { fieldsToUpdate.push('subtitle = ?'); values.push(data.subtitle || null); }
    if (data.ctaLink !== undefined) { fieldsToUpdate.push('ctaLink = ?'); values.push(data.ctaLink || null); }
    if (data.ctaText !== undefined) { fieldsToUpdate.push('ctaText = ?'); values.push(data.ctaText || null); }
    if (data.position !== undefined) { fieldsToUpdate.push('position = ?'); values.push(data.position || 0); }
    
    if (fieldsToUpdate.length === 0) return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    values.push(id);
    
    const sql = `UPDATE hero_slides SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result: any = await query(sql, values);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'Hero slide not found' }, { status: 404 });
    
    const updatedSlides = await query('SELECT * FROM hero_slides WHERE id = ?', [id]) as HeroSlideSQL[];
    return NextResponse.json(updatedSlides[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update hero slide', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const result: any = await query('DELETE FROM hero_slides WHERE id = ?', [id]);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'Hero slide not found' }, { status: 404 });
    return NextResponse.json({ message: 'Hero slide deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to delete hero slide', error: error.message }, { status: 500 });
  }
}
