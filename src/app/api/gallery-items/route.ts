import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { GalleryItemSQL } from '@/lib/schema-types';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET() {
  try {
    const items = await query('SELECT * FROM gallery_items ORDER BY position ASC, created_at DESC');

    // Set cache headers for ISR
    const response = NextResponse.json(items);
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    return response;
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
    
    // Remove the id field from the SQL query to let the database auto-increment it
    const sql = 'INSERT INTO gallery_items (type, src, alt, hint, position) VALUES (?, ?, ?, ?, ?)';
    const result: any = await query(sql, [
      data.type, 
      data.src, 
      data.alt, 
      data.hint || null, 
      data.position || 0
    ]);

    // Revalidate the gallery pages after successful creation
    revalidatePath('/');
    revalidatePath('/gallery');
    revalidateTag('gallery-items');

    // Get the newly inserted ID from the result
    const newId = result.insertId;
    
    // Fetch the newly created gallery item
    const newItems = await query('SELECT * FROM gallery_items WHERE id = ?', [newId]) as GalleryItemSQL[];
    
    if (newItems.length > 0) {
      return NextResponse.json(newItems[0], { status: 201 });
    } else {
      // Fallback if we can't find the newly created item by ID
      const fetchBackSql = 'SELECT * FROM gallery_items WHERE type = ? AND src = ? AND alt = ? ORDER BY created_at DESC LIMIT 1';
      const fetchParams = [data.type, data.src, data.alt];
      const fallbackItems = await query(fetchBackSql, fetchParams) as GalleryItemSQL[];
      
      if (fallbackItems.length > 0) {
        return NextResponse.json(fallbackItems[0], { status: 201 });
      } else {
        return NextResponse.json({ message: 'Gallery item created, but could not fetch it back immediately.' }, { status: 201 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create gallery item', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json() as { id: number };
    if (!data.id) {
      return NextResponse.json({ message: 'id is required' }, { status: 400 });
    }
    
    const sql = 'DELETE FROM gallery_items WHERE id = ?';
    await query(sql, [data.id]);

    // Revalidate after deletion
    revalidatePath('/');
    revalidatePath('/gallery');
    revalidateTag('gallery-items');
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to delete gallery item', error: error.message }, { status: 500 });
  }
}

