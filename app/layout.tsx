import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import DbInit from '@/components/DbInit';

export const metadata: Metadata = {
  title: 'FitPro - Fitnes Markazi Boshqaruvi',
  description: 'Fitnes markazi uchun obuna va to\'lovlarni boshqarish tizimi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="bg-sky-50 min-h-screen">
        <DbInit />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6 min-h-full">
              {children}
            </div>
          </main>
        </div>
        <ChatBot />
      </body>
    </html>
  );
}
