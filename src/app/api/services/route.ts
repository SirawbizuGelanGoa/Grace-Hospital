import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { ServiceSQL } from '@/lib/schema-types';

// GET all services
export async function GET() {
  try {
    const services = await query('SELECT * FROM services ORDER BY created_at DESC');
    return NextResponse.json(services);
  } catch (error: any) {
    console.error('API Error GET /api/services:', error);
    return NextResponse.json({ message: 'Failed to fetch services', error: error.message }, { status: 500 });
  }
}

// POST a new service
export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<ServiceSQL, 'id' | 'created_at'>;
    
    if (!data.name || !data.description || !data.detailedDescription) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Always provide a default value for iconName if not provided
    // Using 'HelpCircle' as the default icon
    const iconName = data.iconName || 'HelpCircle';

    // Always include iconName in the SQL query
    const sql = 'INSERT INTO services (name, description, detailedDescription, iconName) VALUES (?, ?, ?, ?)';
    const params = [data.name, data.description, data.detailedDescription, iconName];
    
    const result: any = await query(sql, params);
    
    const newServiceId = result.insertId;

    const newService = await query('SELECT * FROM services WHERE id = (SELECT LAST_INSERT_ID() AS id)');

    const fetchBackSql = 'SELECT * FROM services WHERE name = ? AND description = ? AND detailedDescription = ? ORDER BY created_at DESC LIMIT 1';
    const fetchParams = [data.name, data.description, data.detailedDescription];
    const newServices = await query(fetchBackSql, fetchParams) as ServiceSQL[];

    if (newServices.length > 0) {
        return NextResponse.json(newServices[0], { status: 201 });
    } else {
        return NextResponse.json({ message: 'Service created, but could not fetch it back immediately.' }, { status: 201 });
    }

  } catch (error: any) {
    console.error('API Error POST /api/services:', error);
    return NextResponse.json({ message: 'Failed to create service', error: error.message }, { status: 500 });
  }
}

