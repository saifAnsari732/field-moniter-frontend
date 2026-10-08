import React, { useState, useEffect } from 'react';
import KisanConnectLayout from '../../components/layout/KisanConnectLayout';
import {
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Activity,
  Layers,
  CreditCard,
  DollarSign,
  Calendar,
  Settings,
  RefreshCw,
  FileText,
  Lock,
  Zap,
  Check,
  PhoneCall,
  ExternalLink,
  Sliders,
  ShieldAlert,
  ArrowUpRight,
  Eye,
  UserCheck,
  Compass,
  X,
  Sparkles,
  ChevronRight,
  Download,
} from 'lucide-react';
import { API } from '../../services/api.service';
import toast from 'react-hot-toast';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'organizations' | 'payments' | 'plans' | 'settings'

  const [stats, setStats] = useState({
    totalOrgs: 0,
    activeOrgs: 0,
    trialOrgs: 0,
    suspendedOrgs: 0,
    totalUsers: 0,
    totalEmployees: 0,
    totalManagers: 0,
    totalDistanceTracked: 0,
    totalRevenue: 0,
    paidTransactionsCount: 0,
  });

  const [organizations, setOrganizations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({
    totalRevenue: 0,
    paidCount: 0,
    failedCount: 0,
    createdCount: 0,
    avgOrderValue: 0,
  });

  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Form data for creating organization
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    planName: 'Growth Pro Plan',
    maxEmployees: 50,
    maxManagers: 10,
  });

  // Form data for updating subscription
  const [subData, setSubData] = useState({
    planName: 'Growth Pro Plan',
    maxEmployees: 50,
    maxManagers: 10,
    addDays: 30,
  });

  const fetchSuperAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, orgsRes, paymentsRes] = await Promise.all([
        API.get('/superadmin/stats').catch(() => ({ data: { success: false } })),
        API.get('/superadmin/organizations').catch(() => ({ data: { success: false } })),
        API.get('/superadmin/payments').catch(() => ({ data: { success: false } })),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (orgsRes.data?.success && Array.isArray(orgsRes.data.data)) setOrganizations(orgsRes.data.data);
      if (paymentsRes.data?.success) {
        setPayments(paymentsRes.data.payments || []);
        if (paymentsRes.data.summary) setPaymentSummary(paymentsRes.data.summary);
      }
    } catch (error) {
      console.error('Error fetching SuperAdmin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/superadmin/organizations', formData);
      if (res.data?.success) {
        toast.success(`🎉 Organization "${formData.name}" onboarded successfully!`);
        setShowCreateModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          adminName: '',
          adminEmail: '',
          adminPassword: '',
          planName: 'Growth Pro Plan',
          maxEmployees: 50,
          maxManagers: 10,
        });
        fetchSuperAdminData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleStatusChange = async (orgId, status) => {
    try {
      await API.patch(`/superadmin/organizations/${orgId}/status`, { status });
      toast.success(`Organization status updated to ${status.toUpperCase()}`);
      fetchSuperAdminData();
    } catch (error) {
      toast.error('Failed to update organization status');
    }
  };

  const handleOpenSubscriptionModal = (org) => {
    setSelectedOrg(org);
    setSubData({
      planName: org.plan?.planName || 'Growth Pro Plan',
      maxEmployees: org.plan?.maxEmployees || 50,
      maxManagers: org.plan?.maxManagers || 10,
      addDays: 30,
    });
    setShowSubscriptionModal(true);
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;
    try {
      const res = await API.patch(`/superadmin/organizations/${selectedOrg._id}/subscription`, subData);
      if (res.data?.success) {
        toast.success(`Subscription updated for ${selectedOrg.name}!`);
        setShowSubscriptionModal(false);
        fetchSuperAdminData();
      }
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter((pay) => {
    const orgName = pay.organization?.name || pay.notes?.companyName || '';
    const email = pay.organization?.email || pay.notes?.userEmail || '';
    const matchesSearch =
      orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.razorpayOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = paymentStatusFilter === 'all' || pay.status === paymentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <KisanConnectLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
        
        {/* ========================================================================= */}
        {/* 1. HERO HEADER WITH ACTIONS & BRANDING                                    */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50/50 via-blue-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Super Admin Master Console
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 font-medium">
                  Multi-Tenant Platform Control
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Platform & Razorpay Payment Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
                Manage multi-tenant customer organizations, live Razorpay transaction ledger, subscription pricing plans, and seat quotas.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={fetchSuperAdminData}
                disabled={loading}
                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl border border-slate-200 transition cursor-pointer flex items-center justify-center active:scale-95 shadow-2xs disabled:opacity-60"
                title="Refresh Platform Analytics"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Organization</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation Tabs Bar */}
          <div className="pt-5 border-t border-slate-100 flex items-center gap-2.5 overflow-x-auto scrollbar-none relative z-10 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border border-blue-400/40 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-700 border border-slate-200/90 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  activeTab === 'overview' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}
              >
                <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Platform Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('organizations')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                activeTab === 'organizations'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border border-blue-400/40 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-purple-700 border border-slate-200/90 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  activeTab === 'organizations'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-50 text-purple-600 border border-purple-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Customer Organizations</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold font-mono ${
                  activeTab === 'organizations'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-100 text-purple-800 border border-purple-200/60'
                }`}
              >
                {organizations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                activeTab === 'payments'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border border-blue-400/40 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 border border-slate-200/90 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  activeTab === 'payments'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Razorpay Payment Ledger</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                activeTab === 'plans'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 border border-blue-400/40 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-amber-700 border border-slate-200/90 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  activeTab === 'plans' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}
              >
                <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>SaaS Pricing Plans</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCREEN 1: OVERVIEW DASHBOARD                                              */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 5 KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Card 1: Total Revenue */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  ₹{(stats.totalRevenue || paymentSummary.totalRevenue || 0).toLocaleString('en-IN')}
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                  {stats.paidTransactionsCount || paymentSummary.paidCount} Verified Payments
                </span>
              </div>

              {/* Card 2: Total Organizations */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Organizations</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {stats.totalOrgs || organizations.length}
                </h3>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">
                  {stats.activeOrgs} Active Customers
                </span>
              </div>

              {/* Card 3: Field Employees */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Field Employees</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {stats.totalEmployees || 0}
                </h3>
                <span className="text-[11px] font-medium text-slate-500 block">Across all active orgs</span>
              </div>

              {/* Card 4: Total Managers */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Managers</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {stats.totalManagers || 0}
                </h3>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 inline-block">
                  Team Leaders
                </span>
              </div>

              {/* Card 5: Tracked Distance */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tracked Distance</span>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100">
                    <Compass className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {stats.totalDistanceTracked ? stats.totalDistanceTracked.toLocaleString('en-IN') : '0'} <span className="text-xs text-slate-400 font-normal">km</span>
                </h3>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 inline-block">
                  GPS Telemetry
                </span>
              </div>
            </div>

            {/* Split Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Recent Customer Organizations */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Customer Organizations</h2>
                    <p className="text-xs text-slate-500 font-medium">Newly onboarded SaaS tenants & subscriptions</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('organizations')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    View All <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {organizations.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <Building2 className="w-8 h-8 mx-auto opacity-30 mb-2" />
                      <p className="font-bold text-xs text-slate-600">No Organizations Onboarded</p>
                    </div>
                  ) : (
                    organizations.slice(0, 5).map((org) => (
                      <div key={org._id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-sm transition flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs shrink-0">
                            {org.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{org.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate font-medium">{org.email} • {org.phone}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {org.plan?.planName || 'Growth Pro'}
                          </span>
                          <div className="text-[11px] font-mono font-bold text-emerald-700 mt-1">
                            Paid: ₹{(org.totalRevenuePaid || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Live Razorpay Activity Stream */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Live Razorpay Activity</h2>
                    <p className="text-xs text-slate-500 font-medium">Real-time payment transactions</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    View Ledger <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <CreditCard className="w-8 h-8 mx-auto opacity-30 mb-2" />
                      <p className="font-bold text-xs text-slate-600">No Razorpay Transactions Yet</p>
                      <p className="text-[11px] mt-0.5">Live payments will appear here in real-time.</p>
                    </div>
                  ) : (
                    payments.slice(0, 5).map((pay) => (
                      <div key={pay._id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {pay.organization?.name || pay.notes?.userName || pay.notes?.userEmail || 'Subscription Order'}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 block truncate">{pay.razorpayOrderId}</span>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-extrabold text-emerald-700 font-mono">₹{pay.amount.toLocaleString('en-IN')}</div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                            pay.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {pay.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: ORGANIZATIONS MANAGEMENT                                       */}
        {/* ========================================================================= */}
        {activeTab === 'organizations' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Customer Organizations Directory</h2>
                <p className="text-xs text-slate-500 font-medium">Manage tenant subscriptions, seat limits, status, and renewals</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search org name, email, slug..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="py-3.5 px-5">Organization Details</th>
                    <th className="py-3.5 px-5">Subscription Plan</th>
                    <th className="py-3.5 px-5">Active User Quota</th>
                    <th className="py-3.5 px-5">Total Paid Revenue</th>
                    <th className="py-3.5 px-5">Plan Expiry Date</th>
                    <th className="py-3.5 px-5">Tenant Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredOrgs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400 font-normal">
                        No customer organizations found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrgs.map((org) => (
                      <tr key={org._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-5 text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs shrink-0">
                              {org.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{org.name}</h4>
                              <p className="text-[11px] text-slate-500 truncate font-medium">{org.email} • {org.phone}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {org.plan?.planName || 'Growth Pro'}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                            Max Seats: {org.plan?.maxEmployees || 50} Employees
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="text-slate-900 font-bold font-mono text-xs">
                            {org.currentEmployeeCount || 0} / {org.plan?.maxEmployees || 50} <span className="font-normal text-slate-400">Emps</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            Managers: {org.currentManagerCount || 0}
                          </div>
                        </td>

                        <td className="py-4 px-5 font-mono font-extrabold text-emerald-700 text-sm">
                          ₹{(org.totalRevenuePaid || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-4 px-5 text-xs text-slate-600 font-medium">
                          {org.plan?.expiresAt ? new Date(org.plan.expiresAt).toLocaleDateString('en-IN') : 'Lifetime / Active'}
                        </td>

                        <td className="py-4 px-5">
                          {org.status === 'active' ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Suspended
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenSubscriptionModal(org)}
                              className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer border border-blue-200/60"
                            >
                              Edit Plan
                            </button>

                            {org.status === 'active' ? (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(org._id, 'suspended')}
                                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition cursor-pointer border border-rose-200/60"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(org._id, 'active')}
                                className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition cursor-pointer border border-emerald-200/60"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: PAYMENTS & RAZORPAY LEDGER                                       */}
        {/* ========================================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Razorpay Ledger Summary Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                <h4 className="text-2xl font-extrabold text-emerald-700 font-mono">₹{paymentSummary.totalRevenue.toLocaleString('en-IN')}</h4>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Successful Payments</span>
                <h4 className="text-2xl font-extrabold text-slate-900 font-mono">{paymentSummary.paidCount}</h4>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Failed Attempts</span>
                <h4 className="text-2xl font-extrabold text-rose-600 font-mono">{paymentSummary.failedCount}</h4>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Order Value</span>
                <h4 className="text-2xl font-extrabold text-blue-700 font-mono">₹{paymentSummary.avgOrderValue.toLocaleString('en-IN')}</h4>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Razorpay Live Transaction Ledger</h2>
                  <p className="text-xs text-slate-500 font-medium">Every Razorpay payment processed for customer subscriptions</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search order ID, payment ID, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>

                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="all">All Payment Status</option>
                    <option value="paid">Paid</option>
                    <option value="created">Created</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="py-3.5 px-5">Razorpay Order & Payment ID</th>
                      <th className="py-3.5 px-5">Customer Organization</th>
                      <th className="py-3.5 px-5">Plan & Billing Cycle</th>
                      <th className="py-3.5 px-5">Amount Paid</th>
                      <th className="py-3.5 px-5">Transaction Date</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Receipt Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-slate-400 font-normal">
                          No transaction records found.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((pay) => (
                        <tr key={pay._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-5 font-mono text-xs">
                            <div className="text-slate-900 font-bold">{pay.razorpayOrderId}</div>
                            <div className="text-slate-400 text-[11px]">{pay.razorpayPaymentId || 'N/A'}</div>
                          </td>

                          <td className="py-4 px-5">
                            <div className="text-slate-900 font-bold">
                              {pay.organization?.name || pay.notes?.companyName || 'SaaS Customer'}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {pay.organization?.email || pay.notes?.userEmail || ''}
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <span className="uppercase text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {pay.plan} ({pay.billingCycle || 'monthly'})
                            </span>
                          </td>

                          <td className="py-4 px-5 font-mono font-extrabold text-emerald-700 text-sm">
                            ₹{pay.amount.toLocaleString('en-IN')}
                          </td>

                          <td className="py-4 px-5 text-xs text-slate-500 font-medium">
                            {new Date(pay.createdAt).toLocaleString('en-IN')}
                          </td>

                          <td className="py-4 px-5">
                            {pay.status === 'paid' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                              </span>
                            )}
                            {pay.status === 'created' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Pending
                              </span>
                            )}
                            {pay.status === 'failed' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Failed
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReceipt(pay);
                                setShowReceiptModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer border border-blue-200/60"
                              title="View Payment Receipt Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 4: PRICING PLANS CONTROL                                           */}
        {/* ========================================================================= */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-3xl flex items-center justify-between text-blue-900 text-xs font-semibold">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  Direct Subscription Policy Enforced: Organizations get instant access upon Razorpay payment confirmation.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Starter Plan */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition">
                <div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full uppercase border border-slate-200">
                    Starter Plan
                  </span>
                  <div className="mt-4 text-3xl font-extrabold text-slate-900 font-mono">
                    ₹999 <span className="text-xs font-normal text-slate-500">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">Ideal for small field teams starting out</p>
                  <ul className="mt-5 space-y-2.5 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Up to 10 Employee Accounts</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 3 Manager Accounts</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Live GPS Location Telemetry</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Selfie Geofenced Attendance</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Quota: 10 Seats</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Razorpay Active</span>
                </div>
              </div>

              {/* Growth Pro Plan */}
              <div className="bg-gradient-to-b from-blue-50/60 to-white p-6 rounded-3xl border-2 border-blue-500 shadow-md flex flex-col justify-between space-y-6 relative">
                <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                  Most Popular
                </div>

                <div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase border border-blue-200">
                    Growth Pro Plan
                  </span>
                  <div className="mt-4 text-3xl font-extrabold text-slate-900 font-mono">
                    ₹1,999 <span className="text-xs font-normal text-slate-500">/ month</span>
                  </div>
                  <p className="text-xs text-blue-900 font-medium mt-1">For growing medium enterprises needing audit tools</p>
                  <ul className="mt-5 space-y-2.5 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> Up to 30 Employee Accounts</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> 10 Manager Accounts</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> Live High Precision GPS Replay</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600" /> OCR Fuel Expense Audits</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>Quota: 30 Seats</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Razorpay Active</span>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition">
                <div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase border border-purple-200">
                    Enterprise Plan
                  </span>
                  <div className="mt-4 text-3xl font-extrabold text-slate-900 font-mono">
                    ₹3,999 <span className="text-xs font-normal text-slate-500">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">High capacity operations requiring multi-tier squad hierarchy</p>
                  <ul className="mt-5 space-y-2.5 text-xs font-semibold text-slate-700">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> 50 Employee Accounts</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> 20 Manager Accounts</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> Dedicated Account Manager</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> Custom SLA & 24/7 Phone Support</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Quota: 50 Seats</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Razorpay Active</span>
                </div>
              </div>

            </div>
          </div>
        )}



        {/* ========================================================================= */}
        {/* MODAL 1: ADD NEW ORGANIZATION                                             */}
        {/* ========================================================================= */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add New Customer Organization</h3>
                    <p className="text-xs text-slate-500">Create tenant account and initialize Super Admin login</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrg} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                  
                  {/* Org Details */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-blue-700 uppercase tracking-wider text-[11px]">Organization Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Organization Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kisan Digital Ltd"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Organization Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="contact@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="text"
                          placeholder="+91 9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Office Address</label>
                        <input
                          type="text"
                          placeholder="City, State"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Initial Admin Credentials */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h4 className="font-bold text-blue-700 uppercase tracking-wider text-[11px]">Primary Admin Credentials</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Admin Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ramesh Kumar"
                          value={formData.adminName}
                          onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Admin Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="admin@company.com"
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Admin Initial Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* Subscription Plan & Seat Quotas */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h4 className="font-bold text-blue-700 uppercase tracking-wider text-[11px]">Subscription Plan & Quotas</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Plan Tier</label>
                        <select
                          value={formData.planName}
                          onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                        >
                          <option value="Starter Plan">Starter Plan (10 seats)</option>
                          <option value="Growth Pro Plan">Growth Pro Plan (50 seats)</option>
                          <option value="Enterprise Plan">Enterprise Plan (500 seats)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Max Employees</label>
                        <input
                          type="number"
                          value={formData.maxEmployees}
                          onChange={(e) => setFormData({ ...formData, maxEmployees: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Max Managers</label>
                        <input
                          type="number"
                          value={formData.maxManagers}
                          onChange={(e) => setFormData({ ...formData, maxManagers: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
                  >
                    Create Organization Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: EDIT SUBSCRIPTION PLAN & QUOTA                                  */}
        {/* ========================================================================= */}
        {showSubscriptionModal && selectedOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-slate-900">Update Subscription: {selectedOrg.name}</h3>
                <button type="button" onClick={() => setShowSubscriptionModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateSubscription} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plan Tier</label>
                  <select
                    value={subData.planName}
                    onChange={(e) => setSubData({ ...subData, planName: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Starter Plan">Starter Plan</option>
                    <option value="Growth Pro Plan">Growth Pro Plan</option>
                    <option value="Enterprise Plan">Enterprise Plan</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Employees</label>
                    <input
                      type="number"
                      value={subData.maxEmployees}
                      onChange={(e) => setSubData({ ...subData, maxEmployees: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Managers</label>
                    <input
                      type="number"
                      value={subData.maxManagers}
                      onChange={(e) => setSubData({ ...subData, maxManagers: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Extend Access (Days)</label>
                  <input
                    type="number"
                    value={subData.addDays}
                    onChange={(e) => setSubData({ ...subData, addDays: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowSubscriptionModal(false)}
                    className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm"
                  >
                    Save Subscription Updates
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: PAYMENT RECEIPT DETAILS                                          */}
        {/* ========================================================================= */}
        {showReceiptModal && selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Razorpay Payment Receipt</h3>
                  <p className="text-xs text-slate-500">Order #{selectedReceipt.razorpayOrderId}</p>
                </div>
                <button type="button" onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <strong className="text-emerald-700 font-mono font-bold text-sm">₹{selectedReceipt.amount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Organization:</span>
                  <strong className="text-slate-900 font-bold">{selectedReceipt.organization?.name || selectedReceipt.notes?.companyName || 'N/A'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Email:</span>
                  <strong className="text-slate-900">{selectedReceipt.organization?.email || selectedReceipt.notes?.userEmail || 'N/A'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Razorpay Payment ID:</span>
                  <strong className="font-mono text-slate-900">{selectedReceipt.razorpayPaymentId || 'N/A'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Status:</span>
                  <strong className="uppercase font-bold text-emerald-700">{selectedReceipt.status}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Date:</span>
                  <strong className="text-slate-900">{new Date(selectedReceipt.createdAt).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </KisanConnectLayout>
  );
}
