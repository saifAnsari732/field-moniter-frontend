import React, { useEffect, useState } from 'react';
import KisanConnectLayout from '../../components/layout/KisanConnectLayout';
import { meetingAPI, API, uploadAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Search,
  Filter,
  X,
  Trash2,
  Calendar,
  MapPin,
  Phone,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Store,
  User,
  RefreshCw,
  Camera,
  Upload,
  Download,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import Avatar from '../../components/shared/Avatar';

export const getMeetingImage = (m) => {
  if (!m) return '';
  const candidates = [
    m.selfieUrl,
    m.checkInImage,
    m.selfie,
    m.photo,
    m.image,
    m.imageUrl,
    m.checkInPhoto,
    m.images,
    m.attachments,
    m.media,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) {
      for (const item of candidate) {
        if (typeof item === 'string' && item.trim()) return item.trim();
        if (item && typeof item === 'object' && item.url) return item.url;
      }
    }
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }

  return '';
};

const formatVisitDate = (rawDate) => {
  if (!rawDate) return '-';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return String(rawDate);

  const datePart = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${datePart}, ${timePart}`;
};

export default function AdminMeetings() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [empFilter, setEmpFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // Date filter (YYYY-MM-DD)
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingMeetingId, setUploadingMeetingId] = useState(null);

  // New Visit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingMeeting, setSubmittingMeeting] = useState(false);
  const [newVisitImage, setNewVisitImage] = useState('');
  const [uploadingNewVisitImage, setUploadingNewVisitImage] = useState(false);
  const [newMeetingForm, setNewMeetingForm] = useState({
    employeeId: '',
    clientName: '',
    companyName: '',
    mobileNumber: '',
    meetingAddress: '',
    meetingNotes: '',
    dealAmount: '',
    status: 'completed',
    date: todayStr,
  });

  useEffect(() => {
    API.get('/employees')
      .then((res) => {
        if (res.data?.success && res.data.employees) {
          setEmployees(res.data.employees);
        }
      })
      .catch(() => {});
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await meetingAPI.getAll({
        page,
        limit: 50,
        status: statusFilter || undefined,
        employeeId: empFilter || undefined,
      });
      setMeetings(res.data?.meetings || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.warn('Failed to fetch meetings:', err);
      toast.error('Failed to load meetings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [page, statusFilter, empFilter]);

  // 📸 Direct Inline Selfie Upload & Update
  const handleSelfieUpload = async (meetingId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, WEBP)');
      return;
    }

    setUploadingMeetingId(meetingId);
    const toastId = toast.loading('Uploading visit selfie to cloud...');

    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await uploadAPI.uploadImage(formData);
      const imageUrl = uploadRes.data?.url || uploadRes.data?.image;

      if (!imageUrl) {
        throw new Error('No image URL returned from cloud upload');
      }

      // Update Meeting document on Backend
      await meetingAPI.update(meetingId, {
        selfieUrl: imageUrl,
        selfie: imageUrl,
        photo: imageUrl,
        images: [imageUrl],
      });

      // Update state locally immediately
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === meetingId
            ? { ...m, selfieUrl: imageUrl, selfie: imageUrl, photo: imageUrl, images: [imageUrl] }
            : m
        )
      );

      toast.success('🎉 Visit selfie uploaded & attached successfully!', { id: toastId });
    } catch (err) {
      console.error('Selfie upload error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to upload selfie', { id: toastId });
    } finally {
      setUploadingMeetingId(null);
      e.target.value = '';
    }
  };

  // Upload selfie inside Create Visit Modal
  const handleModalSelfieUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNewVisitImage(true);
    const toastId = toast.loading('Uploading photo...');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await uploadAPI.uploadImage(formData);
      const imageUrl = uploadRes.data?.url || uploadRes.data?.image;
      setNewVisitImage(imageUrl);
      toast.success('Selfie attached!', { id: toastId });
    } catch (err) {
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setUploadingNewVisitImage(false);
      e.target.value = '';
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!newMeetingForm.clientName.trim()) {
      return toast.error('Client name is required');
    }

    setSubmittingMeeting(true);
    try {
      await meetingAPI.create({
        ...newMeetingForm,
        employee: newMeetingForm.employeeId || undefined,
        dealAmount: Number(newMeetingForm.dealAmount) || 0,
        selfieUrl: newVisitImage || undefined,
        selfie: newVisitImage || undefined,
        images: newVisitImage ? [newVisitImage] : [],
      });

      toast.success('✅ Client visit logged successfully!');
      setShowAddModal(false);
      setNewVisitImage('');
      setNewMeetingForm({
        employeeId: '',
        clientName: '',
        companyName: '',
        mobileNumber: '',
        meetingAddress: '',
        meetingNotes: '',
        dealAmount: '',
        status: 'completed',
        date: todayStr,
      });
      fetchMeetings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create meeting');
    } finally {
      setSubmittingMeeting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client visit record?')) return;
    try {
      await meetingAPI.delete(id);
      toast.success('Meeting deleted successfully');
      fetchMeetings();
    } catch {
      toast.error('Failed to delete meeting');
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    // Filter by Date if selected
    if (selectedDate) {
      const recordDate = m.date || (m.createdAt ? m.createdAt.slice(0, 10) : '');
      if (recordDate !== selectedDate) return false;
    }

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const client = (m.clientName || '').toLowerCase();
    const company = (m.companyName || '').toLowerCase();
    const emp = (m.employee?.name || '').toLowerCase();
    const phone = (m.mobileNumber || '').toLowerCase();
    const address = (m.meetingAddress || '').toLowerCase();
    const notes = (m.meetingNotes || '').toLowerCase();
    return (
      client.includes(term) ||
      company.includes(term) ||
      emp.includes(term) ||
      phone.includes(term) ||
      address.includes(term) ||
      notes.includes(term)
    );
  });

  const meetingsWithPhotos = meetings.filter((m) => !!getMeetingImage(m)).length;

  return (
    <KisanConnectLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-blue-600" />
              Field Visits & Client Meetings
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time audit of field executive visits, client discussions, store locations, and visit selfies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Log Field Visit</span>
            </button>
            <span className="px-3.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 shadow-2xs">
              {total} Total Visits in DB
            </span>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-2">
              <Briefcase className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-medium text-slate-500">Total Visits</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{total}</h3>
            <span className="text-[10px] text-blue-600 font-semibold block">Client interactions</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-medium text-slate-500">Completed Visits</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {meetings.filter((m) => m.status === 'completed').length}
            </h3>
            <span className="text-[10px] text-emerald-600 font-semibold block">Executed</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-2">
              <Camera className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-medium text-slate-500">With Visit Selfie</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{meetingsWithPhotos}</h3>
            <span className="text-[10px] text-indigo-600 font-semibold block">Photo Audited</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-2">
              <Store className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-medium text-slate-500">Total Field Agents</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{employees.length}</h3>
            <span className="text-[10px] text-purple-600 font-semibold block">Active in field</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search client, shop, mobile, notes, employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Employee Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[10px] text-slate-400 font-bold uppercase">Employee:</span>
                <select
                  value={empFilter}
                  onChange={(e) => {
                    setEmpFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[150px] truncate"
                >
                  <option value="">All Field Employees</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
                <option value="follow-up">Follow-Up</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Quick Date Filters */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Date:</span>
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedDate === todayStr
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const y = new Date();
                  y.setDate(y.getDate() - 1);
                  setSelectedDate(y.toISOString().slice(0, 10));
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Yesterday
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  title="Clear Date Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Chips */}
          {(searchTerm || empFilter || statusFilter || selectedDate) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-blue-200">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}>
                    <X className="w-3 h-3 hover:text-blue-900" />
                  </button>
                </span>
              )}
              {empFilter && (
                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-purple-200">
                  Employee: {employees.find((e) => e._id === empFilter)?.name || 'Selected'}
                  <button onClick={() => setEmpFilter('')}>
                    <X className="w-3 h-3 hover:text-purple-900" />
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-emerald-200 capitalize">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('')}>
                    <X className="w-3 h-3 hover:text-emerald-900" />
                  </button>
                </span>
              )}
              {selectedDate && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-amber-200">
                  Date: {selectedDate}
                  <button onClick={() => setSelectedDate('')}>
                    <X className="w-3 h-3 hover:text-amber-900" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setEmpFilter('');
                  setStatusFilter('');
                  setSelectedDate('');
                }}
                className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold underline ml-1 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Table of Meetings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Field Agent</th>
                  <th className="py-3 px-4">Client / Store</th>
                  <th className="py-3 px-4">Visit Selfie</th>
                  <th className="py-3 px-4">Location / Address</th>
                  <th className="py-3 px-4">Meeting Notes</th>
                  <th className="py-3 px-4 text-right">Deal Value</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-xs text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                        <span>Loading visit records from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMeetings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-xs text-slate-400">
                      No client visit records found for selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMeetings.map((m) => {
                    const visitImg = getMeetingImage(m);
                    const isUploadingThis = uploadingMeetingId === m._id;

                    return (
                      <tr key={m._id} className="hover:bg-slate-50/60 transition">
                        {/* Field Agent Avatar + Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={m.employee?.avatar}
                              name={m.employee?.name}
                              size="sm"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">
                                {m.employee?.name || 'Field Executive'}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {m.employee?.employeeId || 'EMP-' + (m.employee?._id || m._id).slice(-4).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Client & Shop Name + Mobile */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block leading-tight">
                            {m.clientName || 'Client'}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {m.companyName || 'Store / Business'}
                          </span>
                          {m.mobileNumber && (
                            <a
                              href={`tel:${m.mobileNumber}`}
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-semibold mt-0.5"
                            >
                              <Phone className="w-3 h-3" />
                              {m.mobileNumber}
                            </a>
                          )}
                        </td>

                        {/* 📸 Visit Selfie Preview & Upload Action */}
                        <td className="py-3.5 px-4">
                          {visitImg ? (
                            <div className="flex items-center gap-2">
                              {/* Clickable High-Res Thumbnail */}
                              <button
                                type="button"
                                onClick={() => setPreviewImage({ url: visitImg, meeting: m })}
                                className="group relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:ring-2 hover:ring-blue-500 transition cursor-pointer flex-shrink-0 bg-slate-100"
                                title="Click to View Full Size Visit Selfie"
                              >
                                <img
                                  src={visitImg}
                                  alt="Visit Selfie"
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                              </button>

                              {/* Small Replace Camera Icon */}
                              <label
                                className={`p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition cursor-pointer text-slate-400 ${
                                  isUploadingThis ? 'opacity-50 pointer-events-none' : ''
                                }`}
                                title="Change / Update Selfie"
                              >
                                {isUploadingThis ? (
                                  <div className="w-3.5 h-3.5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                                ) : (
                                  <Camera className="w-3.5 h-3.5" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  disabled={isUploadingThis}
                                  onChange={(e) => handleSelfieUpload(m._id, e)}
                                />
                              </label>
                            </div>
                          ) : (
                            /* Add Selfie Button for records without photo */
                            <label
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700 text-xs font-bold transition shadow-2xs cursor-pointer group active:scale-98 ${
                                isUploadingThis ? 'opacity-60 pointer-events-none' : ''
                              }`}
                              title="Click to Upload / Capture Visit Selfie"
                            >
                              {isUploadingThis ? (
                                <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                              ) : (
                                <Camera className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition" />
                              )}
                              <span>{isUploadingThis ? 'Uploading...' : 'Add Selfie'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                disabled={isUploadingThis}
                                onChange={(e) => handleSelfieUpload(m._id, e)}
                              />
                            </label>
                          )}
                        </td>

                        {/* Location / Address */}
                        <td className="py-3.5 px-4 max-w-[180px]">
                          <span className="text-slate-800 font-medium block truncate" title={m.meetingAddress}>
                            {m.meetingAddress || m.locationName || 'Field Location'}
                          </span>
                        </td>

                        {/* Meeting Notes */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <span className="text-slate-600 block truncate" title={m.meetingNotes}>
                            {m.meetingNotes || '-'}
                          </span>
                        </td>

                        {/* Deal Value */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                          {m.dealAmount ? `₹${m.dealAmount.toLocaleString('en-IN')}` : '-'}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium font-mono text-[11px]">
                          {formatVisitDate(m.date || m.createdAt)}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              m.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : m.status === 'follow-up'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : m.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                m.status === 'completed'
                                  ? 'bg-emerald-500'
                                  : m.status === 'follow-up'
                                  ? 'bg-amber-500'
                                  : m.status === 'cancelled'
                                  ? 'bg-rose-500'
                                  : 'bg-blue-500'
                              }`}
                            />
                            {m.status || 'scheduled'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(m._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Visit Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 📸 High-Resolution Photo Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  Field Visit Selfie
                </h3>
                {previewImage.meeting && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {previewImage.meeting.clientName} • {previewImage.meeting.employee?.name || 'Field Agent'}
                  </p>
                )}
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl overflow-hidden bg-slate-100 aspect-square max-h-[400px] flex items-center justify-center border border-slate-200">
              <img
                src={typeof previewImage === 'string' ? previewImage : previewImage.url}
                alt="Visit Photo"
                className="w-full h-full object-cover"
              />
            </div>

            {previewImage.meeting && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Store / Client:</span>
                  <span className="font-bold text-slate-900">{previewImage.meeting.clientName} ({previewImage.meeting.companyName || 'Store'})</span>
                </div>
                {previewImage.meeting.meetingAddress && (
                  <div className="flex justify-between text-slate-600">
                    <span className="font-semibold">Location:</span>
                    <span className="text-slate-800 truncate max-w-[240px]">{previewImage.meeting.meetingAddress}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Visit Time:</span>
                  <span className="font-mono text-slate-800">{formatVisitDate(previewImage.meeting.date || previewImage.meeting.createdAt)}</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <a
                href={typeof previewImage === 'string' ? previewImage : previewImage.url}
                target="_blank"
                rel="noreferrer"
                download="visit-selfie.jpg"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open / Download</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ➕ Log New Field Visit Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl p-6 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Log New Field Visit</h3>
                  <p className="text-xs text-slate-500">Record client discussion with visit selfie & location</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="mt-4 space-y-4">
              {/* Field Executive Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Field Executive *
                </label>
                <select
                  value={newMeetingForm.employeeId}
                  onChange={(e) => setNewMeetingForm((p) => ({ ...p, employeeId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Field Agent</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeId || 'Agent'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Client & Store Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newMeetingForm.clientName}
                    onChange={(e) => setNewMeetingForm((p) => ({ ...p, clientName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Store / Business</label>
                  <input
                    type="text"
                    placeholder="e.g. Kisan Traders"
                    value={newMeetingForm.companyName}
                    onChange={(e) => setNewMeetingForm((p) => ({ ...p, companyName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Mobile & Deal Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={newMeetingForm.mobileNumber}
                    onChange={(e) => setNewMeetingForm((p) => ({ ...p, mobileNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Deal Value (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={newMeetingForm.dealAmount}
                    onChange={(e) => setNewMeetingForm((p) => ({ ...p, dealAmount: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Meeting Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Shop #4, Main Market, Lucknow"
                  value={newMeetingForm.meetingAddress}
                  onChange={(e) => setNewMeetingForm((p) => ({ ...p, meetingAddress: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Meeting Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Discussion Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key points discussed during the visit..."
                  value={newMeetingForm.meetingNotes}
                  onChange={(e) => setNewMeetingForm((p) => ({ ...p, meetingNotes: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* 📸 Visit Selfie Upload in Form */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Visit Selfie / Store Photo
                </label>
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex items-center justify-between gap-3">
                  {newVisitImage ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                        <img src={newVisitImage} alt="Visit Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-700 block">Photo Attached</span>
                        <span className="text-[10px] text-slate-400">Ready to save with visit</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Camera className="w-4 h-4 text-slate-400" />
                      <span>Attach visit selfie or shop storefront</span>
                    </div>
                  )}

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs">
                    {uploadingNewVisitImage ? (
                      <div className="w-3.5 h-3.5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>{uploadingNewVisitImage ? 'Uploading...' : newVisitImage ? 'Change Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      disabled={uploadingNewVisitImage}
                      onChange={handleModalSelfieUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMeeting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
                >
                  {submittingMeeting ? 'Saving Visit...' : 'Save Visit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KisanConnectLayout>
  );
}
