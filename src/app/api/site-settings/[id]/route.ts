import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { SiteSettingsSQL } from '@/lib/schema-types';

// Define the fixed ID for the site settings row
const SITE_SETTINGS_ID = 1;

// PUT (update) site settings by ID
export async function PUT(
  request: NextRequest,
  // We still need to destructure params here to satisfy the route signature,
  // but we won't use params.id directly in the initial scope.
  { params }: { params: { id: string } }
) {
  // const requestUrlId = params.id; // REMOVED: Avoid accessing params directly here
  try {
    const data = await request.json() as Partial<Omit<SiteSettingsSQL, 'id' | 'created_at'>>;

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    const fieldsToUpdate = [];
    const values = [];

    // Build the SET part of the query dynamically
    if (data.hospitalName !== undefined) { fieldsToUpdate.push('hospitalName = ?'); values.push(data.hospitalName); }
    if (data.logoUrl !== undefined) { fieldsToUpdate.push('logoUrl = ?'); values.push(data.logoUrl || null); }
    if (data.facebookUrl !== undefined) { fieldsToUpdate.push('facebookUrl = ?'); values.push(data.facebookUrl || null); }
    if (data.tiktokUrl !== undefined) { fieldsToUpdate.push('tiktokUrl = ?'); values.push(data.tiktokUrl || null); }
    if (data.telegramUrl !== undefined) { fieldsToUpdate.push('telegramUrl = ?'); values.push(data.telegramUrl || null); }

    if (fieldsToUpdate.length === 0) {
        return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }

    // Optional: Check logoUrl length
    if (data.logoUrl && data.logoUrl.length > 65535) { // TEXT limit
      return NextResponse.json(
        { error: "Logo URL exceeds maximum length (65535 characters)" },
        { status: 400 }
      );
    }

    // *** FIX: Use the hardcoded SITE_SETTINGS_ID for the WHERE clause ***
    values.push(SITE_SETTINGS_ID);

    const sql = `UPDATE site_settings SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result: any = await query(sql, values);

    if (result.affectedRows === 0) {
      const checkExistence = await query('SELECT 1 FROM site_settings WHERE id = ?', [SITE_SETTINGS_ID]) as any[];
      if (checkExistence.length === 0) {
          return NextResponse.json({ message: `Site settings row with ID ${SITE_SETTINGS_ID} not found.` }, { status: 404 });
      } else {
          const currentSettings = await query('SELECT * FROM site_settings WHERE id = ?', [SITE_SETTINGS_ID]) as SiteSettingsSQL[];
          return NextResponse.json(currentSettings[0]);
      }
    }

    // *** FIX: Use the hardcoded SITE_SETTINGS_ID to fetch the updated record ***
    const updatedSettings = await query('SELECT * FROM site_settings WHERE id = ?', [SITE_SETTINGS_ID]) as SiteSettingsSQL[];
    return NextResponse.json(updatedSettings[0]);

  } catch (error: any) {
    // Log the error, mentioning the fixed ID being used.
    // We can access params.id here if needed for logging, as it's within the async try block.
    console.error(`API Error PUT /api/site-settings/${params.id} (using fixed ID ${SITE_SETTINGS_ID}):`, error);
     if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
         return NextResponse.json({ message: 'Internal Server Error: Database type mismatch occurred.', error: error.message }, { status: 500 });
     }
    return NextResponse.json({ message: 'Failed to update site settings', error: error.message }, { status: 500 });
  }
}

// Note: DELETE for site_settings is usually not implemented as it's a single-row config.

