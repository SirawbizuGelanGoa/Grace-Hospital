
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { ServiceSQL } from '@/lib/schema-types';

// GET a single service by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const services = await query('SELECT * FROM services WHERE id = ?', [id]) as ServiceSQL[];
    if (services.length === 0) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json(services[0]);
  } catch (error: any) {
    console.error(`API Error GET /api/services/${id}:`, error);
    return NextResponse.json({ message: 'Failed to fetch service', error: error.message }, { status: 500 });
  }
}

// PUT (update) a service by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const data = await request.json() as Partial<Omit<ServiceSQL, 'id' | 'created_at'>>;
    
    if (Object.keys(data).length === 0) {
        return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    const fieldsToUpdate = [];
    const values = [];
    if (data.name) { fieldsToUpdate.push('name = ?'); values.push(data.name); }
    if (data.description) { fieldsToUpdate.push('description = ?'); values.push(data.description); }
    if (data.detailedDescription) { fieldsToUpdate.push('detailedDescription = ?'); values.push(data.detailedDescription); }
    if (data.iconName) { fieldsToUpdate.push('iconName = ?'); values.push(data.iconName); }

    if (fieldsToUpdate.length === 0) {
        return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }

    values.push(id); // For the WHERE clause

    const sql = `UPDATE services SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result: any = await query(sql, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Service not found or no changes made' }, { status: 404 });
    }

    const updatedService = await query('SELECT * FROM services WHERE id = ?', [id]) as ServiceSQL[];
    return NextResponse.json(updatedService[0]);

  } catch (error: any) {
    console.error(`API Error PUT /api/services/${id}:`, error);
    return NextResponse.json({ message: 'Failed to update service', error: error.message }, { status: 500 });
  }
}

// DELETE a service by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const result: any = await query('DELETE FROM services WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (error: any) {
    console.error(`API Error DELETE /api/services/${id}:`, error);
    return NextResponse.json({ message: 'Failed to delete service', error: error.message }, { status: 500 });
  }
}
