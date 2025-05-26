
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { DepartmentSQL } from '@/lib/schema-types';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const departments = await query('SELECT * FROM departments ORDER BY created_at DESC');
    return NextResponse.json(departments);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch departments', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as Omit<DepartmentSQL, 'id' | 'created_at'>;
    if (!data.name || !data.description || !data.detailedDescription || !data.iconName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    const newId = randomUUID();
    const sql = 'INSERT INTO departments (id, name, description, iconName, detailedDescription, headOfDepartmentImage, headOfDepartmentImageHint) VALUES (?, ?, ?, ?, ?, ?, ?)';
    await query(sql, [newId, data.name, data.description, data.iconName, data.detailedDescription, data.headOfDepartmentImage || null, data.headOfDepartmentImageHint || null]);
    
    const newDepartments = await query('SELECT * FROM departments WHERE id = ?', [newId]) as DepartmentSQL[];
    return NextResponse.json(newDepartments[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create department', error: error.message }, { status: 500 });
  }
}
