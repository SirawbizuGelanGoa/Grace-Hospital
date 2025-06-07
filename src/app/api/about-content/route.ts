import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { AboutContentSQL } from '@/lib/schema-types';

// Define the fixed ID for the about content row (assuming it should be a single row)
const ABOUT_CONTENT_ID = 1;
// Define max length for imageUrl (assuming TEXT type, 65535 chars)
// Adjust this if your database column type is different (e.g., VARCHAR(255))
const MAX_IMAGE_URL_LENGTH = 65535;

export async function GET() {
  try {
    const content = await query('SELECT * FROM about_content WHERE id = ?', [ABOUT_CONTENT_ID]) as AboutContentSQL[];
    if (content.length === 0) {
        return NextResponse.json({ message: 'About content not found' }, { status: 404 });
    }
    return NextResponse.json(content[0]); 
  } catch (error: any) {
    console.error(`API Error GET /api/about-content (ID: ${ABOUT_CONTENT_ID}):`, error);
    return NextResponse.json({ message: 'Failed to fetch about content', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<AboutContentSQL, 'id' | 'created_at'>;
    
    // --- Basic field validation ---
    if (!data.title || !data.description || !data.mission || !data.vision) {
      return NextResponse.json({ message: 'Missing required fields (title, description, mission, vision)' }, { status: 400 });
    }

    // --- ADDED: imageUrl Length Validation ---
    if (data.imageUrl && data.imageUrl.length > MAX_IMAGE_URL_LENGTH) {
        console.error(`API Error POST /api/about-content: imageUrl length (${data.imageUrl.length}) exceeds maximum (${MAX_IMAGE_URL_LENGTH}).`);
        return NextResponse.json(
            { message: `Image URL is too long. Maximum length allowed is ${MAX_IMAGE_URL_LENGTH} characters.` }, 
            { status: 400 } // Bad Request
        );
    }
    // --- End of added validation ---

    const existingContent = await query('SELECT id FROM about_content WHERE id = ?', [ABOUT_CONTENT_ID]) as { id: number }[];
    let savedContent;
    let statusCode = 200; 

    if (existingContent.length > 0) {
      // --- UPDATE existing row --- 
      const sql = 'UPDATE about_content SET title = ?, description = ?, mission = ?, vision = ?, imageUrl = ?, imageHint = ? WHERE id = ?';
      const values = [data.title, data.description, data.mission, data.vision, data.imageUrl || null, data.imageHint || null, ABOUT_CONTENT_ID];
      await query(sql, values);
      
    } else {
      // --- INSERT new row --- 
      const sql = 'INSERT INTO about_content (title, description, mission, vision, imageUrl, imageHint) VALUES (?, ?, ?, ?, ?, ?)';
      const values = [data.title, data.description, data.mission, data.vision, data.imageUrl || null, data.imageHint || null];
      await query(sql, values);
      statusCode = 201; 
    }

    const result = await query('SELECT * FROM about_content WHERE id = ?', [ABOUT_CONTENT_ID]) as AboutContentSQL[];
    if (result.length === 0) {
        return NextResponse.json({ message: 'Failed to retrieve saved about content' }, { status: 500 });
    }
    savedContent = result[0];

    return NextResponse.json(savedContent, { status: statusCode });

  } catch (error: any) {
    console.error(`API Error POST /api/about-content (using fixed ID ${ABOUT_CONTENT_ID}):`, error);
    // Specific check for data too long error
    if (error.code === 'ER_DATA_TOO_LONG') {
         return NextResponse.json({ message: `Database error: Data too long for column '${error.sqlMessage?.match(/column '(.*?)'/)?.[1] || 'unknown'}'. Please check input length.`, error: error.message }, { status: 400 });
    }
    // Keep the check for the ID truncation error as well
    if (error.code === 'WARN_DATA_TRUNCATED' || error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || error.message.includes('Data truncated for column \'id\'')) {
        return NextResponse.json({ message: 'Database error: Tried to save invalid value to ID field.', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Failed to save about content', error: error.message }, { status: 500 });
  }
}

