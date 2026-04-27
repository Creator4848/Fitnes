export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const [
      totalMembersRes,
      allMembersRes,
      activeSubsRes,
      revenueRes,
      expiringRes,
      recentPayments,
      expiringMembers,
    ] = await Promise.all([
      sql`SELECT CAST(COUNT(*) AS INTEGER) as count FROM members WHERE status = 'active'`,
      sql`SELECT CAST(COUNT(*) AS INTEGER) as count FROM members`,
      sql`SELECT CAST(COUNT(*) AS INTEGER) as count FROM subscriptions WHERE status = 'active' AND end_date >= CURRENT_DATE`,
      sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed' AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)`,
      sql`SELECT CAST(COUNT(*) AS INTEGER) as count FROM subscriptions WHERE status = 'active' AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`,
      sql`
        SELECT p.id, p.amount, p.payment_date, p.payment_method, p.status,
               m.name as member_name, sp.name as plan_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN subscriptions s ON p.subscription_id = s.id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        ORDER BY p.created_at DESC LIMIT 10
      `,
      sql`
        SELECT m.name, m.phone, s.end_date, sp.name as plan_name
        FROM subscriptions s
        JOIN members m ON s.member_id = m.id
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.status = 'active' AND s.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        ORDER BY s.end_date ASC LIMIT 5
      `,
    ]);

    return NextResponse.json({
      totalMembers: Number(totalMembersRes[0]?.count ?? 0),
      allMembers: Number(allMembersRes[0]?.count ?? 0),
      activeSubscriptions: Number(activeSubsRes[0]?.count ?? 0),
      monthlyRevenue: parseFloat(String(revenueRes[0]?.total ?? 0)),
      expiringSoon: Number(expiringRes[0]?.count ?? 0),
      recentPayments,
      expiringMembers,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Dashboard error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
