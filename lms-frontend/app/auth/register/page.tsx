'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import Alert from '../../../components/common/Alert';
import Spinner from '../../../components/common/Spinner';

const perks = ['Track your progress', 'Resume where you left off', 'Unlock sequential learning'];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, name);
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Try a different email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#0a0a0f' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, rgba(0,201,167,0.3) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 bg-grid-pattern" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f0b429, #c9922a)', boxShadow: '0 0 20px rgba(240,180,41,0.4)' }}>
              <BookOpen size={18} className="text-ink" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl font-semibold text-white">Aura <span className="text-gold">LMS</span></span>
          </Link>
          <h1 className="section-heading text-3xl text-white mb-2">Start learning today</h1>
          <p className="text-sm text-slate-text">Free forever. No credit card required.</p>
        </div>

        {/* Perks */}
        <div className="flex flex-col gap-2 mb-6">
          {perks.map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm text-slate-text">
              <CheckCircle2 size={14} className="text-jade shrink-0" />
              {p}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          {error && <div className="mb-5"><Alert variant="error" message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-text mb-2 uppercase tracking-wider">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-text pointer-events-none" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10" placeholder="John Doe" required minLength={2} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-text mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-text pointer-events-none" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-text mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-text pointer-events-none" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10" placeholder="Min. 8 characters" required minLength={8} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-text hover:text-white transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-2">
              {isLoading ? <Spinner size={16} /> : <>Create account <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-text mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-gold hover:text-gold-glow transition-colors font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
