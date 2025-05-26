
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { SiteSettingsSQL } from '@/lib/schema-types';
import { randomUUID } from 'crypto'; // For generating UUID if needed

// GET site settings (expects a single row)
export async function GET() {
  try {
    const settings = await query('SELECT * FROM site_settings LIMIT 1') as SiteSettingsSQL[];
    return NextResponse.json(settings); // Returns an array, client should take settings[0]
  } catch (error: any) {
    console.error('API Error GET /api/site-settings:', error);
    return NextResponse.json({ message: 'Failed to fetch site settings', error: error.message }, { status: 500 });
  }
}

// POST (Create or effectively Upsert) site settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<SiteSettingsSQL, 'id' | 'created_at'>;

    if (!data.hospitalName) {
      return NextResponse.json({ message: 'Hospital name is required' }, { status: 400 });
    }
    
    // Check if settings exist
    const existingSettings = await query('SELECT id FROM site_settings LIMIT 1') as { id: string }[];

    let savedSettings;

    if (existingSettings.length > 0) {
      // Update existing settings
      const existingId = existingSettings[0].id;
      const updateSql = `UPDATE site_settings SET hospitalName = ?, logoUrl = ?, facebookUrl = ?, tiktokUrl = ?, telegramUrl = ? WHERE id = ?`;
      await query(updateSql, [
        data.hospitalName,
        data.logoUrl || null,
        data.facebookUrl || null,
        data.tiktokUrl || null,
        data.telegramUrl || null,
        existingId
      ]);
      const result = await query('SELECT * FROM site_settings WHERE id = ?', [existingId]) as SiteSettingsSQL[];
      savedSettings = result[0];
    } else {
      // Insert new settings
      const newId = randomUUID(); // Generate UUID on the server
      const insertSql = 'INSERT INTO site_settings (id, hospitalName, logoUrl, facebookUrl, tiktokUrl, telegramUrl) VALUES (?, ?, ?, ?, ?, ?)';
      await query(insertSql, [
        newId,
        data.hospitalName,
        data.logoUrl || null,
        data.facebookUrl || null,
        data.tiktokUrl || null,
        data.telegramUrl || null
      ]);
      const result = await query('SELECT * FROM site_settings WHERE id = ?', [newId]) as SiteSettingsSQL[];
      savedSettings = result[0];
    }
    return NextResponse.json(savedSettings, { status: existingSettings.length > 0 ? 200 : 201 });
  } catch (error: any) {
    console.error('API Error POST /api/site-settings:', error);
    return NextResponse.json({ message: 'Failed to save site settings', error: error.message }, { status: 500 });
  }
}
