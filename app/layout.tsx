import type { Metadata } from 'next';
import './globals.css';
import ConditionalLayout from '@/components/ConditionalLayout';

export const metadata: Metadata = {
  title: 'FitPro - Fitnes Markazi Boshqaruvi',
  description: 'Fitnes markazi uchun obuna va to\'lovlarni boshqarish tizimi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="bg-sky-50 min-h-screen">
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
