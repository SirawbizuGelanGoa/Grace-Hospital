import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { SiteSettingsSQL } from '@/lib/schema-types';
import { revalidateTag } from 'next/cache';

// Fixed ID for the single site settings row
const SITE_SETTINGS_ID = 1;

// GET site settings (returns a single object, not an array)
export async function GET() {
  try {
    const settings = await query('SELECT * FROM site_settings WHERE id = ?', [SITE_SETTINGS_ID]) as SiteSettingsSQL[];

    if (settings.length === 0) {
      // Return 404 if no settings found
      return NextResponse.json({ message: 'Site settings not found' }, { status: 404 });
    }

    // Set cache headers for ISR
    const response = NextResponse.json(settings[0]);
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    return response;
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

    // Check if settings exist using fixed ID
    const existingSettings = await query('SELECT id FROM site_settings WHERE id = ?', [SITE_SETTINGS_ID]) as { id: number }[];

    let savedSettings;
    let statusCode = 200;

    if (existingSettings.length > 0) {
      // Update existing settings
      const updateSql = `UPDATE site_settings SET hospitalName = ?, logoUrl = ?, facebookUrl = ?, tiktokUrl = ?, telegramUrl = ? WHERE id = ?`;
      await query(updateSql, [
        data.hospitalName,
        data.logoUrl || null,
        data.facebookUrl || null,
        data.tiktokUrl || null,
        data.telegramUrl || null,
        SITE_SETTINGS_ID
      ]);
    } else {
      // Insert new settings with fixed ID
      const insertSql = 'INSERT INTO site_settings (hospitalName, logoUrl, facebookUrl, tiktokUrl, telegramUrl) VALUES (?, ?, ?, ?, ?)';
      await query(insertSql, [
        data.hospitalName,
        data.logoUrl || null,
        data.facebookUrl || null,
        data.tiktokUrl || null,
        data.telegramUrl || null
      ]);
      statusCode = 201;
    }

    // Fetch the saved settings
    const result = await query('SELECT * FROM site_settings WHERE id = ?', [SITE_SETTINGS_ID]) as SiteSettingsSQL[];
    if (result.length === 0) {
      return NextResponse.json({ message: 'Failed to retrieve saved site settings' }, { status: 500 });
    }
    savedSettings = result[0];

    // Revalidate the cache for site settings
    revalidateTag('site-settings');

    return NextResponse.json(savedSettings, { status: statusCode });
  } catch (error: any) {
    console.error('API Error POST /api/site-settings:', error);
    return NextResponse.json({ message: 'Failed to save site settings', error: error.message }, { status: 500 });
  }
}

