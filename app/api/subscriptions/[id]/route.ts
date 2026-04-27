import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, price, duration_days, description, is_active, status } = body;

    // Update subscription plan
    if (name !== undefined) {
      const result = await sql`
        UPDATE subscription_plans
        SET name = ${name}, price = ${price}, duration_days = ${duration_days},
            description = ${description || null}, is_active = ${is_active ?? true}
        WHERE id = ${params.id}
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    }

    // Update subscription status
    const result = await sql`
      UPDATE subscriptions SET status = ${status}
      WHERE id = ${params.id}
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Subscription PUT error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'plan') {
      await sql`UPDATE subscription_plans SET is_active = false WHERE id = ${params.id}`;
    } else {
      await sql`DELETE FROM subscriptions WHERE id = ${params.id}`;
    }

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Subscription DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
