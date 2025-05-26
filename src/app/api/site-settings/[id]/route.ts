
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { SiteSettingsSQL } from '@/lib/schema-types';

// PUT (update) site settings by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const data = await request.json() as Partial<Omit<SiteSettingsSQL, 'id' | 'created_at'>>;
    
    if (Object.keys(data).length === 0) {
        return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    const fieldsToUpdate = [];
    const values = [];

    if (data.hospitalName !== undefined) { fieldsToUpdate.push('hospitalName = ?'); values.push(data.hospitalName); }
    if (data.logoUrl !== undefined) { fieldsToUpdate.push('logoUrl = ?'); values.push(data.logoUrl || null); }
    if (data.facebookUrl !== undefined) { fieldsToUpdate.push('facebookUrl = ?'); values.push(data.facebookUrl || null); }
    if (data.tiktokUrl !== undefined) { fieldsToUpdate.push('tiktokUrl = ?'); values.push(data.tiktokUrl || null); }
    if (data.telegramUrl !== undefined) { fieldsToUpdate.push('telegramUrl = ?'); values.push(data.telegramUrl || null); }

    if (fieldsToUpdate.length === 0) {
        return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }

    values.push(id); // For the WHERE clause

    const sql = `UPDATE site_settings SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result: any = await query(sql, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Site settings not found or no changes made' }, { status: 404 });
    }

    const updatedSettings = await query('SELECT * FROM site_settings WHERE id = ?', [id]) as SiteSettingsSQL[];
    return NextResponse.json(updatedSettings[0]);

  } catch (error: any) {
    console.error(`API Error PUT /api/site-settings/${id}:`, error);
    return NextResponse.json({ message: 'Failed to update site settings', error: error.message }, { status: 500 });
  }
}

// Note: DELETE for site_settings is usually not implemented as it's a single-row config.
// If you need to delete (e.g. for a reset), you can add a DELETE handler here.
