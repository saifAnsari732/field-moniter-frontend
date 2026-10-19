import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  PhoneCall,
  MapPin,
  Compass,
  Check,
  Radio,
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Field Services',
    designation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Registration submitted! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'Field Services',
    'Sales',
    'Operations',
    'Logistics',
    'Marketing',
    'Support',
    'Agriculture',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbf8f2] via-[#fafbfc] to-[#e6faf0] text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* Soft Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-[#fef3c7]/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[650px] h-[650px] bg-[#a7f3d0]/30 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-teal-100/20 rounded-full blur-[130px]" />
      </div>

      {/* Top Header Navigation */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-20 py-1">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/70 text-slate-700 hover:text-slate-900 hover:bg-white text-xs font-bold transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
          <span>Back to Home</span>
        </Link>

        <a
          href="tel:9511450914"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/70 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Need help? Support:</span>
          <strong className="text-slate-800 font-bold">+91 9511450914</strong>
        </a>
      </header>

      {/* Main Showcase & Auth Container */}
      <main className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center z-10 py-6">
        
        {/* Left Side: 3D Floating Smartphone & Telemetry Showcase */}
        <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center relative select-none">
          
          <div className="absolute w-72 h-96 bg-emerald-300/25 rounded-full blur-3xl -z-10" />

          {/* 3D Phone Mockup */}
          <div className="relative w-[300px] xl:w-[320px] transition-transform duration-500 hover:scale-[1.02]">
            <div className="rounded-[3rem] p-2.5 bg-gradient-to-b from-[#f2ece1] via-[#e5ded0] to-[#cdc3b1] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2),0_10px_20px_-10px_rgba(0,0,0,0.1)] border border-white/60">
              <div className="rounded-[2.6rem] bg-slate-950 p-2 overflow-hidden relative shadow-inner">
                
                {/* Dynamic Island Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-end pr-2 gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                </div>

                {/* Status Bar */}
                <div className="relative z-20 flex items-center justify-between px-6 pt-2 text-[10px] text-white font-semibold">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span>5G</span>
                    <div className="w-4 h-2 border border-white rounded-xs p-0.5">
                      <div className="w-full h-full bg-white rounded-xs" />
                    </div>
                  </div>
                </div>

                {/* Satellite Field Screen */}
                <div className="relative h-[480px] rounded-[2rem] overflow-hidden bg-gradient-to-b from-[#2d4a22] via-[#3a5d2b] to-[#203617] mt-1 shadow-inner">
                  <div
                    className="absolute inset-0 opacity-80 mix-blend-overlay"
                    style={{
                      backgroundImage: `radial-gradient(circle at 40% 30%, rgba(134, 239, 172, 0.4) 0%, transparent 60%),
                                        linear-gradient(45deg, #1f3915 25%, transparent 25%),
                                        linear-gradient(-45deg, #2b4c1f 25%, transparent 25%),
                                        linear-gradient(45deg, transparent 75%, #1b3313 75%),
                                        linear-gradient(-45deg, transparent 75%, #25441b 75%)`,
                      backgroundSize: '100% 100%, 40px 40px, 40px 40px, 40px 40px, 40px 40px'
                    }}
                  />

                  {/* SVG Live GPS Tracking Route */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 480">
                    <defs>
                      <linearGradient id="userRouteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#6ee7b7" />
                      </linearGradient>
                      <filter id="userNeonBlur" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    <path
                      d="M 60 160 L 150 140 L 120 220 L 220 260 L 150 350 L 190 410"
                      fill="none"
                      stroke="url(#userRouteGlow)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#userNeonBlur)"
                      className="animate-pulse"
                    />

                    <path
                      d="M 60 160 L 150 140 L 120 220 L 220 260 L 150 350 L 190 410"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                    />
                  </svg>

                  {/* Pulse Pins */}
                  <div className="absolute top-[130px] left-[140px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-400/30 animate-ping absolute" />
                    <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>

                  <div className="absolute top-[250px] left-[210px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-400/30 animate-ping absolute" />
                    <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
                      <MapPin className="w-3.5 h-3.5 fill-white" />
                    </div>
                  </div>

                  <div className="absolute top-[340px] left-[140px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-400/40 animate-ping absolute" />
                    <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
                      <Compass className="w-4 h-4 text-white animate-spin-slow" />
                    </div>
                  </div>

                  {/* In-Phone Bottom Bar */}
                  <div className="absolute bottom-3 inset-x-3 bg-slate-900/80 backdrop-blur-md rounded-2xl py-2 px-4 flex items-center justify-between text-white text-[11px] border border-white/10">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span>Live Telemetry</span>
                    </div>
                    <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                      1.2s Sync
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Widgets */}
            <div className="absolute -top-3 -left-12 bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl p-2.5 px-3.5 shadow-xl shadow-slate-300/40 flex items-center gap-2.5 z-40">
              <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-[10px] font-black">
                FE
              </div>
              <div className="text-left">
                <p className="text-[11px] font-extrabold text-slate-900 leading-tight">Field Executive</p>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready to Sync</span>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -right-14 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl p-3 px-4 shadow-xl shadow-slate-300/50 flex items-center gap-3 z-40">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <Compass className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
                <p className="text-sm font-black text-slate-900 leading-tight">Geofence Verified</p>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-10 bg-white/95 backdrop-blur-md border border-white/90 rounded-2xl p-3 px-4 shadow-xl shadow-slate-300/50 flex items-center gap-3 z-40">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Automated</p>
                <p className="text-xs font-black text-emerald-700 leading-tight">Mileage Reclaim</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Luxury Register Card */}
        <div className="lg:col-span-7 w-full max-w-lg mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.2rem] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] p-8 sm:p-10 transition-all relative">
            
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <img
                src="/images/superCompanyLOGO.png"
                alt="KisanConnect"
                className="h-10 sm:h-11 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/icon.jpg';
                }}
              />
            </div>

            {/* Heading */}
            <div className="text-center mb-7">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Create Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
                Join your organization's field operations & telemetry team
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={set('name')}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Work Email *"
                    value={form.email}
                    onChange={set('email')}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={set('phone')}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                  />
                </div>
              </div>

              {/* Department & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={form.department}
                    onChange={set('department')}
                    className="w-full pl-11 pr-8 py-3 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 font-medium transition shadow-2xs cursor-pointer appearance-none"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Designation"
                    value={form.designation}
                    onChange={set('designation')}
                    className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
                  />
                </div>
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
                  value={form.password}
                  onChange={set('password')}
                  className="w-full pl-11 pr-11 py-3 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium transition shadow-2xs"
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

              {/* Glowing Emerald Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.99] text-white font-bold text-sm shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_28px_-4px_rgba(16,185,129,0.5)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Switch Link */}
            <div className="mt-7 pt-5 border-t border-slate-100 text-center space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                Already registered with your company?
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline transition"
              >
                <span>Sign In to Existing Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Security Subtext */}
          <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Session • Geofenced Telemetry Protection</span>
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
