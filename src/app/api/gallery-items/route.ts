
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { GalleryItemSQL } from '@/lib/schema-types';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const items = await query('SELECT * FROM gallery_items ORDER BY position ASC, created_at DESC');
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch gallery items', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<GalleryItemSQL, 'id' | 'created_at'>;
    if (!data.type || !data.src || !data.alt) {
      return NextResponse.json({ message: 'type, src, and alt are required' }, { status: 400 });
    }
    if (!['photo', 'video'].includes(data.type)) {
        return NextResponse.json({ message: "Invalid type. Must be 'photo' or 'video'." }, { status: 400 });
    }
    const newId = randomUUID();
    const sql = 'INSERT INTO gallery_items (id, type, src, alt, hint, position) VALUES (?, ?, ?, ?, ?, ?)';
    await query(sql, [newId, data.type, data.src, data.alt, data.hint || null, data.position || 0]);
    
    const newItems = await query('SELECT * FROM gallery_items WHERE id = ?', [newId]) as GalleryItemSQL[];
    return NextResponse.json(newItems[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create gallery item', error: error.message }, { status: 500 });
  }
}
