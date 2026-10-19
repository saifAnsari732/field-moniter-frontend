import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterOrganization() {
  const { registerOrganization, authError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organizationName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    plan: 'pro',
    billingCycle: 'monthly',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.organizationName.trim() || !formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerOrganization({
        organizationName: formData.organizationName.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        plan: formData.plan,
        billingCycle: formData.billingCycle,
      });

      if (res?.success) {
        toast.success('Organization created successfully! Redirecting...');
        navigate('/admin');
      } else {
        toast.error(res?.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration error');
    } finally {
      setLoading(false);
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

      {/* Main 2-Column Showcase & Register Container */}
      <main className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 py-4">
        
        {/* Left Side: Exact High-Res 3D Phone & Telemetry Graphic from Approved Showcase */}
        <div className="hidden lg:flex lg:col-span-5 items-center justify-center relative select-none">
          <div className="relative w-full max-w-[500px] flex items-center justify-center">
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

        {/* Right Side: Exact Clean Luxury Register Card */}
        <div className="lg:col-span-7 w-full max-w-lg mx-auto">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] p-8 sm:p-10 transition-all relative">
            
            {/* Logo */}
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
            <div className="text-center mb-7">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Create Organization
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                Set up your company workspace to manage your field team
              </p>
            </div>

            {/* Auth Error Banner */}
            {authError && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Organization Name */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Organization / Company Name *"
                  value={formData.organizationName}
                  onChange={(e) => handleChange('organizationName', e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                />
              </div>

              {/* Admin Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Admin Full Name *"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Work Email Address *"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300 select-none">
                  @
                </span>
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Password (minimum 6 characters) *"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Glowing Radiant Emerald Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] active:scale-[0.99] text-white font-bold text-base shadow-[0_12px_28px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_14px_32px_-4px_rgba(16,185,129,0.6)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Organization Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Switch Link */}
            <div className="mt-7 pt-5 border-t border-slate-100 text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">
                Already registered?
              </p>
              <Link
                to="/login"
                className="inline-block text-xs font-bold text-slate-700 hover:text-emerald-700 transition"
              >
                Sign In to Existing Account
              </Link>
            </div>
          </div>

          {/* Security Subtext */}
          <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-Tenant Geofence Security • Encrypted Workspace</span>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-xs text-slate-400 py-2">
        © {new Date().getFullYear()} KisanConnect Field Telemetry SaaS Platform. All rights reserved.
      </footer>
    </div>
  );
}
