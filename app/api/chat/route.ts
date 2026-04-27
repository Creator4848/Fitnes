export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `Siz "FitPro" fitnes markazi boshqaruv tizimining AI yordamchisisiz. Siz faqat O'zbek tilida javob berasiz.

Siz quyidagi mavzularda yordam bera olasiz:
- Fitnes markazi obuna rejalari va narxlari haqida ma'lumot
- Mijozlarni ro'yxatga olish va boshqarish
- To'lovlar va moliyaviy hisobotlar
- Obuna muddatlari va eslatmalar
- Fitnes va sog'liqni saqlash bo'yicha umumiy maslahatlar
- Tizimdan foydalanish bo'yicha yordam

Tizimimizda mavjud bo'limlar:
1. Boshqaruv paneli (Dashboard) - umumiy statistika
2. A'zolar - mijozlarni boshqarish (qo'shish, tahrirlash, o'chirish)
3. Obunalar - obuna rejalari va tayinlash
4. To'lovlar - to'lovlarni kuzatish va boshqarish

Qisqa, aniq va foydali javoblar bering. Doimo samimiy va professional bo'ling.`;

// Supported models (fallback order)
const MODELS = [
  'llama-3.1-8b-instant',
  'llama3-8b-8192',
  'gemma2-9b-it',
];

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY sozlanmagan. Vercel → Settings → Environment Variables ga qo\'shing.' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await request.json();
    const groq = new Groq({ apiKey });

    let lastError: Error | null = null;

    for (const model of MODELS) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
          ],
          model,
          max_tokens: 1024,
          temperature: 0.7,
        });

        const responseMessage = completion.choices[0]?.message?.content || 'Kechirasiz, javob ololmadim.';
        return NextResponse.json({ message: responseMessage });
      } catch (err) {
        lastError = err as Error;
        console.error(`Model ${model} failed:`, err);
        continue;
      }
    }

    throw lastError;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Noma\'lum xatolik';
    console.error('Chat error:', msg);
    return NextResponse.json(
      { error: `AI xatolik: ${msg}` },
      { status: 500 }
    );
  }
}
