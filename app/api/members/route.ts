import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    let members;
    if (search && status) {
      members = await sql`
        SELECT m.*,
               s.end_date as subscription_end,
               s.status as subscription_status,
               sp.name as plan_name
        FROM members m
        LEFT JOIN LATERAL (
          SELECT sub.end_date, sub.status, sub.plan_id
          FROM subscriptions sub
          WHERE sub.member_id = m.id
          ORDER BY sub.created_at DESC
          LIMIT 1
        ) s ON true
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE (m.name ILIKE ${'%' + search + '%'} OR m.phone ILIKE ${'%' + search + '%'} OR m.email ILIKE ${'%' + search + '%'})
        AND m.status = ${status}
        ORDER BY m.created_at DESC
      `;
    } else if (search) {
      members = await sql`
        SELECT m.*,
               s.end_date as subscription_end,
               s.status as subscription_status,
               sp.name as plan_name
        FROM members m
        LEFT JOIN LATERAL (
          SELECT sub.end_date, sub.status, sub.plan_id
          FROM subscriptions sub
          WHERE sub.member_id = m.id
          ORDER BY sub.created_at DESC
          LIMIT 1
        ) s ON true
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE m.name ILIKE ${'%' + search + '%'} OR m.phone ILIKE ${'%' + search + '%'} OR m.email ILIKE ${'%' + search + '%'}
        ORDER BY m.created_at DESC
      `;
    } else if (status) {
      members = await sql`
        SELECT m.*,
               s.end_date as subscription_end,
               s.status as subscription_status,
               sp.name as plan_name
        FROM members m
        LEFT JOIN LATERAL (
          SELECT sub.end_date, sub.status, sub.plan_id
          FROM subscriptions sub
          WHERE sub.member_id = m.id
          ORDER BY sub.created_at DESC
          LIMIT 1
        ) s ON true
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE m.status = ${status}
        ORDER BY m.created_at DESC
      `;
    } else {
      members = await sql`
        SELECT m.*,
               s.end_date as subscription_end,
               s.status as subscription_status,
               sp.name as plan_name
        FROM members m
        LEFT JOIN LATERAL (
          SELECT sub.end_date, sub.status, sub.plan_id
          FROM subscriptions sub
          WHERE sub.member_id = m.id
          ORDER BY sub.created_at DESC
          LIMIT 1
        ) s ON true
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        ORDER BY m.created_at DESC
      `;
    }

    return NextResponse.json(members);
  } catch (error) {
    console.error('Members GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, address, birth_date, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO members (name, phone, email, address, birth_date, notes)
      VALUES (${name}, ${phone || null}, ${email || null}, ${address || null}, ${birth_date || null}, ${notes || null})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Members POST error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
