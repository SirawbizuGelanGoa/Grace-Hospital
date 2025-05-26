
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { DepartmentSQL } from '@/lib/schema-types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const departments = await query('SELECT * FROM departments WHERE id = ?', [id]) as DepartmentSQL[];
    if (departments.length === 0) return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    return NextResponse.json(departments[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch department', error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const data = await request.json() as Partial<Omit<DepartmentSQL, 'id' | 'created_at'>>;
    const fieldsToUpdate = [];
    const values = [];
    if (data.name !== undefined) { fieldsToUpdate.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fieldsToUpdate.push('description = ?'); values.push(data.description); }
    if (data.detailedDescription !== undefined) { fieldsToUpdate.push('detailedDescription = ?'); values.push(data.detailedDescription); }
    if (data.iconName !== undefined) { fieldsToUpdate.push('iconName = ?'); values.push(data.iconName); }
    if (data.headOfDepartmentImage !== undefined) { fieldsToUpdate.push('headOfDepartmentImage = ?'); values.push(data.headOfDepartmentImage || null); }
    if (data.headOfDepartmentImageHint !== undefined) { fieldsToUpdate.push('headOfDepartmentImageHint = ?'); values.push(data.headOfDepartmentImageHint || null); }
    
    if (fieldsToUpdate.length === 0) return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    values.push(id);

    const sql = `UPDATE departments SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    const result: any = await query(sql, values);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    
    const updatedDepartments = await query('SELECT * FROM departments WHERE id = ?', [id]) as DepartmentSQL[];
    return NextResponse.json(updatedDepartments[0]);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update department', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const result: any = await query('DELETE FROM departments WHERE id = ?', [id]);
    if (result.affectedRows === 0) return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    return NextResponse.json({ message: 'Department deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to delete department', error: error.message }, { status: 500 });
  }
}
