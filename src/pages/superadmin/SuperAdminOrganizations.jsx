import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KisanConnectLayout from '../../components/layout/KisanConnectLayout';
import {
  Building2,
  Users,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Activity,
  Edit,
  Sliders,
  Calendar,
  CreditCard,
  RefreshCw,
  Phone,
  Mail,
  Zap,
  ExternalLink,
  Code,
  MapPin,
  Clock,
  Compass,
  CalendarCheck,
  Briefcase,
  Receipt,
  FileText,
  ChevronRight,
  X,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Copy,
  Check,
} from 'lucide-react';
import { API } from '../../services/api.service';
import toast from 'react-hot-toast';

export default function SuperAdminOrganizations() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgDetails, setOrgDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState('overview'); // 'overview', 'operations', 'members', 'json'
  const [copiedJson, setCopiedJson] = useState(false);

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

  const [subData, setSubData] = useState({
    planName: 'Growth Pro Plan',
    maxEmployees: 50,
    maxManagers: 10,
    addDays: 30,
  });

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await API.get('/superadmin/organizations');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setOrganizations(res.data.data);
      }
    } catch {
      toast.error('Failed to load organizations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // 🔍 Fetch Full Structured Organization Breakdown
  const handleOpenDetails = async (org) => {
    setSelectedOrg(org);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setActiveDetailsTab('overview');
    try {
      const res = await API.get(`/superadmin/organizations/${org._id}/details`);
      if (res.data?.success) {
        setOrgDetails(res.data.data);
      }
    } catch {
      toast.error('Failed to load deep organization details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // ⚡ Master Switch into Organization (SuperAdmin Impersonation Mode)
  const handleSwitchToOrg = (org) => {
    localStorage.setItem('organization', JSON.stringify(org));
    toast.success(`⚡ Switched active inspection context to "${org.name}"!`, { duration: 4000 });
    navigate('/admin');
  };

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
        fetchOrganizations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleStatusChange = async (orgId, status) => {
    try {
      await API.patch(`/superadmin/organizations/${orgId}/status`, { status });
      toast.success(`Status updated to ${status.toUpperCase()}`);
      fetchOrganizations();
      if (orgDetails && orgDetails.organization?._id === orgId) {
        setOrgDetails((prev) => ({
          ...prev,
          organization: { ...prev.organization, status },
        }));
      }
    } catch {
      toast.error('Failed to update organization status');
    }
  };

  const handleOpenSubModal = (org) => {
    setSelectedOrg(org);
    setSubData({
      planName: org.plan?.planName || 'Growth Pro Plan',
      maxEmployees: org.plan?.maxEmployees || 50,
      maxManagers: org.plan?.maxManagers || 10,
      addDays: 30,
    });
    setShowSubModal(true);
  };

  const handleUpdateSub = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;
    try {
      const res = await API.patch(`/superadmin/organizations/${selectedOrg._id}/subscription`, subData);
      if (res.data?.success) {
        toast.success(`Subscription updated & plan extended for ${selectedOrg.name}!`);
        setShowSubModal(false);
        fetchOrganizations();
        if (showDetailsModal && orgDetails) {
          handleOpenDetails(selectedOrg);
        }
      }
    } catch {
      toast.error('Failed to update subscription');
    }
  };

  const copyStructuredJson = () => {
    if (!orgDetails) return;
    navigator.clipboard.writeText(JSON.stringify(orgDetails, null, 2));
    setCopiedJson(true);
    toast.success('Structured JSON copied to clipboard! 📋');
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <KisanConnectLayout>
      <div className="space-y-6 pb-16 antialiased">
        
        {/* Modern Super Admin Header Bar */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 rounded-full flex items-center gap-1.5 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-rose-600" /> Multi-Tenant Master Hub
              </span>
              <span className="text-xs text-slate-400 font-bold">• 100% Master Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
              Customer Organizations & Structured Data
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
              Inspect structured organizational data, tenant quotas, real-time telemetry, and override plans without billing.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={fetchOrganizations}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl border border-slate-200 shadow-2xs transition cursor-pointer flex items-center gap-2 text-xs font-bold"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-600' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-600/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Onboard New Organization
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by company name, email, or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['all', 'active', 'unpaid', 'suspended', 'trial'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer capitalize whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab === 'all' ? `All (${organizations.length})` : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <th className="py-4 px-6">Company / Slug</th>
                  <th className="py-4 px-6">Contact Email & Phone</th>
                  <th className="py-4 px-6">Plan & Quotas</th>
                  <th className="py-4 px-6">Staff Usage</th>
                  <th className="py-4 px-6">Total Paid</th>
                  <th className="py-4 px-6">Expiry Status</th>
                  <th className="py-4 px-6">Tenant Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-slate-400 font-medium">
                      No organizations found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => {
                    const isExpired = org.plan?.expiresAt ? new Date(org.plan.expiresAt) < new Date() : false;
                    const daysRemaining = org.plan?.expiresAt
                      ? Math.ceil((new Date(org.plan.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
                      : null;

                    return (
                      <tr key={org._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 font-black flex items-center justify-center text-xs border border-rose-100 flex-shrink-0 shadow-2xs">
                              {org.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 truncate">{org.name}</div>
                              <div className="font-mono text-[11px] text-slate-400">{org.slug}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="text-slate-800 text-xs flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {org.email}
                          </div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {org.phone || 'N/A'}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                            {org.plan?.planName || 'Growth Pro'}
                          </span>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                            Max: {org.plan?.maxEmployees || 50} Emp • {org.plan?.maxManagers || 10} Mgr
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="text-slate-900 font-extrabold text-xs">
                            {org.currentEmployeeCount || 0} / {org.plan?.maxEmployees || 50} Emp
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {org.currentManagerCount || 0} / {org.plan?.maxManagers || 10} Mgr
                          </div>
                        </td>

                        <td className="py-4 px-6 text-emerald-600 font-black">
                          ₹{(org.totalRevenuePaid || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="py-4 px-6">
                          {org.plan?.expiresAt ? (
                            <div>
                              <div className="text-xs text-slate-800 font-bold">
                                {new Date(org.plan.expiresAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              <span
                                className={`text-[10px] font-extrabold block ${
                                  daysRemaining <= 0
                                    ? 'text-rose-600'
                                    : daysRemaining <= 3
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                                }`}
                              >
                                {daysRemaining <= 0
                                  ? `Expired (${Math.abs(daysRemaining)}d ago)`
                                  : `${daysRemaining} days left`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">No Expiry</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                              org.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : org.status === 'unpaid'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {org.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            
                            {/* Inspect Structured Data */}
                            <button
                              onClick={() => handleOpenDetails(org)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1 cursor-pointer"
                              title="Inspect Full Data Structure"
                            >
                              <Layers className="w-3.5 h-3.5 text-slate-500" />
                              Inspect
                            </button>

                            {/* Quick Switch / Open Console */}
                            <button
                              onClick={() => handleSwitchToOrg(org)}
                              className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                              title="Switch into organization operational view"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              Manage
                            </button>

                            {/* Edit Plan / Extend */}
                            <button
                              onClick={() => handleOpenSubModal(org)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Edit Plan & Quotas"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>

                            {/* Toggle Suspend/Active */}
                            {org.status === 'active' ? (
                              <button
                                onClick={() => handleStatusChange(org._id, 'suspended')}
                                className="px-2 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                                title="Suspend organization access"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(org._id, 'active')}
                                className="px-2 py-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
                                title="Activate organization"
                              >
                                Activate
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── DEEP STRUCTURED DATA INSPECTOR MODAL ───────────────────────── */}
        {showDetailsModal && selectedOrg && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5 max-h-[92vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-rose-500/20">
                    {selectedOrg.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {selectedOrg.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                        {selectedOrg.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      ID: {selectedOrg._id} • Slug: {selectedOrg.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSwitchToOrg(selectedOrg)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Open Live Console
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider overflow-x-auto">
                {[
                  { id: 'overview', label: 'Structured Overview', icon: Building2 },
                  { id: 'operations', label: 'Live Operations Footprint', icon: Compass },
                  { id: 'members', label: 'Team Members Directory', icon: Users },
                  { id: 'json', label: 'Raw Data Structure (JSON)', icon: Code },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDetailsTab(tab.id)}
                      className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        activeDetailsTab === tab.id
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs font-black'
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {loadingDetails ? (
                <div className="py-16 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-rose-600" />
                  Loading structured organization data tree...
                </div>
              ) : !orgDetails ? (
                <div className="py-12 text-center text-slate-400 font-medium">Failed to load details.</div>
              ) : (
                <div>
                  
                  {/* TAB 1: STRUCTURED OVERVIEW */}
                  {activeDetailsTab === 'overview' && (
                    <div className="space-y-5 text-xs font-semibold">
                      
                      {/* Identity & Admin Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Organization Metadata
                          </h4>
                          <div className="space-y-1.5 text-slate-800">
                            <div><strong className="text-slate-500">Legal Name:</strong> {orgDetails.organization.name}</div>
                            <div><strong className="text-slate-500">Official Email:</strong> {orgDetails.organization.email}</div>
                            <div><strong className="text-slate-500">Contact Phone:</strong> {orgDetails.organization.phone || 'N/A'}</div>
                            <div><strong className="text-slate-500">Address:</strong> {orgDetails.organization.address?.city ? `${orgDetails.organization.address.city}, ${orgDetails.organization.address.state || ''}` : 'India'}</div>
                            <div><strong className="text-slate-500">Registered On:</strong> {new Date(orgDetails.organization.createdAt).toLocaleDateString('en-IN')}</div>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Organization Admin Account
                          </h4>
                          {orgDetails.adminUser ? (
                            <div className="space-y-1.5 text-slate-800">
                              <div><strong className="text-slate-500">Admin Name:</strong> {orgDetails.adminUser.name}</div>
                              <div><strong className="text-slate-500">Admin Email:</strong> {orgDetails.adminUser.email}</div>
                              <div><strong className="text-slate-500">Admin Phone:</strong> {orgDetails.adminUser.phone || 'N/A'}</div>
                              <div><strong className="text-slate-500">Role:</strong> {orgDetails.adminUser.role}</div>
                              <div>
                                <strong className="text-slate-500">Account Status:</strong>{' '}
                                <span className={orgDetails.adminUser.isActive ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                  {orgDetails.adminUser.isActive ? 'Active' : 'Deactivated'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-400 text-xs">No administrative user record found.</p>
                          )}
                        </div>
                      </div>

                      {/* Subscription & Quota Health Cards */}
                      <div className="p-5 bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-slate-50 rounded-2xl border border-rose-200 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 block">
                              SaaS Subscription Tier
                            </span>
                            <span className="text-lg font-black text-slate-900">
                              {orgDetails.subscription?.planName || 'Growth Pro Plan'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenSubModal(selectedOrg)}
                            className="px-4 py-2 bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 rounded-xl font-black text-xs uppercase tracking-wider shadow-2xs transition cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5 inline mr-1.5" />
                            Extend / Override Plan
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[10px] block font-bold uppercase">Lifecycle State</span>
                            <span className="font-black text-slate-900 text-sm">{orgDetails.subscription?.state || 'ACTIVE'}</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[10px] block font-bold uppercase">Health Score</span>
                            <span className="font-black text-emerald-600 text-sm">{orgDetails.subscription?.healthScore || 0}%</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[10px] block font-bold uppercase">Days Remaining</span>
                            <span className="font-black text-slate-900 text-sm">{orgDetails.subscription?.daysRemaining ?? 'N/A'} days</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-slate-200">
                            <span className="text-slate-400 text-[10px] block font-bold uppercase">Total Revenue Paid</span>
                            <span className="font-black text-purple-700 text-sm">₹{(orgDetails.operations?.totalRevenuePaid || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Quota Utilization Bars */}
                        <div className="space-y-2 pt-2 border-t border-rose-100">
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-slate-600 font-bold">Employee Capacity:</span>
                              <span className="font-black text-slate-900">
                                {orgDetails.capacity?.employees} / {orgDetails.capacity?.maxEmployees} seats ({orgDetails.capacity?.employeeUtilization}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-rose-600 rounded-full"
                                style={{ width: `${Math.min(100, orgDetails.capacity?.employeeUtilization || 0)}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-slate-600 font-bold">Manager Capacity:</span>
                              <span className="font-black text-slate-900">
                                {orgDetails.capacity?.managers} / {orgDetails.capacity?.maxManagers} seats ({orgDetails.capacity?.managerUtilization}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${Math.min(100, orgDetails.capacity?.managerUtilization || 0)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: LIVE OPERATIONS FOOTPRINT */}
                  {activeDetailsTab === 'operations' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                            <CalendarCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Attendance Punches</span>
                            <span className="text-lg font-black text-slate-900">{orgDetails.operations?.attendanceCount || 0}</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block">GPS Sessions Logged</span>
                            <span className="text-lg font-black text-slate-900">{orgDetails.operations?.trackingSessionsCount || 0}</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Client Visits & Meetings</span>
                            <span className="text-lg font-black text-slate-900">{orgDetails.operations?.meetingsCount || 0}</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Expenses Submitted</span>
                            <span className="text-lg font-black text-slate-900">{orgDetails.operations?.expensesCount || 0}</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Tasks Assigned</span>
                            <span className="text-lg font-black text-slate-900">{orgDetails.operations?.tasksCount || 0}</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Field Leads Captured</span>
                            <span className="text-lg font-black text-slate-900">{orgDetails.operations?.leadsCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">Want to inspect live data in real-time?</span>
                        <button
                          onClick={() => handleSwitchToOrg(selectedOrg)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Open Operational Dashboard
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: TEAM MEMBERS DIRECTORY */}
                  {activeDetailsTab === 'members' && (
                    <div className="space-y-3">
                      <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] border-b">
                            <tr>
                              <th className="p-3">Member Name</th>
                              <th className="p-3">Email</th>
                              <th className="p-3">Phone</th>
                              <th className="p-3">Role</th>
                              <th className="p-3">Department</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold">
                            {(orgDetails.recentMembers || []).map((m) => (
                              <tr key={m._id} className="hover:bg-slate-50">
                                <td className="p-3 font-bold text-slate-900">{m.name}</td>
                                <td className="p-3 text-slate-600">{m.email}</td>
                                <td className="p-3 text-slate-500">{m.phone || 'N/A'}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                    {m.role}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-500">{m.department || 'N/A'}</td>
                                <td className="p-3">
                                  <span className={m.isActive ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                    {m.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: RAW DATA STRUCTURE (JSON) */}
                  {activeDetailsTab === 'json' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                          Complete Schema & Aggregated Properties Tree
                        </span>
                        <button
                          type="button"
                          onClick={copyStructuredJson}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedJson ? 'Copied!' : 'Copy Raw JSON'}
                        </button>
                      </div>

                      <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
                        {JSON.stringify(orgDetails, null, 2)}
                      </pre>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

        {/* ─── MODAL: EDIT SUBSCRIPTION / PLAN OVERRIDE ────────────────────── */}
        {showSubModal && selectedOrg && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">Master Subscription Override</h3>
                    <p className="text-xs text-slate-500 font-medium">Adjust plan tier & extend days (Zero cost)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateSub} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-600 mb-1">Select SaaS Plan</label>
                  <select
                    value={subData.planName}
                    onChange={(e) => setSubData({ ...subData, planName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-800"
                  >
                    <option value="Starter Plan">Starter Plan (10 Emp, 3 Mgr)</option>
                    <option value="Growth Pro Plan">Growth Pro Plan (30 Emp, 10 Mgr)</option>
                    <option value="Enterprise Plan">Enterprise Plan (50 Emp, 20 Mgr)</option>
                    <option value="Custom Enterprise Plus">Custom Enterprise Plus (Custom Quota)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Max Employees</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={subData.maxEmployees}
                      onChange={(e) => setSubData({ ...subData, maxEmployees: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Max Managers</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={subData.maxManagers}
                      onChange={(e) => setSubData({ ...subData, maxManagers: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Extend Expiration By (Days)</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[30, 90, 180, 365].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSubData({ ...subData, addDays: d })}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          subData.addDays === d
                            ? 'bg-rose-50 text-rose-700 border-rose-300 font-black'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        +{d}d
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    value={subData.addDays}
                    onChange={(e) => setSubData({ ...subData, addDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowSubModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-xl font-black shadow-md transition"
                  >
                    Apply Override
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL: ONBOARD NEW ORGANIZATION ───────────────────────────── */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">Onboard New Customer Tenant</h3>
                    <p className="text-xs text-slate-500 font-medium">Provision organization & primary administrator</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrg} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-600 mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kisan Agro Biotech Ltd."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Official Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="info@kisanagro.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Official Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[11px] font-black uppercase text-slate-400 block">Initial Admin Credentials</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-500 mb-1">Admin Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Admin Name"
                        value={formData.adminName}
                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Admin Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="admin@kisanagro.com"
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Admin Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Secure Password"
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-xl font-black shadow-md transition"
                  >
                    Provision Tenant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </KisanConnectLayout>
  );
}
