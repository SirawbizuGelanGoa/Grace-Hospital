import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { NewsEventSQL } from '@/lib/schema-types';

async function getNewsItem(idOrLink: string): Promise<NewsEventSQL | null> {
    console.log(`getNewsItem received: ${idOrLink}`); // For debugging
    let items: NewsEventSQL[];

    // Attempt to parse idOrLink as an integer (for 'id' column)
    const numericId = parseInt(idOrLink, 10);

    if (!isNaN(numericId)) {
        // If it's a valid number, try fetching by 'id'
        items = await query('SELECT * FROM news_events WHERE id = ?', [numericId]) as NewsEventSQL[];
        if (items.length > 0) {
            return { // Ensure date is string
                ...items[0],
                date: items[0].date instanceof Date ? items[0].date.toISOString().split('T')[0] : String(items[0].date),
            };
        }
    }

    // If not found by numeric ID, or if idOrLink was not a number, try to fetch by 'link'
    // Ensure the link always starts with /news/ for database query consistency
    const queryLink = idOrLink.startsWith('/news/') ? idOrLink : `/news/${idOrLink}`;
    items = await query('SELECT * FROM news_events WHERE link = ?', [queryLink]) as NewsEventSQL[];
    
    if (items.length === 0) return null;
    return { // Ensure date is string
        ...items[0],
        date: items[0].date instanceof Date ? items[0].date.toISOString().split('T')[0] : String(items[0].date),
    };
}


export async function GET(request: NextRequest, { params }: { params: { idOrLink: string } }) {
  // Await params to satisfy Next.js static analysis, even if it's not strictly a Promise
  const idOrLink = await params.idOrLink;
  try {
    const item = await getNewsItem(idOrLink);
    if (!item) return NextResponse.json({ message: 'News/Event not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch news/event', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { idOrLink: string } }) {
  const id = await params.idOrLink; // Assuming ID is passed for PUT
  try {
    const data = await request.json() as Partial<Omit<NewsEventSQL, 'id' | 'created_at'>>;
    const fieldsToUpdate = [];
    const values = [];

    if (data.title !== undefined) { fieldsToUpdate.push('title = ?'); values.push(data.title); }
    if (data.date !== undefined) { 
        const formattedDate = data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date;
        fieldsToUpdate.push('date = ?'); values.push(formattedDate); 
    }
    if (data.summary !== undefined) { fieldsToUpdate.push('summary = ?'); values.push(data.summary); }
    if (data.fullContent !== undefined) { fieldsToUpdate.push('fullContent = ?'); values.push(data.fullContent); }
    if (data.image !== undefined) { fieldsToUpdate.push('image = ?'); values.push(data.image); }
    if (data.link !== undefined) { 
        // Ensure link starts with /news/ for consistency
        const formattedLink = data.link.startsWith('/news/') ? data.link : `/news/${data.link}`;
        fieldsToUpdate.push('link = ?'); values.push(formattedLink); 
    }
    if (data.hint !== undefined) { fieldsToUpdate.push('hint = ?'); values.push(data.hint || null); }
    
    if (fieldsToUpdate.length === 0) return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    values.push(id);

    const sql = `UPDATE news_events SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result: any = await query(sql, values);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'News/Event not found' }, { status: 404 });
    
    const updatedItem = await getNewsItem(id);
    return NextResponse.json(updatedItem);
  } catch (error: any) {
     if (error.code === 'ER_DUP_ENTRY' || (error.message && error.message.toLowerCase().includes('unique constraint failed'))) {
        return NextResponse.json({ message: 'A news item with this link already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to update news/event', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { idOrLink: string } }) {
  const id = await params.idOrLink; // Assuming ID is passed for DELETE
  try {
    const result: any = await query('DELETE FROM news_events WHERE id = ?', [id]);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'News/Event not found' }, { status: 404 });
    return NextResponse.json({ message: 'News/Event deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to delete news/event', error: error.message }, { status: 500 });
  }
}


