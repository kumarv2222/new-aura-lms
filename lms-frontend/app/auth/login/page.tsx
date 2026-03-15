'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, BookOpen, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import Alert from '../../../components/common/Alert';
import Spinner from '../../../components/common/Spinner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#0a0a0f' }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, rgba(240,180,41,0.4) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 bg-grid-pattern" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f0b429, #c9922a)', boxShadow: '0 0 20px rgba(240,180,41,0.4)' }}>
              <BookOpen size={18} className="text-ink" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl font-semibold text-white">Aura <span className="text-gold">LMS</span></span>
          </Link>
          <h1 className="section-heading text-3xl text-white mb-2">Welcome back</h1>
          <p className="text-sm text-slate-text">Sign in to continue your learning journey</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          {error && <div className="mb-5"><Alert variant="error" message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-text mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-text pointer-events-none" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-text mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-text pointer-events-none" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-text hover:text-white transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-2">
              {isLoading ? <Spinner size={16} /> : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-text mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-gold hover:text-gold-glow transition-colors font-medium">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
