'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User, BookOpen, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Props { showNav?: boolean; }

export default function AppShell({ showNav = true }: Props) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 border-b border-slate-border"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)' }}>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f0b429, #c9922a)', boxShadow: '0 0 12px rgba(240,180,41,0.4)' }}>
          <BookOpen size={14} className="text-ink" strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Aura <span className="text-gold">LMS</span>
        </span>
      </Link>

      {showNav && (
        <nav className="hidden md:flex items-center gap-1 ml-8">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-sm text-slate-text hover:text-white transition-colors hover:bg-slate-glass">
            Courses
          </Link>
          {isAuthenticated && (
            <Link href="/profile" className="px-3 py-1.5 rounded-lg text-sm text-slate-text hover:text-white transition-colors hover:bg-slate-glass">
              My Progress
            </Link>
          )}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link href="/profile"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-text hover:text-white transition-all hover:bg-slate-glass">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ background: 'linear-gradient(135deg, #f0b429, #c9922a)', color: '#0a0a0f' }}>
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <span className="hidden md:inline">{user?.email?.split('@')[0]}</span>
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-text hover:text-crimson transition-all hover:bg-slate-glass">
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="btn-ghost text-sm py-1.5 px-4">Sign in</Link>
            <Link href="/auth/register" className="btn-gold text-sm py-1.5 px-4">
              Get started <ChevronRight size={14} className="inline ml-0.5" />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
