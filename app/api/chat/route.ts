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

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY sozlanmagan. Vercel muhit o\'zgaruvchilarini tekshiring.' },
        { status: 500 }
      );
    }

    // Lazy init — handler ichida yaratiladi, build vaqtida emas
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      model: 'llama3-8b-8192',
      max_tokens: 1024,
      temperature: 0.7,
    });

    const responseMessage = completion.choices[0]?.message?.content || 'Kechirasiz, javob ololmadim.';

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'AI xizmati bilan bog\'lanishda xatolik yuz berdi.' },
      { status: 500 }
    );
  }
}
