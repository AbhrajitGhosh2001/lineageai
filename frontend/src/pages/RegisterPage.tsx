import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { register } from '../lib/auth';
import { tw } from '../lib/theme';
import SEO from '../components/SEO';
import type { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

export default function RegisterPage({ onLogin }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', clinicName: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDataUse, setAgreedToDataUse] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }
    if (!agreedToDataUse) {
      setError('You must acknowledge how patient data will be handled to use this platform.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    
    setLoading(true);
    try {
      const { token, user } = await register(form);
      localStorage.setItem('token', token);
      onLogin(user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/google`;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <SEO title="Start Free Pilot — Lineage AI" noIndex />
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-slate-100">Lineage AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Start your free pilot</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">$99/clinic for the first 3 months</p>
        </div>

        <div className={`${tw.card} p-8`}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-6 border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors mb-5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-800 px-2 text-gray-400 dark:text-slate-500">or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={tw.label}>Full name</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required
                placeholder="Dr. Jane Smith" className={tw.input} />
            </div>
            <div>
              <label className={tw.label}>Work email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required
                placeholder="you@clinic.com" className={tw.input} />
            </div>
            <div>
              <label className={tw.label}>Clinic / Practice name</label>
              <input type="text" value={form.clinicName} onChange={(e) => update('clinicName', e.target.value)}
                placeholder="City Genetics Center" className={tw.input} />
            </div>
            <div>
              <label className={tw.label}>Password</label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required
                placeholder="Min. 8 characters" className={tw.input} />
            </div>

            {/* HIPAA/GINA Compliant Consent Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                  I have read and agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                    Privacy Policy
                  </Link>
                  , including the Notice of Privacy Practices as required under HIPAA.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToDataUse}
                  onChange={(e) => setAgreedToDataUse(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                  I understand that patient genetic data entered into Lineage AI will be handled in accordance with the{' '}
                  <Link to="/privacy" target="_blank" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  and used solely for cascade testing coordination purposes, in compliance with GINA regulations.
                </span>
              </label>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                By creating an account, you confirm you are authorized to access patient health information and will comply with HIPAA, GINA, and applicable state privacy laws.
              </p>
            </div>

            <button type="submit" disabled={loading || !agreedToTerms || !agreedToDataUse} className={`w-full ${tw.btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400 dark:text-slate-500">
          <Link to="/terms" className="hover:text-gray-600 dark:hover:text-slate-300">Terms of Service</Link>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="hover:text-gray-600 dark:hover:text-slate-300">Privacy Policy</Link>
        </div>
      </motion.div>
    </div>
  );
}
