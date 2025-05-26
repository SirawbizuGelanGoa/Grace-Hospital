
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { ContactInfoSQL } from '@/lib/schema-types';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const info = await query('SELECT * FROM contact_info LIMIT 1') as ContactInfoSQL[];
    return NextResponse.json(info); // Returns array, client to take info[0]
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch contact info', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<ContactInfoSQL, 'id' | 'created_at'>;
    if (!data.address || !data.phone || !data.email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingInfo = await query('SELECT id FROM contact_info LIMIT 1') as { id: string }[];
    let savedInfo;

    if (existingInfo.length > 0) {
      const existingId = existingInfo[0].id;
      const sql = 'UPDATE contact_info SET address = ?, phone = ?, email = ?, mapPlaceholder = ? WHERE id = ?';
      await query(sql, [data.address, data.phone, data.email, data.mapPlaceholder || null, existingId]);
      const result = await query('SELECT * FROM contact_info WHERE id = ?', [existingId]) as ContactInfoSQL[];
      savedInfo = result[0];
    } else {
      const newId = randomUUID();
      const sql = 'INSERT INTO contact_info (id, address, phone, email, mapPlaceholder) VALUES (?, ?, ?, ?, ?)';
      await query(sql, [newId, data.address, data.phone, data.email, data.mapPlaceholder || null]);
      const result = await query('SELECT * FROM contact_info WHERE id = ?', [newId]) as ContactInfoSQL[];
      savedInfo = result[0];
    }
    return NextResponse.json(savedInfo, { status: existingInfo.length > 0 ? 200 : 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to save contact info', error: error.message }, { status: 500 });
  }
}
