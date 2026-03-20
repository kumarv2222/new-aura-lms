'use client';
import Link from 'next/link';
import { BookOpen, CreditCard, Landmark, Wallet, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080810] border-t border-white/5 pt-20 pb-10 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mb-16">

        {/* Brand */}
        <div className="flex flex-col gap-5 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f0b429] to-[#c9922a] shadow-[0_0_20px_rgba(240,180,41,0.3)] group-hover:scale-105 transition-transform">
              <BookOpen size={17} className="text-black" strokeWidth={2.5} />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-white">
              Aura <span className="text-[#f0b429]">LMS</span>
            </span>
          </Link>
          <p className="text-[#6b6f88] text-sm leading-relaxed max-w-xs">
            Curated expert-led courses, zero paywalls. Built for learners who take their craft seriously.
          </p>
          <div className="flex items-center gap-3 pt-1">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <button key={i} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[#6b6f88] hover:text-white hover:border-white/20 transition-all">
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* Learn */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6b6f88] mb-6">Learn</p>
          <nav className="flex flex-col gap-3.5">
            {[
              { label: 'All Courses', href: '/' },
              { label: 'Python', href: '/?category=Python' },
              { label: 'Web Development', href: '/?category=Web+Dev' },
              { label: 'Data Science', href: '/?category=Data+Science' },
              { label: 'AI & Machine Learning', href: '/?category=AI+%26+ML' },
              { label: 'DSA & Algorithms', href: '/?category=DSA' },
            ].map(l => (
              <Link key={l.label} href={l.href} className="text-sm text-[#6b6f88] hover:text-white transition-colors font-medium">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Platform */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6b6f88] mb-6">Platform</p>
          <nav className="flex flex-col gap-3.5">
            {[
              { label: 'About Aura LMS', href: '/about' },
              { label: 'Premium Plans', href: '/premium' },
              { label: 'My Dashboard', href: '/profile' },
              { label: 'Sign In', href: '/auth/login' },
              { label: 'Create Account', href: '/auth/register' },
            ].map(l => (
              <Link key={l.label} href={l.href} className="text-sm text-[#6b6f88] hover:text-white transition-colors font-medium">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Trust */}
        <div className="flex flex-col gap-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6b6f88]">Secure Payments</p>
          <div className="flex items-center gap-3">
            {[Landmark, CreditCard, Wallet].map((Icon, i) => (
              <div key={i} className="w-12 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[#6b6f88] hover:border-[#f0b429]/30 hover:text-[#f0b429] transition-all cursor-pointer">
                <Icon size={15} />
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[12px] font-bold text-white mb-1.5">100% Free Forever</p>
            <p className="text-[12px] text-[#6b6f88] leading-relaxed">
              All core courses are free. No credit card required to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[11px] text-[#6b6f88] font-medium">
          © 2026 Aura Learning Systems. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <span className="text-[11px] text-[#6b6f88] hover:text-white cursor-pointer transition-colors font-medium">Privacy Policy</span>
          <span className="text-[11px] text-[#6b6f88] hover:text-white cursor-pointer transition-colors font-medium">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
