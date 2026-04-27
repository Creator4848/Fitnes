'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import ChatBot from './ChatBot';
import DbInit from './DbInit';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login sahifasida sidebar/chatbot ko'rsatilmaydi
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <>
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
    </>
  );
}
