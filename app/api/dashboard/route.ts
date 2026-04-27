import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const totalMembers = await sql`SELECT COUNT(*) as count FROM members WHERE status = 'active'`;
    const allMembers = await sql`SELECT COUNT(*) as count FROM members`;

    const activeSubscriptions = await sql`
      SELECT COUNT(*) as count FROM subscriptions
      WHERE status = 'active' AND end_date >= CURRENT_DATE
    `;

    const monthlyRevenue = await sql`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments
      WHERE status = 'completed'
      AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)
    `;

    const expiringSoon = await sql`
      SELECT COUNT(*) as count FROM subscriptions
      WHERE status = 'active'
      AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    `;

    const recentPayments = await sql`
      SELECT p.id, p.amount, p.payment_date, p.payment_method, p.status,
             m.name as member_name, sp.name as plan_name
      FROM payments p
      JOIN members m ON p.member_id = m.id
      LEFT JOIN subscriptions s ON p.subscription_id = s.id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      ORDER BY p.created_at DESC
      LIMIT 8
    `;

    const expiringMembers = await sql`
      SELECT m.name, m.phone, s.end_date, sp.name as plan_name
      FROM subscriptions s
      JOIN members m ON s.member_id = m.id
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.status = 'active'
      AND s.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      ORDER BY s.end_date ASC
      LIMIT 5
    `;

    return NextResponse.json({
      totalMembers: parseInt((totalMembers[0] as { count: string }).count),
      allMembers: parseInt((allMembers[0] as { count: string }).count),
      activeSubscriptions: parseInt((activeSubscriptions[0] as { count: string }).count),
      monthlyRevenue: parseFloat((monthlyRevenue[0] as { total: string }).total),
      expiringSoon: parseInt((expiringSoon[0] as { count: string }).count),
      recentPayments,
      expiringMembers,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
