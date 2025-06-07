import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { ContactInfoSQL } from '@/lib/schema-types';
// import { randomUUID } from 'crypto'; // No longer needed

// Define the fixed ID for the contact info row (assuming it should be a single row)
const CONTACT_INFO_ID = 1;

export async function GET() {
  try {
    // Fetch the specific contact info row by its fixed ID
    const info = await query('SELECT * FROM contact_info WHERE id = ?', [CONTACT_INFO_ID]) as ContactInfoSQL[];
    if (info.length === 0) {
        // Return an empty object or appropriate response if not found
        return NextResponse.json({ message: 'Contact info not found' }, { status: 404 });
    }
    // Return the single contact info object
    return NextResponse.json(info[0]); 
  } catch (error: any) {
    console.error(`API Error GET /api/contact-info (ID: ${CONTACT_INFO_ID}):`, error);
    return NextResponse.json({ message: 'Failed to fetch contact info', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<ContactInfoSQL, 'id' | 'created_at'>;
    if (!data.address || !data.phone || !data.email) {
      return NextResponse.json({ message: 'Missing required fields (address, phone, email)' }, { status: 400 });
    }

    // Check if the contact info row with the fixed ID already exists
    const existingInfo = await query('SELECT id FROM contact_info WHERE id = ?', [CONTACT_INFO_ID]) as { id: number }[];
    let savedInfo;
    let statusCode = 200; // Default to 200 OK for update

    if (existingInfo.length > 0) {
      // --- UPDATE existing row --- 
      const sql = 'UPDATE contact_info SET address = ?, phone = ?, email = ?, mapPlaceholder = ? WHERE id = ?';
      const values = [data.address, data.phone, data.email, data.mapPlaceholder || null, CONTACT_INFO_ID];
      await query(sql, values);
      
    } else {
      // --- INSERT new row --- 
      // The 'id' column should be AUTO_INCREMENT, so we don't specify it here.
      // If 'id' is NOT auto_increment and you MUST specify it, use CONTACT_INFO_ID.
      // Assuming AUTO_INCREMENT:
      const sql = 'INSERT INTO contact_info (address, phone, email, mapPlaceholder) VALUES (?, ?, ?, ?)';
      const values = [data.address, data.phone, data.email, data.mapPlaceholder || null];
      const insertResult: any = await query(sql, values);
      
      // If ID is NOT auto_increment, use this INSERT instead:
      // const sql = 'INSERT INTO contact_info (id, address, phone, email, mapPlaceholder) VALUES (?, ?, ?, ?, ?)';
      // const values = [CONTACT_INFO_ID, data.address, data.phone, data.email, data.mapPlaceholder || null];
      // await query(sql, values);

      statusCode = 201; // 201 Created for new resource
    }

    // Fetch the saved/updated info using the fixed ID to return it
    const result = await query('SELECT * FROM contact_info WHERE id = ?', [CONTACT_INFO_ID]) as ContactInfoSQL[];
    if (result.length === 0) {
        // This shouldn't happen if insert/update succeeded, but handle defensively
        return NextResponse.json({ message: 'Failed to retrieve saved contact info' }, { status: 500 });
    }
    savedInfo = result[0];

    return NextResponse.json(savedInfo, { status: statusCode });

  } catch (error: any) {
    console.error(`API Error POST /api/contact-info (using fixed ID ${CONTACT_INFO_ID}):`, error);
    // Check if it's the specific error we were trying to fix
    if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || error.message.includes('Incorrect integer value')) {
        return NextResponse.json({ message: 'Database error: Tried to save non-integer value to integer ID field.', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Failed to save contact info', error: error.message }, { status: 500 });
  }
}

