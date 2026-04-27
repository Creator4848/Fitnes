import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'plans') {
      const plans = await sql`
        SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price ASC
      `;
      return NextResponse.json(plans);
    }

    const subscriptions = await sql`
      SELECT s.*, m.name as member_name, m.phone as member_phone,
             sp.name as plan_name, sp.price as plan_price
      FROM subscriptions s
      JOIN members m ON s.member_id = m.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      ORDER BY s.created_at DESC
    `;

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Subscriptions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'plan') {
      const { name, price, duration_days, description } = body;
      const result = await sql`
        INSERT INTO subscription_plans (name, price, duration_days, description)
        VALUES (${name}, ${price}, ${duration_days}, ${description || null})
        RETURNING *
      `;
      return NextResponse.json(result[0], { status: 201 });
    }

    // Assign subscription to member
    const { member_id, plan_id, start_date } = body;
    if (!member_id || !plan_id || !start_date) {
      return NextResponse.json({ error: 'member_id, plan_id and start_date are required' }, { status: 400 });
    }

    const plan = await sql`SELECT * FROM subscription_plans WHERE id = ${plan_id}`;
    if (!plan.length) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const planData = plan[0] as { duration_days: number };
    const endDate = new Date(start_date);
    endDate.setDate(endDate.getDate() + planData.duration_days);

    // Deactivate old subscriptions
    await sql`
      UPDATE subscriptions SET status = 'expired'
      WHERE member_id = ${member_id} AND status = 'active'
    `;

    const result = await sql`
      INSERT INTO subscriptions (member_id, plan_id, start_date, end_date, status)
      VALUES (${member_id}, ${plan_id}, ${start_date}, ${endDate.toISOString().split('T')[0]}, 'active')
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Subscriptions POST error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
