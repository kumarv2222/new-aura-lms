'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, BookOpen, ChevronRight, Crown, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

interface Props { showNav?: boolean; }

export default function AppShell({ showNav = true }: Props) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = [
    { label: 'Courses', href: '/' },
    { label: 'AI Assistant', href: '/ai' },
    { label: 'Premium', href: '/premium' },
    { label: 'About', href: '/about' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 lg:px-10"
      style={{
        background: 'rgba(10,10,15,0.90)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group mr-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f0b429] to-[#c9922a] shadow-[0_0_20px_rgba(240,180,41,0.35)] group-hover:shadow-[0_0_30px_rgba(240,180,41,0.5)] transition-all">
          <BookOpen size={17} className="text-black" strokeWidth={2.5} />
        </div>
        <span className="font-serif text-xl font-bold tracking-tight text-white leading-none">
          Aura <span className="text-[#f0b429]">LMS</span>
        </span>
      </Link>

      {/* Desktop Nav */}
      {showNav && (
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200 ${
                  active ? 'text-[#f0b429]' : 'text-[#8b8fa8] hover:text-white'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#f0b429] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm text-[#8b8fa8] hover:text-white transition-all hover:bg-white/5 border border-transparent hover:border-white/8"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: 'linear-gradient(135deg, #f0b429, #c9922a)', color: '#0a0a0f' }}
              >
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <span className="hidden md:inline font-semibold">{user?.email?.split('@')[0]}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#8b8fa8] hover:text-white transition-all hover:bg-white/5"
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="hidden sm:block px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-[#8b8fa8] hover:text-white transition-all hover:bg-white/5">
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              style={{
                background: 'linear-gradient(135deg, #f0b429, #c9922a)',
                color: '#0a0a0f',
                boxShadow: '0 0 20px rgba(240,180,41,0.25)',
              }}
            >
              Get Started <ChevronRight size={13} />
            </Link>
          </>
        )}

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden ml-2 text-[#8b8fa8] hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav Sheet */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 z-40 flex flex-col pt-6 px-6 gap-2"
          style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(24px)' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-[#8b8fa8] hover:text-white hover:bg-white/5 transition-all"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-white/5 my-2" />
          {isAuthenticated ? (
            <>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-[#f0b429] hover:bg-white/5 transition-all">
                My Dashboard
              </Link>
              <button onClick={handleLogout} className="px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-left text-[#8b8fa8] hover:text-white hover:bg-white/5 transition-all">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-[#8b8fa8] hover:text-white hover:bg-white/5 transition-all">Sign In</Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest text-center text-black" style={{ background: 'linear-gradient(135deg, #f0b429, #c9922a)' }}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
