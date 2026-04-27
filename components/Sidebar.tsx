'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BadgeCheck,
  Dumbbell,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Boshqaruv', icon: LayoutDashboard },
  { href: '/members', label: 'A\'zolar', icon: Users },
  { href: '/subscriptions', label: 'Obunalar', icon: BadgeCheck },
  { href: '/payments', label: 'To\'lovlar', icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-sky-600 text-white p-2 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-sky-100 z-40 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:h-screen
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sky-100">
          <div className="bg-sky-600 text-white p-2 rounded-xl">
            <Dumbbell size={22} />
          </div>
          <div>
            <h1 className="font-bold text-sky-900 text-lg leading-tight">FitPro</h1>
            <p className="text-xs text-sky-400">Boshqaruv tizimi</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-200'
                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-sky-100">
          <div className="bg-sky-50 rounded-xl p-3 text-center">
            <p className="text-xs text-sky-600 font-medium">FitPro v1.0</p>
            <p className="text-xs text-sky-400 mt-0.5">Fitnes markazi boshqaruvi</p>
          </div>
        </div>
      </aside>
    </>
  );
}
