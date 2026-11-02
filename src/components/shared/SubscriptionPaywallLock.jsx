import React from 'react';
import {
  ShieldAlert,
  CreditCard,
  Lock,
  Compass,
  CalendarCheck,
  Briefcase,
  FileText,
  PhoneCall,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export default function SubscriptionPaywallLock({
  organization,
  user,
  onRenew,
  onSupport,
}) {
  const userRole = (user?.role || '').toUpperCase();
  const isOrgAdmin = ['ORG_ADMIN', 'ADMIN', 'HR'].includes(userRole);
  const orgName = organization?.name || user?.organizationName || 'Organization';
  const planName = organization?.plan?.planName || 'Standard Business Plan';
  const expiresAt = organization?.plan?.expiresAt ? new Date(organization.plan.expiresAt) : null;

  // Mathematical expiry calculations
  const now = new Date();
  const isExpired = expiresAt ? expiresAt < now : true;
  const daysDiff = expiresAt ? Math.abs(Math.floor((now - expiresAt) / (1000 * 60 * 60 * 24))) : 0;

  const formattedExpiry = expiresAt
    ? expiresAt.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  const lockedFeatures = [
    {
      icon: Compass,
      title: 'Real-Time GPS Tracking & Live Map',
      desc: 'Live telemetry, movement replay & battery health tracking are paused.',
    },
    {
      icon: CalendarCheck,
      title: 'Daily Attendance & Punch Logs',
      desc: 'Punch in/out, geofence audit & automated working hour calculations are locked.',
    },
    {
      icon: Briefcase,
      title: 'Client Visits, Meetings & Field Leads',
      desc: 'Logging client verification, check-ins, and field lead capture are restricted.',
    },
    {
      icon: Receipt,
      title: 'Travel Allowance (TA) & Expense Claims',
      desc: 'Distance disbursement calculations, DA claims & bill approvals are halted.',
    },
    {
      icon: FileText,
      title: 'Executive Reports & PDF / Excel Exports',
      desc: 'Audit reports, date-range timeline generation & printable exports are disabled.',
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 antialiased">
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-rose-200/80 shadow-2xl shadow-rose-950/5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Glow Bar */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-12 top-6 opacity-15 pointer-events-none">
            <Lock className="w-32 h-32" />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider border border-white/25">
                <span className="w-2 h-2 rounded-full bg-rose-200 animate-ping" />
                Access Suspended
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/25 text-rose-100 text-[11px] font-bold">
                {planName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Subscription Plan Expired
            </h1>

            <p className="text-sm text-rose-100 max-w-xl font-medium leading-relaxed">
              The subscription for <strong className="text-white underline decoration-rose-300">{orgName}</strong> ended on{' '}
              <span className="font-bold text-white">{formattedExpiry}</span> ({daysDiff === 0 ? 'today' : `${daysDiff} day(s) ago`}). Operations have been paused until the plan is renewed.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Mathematical Health Meter & Status Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Subscription Health Index
                </span>
                <span className="text-sm font-extrabold text-slate-800">
                  0% Capacity Available • Immediate Action Required
                </span>
              </div>
            </div>

            {isOrgAdmin && (
              <button
                type="button"
                onClick={onRenew}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/30 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Renew Plan Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Locked Features Grid */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              Features Temporarily Restricted Under Expired State
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lockedFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-200 hover:bg-rose-50/20 transition-all flex items-start gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-rose-100 text-slate-500 group-hover:text-rose-600 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 truncate">
                          {feat.title}
                        </span>
                        <Lock className="w-3 h-3 text-rose-400 flex-shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5 line-clamp-2">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role-Specific Action Banner */}
          {isOrgAdmin ? (
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Sparkles className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>Instant activation: All tracking and attendance data resume immediately upon payment.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onSupport}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Support Desk
                </button>

                <button
                  type="button"
                  onClick={onRenew}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-600/25 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  Go to Billing
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 font-medium space-y-1">
                <p className="font-extrabold text-amber-950">
                  Notice for Field Executives & Managers:
                </p>
                <p>
                  Your organization's subscription is currently expired. Please contact your Organization Admin ({organization?.email || 'Admin'}) or management team to renew the plan in Billing.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href="tel:9511450914"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 underline hover:text-amber-950"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Helpline: 9511450914
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
