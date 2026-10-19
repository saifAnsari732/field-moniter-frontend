import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Lock,
  Mail,
  Building2,
  PhoneCall,
  Key,
  CheckCircle,
  X,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const { login, authError } = useAuth();
  const navigate = useNavigate();

  // Login Form State
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('web_remember_me') !== 'false';
  });

  // Load saved credentials on mount for auto-fill
  useEffect(() => {
    const savedEmail = localStorage.getItem('web_saved_login_email');
    const savedPassword = localStorage.getItem('web_saved_login_password');
    if (savedEmail || savedPassword) {
      setForm({
        email: savedEmail || '',
        password: savedPassword || '',
      });
    }
  }, []);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(null);

  // Detect password reset link from email URL (?email=...&otp=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlEmail = params.get('email');
    const urlOtp = params.get('otp') || params.get('resetToken');

    if (urlEmail) {
      setForgotEmail(urlEmail);
      if (urlOtp) {
        setOtpCode(urlOtp);
      }
      setForgotStep(2);
      setForgotMsg({
        type: 'success',
        text: `Reset link verified for ${urlEmail}. Enter your OTP code and new password.`,
      });
      setShowForgotModal(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res?.success) {
        if (rememberMe) {
          localStorage.setItem('web_saved_login_email', form.email);
          localStorage.setItem('web_saved_login_password', form.password);
          localStorage.setItem('web_remember_me', 'true');
        } else {
          localStorage.removeItem('web_saved_login_email');
          localStorage.removeItem('web_saved_login_password');
          localStorage.setItem('web_remember_me', 'false');
        }

        const userRole = res.role ? res.role.toUpperCase() : '';
        if (userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN') {
          navigate('/super-admin');
        } else {
          navigate('/admin');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request OTP via email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMsg({ type: 'error', text: 'Please enter your registered work email.' });
      return;
    }

    setForgotLoading(true);
    setForgotMsg(null);
    setOtpCode('');

    try {
      const res = await authAPI.forgotPassword(forgotEmail.trim());
      setForgotStep(2);
      setForgotMsg({
        type: 'success',
        text: res.data?.message || `Verification OTP sent to ${forgotEmail}. Please check your inbox.`,
      });
      toast.success('Reset code sent to your email!');
    } catch (err) {
      console.error('Request OTP error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP. Please check your email and try again.';
      setForgotMsg({ type: 'error', text: msg });
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setForgotMsg({ type: 'error', text: 'Please enter the verification OTP code.' });
      return;
    }
    if (newPassword.length < 6) {
      setForgotMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setForgotLoading(true);
    setForgotMsg(null);

    try {
      await authAPI.resetPassword({
        email: forgotEmail.trim(),
        otp: otpCode.trim(),
        newPassword: newPassword,
      });

      toast.success('Password updated successfully! Please sign in.');
      setForm({ email: forgotEmail.trim(), password: '' });
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Reset password error:', err);
      const msg = err.response?.data?.message || err.message || 'Password reset failed. Please check OTP and try again.';
      setForgotMsg({ type: 'error', text: msg });
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcf9f2] via-[#faf7f0] to-[#e4f6ec] text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header Navigation */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-20 py-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 text-slate-700 hover:text-slate-900 hover:bg-white text-xs font-bold transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
          <span>Back to Home</span>
        </Link>

        <a
          href="tel:9511450914"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/60 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Need help? Support:</span>
          <strong className="text-slate-800 font-bold">+91 9511450914</strong>
        </a>
      </header>

      {/* Main 2-Column Showcase & Login Container */}
      <main className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 py-4">
        
        {/* Left Side: Exact High-Res 3D Phone & Telemetry Graphic from Approved Showcase */}
        <div className="hidden lg:flex lg:col-span-6 items-center justify-center relative select-none">
          <div className="relative w-full max-w-[540px] flex items-center justify-center">
            <img
              src="/images/auth-phone-showcase-feathered.png"
              alt="KisanConnect 3D Telemetry Showcase"
              className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.08)] pointer-events-none select-none transition-transform duration-700 hover:scale-[1.02]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/auth-phone-showcase.png';
              }}
            />
          </div>
        </div>

        {/* Right Side: Exact Clean Luxury Auth Card */}
        <div className="lg:col-span-6 w-full max-w-[420px] mx-auto">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] p-8 sm:p-11 transition-all relative">
            
            {/* Top Brand Logo */}
            <div className="flex items-center justify-center mb-6">
              <img
                src="/images/superCompanyLOGO.png"
                alt="KisanConnect"
                className="h-10 sm:h-12 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/icon.jpg';
                }}
              />
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                Sign in to manage your field operations
              </p>
            </div>

            {/* Auth Error Banner */}
            {authError && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-10 py-3.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300 select-none">
                  @
                </span>
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                />
                <button
                  type="button"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition cursor-pointer"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500/20 focus:ring-2 cursor-pointer accent-emerald-600"
                  />
                  <span className="text-xs font-medium text-slate-500 hover:text-slate-700">
                    Remember & auto-fill
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(form.email || '');
                    setForgotStep(1);
                    setForgotMsg(null);
                    setOtpCode('');
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Glowing Radiant Emerald Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] active:scale-[0.99] text-white font-bold text-base shadow-[0_12px_28px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_14px_32px_-4px_rgba(16,185,129,0.6)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Quick Registration Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">
                New to KisanConnect?
              </p>
              <Link
                to="/register-organization"
                className="inline-block text-xs font-bold text-slate-700 hover:text-emerald-700 transition"
              >
                Register your organization in 2 minutes
              </Link>
            </div>
          </div>

          {/* Security Subtext */}
          <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Encrypted • Geofenced Telemetry</span>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-white shadow-2xl p-6 sm:p-8 space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {forgotStep === 1 ? 'Reset Your Password' : 'Verify Code & Set Password'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {forgotStep === 1
                    ? 'Enter your registered work email to receive a secure OTP code.'
                    : 'Enter the 6-digit verification code sent to your email to set a new password.'}
                </p>
              </div>
            </div>

            {/* Status Feedback Message */}
            {forgotMsg && (
              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs font-medium ${
                  forgotMsg.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                {forgotMsg.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <span>{forgotMsg.text}</span>
              </div>
            )}

            {/* STEP 1: Request OTP */}
            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {forgotLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: Verify OTP & Reset Password */
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Email: <strong className="text-slate-900 font-semibold">{forgotEmail}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotMsg(null);
                    }}
                    className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                      required
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono tracking-widest bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-bold transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={forgotLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend OTP</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {forgotLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Set New Password & Continue</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-slate-400 py-2">
        © {new Date().getFullYear()} KisanConnect Field Telemetry SaaS Platform. All rights reserved.
      </footer>
    </div>
  );
}
