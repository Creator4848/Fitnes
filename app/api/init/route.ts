import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        birth_date DATE,
        join_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration_days INTEGER NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES subscription_plans(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

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

    // Seed default subscription plans if none exist
    const plans = await sql`SELECT COUNT(*) as count FROM subscription_plans`;
    if (parseInt((plans[0] as { count: string }).count) === 0) {
      await sql`
        INSERT INTO subscription_plans (name, price, duration_days, description) VALUES
        ('Oylik - Asosiy', 150000, 30, 'Barcha asosiy trenajerlar'),
        ('Oylik - Premium', 250000, 30, 'Barcha trenajerlar + shaxsiy murabbiy'),
        ('3 Oylik', 400000, 90, '3 oylik chegirmali obuna'),
        ('Yillik', 1400000, 365, 'Yillik to''liq obuna')
      `;
    }

    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('DB init error:', error);
    return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 });
  }
}
