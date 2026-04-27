export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('member_id');
    const status = searchParams.get('status');
    const month = searchParams.get('month'); // format: 2024-01

    let payments;

    if (memberId) {
      payments = await sql`
        SELECT p.*, m.name as member_name, sp.name as plan_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN subscriptions s ON p.subscription_id = s.id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE p.member_id = ${memberId}
        ORDER BY p.created_at DESC
      `;
    } else if (status && month) {
      payments = await sql`
        SELECT p.*, m.name as member_name, sp.name as plan_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN subscriptions s ON p.subscription_id = s.id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE p.status = ${status}
        AND TO_CHAR(p.payment_date, 'YYYY-MM') = ${month}
        ORDER BY p.created_at DESC
      `;
    } else if (status) {
      payments = await sql`
        SELECT p.*, m.name as member_name, sp.name as plan_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN subscriptions s ON p.subscription_id = s.id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE p.status = ${status}
        ORDER BY p.created_at DESC
      `;
    } else if (month) {
      payments = await sql`
        SELECT p.*, m.name as member_name, sp.name as plan_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN subscriptions s ON p.subscription_id = s.id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE TO_CHAR(p.payment_date, 'YYYY-MM') = ${month}
        ORDER BY p.created_at DESC
      `;
    } else {
      payments = await sql`
        SELECT p.*, m.name as member_name, sp.name as plan_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN subscriptions s ON p.subscription_id = s.id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        ORDER BY p.created_at DESC
        LIMIT 100
      `;
    }

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Payments GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { member_id, subscription_id, amount, payment_date, payment_method, status, notes } = body;

    if (!member_id || !amount) {
      return NextResponse.json({ error: 'member_id and amount are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO payments (member_id, subscription_id, amount, payment_date, payment_method, status, notes)
      VALUES (
        ${member_id},
        ${subscription_id || null},
        ${amount},
        ${payment_date || new Date().toISOString().split('T')[0]},
        ${payment_method || 'cash'},
        ${status || 'completed'},
        ${notes || null}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Payments POST error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
