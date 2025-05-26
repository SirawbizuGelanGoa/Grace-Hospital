
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { AboutContentSQL } from '@/lib/schema-types';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const content = await query('SELECT * FROM about_content LIMIT 1') as AboutContentSQL[];
    return NextResponse.json(content); // Returns array, client expects to take content[0]
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch about content', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<AboutContentSQL, 'id' | 'created_at'>;
    if (!data.title || !data.description || !data.mission || !data.vision) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingContent = await query('SELECT id FROM about_content LIMIT 1') as { id: string }[];
    let savedContent;

    if (existingContent.length > 0) {
      const existingId = existingContent[0].id;
      const sql = 'UPDATE about_content SET title = ?, description = ?, mission = ?, vision = ?, imageUrl = ?, imageHint = ? WHERE id = ?';
      await query(sql, [data.title, data.description, data.mission, data.vision, data.imageUrl || null, data.imageHint || null, existingId]);
      const result = await query('SELECT * FROM about_content WHERE id = ?', [existingId]) as AboutContentSQL[];
      savedContent = result[0];
    } else {
      const newId = randomUUID();
      const sql = 'INSERT INTO about_content (id, title, description, mission, vision, imageUrl, imageHint) VALUES (?, ?, ?, ?, ?, ?, ?)';
      await query(sql, [newId, data.title, data.description, data.mission, data.vision, data.imageUrl || null, data.imageHint || null]);
      const result = await query('SELECT * FROM about_content WHERE id = ?', [newId]) as AboutContentSQL[];
      savedContent = result[0];
    }
    return NextResponse.json(savedContent, { status: existingContent.length > 0 ? 200 : 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to save about content', error: error.message }, { status: 500 });
  }
}
