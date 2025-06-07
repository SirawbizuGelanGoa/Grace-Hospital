import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { query } from '@/lib/mysql';
import type { DepartmentSQL } from '@/lib/schema-types';

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
    
    // Remove the id field from the SQL query to let the database auto-increment it
    const sql = 'INSERT INTO departments (name, description, iconName, detailedDescription, headOfDepartmentImage, headOfDepartmentImageHint) VALUES (?, ?, ?, ?, ?, ?)';
    const result: any = await query(sql, [
      data.name, 
      data.description, 
      data.iconName, 
      data.detailedDescription, 
      data.headOfDepartmentImage || null, 
      data.headOfDepartmentImageHint || null
    ]);
    
    // Get the newly inserted ID from the result
    const newId = result.insertId;
    
    // Fetch the newly created department
    const newDepartments = await query('SELECT * FROM departments WHERE id = ?', [newId]) as DepartmentSQL[];
    
    if (newDepartments.length > 0) {
      return NextResponse.json(newDepartments[0], { status: 201 });
    } else {
      // Fallback if we can't find the newly created department by ID
      const fetchBackSql = 'SELECT * FROM departments WHERE name = ? AND description = ? ORDER BY created_at DESC LIMIT 1';
      const fetchParams = [data.name, data.description];
      const fallbackDepartments = await query(fetchBackSql, fetchParams) as DepartmentSQL[];
      
      if (fallbackDepartments.length > 0) {
        return NextResponse.json(fallbackDepartments[0], { status: 201 });
      } else {
        return NextResponse.json({ message: 'Department created, but could not fetch it back immediately.' }, { status: 201 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create department', error: error.message }, { status: 500 });
  }
}

