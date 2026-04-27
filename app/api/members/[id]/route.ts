import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const member = await sql`
      SELECT * FROM members WHERE id = ${params.id}
    `;
    if (!member.length) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const subscriptions = await sql`
      SELECT s.*, sp.name as plan_name, sp.price
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.member_id = ${params.id}
      ORDER BY s.created_at DESC
    `;

    const payments = await sql`
      SELECT p.*, sp.name as plan_name
      FROM payments p
      LEFT JOIN subscriptions s ON p.subscription_id = s.id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE p.member_id = ${params.id}
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json({ ...member[0], subscriptions, payments });
  } catch (error) {
    console.error('Member GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, phone, email, address, birth_date, status, notes } = body;

    const result = await sql`
      UPDATE members
      SET name = ${name}, phone = ${phone || null}, email = ${email || null},
          address = ${address || null}, birth_date = ${birth_date || null},
          status = ${status || 'active'}, notes = ${notes || null},
          updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (!result.length) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Member PUT error:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM members WHERE id = ${params.id}`;
    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Member DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
