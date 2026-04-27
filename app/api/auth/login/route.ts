export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const ADMIN_LOGIN = process.env.ADMIN_LOGIN || '123123*';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123123*';
const AUTH_TOKEN = 'fitpro_authenticated_v1';

export async function POST(request: Request) {
  try {
    const { login, password } = await request.json();

    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('fitpro_auth', AUTH_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 kun
        path: '/',
        sameSite: 'lax',
      });
      return response;
    }

    return NextResponse.json(
      { error: 'Login yoki parol noto\'g\'ri' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
