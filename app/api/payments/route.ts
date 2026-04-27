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
      return NextResponse.json({ error: 'A\'zo va summa majburiy', status: 400 });
    }

    // Ensure payments table exists
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATE DEFAULT CURRENT_DATE,
        payment_method VARCHAR(50) DEFAULT 'cash',
        status VARCHAR(20) DEFAULT 'completed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    const memberId = Number(member_id);
    const subId = subscription_id ? Number(subscription_id) : null;
    const amountNum = Number(amount);
    const pDate = payment_date || new Date().toISOString().split('T')[0];
    const pMethod = payment_method || 'cash';
    const pStatus = status || 'completed';
    const pNotes = notes || null;

    let result;
    if (subId) {
      result = await sql`
        INSERT INTO payments (member_id, subscription_id, amount, payment_date, payment_method, status, notes)
        VALUES (${memberId}, ${subId}, ${amountNum}, ${pDate}, ${pMethod}, ${pStatus}, ${pNotes})
        RETURNING *
      `;
    } else {
      result = await sql`
        INSERT INTO payments (member_id, amount, payment_date, payment_method, status, notes)
        VALUES (${memberId}, ${amountNum}, ${pDate}, ${pMethod}, ${pStatus}, ${pNotes})
        RETURNING *
      `;
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Payments POST error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
