'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { TrendingUp, LogOut, BarChart3, PlusCircle, History, Home } from 'lucide-react';

export function Navigation() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-slate-800/50 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg">Trading Journal</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { path: '/dashboard', label: 'Dashboard', icon: Home },
              { path: '/dashboard/new-trade', label: 'New Trade', icon: PlusCircle },
              { path: '/dashboard/history', label: 'History', icon: History },
              { path: '/dashboard/performance', label: 'Performance', icon: BarChart3 },
            ].map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                  isActive(path)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-1 pb-3 overflow-x-auto">
          {[
            { path: '/dashboard', label: 'Dashboard', icon: Home },
            { path: '/dashboard/new-trade', label: 'New', icon: PlusCircle },
            { path: '/dashboard/history', label: 'History', icon: History },
            { path: '/dashboard/performance', label: 'Stats', icon: BarChart3 },
          ].map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 whitespace-nowrap text-sm transition ${
                isActive(path)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
