
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { NewsEventSQL } from '@/lib/schema-types';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const items = await query('SELECT * FROM news_events ORDER BY date DESC, created_at DESC');
    // Ensure date is string for client
    const processedItems = (items as NewsEventSQL[]).map(item => ({
        ...item,
        date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : String(item.date),
    }));
    return NextResponse.json(processedItems);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch news/events', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<NewsEventSQL, 'id' | 'created_at'>;
    if (!data.title || !data.date || !data.summary || !data.fullContent || !data.image || !data.link) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    if (!data.link.startsWith('/')) {
        return NextResponse.json({ message: "Link must start with /" }, { status: 400 });
    }

    const formattedDate = data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date;
    const newId = randomUUID();

    const sql = 'INSERT INTO news_events (id, title, date, summary, fullContent, image, link, hint) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await query(sql, [newId, data.title, formattedDate, data.summary, data.fullContent, data.image, data.link, data.hint || null]);
    
    const newItems = await query('SELECT * FROM news_events WHERE id = ?', [newId]) as NewsEventSQL[];
    if (newItems.length > 0) {
        return NextResponse.json({
            ...newItems[0],
            date: newItems[0].date instanceof Date ? newItems[0].date.toISOString().split('T')[0] : String(newItems[0].date),
        }, { status: 201 });
    }
    return NextResponse.json({ message: 'News item created but failed to fetch back' }, { status: 201 });
  } catch (error: any) {
    // Check for unique constraint violation on 'link'
    if (error.code === 'ER_DUP_ENTRY' || (error.message && error.message.toLowerCase().includes('unique constraint failed'))) {
        return NextResponse.json({ message: 'A news item with this link already exists.' }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: 'Failed to create news/event', error: error.message }, { status: 500 });
  }
}
