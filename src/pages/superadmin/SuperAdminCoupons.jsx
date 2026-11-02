import React, { useState, useEffect } from 'react';
import KisanConnectLayout from '../../components/layout/KisanConnectLayout';
import {
  Tag,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Sparkles,
  Percent,
  Calendar,
  Copy,
  CheckCircle2,
  XCircle,
  X,
  CreditCard,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Edit2,
  Users,
  Check,
  Dices,
  Layers,
  History,
} from 'lucide-react';
import { API } from '../../services/api.service';
import toast from 'react-hot-toast';

export default function SuperAdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalSavings: 0,
    totalRedemptions: 0,
    recentRedemptions: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'expired', 'disabled'
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: '',
    maxDiscountAmount: '',
    maxUses: 100,
    maxUsesPerOrg: 1,
    applicablePlans: ['all'],
    firstTimeOnly: false,
    validTill: '',
  });

  const fetchCouponsAndAnalytics = async () => {
    try {
      setLoading(true);
      const [couponsRes, analyticsRes] = await Promise.all([
        API.get('/superadmin/coupons'),
        API.get('/superadmin/coupons/analytics').catch(() => ({ data: { analytics: null } })),
      ]);

      if (couponsRes.data?.success) {
        setCoupons(couponsRes.data.coupons || []);
      }
      if (analyticsRes.data?.analytics) {
        setAnalytics(analyticsRes.data.analytics);
      }
    } catch {
      toast.error('Failed to load coupons & analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsAndAnalytics();
  }, []);

  // 🎲 Generate Random Promo Code
  const handleGenerateRandomCode = () => {
    const prefixes = ['GROWTH', 'KISAN', 'SAVE', 'BOOST', 'PROMO', 'FESTIVE', 'STARTUP'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const generated = `${prefix}${num}`;
    setFormData((prev) => ({ ...prev, code: generated }));
    toast.success(`Generated code: ${generated}`);
  };

  const openCreateModal = () => {
    setEditCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: '',
      maxDiscountAmount: '',
      maxUses: 100,
      maxUsesPerOrg: 1,
      applicablePlans: ['all'],
      firstTimeOnly: false,
      validTill: '',
    });
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || 10,
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      maxUses: coupon.maxUses || 100,
      maxUsesPerOrg: coupon.maxUsesPerOrg || 1,
      applicablePlans: Array.isArray(coupon.applicablePlans) && coupon.applicablePlans.length > 0 ? coupon.applicablePlans : ['all'],
      firstTimeOnly: Boolean(coupon.firstTimeOnly),
      validTill: coupon.validTill ? new Date(coupon.validTill).toISOString().slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSubmitCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        code: formData.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        maxUses: formData.maxUses ? Number(formData.maxUses) : 100,
        maxUsesPerOrg: formData.maxUsesPerOrg ? Number(formData.maxUsesPerOrg) : 1,
        applicablePlans: formData.applicablePlans,
        firstTimeOnly: Boolean(formData.firstTimeOnly),
        validTill: formData.validTill ? new Date(formData.validTill).toISOString() : null,
      };

      if (editCoupon) {
        const res = await API.put(`/superadmin/coupons/${editCoupon._id}`, payload);
        if (res.data?.success) {
          toast.success(`🎉 Coupon "${payload.code}" updated successfully!`);
          setShowModal(false);
          fetchCouponsAndAnalytics();
        }
      } else {
        const res = await API.post('/superadmin/coupons', payload);
        if (res.data?.success) {
          toast.success(`🎉 Promo Coupon "${payload.code}" launched successfully!`);
          setShowModal(false);
          fetchCouponsAndAnalytics();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      const res = await API.patch(`/superadmin/coupons/${couponId}/toggle`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Coupon status updated!');
        fetchCouponsAndAnalytics();
      }
    } catch {
      toast.error('Failed to toggle coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) return;
    try {
      const res = await API.delete(`/superadmin/coupons/${couponId}`);
      if (res.data?.success) {
        toast.success(`Coupon "${code}" deleted!`);
        fetchCouponsAndAnalytics();
      }
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success(`Copied "${text}" to clipboard! 📋`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = coupons.filter((c) => {
    const code = c.code || '';
    const desc = c.description || '';
    const matchesSearch =
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'active') return c.isActive && !c.isExpired;
    if (statusFilter === 'expired') return c.isExpired;
    if (statusFilter === 'disabled') return !c.isActive;
    return true;
  });

  return (
    <KisanConnectLayout>
      <div className="space-y-6 pb-16 antialiased">
        
        {/* Header Title & Actions */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 rounded-full flex items-center gap-1.5 shadow-2xs">
                <Tag className="w-3.5 h-3.5 text-rose-600" /> SuperAdmin Promotion Engine
              </span>
              <span className="text-xs text-slate-400 font-bold">• Secure Checkout V2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
              Promotional Coupons & Checkout Discounts
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
              Create, configure, and monitor promo discount codes with per-org limits, minimum thresholds & plan restrictions.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={fetchCouponsAndAnalytics}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl border border-slate-200 shadow-2xs transition cursor-pointer flex items-center gap-2 text-xs font-bold"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-600' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-600/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Arise New Promo Coupon
            </button>
          </div>
        </div>

        {/* Analytics KPI Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Total Coupons
              </span>
              <span className="text-2xl font-black text-slate-900">
                {analytics.totalCoupons || coupons.length}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Active & Redeemable
              </span>
              <span className="text-2xl font-black text-emerald-600">
                {analytics.activeCoupons || coupons.filter((c) => c.isActive && !c.isExpired).length}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Times Redeemed
              </span>
              <span className="text-2xl font-black text-blue-600">
                {analytics.totalRedemptions || coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0)}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Total Savings Given
              </span>
              <span className="text-2xl font-black text-purple-600">
                ₹{(analytics.totalSavings || coupons.reduce((acc, c) => acc + (c.totalSavingsGenerated || 0), 0)).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar: Search & Filter Tabs */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search coupon code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['all', 'active', 'expired', 'disabled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer capitalize whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab === 'all' ? 'All Coupons' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Coupons Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoupons.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 font-medium">
              <Tag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">No coupons matched your filter</p>
              <p className="text-xs text-slate-400 mt-1">Click "+ Arise New Promo Coupon" to launch a campaign.</p>
            </div>
          ) : (
            filteredCoupons.map((coupon) => {
              const isExpired = coupon.isExpired || (coupon.validTill && new Date(coupon.validTill) < new Date());
              const usagePercent = coupon.usagePercentage || (coupon.maxUses ? Math.min(100, Math.round(((coupon.usedCount || 0) / coupon.maxUses) * 100)) : 0);

              return (
                <div
                  key={coupon._id}
                  className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group ${
                    !coupon.isActive
                      ? 'border-slate-200 opacity-75'
                      : isExpired
                      ? 'border-amber-200/90'
                      : 'border-slate-200 hover:border-rose-300'
                  }`}
                >
                  {/* Decorative background glow */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-50 rounded-full blur-xl group-hover:scale-125 transition-transform pointer-events-none" />

                  <div>
                    {/* Top Row: Code, Copy Button, Status Badge */}
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-black shadow-2xs">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(coupon.code)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
                              title="Copy Code"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <span className="text-xs text-slate-500 font-medium line-clamp-1">
                            {coupon.description || 'General Promotional Discount'}
                          </span>
                        </div>
                      </div>

                      {/* Status pill */}
                      <button
                        onClick={() => handleToggleStatus(coupon._id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition cursor-pointer ${
                          !coupon.isActive
                            ? 'bg-slate-100 text-slate-500 border-slate-200'
                            : isExpired
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {!coupon.isActive ? 'Disabled' : isExpired ? 'Expired' : 'Active'}
                      </button>
                    </div>

                    {/* Discount & Threshold Specs Box */}
                    <div className="mt-4 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-semibold">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Discount Benefit:</span>
                        <span className="text-rose-700 font-black text-sm">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} FLAT OFF`}
                          {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
                            <span className="text-[10px] text-slate-400 block text-right font-normal">
                              (Max ₹{coupon.maxDiscountAmount} cap)
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Min Order Requirement:</span>
                        <span className="text-slate-900 font-bold">
                          {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : 'None (₹0)'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Usage Limit per Org:</span>
                        <span className="text-slate-900 font-bold">
                          {coupon.maxUsesPerOrg || 1} redemption / org
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Eligible Plans:</span>
                        <span className="text-slate-900 font-bold uppercase text-[11px]">
                          {Array.isArray(coupon.applicablePlans) && coupon.applicablePlans.length > 0
                            ? coupon.applicablePlans.join(', ')
                            : 'All Plans'}
                        </span>
                      </div>

                      {/* Usage Progress Bar */}
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex justify-between items-center text-[11px] mb-1">
                          <span className="text-slate-500 font-medium">Redemption Cap:</span>
                          <span className="font-bold text-slate-900">
                            {coupon.usedCount || 0} / {coupon.maxUses || 100} ({usagePercent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              usagePercent >= 100 ? 'bg-amber-500' : 'bg-rose-600'
                            }`}
                            style={{ width: `${Math.min(100, usagePercent)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-1">
                        <span className="text-slate-400">Total Money Saved:</span>
                        <span className="font-black text-purple-700">
                          ₹{(coupon.totalSavingsGenerated || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Expiry + Edit & Delete Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {coupon.validTill
                        ? `Valid till ${new Date(coupon.validTill).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}`
                        : 'Lifetime Validity'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Edit Coupon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ─── CREATE / EDIT COUPON MODAL ────────────────────────────────────── */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">
                      {editCoupon ? 'Edit Promotional Coupon' : 'Arise New Promo Coupon'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Configure discount mathematics, anti-abuse caps & plan filters
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitCoupon} className="space-y-4 text-xs font-semibold">
                
                {/* Coupon Code Input with Random Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-bold">Promo Coupon Code *</label>
                    {!editCoupon && (
                      <button
                        type="button"
                        onClick={handleGenerateRandomCode}
                        className="text-[11px] text-rose-600 font-bold hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Dices className="w-3.5 h-3.5" /> Auto-Generate
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editCoupon)}
                    placeholder="e.g. SPECIAL50, DIWALI30, GROWTH20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-slate-900 text-sm disabled:opacity-60"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Discount Type *</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-800"
                    >
                      <option value="percentage">Percentage (% OFF)</option>
                      <option value="flat">Flat Amount (₹ INR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">
                      Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 20"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Min Order & Max Discount Cap */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 999 (0 for none)"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500 (for % off)"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Total Uses & Max Uses Per Org */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Total Global Uses</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Max Redemptions / Org</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1 (Default)"
                      value={formData.maxUsesPerOrg}
                      onChange={(e) => setFormData({ ...formData, maxUsesPerOrg: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-slate-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.validTill}
                    onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Applicable Plans Checklist */}
                <div>
                  <label className="block text-slate-700 mb-1.5">Applicable Subscription Plans</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'starter', 'pro', 'enterprise'].map((p) => {
                      const isChecked = formData.applicablePlans.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            if (p === 'all') {
                              setFormData({ ...formData, applicablePlans: ['all'] });
                            } else {
                              const withoutAll = formData.applicablePlans.filter((x) => x !== 'all');
                              if (withoutAll.includes(p)) {
                                const next = withoutAll.filter((x) => x !== p);
                                setFormData({ ...formData, applicablePlans: next.length ? next : ['all'] });
                              } else {
                                setFormData({ ...formData, applicablePlans: [...withoutAll, p] });
                              }
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition cursor-pointer ${
                            isChecked
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p === 'all' ? 'All Plans' : p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* First Time Only Checkbox */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">First-Time Customers Only</span>
                    <span className="text-[11px] text-slate-500">Prevent organizations with previous payments from using this coupon</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.firstTimeOnly}
                    onChange={(e) => setFormData({ ...formData, firstTimeOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                </div>

                {/* Campaign Description */}
                <div>
                  <label className="block text-slate-700 mb-1">Campaign Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Festival Season 20% discount on Growth Pro"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl font-black shadow-md shadow-rose-600/20 transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Saving...' : editCoupon ? 'Save Changes' : 'Publish Promo Coupon'}
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
