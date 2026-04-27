import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { amount, payment_date, payment_method, status, notes } = body;

    const result = await sql`
      UPDATE payments
      SET amount = ${amount}, payment_date = ${payment_date},
          payment_method = ${payment_method}, status = ${status},
          notes = ${notes || null}
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (!result.length) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Payment PUT error:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM payments WHERE id = ${params.id}`;
    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Payment DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
