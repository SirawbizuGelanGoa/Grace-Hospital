import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { HeroSlideSQL } from '@/lib/schema-types';

export async function GET() {
  try {
    const slides = await query('SELECT * FROM hero_slides ORDER BY position ASC, created_at DESC');
    return NextResponse.json(slides);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch hero slides', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<HeroSlideSQL, 'id' | 'created_at'>;
    if (!data.src || !data.alt) {
      return NextResponse.json({ message: 'src and alt are required' }, { status: 400 });
    }
    
    // Modified: Don't generate UUID, let MySQL auto-increment handle the ID
    // Remove the id field from the SQL query
    const sql = 'INSERT INTO hero_slides (src, alt, hint, title, subtitle, ctaLink, ctaText, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const result = await query(sql, [data.src, data.alt, data.hint || null, data.title || null, data.subtitle || null, data.ctaLink || null, data.ctaText || null, data.position || 0]);
    
    // Get the inserted ID from the result
    const insertId = (result as any).insertId;
    
    // Fetch the newly created slide
    const newSlides = await query('SELECT * FROM hero_slides WHERE id = ?', [insertId]) as HeroSlideSQL[];
    return NextResponse.json(newSlides[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create hero slide', error: error.message }, { status: 500 });
  }
}

