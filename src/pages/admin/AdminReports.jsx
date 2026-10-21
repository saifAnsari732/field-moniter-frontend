import React, { useState, useEffect, useRef } from 'react';
import KisanConnectLayout from '../../components/layout/KisanConnectLayout';
import { adminAPI } from '../../services/api.service';
import toast from 'react-hot-toast';
import {
  FileText,
  Download,
  Calendar,
  User,
  Search,
  MapPin,
  Receipt,
  Briefcase,
  CheckCircle,
  Target,
  Image as ImageIcon,
  Printer,
  ChevronDown,
  ChevronUp,
  Layers,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Eye,
  Phone,
  Sparkles,
  ArrowRight,
  Filter,
  FileSpreadsheet,
  CalendarCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Navigation,
  Compass,
  Building2,
  Check,
  HelpCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import Avatar from '../../components/shared/Avatar';

export default function AdminReports() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('All');
  const [viewLayout, setViewLayout] = useState('unified'); // 'unified' (Day-by-Day Timeline) or 'categorized' (Tables)
  const [expandedDates, setExpandedDates] = useState({});
  const printableReportRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await adminAPI.getEmployees({ limit: 100, role: 'all' });
      const empList = data.employees || [];
      setEmployees(empList);
      if (empList.length > 0 && !selectedEmp) {
        setSelectedEmp(empList[0]._id);
      }
    } catch {
      toast.error('Failed to load employee list');
    }
  };

  const handleQuickDatePreset = (preset) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const y = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setStartDate(y);
      setEndDate(y);
    } else if (preset === '7days') {
      const s = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setStartDate(s);
      setEndDate(todayStr);
    } else if (preset === 'thisMonth') {
      const s = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      setStartDate(s);
      setEndDate(todayStr);
    } else if (preset === 'lastMonth') {
      const s = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
      const e = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().slice(0, 10);
      setStartDate(s);
      setEndDate(e);
    }
  };

  const handleGenerate = async () => {
    if (!selectedEmp) return toast.error('Please select an employee first');
    setLoading(true);
    try {
      const { data } = await adminAPI.getConsolidatedReport({
        employeeId: selectedEmp,
        startDate,
        endDate,
      });
      setReportData(data.data);
      setExpandedDates({});
      toast.success('Consolidated Report generated successfully');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const toggleDateExpansion = (dateKey) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  // ─── Build Day-by-Day Unified Timeline Map ────────────────────────────────
  const buildDailyTimeline = () => {
    if (!reportData) return [];

    const dateMap = {};

    // 1. Process Attendances
    (reportData.attendances || []).forEach((a) => {
      const dateKey = a.date || (a.createdAt ? new Date(a.createdAt).toISOString().slice(0, 10) : null);
      if (!dateKey) return;
      if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey };
      dateMap[dateKey].attendance = a;
    });

    // 2. Process Daily Distances
    (reportData.dailyDistances || []).forEach((d) => {
      const dateKey = d.date;
      if (!dateKey) return;
      if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey };
      dateMap[dateKey].distance = d;
    });

    // 3. Process Meetings
    (reportData.meetings || []).forEach((m) => {
      const dateKey = m.date ? new Date(m.date).toISOString().slice(0, 10) : null;
      if (!dateKey) return;
      if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey };
      if (!dateMap[dateKey].meetings) dateMap[dateKey].meetings = [];
      dateMap[dateKey].meetings.push(m);
    });

    // 4. Process Expenses
    (reportData.expenses || []).forEach((e) => {
      const dateKey = e.date ? new Date(e.date).toISOString().slice(0, 10) : null;
      if (!dateKey) return;
      if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey };
      if (!dateMap[dateKey].expenses) dateMap[dateKey].expenses = [];
      dateMap[dateKey].expenses.push(e);
    });

    // 5. Process Tasks
    (reportData.tasks || []).forEach((t) => {
      const dateKey = t.dueDate
        ? new Date(t.dueDate).toISOString().slice(0, 10)
        : t.createdAt
        ? new Date(t.createdAt).toISOString().slice(0, 10)
        : null;
      if (!dateKey) return;
      if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey };
      if (!dateMap[dateKey].tasks) dateMap[dateKey].tasks = [];
      dateMap[dateKey].tasks.push(t);
    });

    // 6. Process Leads
    (reportData.leads || []).forEach((l) => {
      const dateKey = l.createdAt ? new Date(l.createdAt).toISOString().slice(0, 10) : null;
      if (!dateKey) return;
      if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey };
      if (!dateMap[dateKey].leads) dateMap[dateKey].leads = [];
      dateMap[dateKey].leads.push(l);
    });

    // Sort descending by date
    return Object.values(dateMap).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // ─── Export to JPEG ────────────────────────────────────────────────────────
  const handleExportJPEG = async () => {
    if (!printableReportRef.current) return;
    try {
      const element = printableReportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Report_${reportData?.employee?.name?.replace(/\s+/g, '_') || 'Audit'}_${startDate}_to_${endDate}.jpg`;
      link.click();
      toast.success('JPEG snapshot exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export JPEG');
    }
  };

  // ─── Export to CSV / Excel ───────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!reportData) return;
    try {
      const emp = reportData.employee;
      const summary = reportData.summary;
      const daily = reportData.dailyDistances || [];
      const attendances = reportData.attendances || [];

      let csv = `KISANCONNECT FIELD OPERATIONS REPORT\n`;
      csv += `Employee,${emp.name} (${emp.employeeId || 'N/A'})\n`;
      csv += `Department,${emp.department || 'N/A'}\n`;
      csv += `Designation,${emp.designation || 'N/A'}\n`;
      csv += `Phone,${emp.phone || 'N/A'}\n`;
      csv += `Period,${startDate} to ${endDate}\n`;
      csv += `Monthly Salary,Rs ${emp.salary || 12000}\n`;
      csv += `TA Rate,Rs ${summary.taRate || 2.5} / km\n`;
      csv += `DA Rate,Rs ${summary.daRate || 0} / day\n\n`;

      csv += `--- SUMMARY TOTALS ---\n`;
      csv += `Days Present,${summary.daysPresent || 0}\n`;
      csv += `Total Work Hours Logged,${summary.totalWorkHours || 0} hrs\n`;
      csv += `Total Distance (km),${summary.totalKm}\n`;
      csv += `Total Travel Pay (TA),Rs ${summary.travelPay}\n`;
      csv += `Total Meetings,${summary.totalMeetings}\n`;
      csv += `Total Expenses Claimed,Rs ${summary.totalExpenses}\n`;
      csv += `Approved Expenses,Rs ${summary.approvedExpenses || 0}\n`;
      csv += `Total Tasks,${summary.totalTasks}\n`;
      csv += `Total Leads,${summary.totalLeads}\n\n`;

      // Attendance Table in CSV
      if (attendances.length > 0) {
        csv += `--- ATTENDANCE & WORKING HOURS LOG ---\n`;
        csv += `Date,Day,Status,Punch In,Punch Out,Work Hours,Distance Traveled (km)\n`;
        attendances.forEach((a) => {
          const dayName = new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' });
          const checkInTime = a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
          const checkOutTime = a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (a.status === 'present' ? 'In Progress' : 'N/A');
          csv += `"${a.date}","${dayName}","${a.status?.toUpperCase() || 'PRESENT'}","${checkInTime}","${checkOutTime}","${a.totalWorkHours || 0} hrs","${a.totalDistanceTraveled || 0} km"\n`;
        });
        csv += `\n`;
      }

      // Daily Distance Table in CSV
      csv += `--- DAILY CONSOLIDATED DISTANCE & TRAVEL ALLOWANCE ---\n`;
      csv += `Date,Day,Sessions,Total Distance (km),TA Rate (Rs/km),Daily Travel Pay (Rs),Start Address,End Address\n`;
      daily.forEach((d) => {
        const dayName = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });
        csv += `"${d.date}","${dayName}",${d.sessionsCount},"${d.totalDistance}","${summary.taRate || 2.5}","${d.travelPay}","${(d.startAddress || '').replace(/"/g, '""')}","${(d.endAddress || '').replace(/"/g, '""')}"\n`;
      });
      csv += `\n`;

      if (reportData.meetings?.length > 0) {
        csv += `--- MEETINGS & CLIENT VISITS ---\n`;
        csv += `Date,Client Name,Store / Company,Phone,Status,Deal Value,Meeting Notes\n`;
        reportData.meetings.forEach((m) => {
          csv += `"${new Date(m.date).toLocaleDateString()}","${m.clientName || ''}","${m.companyName || ''}","${m.mobileNumber || ''}","${m.status || ''}","Rs ${m.dealAmount || 0}","${(m.meetingNotes || m.purpose || '').replace(/"/g, '""')}"\n`;
        });
        csv += `\n`;
      }

      if (reportData.expenses?.length > 0) {
        csv += `--- EXPENSE CLAIMS ---\n`;
        csv += `Date,Category,Amount,Status,Description\n`;
        reportData.expenses.forEach((e) => {
          csv += `"${new Date(e.date).toLocaleDateString()}","${e.category}","Rs ${e.amount}","${e.status}","${(e.description || '').replace(/"/g, '""')}"\n`;
        });
        csv += `\n`;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `Report_${emp.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV / Excel report exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV');
    }
  };

  // ─── Export to PDF (Clean Multi-Page AutoTable Format) ───────────────────────
  const handleExport = () => {
    if (!reportData) return;

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const emp = reportData.employee;
      const summary = reportData.summary;
      const daily = reportData.dailyDistances || [];
      const attendances = reportData.attendances || [];

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 595.28, 70, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('KISANCONNECT FIELD TELEMETRY & OPERATIONS', 40, 30);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`CONSOLIDATED ACTIVITY & AUDIT REPORT   |   PERIOD: ${startDate} to ${endDate}`, 40, 48);

      // Employee Information Block
      const empTableData = [
        ['Employee Name', emp.name, 'Department', emp.department || 'Field Services'],
        ['Employee ID', emp.employeeId || '-', 'Designation', emp.designation || 'Field Executive'],
        ['Contact Phone', emp.phone || '-', 'Allocated Area', emp.allocatedArea || 'General Zone'],
        ['Base Salary', `Rs. ${emp.salary || 12000} / mo`, 'TA Rate', `Rs. ${summary.taRate || 2.5} / km`],
      ];

      // @ts-ignore
      doc.autoTable({
        startY: 85,
        head: [['Profile Attribute', 'Detail', 'Operations Attribute', 'Detail']],
        body: empTableData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        margin: { left: 40, right: 40 },
      });

      let y = doc.previousAutoTable.finalY + 12;

      // Executive Summary KPI Table
      const summaryTableData = [
        ['Attendance Days Present', `${summary.daysPresent || 0} Days (${summary.totalWorkHours || 0} hrs)`, 'Total Traveled Distance', `${summary.totalKm.toFixed(2)} km (Rs. ${summary.travelPay} TA)`],
        ['Client Meetings / Visits', `${summary.totalMeetings} (${summary.completedMeetings || 0} Done)`, 'Expense Claims', `Rs. ${summary.totalExpenses} (Rs. ${summary.approvedExpenses || 0} Approved)`],
        ['Assigned Tasks', `${summary.totalTasks} Tasks`, 'New Leads Captured', `${summary.totalLeads} Leads`],
      ];

      // @ts-ignore
      doc.autoTable({
        startY: y,
        head: [['Key Operations Metric', 'Result', 'Activity Metric', 'Result']],
        body: summaryTableData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        margin: { left: 40, right: 40 },
      });

      y = doc.previousAutoTable.finalY + 18;

      // 1. Attendance & Punch Log Table
      if (attendances.length > 0 && (reportType === 'All' || reportType === 'Attendance')) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('1. Daily Attendance & Working Hours Log', 40, y);

        const attendanceRows = attendances.map((a) => {
          const checkInTime = a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
          const checkOutTime = a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (a.status === 'present' ? 'In Progress' : 'N/A');
          return [
            a.date,
            new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' }),
            a.status?.toUpperCase() || 'PRESENT',
            checkInTime,
            checkOutTime,
            `${a.totalWorkHours || 0} hrs`,
            `${(a.totalDistanceTraveled || 0).toFixed(1)} km`,
          ];
        });

        // @ts-ignore
        doc.autoTable({
          startY: y + 6,
          head: [['Date', 'Day', 'Status', 'Punch In', 'Punch Out', 'Work Hours', 'Traveled Km']],
          body: attendanceRows,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
          headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' },
          margin: { left: 40, right: 40 },
        });

        y = doc.previousAutoTable.finalY + 18;
      }

      // 2. Consolidated Daily Distance Table
      if (daily.length > 0 && (reportType === 'All' || reportType === 'Distance')) {
        if (y > 680) {
          doc.addPage();
          y = 40;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('2. Consolidated Daily Distance & Travel Allowance (TA)', 40, y);

        const distanceRows = daily.map((d) => [
          d.date,
          new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
          `${d.sessionsCount} Session(s)`,
          `${d.totalDistance.toFixed(2)} km`,
          `Rs. ${summary.taRate || 2.5}/km`,
          `Rs. ${d.travelPay.toFixed(2)}`,
          d.startAddress ? d.startAddress.substring(0, 30) : '-',
        ]);

        // @ts-ignore
        doc.autoTable({
          startY: y + 6,
          head: [['Date', 'Day', 'Sessions', 'Total Distance', 'Rate', 'Travel Pay', 'Start Location']],
          body: distanceRows,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
          headStyles: { fillColor: [14, 116, 144], textColor: 255, fontStyle: 'bold' },
          margin: { left: 40, right: 40 },
        });

        y = doc.previousAutoTable.finalY + 18;
      }

      // 3. Client Meetings Table
      if (reportData.meetings?.length > 0 && (reportType === 'All' || reportType === 'Meetings')) {
        if (y > 680) {
          doc.addPage();
          y = 40;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('3. Client Meetings & Visits Log', 40, y);

        const meetingRows = reportData.meetings.map((m) => [
          new Date(m.date).toLocaleDateString(),
          m.clientName || 'Client',
          m.companyName || '-',
          m.mobileNumber || '-',
          `Rs. ${m.dealAmount || 0}`,
          m.status || 'scheduled',
          (m.meetingNotes || m.purpose || '').slice(0, 40),
        ]);

        // @ts-ignore
        doc.autoTable({
          startY: y + 6,
          head: [['Date', 'Client', 'Store/Company', 'Phone', 'Deal Value', 'Status', 'Notes']],
          body: meetingRows,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
          headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
          margin: { left: 40, right: 40 },
        });

        y = doc.previousAutoTable.finalY + 18;
      }

      // 4. Expense Claims Table
      if (reportData.expenses?.length > 0 && (reportType === 'All' || reportType === 'Expenses')) {
        if (y > 680) {
          doc.addPage();
          y = 40;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('4. Expense Claims & Reimbursements', 40, y);

        const expenseRows = reportData.expenses.map((e) => [
          new Date(e.date).toLocaleDateString(),
          e.category?.toUpperCase() || 'MISC',
          `Rs. ${e.amount}`,
          e.status?.toUpperCase() || 'PENDING',
          (e.description || '-').slice(0, 50),
        ]);

        // @ts-ignore
        doc.autoTable({
          startY: y + 6,
          head: [['Date', 'Category', 'Amount', 'Status', 'Description']],
          body: expenseRows,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
          headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
          margin: { left: 40, right: 40 },
        });

        y = doc.previousAutoTable.finalY + 18;
      }

      // 5. Sign-off Footer block
      if (y > 680) {
        doc.addPage();
        y = 50;
      }
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Official Document Generated by KisanConnect Telemetry on ${new Date().toLocaleString()}`, 40, y + 25);
      doc.text('Authorized Employee Signature: _______________________      Manager Approval: _______________________', 40, y + 50);

      const filename = `Report_${emp.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.pdf`;
      doc.save(filename);
      toast.success('PDF report exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('PDF Export failed');
    }
  };

  const dailyTimeline = reportData ? buildDailyTimeline() : [];

  return (
    <KisanConnectLayout>
      {/* ── Print Stylesheet Optimization ── */}
      <style>
        {`
          @media print {
            body {
              background: #ffffff !important;
              color: #0f172a !important;
              font-size: 11px !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print, header, aside, .print\\:hidden {
              display: none !important;
            }
            .print-avoid-break {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .print-page-break {
              page-break-before: always !important;
              break-before: page !important;
            }
            .print-border {
              border: 1px solid #cbd5e1 !important;
            }
          }
        `}
      </style>

      <div className="space-y-6 max-w-[1600px] mx-auto pb-12 print:p-0 print:m-0 print:max-w-none">
        
        {/* ── Top Header & Export Toolbar (Hidden on Print) ── */}
        <div className="no-print print:hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Executive Data Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Unified Activity, Attendance & Distance Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Consolidated daily distance audit, geofenced attendance hours, travel allowance (TA), client visits, and expense settlements.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport}
              disabled={!reportData}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={!reportData}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel / CSV</span>
            </button>

            <button
              onClick={handleExportJPEG}
              disabled={!reportData}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>JPEG Snapshot</span>
            </button>

            <button
              onClick={() => window.print()}
              disabled={!reportData}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* ── Filter & Generation Control Panel (Hidden on Print) ── */}
        <div className="no-print print:hidden bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              Report Configuration & Date Range Filters
            </h3>

            {/* Quick Date Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Quick Presets:</span>
              {[
                { label: 'Today', key: 'today' },
                { label: 'Yesterday', key: 'yesterday' },
                { label: 'Last 7 Days', key: '7days' },
                { label: 'This Month', key: 'thisMonth' },
                { label: 'Last Month', key: 'lastMonth' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleQuickDatePreset(p.key)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-bold transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* 1. Report Focus Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Report View Focus
              </label>
              <select
                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="All">Unified (All Operations Data)</option>
                <option value="Attendance">Attendance & Punch Hours</option>
                <option value="Distance">Distance Details & TA Pay</option>
                <option value="Meetings">Meetings & Client Visits Log</option>
                <option value="Expenses">Expense Claims & Settlements</option>
                <option value="Tasks">Tasks & Work Orders</option>
                <option value="Leads">Leads & Customer Pipeline</option>
                <option value="DA">Daily Allowance (DA) History</option>
              </select>
            </div>

            {/* 2. Select Employee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Field Executive
              </label>
              <select
                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
              >
                <option value="">Choose Field Employee...</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} ({e.employeeId || 'ID N/A'}) • {e.department || 'General'}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* 4. End Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* 5. Generate Button */}
            <div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/25 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing DB...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Empty State Hero Card (When No Report Generated Yet) ── */}
        {!reportData && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
              <FileText className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-black text-slate-900">Build a Field Staff Report</h3>
              <p className="text-xs text-slate-500 font-medium">
                Choose an employee and a date range from the panel above, then click <strong className="text-blue-600">Generate Report</strong> to inspect consolidated distance, attendance hours, meetings, expenses, and TA/DA totals.
              </p>
            </div>

            {employees.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>Generate Report for {employees.find((e) => e._id === selectedEmp)?.name || 'Selected Staff'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Printable Report Document Container ── */}
        {reportData && (
          <div
            ref={printableReportRef}
            className="space-y-6 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* ── Print-Only Official Document Header ── */}
            <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    KISANCONNECT FIELD TELEMETRY & OPERATIONS
                  </h1>
                  <p className="text-xs font-bold text-slate-600">
                    Official Executive Activity, Attendance & Distance Audit Report
                  </p>
                </div>
                <div className="text-right text-xs font-semibold text-slate-700">
                  <div>Audit Period: <strong className="text-slate-900">{startDate} to {endDate}</strong></div>
                  <div>Printed On: <strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
                </div>
              </div>
            </div>

            {/* ── Employee Profile & Remuneration Card ── */}
            <div className="print-avoid-break bg-slate-50/70 print:bg-white rounded-3xl p-6 border border-slate-200/90 print:border-slate-300 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div className="flex items-center gap-3.5">
                  <Avatar
                    src={reportData.employee.avatar}
                    name={reportData.employee.name}
                    size="lg"
                  />
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{reportData.employee.name}</span>
                      <span className="no-print print:hidden text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Active Field Staff
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold print:border print:border-blue-200">
                        {reportData.employee.employeeId || 'EMP-N/A'}
                      </span>
                      <span>•</span>
                      <span>{reportData.employee.department || 'Field Operations'}</span>
                      <span>•</span>
                      <span>{reportData.employee.designation || 'Field Executive'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-600 bg-white print:bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
                    Period: <strong>{startDate} to {endDate}</strong>
                  </span>
                </div>
              </div>

              {/* Remuneration & Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-1">
                <div className="bg-white print:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Phone / Mobile
                  </span>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600 print:hidden" />
                    <span>{reportData.employee.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-white print:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Allocated Area
                  </span>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 print:hidden" />
                    <span className="capitalize">{reportData.employee.allocatedArea || 'Assigned Zone'}</span>
                  </div>
                </div>

                <div className="bg-white print:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Base Salary
                  </span>
                  <div className="text-xs font-black text-slate-900">
                    ₹{(reportData.employee.salary || 12000).toLocaleString()}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">/ mo</span>
                  </div>
                </div>

                <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200/80">
                  <span className="text-[10px] font-black uppercase text-blue-700 block mb-1">
                    Travel Rate (TA)
                  </span>
                  <div className="text-xs font-black text-blue-900">
                    ₹{reportData.summary.taRate || 2.5}{' '}
                    <span className="text-[10px] text-blue-600 font-bold">/ km</span>
                  </div>
                </div>

                <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80">
                  <span className="text-[10px] font-black uppercase text-emerald-700 block mb-1">
                    Daily Allowance (DA)
                  </span>
                  <div className="text-xs font-black text-emerald-900">
                    ₹{reportData.summary.daRate || 0}{' '}
                    <span className="text-[10px] text-emerald-600 font-bold">/ day</span>
                  </div>
                </div>

                <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-200/80">
                  <span className="text-[10px] font-black uppercase text-indigo-700 block mb-1">
                    Net TA Payout
                  </span>
                  <div className="text-xs font-black text-indigo-900">
                    ₹{reportData.summary.travelPay}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 6 Core KPI Metric Cards (Includes Attendance) ── */}
            <div className="print-avoid-break grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              
              {/* 1. Attendance & Working Hours */}
              <div className="bg-white p-4.5 rounded-3xl border border-emerald-200/80 shadow-xs space-y-1 bg-gradient-to-b from-emerald-50/30 to-white">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    {reportData.summary.totalWorkHours || 0} hrs
                  </span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 pt-1">
                  {reportData.summary.daysPresent || 0}{' '}
                  <span className="text-xs text-slate-400 font-bold">Days</span>
                </h4>
                <p className="text-xs font-bold text-slate-600">Attendance Present</p>
                <span className="text-[10px] text-slate-400 block font-medium truncate">
                  {reportData.summary.halfDays ? `${reportData.summary.halfDays} Half-day • ` : ''}
                  {reportData.attendances?.length || 0} punch records
                </span>
              </div>

              {/* 2. Distance */}
              <div className="bg-white p-4.5 rounded-3xl border border-blue-200/80 shadow-xs space-y-1 bg-gradient-to-b from-blue-50/30 to-white">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                    ₹{reportData.summary.travelPay} TA
                  </span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 pt-1">
                  {reportData.summary.totalKm.toFixed(1)}{' '}
                  <span className="text-xs text-slate-400 font-bold">km</span>
                </h4>
                <p className="text-xs font-bold text-slate-600">Total Distance</p>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {reportData.dailyDistances?.length || 0} active days
                </span>
              </div>

              {/* 3. Meetings */}
              <div className="bg-white p-4.5 rounded-3xl border border-purple-200/80 shadow-xs space-y-1 bg-gradient-to-b from-purple-50/30 to-white">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                    {reportData.summary.completedMeetings || 0} Done
                  </span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 pt-1">
                  {reportData.summary.totalMeetings}
                </h4>
                <p className="text-xs font-bold text-slate-600">Client Visits</p>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Client & store visits
                </span>
              </div>

              {/* 4. Expenses */}
              <div className="bg-white p-4.5 rounded-3xl border border-amber-200/80 shadow-xs space-y-1 bg-gradient-to-b from-amber-50/30 to-white">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    ₹{reportData.summary.approvedExpenses || 0} Appr.
                  </span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 pt-1">
                  ₹{reportData.summary.totalExpenses}
                </h4>
                <p className="text-xs font-bold text-slate-600">Expenses Claimed</p>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Fuel, meals, stays
                </span>
              </div>

              {/* 5. Tasks */}
              <div className="bg-white p-4.5 rounded-3xl border border-indigo-200/80 shadow-xs space-y-1 bg-gradient-to-b from-indigo-50/30 to-white">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                    {reportData.summary.completedTasks || 0} Closed
                  </span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 pt-1">
                  {reportData.summary.totalTasks}
                </h4>
                <p className="text-xs font-bold text-slate-600">Assigned Tasks</p>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Field assignments
                </span>
              </div>

              {/* 6. Leads */}
              <div className="bg-white p-4.5 rounded-3xl border border-rose-200/80 shadow-xs space-y-1 bg-gradient-to-b from-rose-50/30 to-white">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                    Pipeline
                  </span>
                </div>
                <h4 className="text-2xl font-black text-slate-900 pt-1">
                  {reportData.summary.totalLeads}
                </h4>
                <p className="text-xs font-bold text-slate-600">Leads Captured</p>
                <span className="text-[10px] text-slate-400 block font-medium">
                  New client prospects
                </span>
              </div>
            </div>

            {/* ── View Switcher Toolbar (Screen Only) ── */}
            <div className="no-print print:hidden flex items-center justify-between border-y border-slate-100 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-1">Layout Style:</span>
                <button
                  type="button"
                  onClick={() => setViewLayout('unified')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    viewLayout === 'unified'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Day-by-Day Unified Timeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('categorized')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    viewLayout === 'categorized'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Categorized Tables</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 font-semibold">
                Showing <strong>{dailyTimeline.length} active dates</strong> in range
              </div>
            </div>

            {/* ── UNIQUE LAYOUT: DAY-BY-DAY UNIFIED ACTIVITY TIMELINE ── */}
            {viewLayout === 'unified' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>Daily Operations Chronological Timeline ({dailyTimeline.length} Days)</span>
                  </h3>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
                    Unified Date-Range View
                  </span>
                </div>

                {dailyTimeline.length > 0 ? (
                  <div className="space-y-3.5">
                    {dailyTimeline.map((item) => {
                      const dateObj = new Date(item.date);
                      const formattedDate = dateObj.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      const isExpanded = expandedDates[item.date];

                      const att = item.attendance;
                      const dist = item.distance;
                      const meets = item.meetings || [];
                      const exps = item.expenses || [];
                      const tsks = item.tasks || [];
                      const lds = item.leads || [];

                      const checkInStr = att?.checkIn
                        ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : null;
                      const checkOutStr = att?.checkOut
                        ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : att?.status === 'present'
                        ? 'Shift in progress'
                        : null;

                      return (
                        <div
                          key={item.date}
                          className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all overflow-hidden"
                        >
                          {/* Day Header Row */}
                          <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-700 flex flex-col items-center justify-center font-black leading-none shrink-0">
                                <span className="text-[10px] uppercase font-bold text-blue-500">
                                  {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className="text-sm font-black text-slate-900 mt-0.5">
                                  {dateObj.getDate()}
                                </span>
                              </div>

                              <div>
                                <h4 className="text-sm font-black text-slate-900">{formattedDate}</h4>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  {/* Attendance Badge */}
                                  {att ? (
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                        att.status === 'present'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : att.status === 'half-day'
                                          ? 'bg-amber-100 text-amber-800'
                                          : att.status === 'leave'
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      <CalendarCheck className="w-3 h-3" />
                                      <span>
                                        {att.status || 'Present'} {checkInStr ? `(${checkInStr} - ${checkOutStr || 'Active'})` : ''}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                                      No Punch Recorded
                                    </span>
                                  )}

                                  {att?.totalWorkHours > 0 && (
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                      ⏱️ {att.totalWorkHours} hrs
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Daily Operations Quick Metrics Pills */}
                            <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
                              {/* Distance */}
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 border border-blue-200/70 text-blue-800">
                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                <span>{dist?.totalDistance ? `${dist.totalDistance.toFixed(1)} km` : '0 km'}</span>
                                {dist?.travelPay > 0 && (
                                  <span className="text-[10px] text-blue-600 font-semibold">(₹{dist.travelPay} TA)</span>
                                )}
                              </div>

                              {/* Meetings */}
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/80 border border-purple-200/70 text-purple-800">
                                <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                                <span>{meets.length} Visits</span>
                              </div>

                              {/* Expenses */}
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-800">
                                <Receipt className="w-3.5 h-3.5 text-amber-600" />
                                <span>₹{exps.reduce((acc, e) => acc + (Number(e.amount) || 0), 0)} Claims</span>
                              </div>

                              {/* Tasks & Leads */}
                              {(tsks.length > 0 || lds.length > 0) && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                                  <span>{tsks.length} Tasks</span>
                                  <span>•</span>
                                  <span>{lds.length} Leads</span>
                                </div>
                              )}

                              {/* Expand / Collapse Button */}
                              <button
                                type="button"
                                onClick={() => toggleDateExpansion(item.date)}
                                className="no-print print:hidden ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                              >
                                <span>{isExpanded ? 'Hide' : 'Details'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Day Details Breakdown */}
                          {isExpanded && (
                            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/40 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Attendance & Check In Card */}
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Attendance & Punch Log</span>
                                  </h5>
                                  {att ? (
                                    <div className="text-xs space-y-1.5 text-slate-700 font-semibold">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Punch In:</span>
                                        <strong className="text-slate-900">{checkInStr || 'N/A'}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Punch Out:</span>
                                        <strong className="text-slate-900">{checkOutStr || 'N/A'}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Total Hours:</span>
                                        <strong className="text-emerald-700">{att.totalWorkHours ? `${att.totalWorkHours} hrs` : '—'}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Status:</span>
                                        <span className="uppercase text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                          {att.status || 'Present'}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">No attendance punch recorded for this date.</p>
                                  )}
                                </div>

                                {/* Distance & Sessions Card */}
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Distance Traveled ({dist?.sessionsCount || 0} Sessions)</span>
                                  </h5>
                                  {dist ? (
                                    <div className="text-xs space-y-1.5 text-slate-700 font-semibold">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Total Distance:</span>
                                        <strong className="text-blue-600">{dist.totalDistance.toFixed(2)} km</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Travel Pay (TA):</span>
                                        <strong className="text-emerald-700">₹{dist.travelPay.toFixed(2)}</strong>
                                      </div>
                                      <div className="text-[11px] text-slate-500 truncate pt-1">
                                        <span className="text-slate-400">Start:</span> {dist.startAddress || '—'}
                                      </div>
                                      <div className="text-[11px] text-slate-500 truncate">
                                        <span className="text-slate-400">End:</span> {dist.endAddress || '—'}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">No distance tracking data recorded for this date.</p>
                                  )}
                                </div>
                              </div>

                              {/* Meetings Log on this Day */}
                              {meets.length > 0 && (
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
                                  <h5 className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    <span>Client Visits & Meetings ({meets.length})</span>
                                  </h5>
                                  <div className="divide-y divide-slate-100 text-xs">
                                    {meets.map((m) => (
                                      <div key={m._id} className="py-2 flex items-center justify-between gap-3">
                                        <div>
                                          <span className="font-bold text-slate-900">{m.clientName || 'Client'}</span>
                                          <span className="text-slate-400 text-[11px] ml-2">({m.companyName || 'Store'})</span>
                                          <p className="text-[11px] text-slate-500 truncate">{m.meetingNotes || m.purpose || 'Meeting completed'}</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-purple-50 text-purple-700 shrink-0">
                                          {m.status || 'Done'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Expenses Log on this Day */}
                              {exps.length > 0 && (
                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
                                  <h5 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                                    <Receipt className="w-3.5 h-3.5" />
                                    <span>Expense Claims on this Day ({exps.length})</span>
                                  </h5>
                                  <div className="divide-y divide-slate-100 text-xs">
                                    {exps.map((e) => (
                                      <div key={e._id} className="py-2 flex items-center justify-between gap-3">
                                        <div>
                                          <span className="font-bold uppercase text-slate-800">{e.category}</span>
                                          <p className="text-[11px] text-slate-500">{e.description || 'Expense reimbursement'}</p>
                                        </div>
                                        <div className="text-right">
                                          <span className="font-black text-slate-900 block">₹{e.amount}</span>
                                          <span className="text-[9px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                            {e.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs font-bold">
                    No field operations recorded for the selected date range.
                  </div>
                )}
              </div>
            )}

            {/* ── 1. ATTENDANCE & WORKING HOURS SECTION (CATEGORIZED TABLE) ── */}
            {(reportType === 'All' || reportType === 'Attendance' || viewLayout === 'categorized') && (
              <div className="print-avoid-break bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-0">
                <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <CalendarCheck className="w-5 h-5 text-emerald-600" />
                      <span>Daily Attendance, Working Hours & Punch Log</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Verified punch in/out timestamps, total daily shift hours, and geofence verification.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                      Present: <strong>{reportData.summary.daysPresent || 0} Days</strong> ({reportData.summary.totalWorkHours || 0} Total Hours)
                    </span>
                  </div>
                </div>

                {reportData.attendances && reportData.attendances.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 min-w-[120px]">Date & Day</th>
                          <th className="py-3 px-4 min-w-[100px]">Status</th>
                          <th className="py-3 px-4 min-w-[110px]">Punch In Time</th>
                          <th className="py-3 px-4 min-w-[110px]">Punch Out Time</th>
                          <th className="py-3 px-4 min-w-[110px]">Total Work Hours</th>
                          <th className="py-3 px-4 min-w-[110px]">Traveled Km</th>
                          <th className="py-3 px-4 text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {reportData.attendances.map((a) => {
                          const dateObj = new Date(a.date);
                          const formattedDate = dateObj.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          });
                          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                          const checkInStr = a.checkIn
                            ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '—';
                          const checkOutStr = a.checkOut
                            ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : a.status === 'present'
                            ? 'In Progress'
                            : '—';

                          return (
                            <tr key={a._id || a.date} className="hover:bg-slate-50/80 transition">
                              {/* Date & Day */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="font-bold text-slate-900">{formattedDate}</div>
                                <div className="text-[11px] text-slate-400 font-medium">{dayName}</div>
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                    a.status === 'present'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : a.status === 'half-day'
                                      ? 'bg-amber-100 text-amber-800'
                                      : a.status === 'leave'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {a.status === 'present' && <Check className="w-3 h-3" />}
                                  <span>{a.status || 'Present'}</span>
                                </span>
                              </td>

                              {/* Punch In */}
                              <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                                {checkInStr}
                              </td>

                              {/* Punch Out */}
                              <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                                {checkOutStr}
                              </td>

                              {/* Work Hours */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold">
                                  {a.totalWorkHours ? `${a.totalWorkHours} hrs` : '—'}
                                </span>
                              </td>

                              {/* Traveled Distance */}
                              <td className="py-3.5 px-4 whitespace-nowrap font-bold text-blue-700">
                                {(a.totalDistanceTraveled || 0).toFixed(1)} km
                              </td>

                              {/* Verification Badge */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                  <Shield className="w-3 h-3 text-emerald-600" />
                                  <span>Geofence Verified</span>
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                        <tr>
                          <td className="py-3.5 px-4" colSpan="2">
                            Total Attendance ({reportData.summary.daysPresent || 0} Present Days)
                          </td>
                          <td className="py-3.5 px-4" colSpan="2">
                            —
                          </td>
                          <td className="py-3.5 px-4 text-emerald-700">
                            {reportData.summary.totalWorkHours || 0} hrs Total
                          </td>
                          <td className="py-3.5 px-4 text-blue-700" colSpan="2">
                            {reportData.summary.totalKm.toFixed(1)} km Total
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold">
                    No attendance punch records found for this period.
                  </div>
                )}
              </div>
            )}

            {/* ── 2. CONSOLIDATED DAILY DISTANCE SECTION (COMBINED BY DATE) ── */}
            {(reportType === 'All' || reportType === 'Distance' || viewLayout === 'categorized') && (
              <div className="print-avoid-break bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-0">
                <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span>Consolidated Daily Distance & Travel Allowance (TA)</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      All tracking sessions on each date are combined into a single total km entry with TA rate calculation.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                      Total: <strong>{reportData.summary.totalKm.toFixed(2)} km</strong> (₹{reportData.summary.travelPay})
                    </span>
                  </div>
                </div>

                {reportData.dailyDistances && reportData.dailyDistances.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 min-w-[120px]">Date & Day</th>
                          <th className="py-3 px-4 min-w-[90px]">Sessions</th>
                          <th className="py-3 px-4 min-w-[110px]">Daily Total Distance</th>
                          <th className="py-3 px-4 min-w-[80px]">TA Rate</th>
                          <th className="py-3 px-4 min-w-[110px]">Calculated Travel Pay</th>
                          <th className="py-3 px-4 min-w-[140px]">Start Location</th>
                          <th className="py-3 px-4 min-w-[140px]">End Location</th>
                          <th className="py-3 px-4 text-right no-print print:hidden">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {reportData.dailyDistances.map((d) => {
                          const dateObj = new Date(d.date);
                          const formattedDate = dateObj.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          });
                          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                          const isExpanded = expandedDates[d.date];

                          return (
                            <React.Fragment key={d.date}>
                              <tr className="hover:bg-slate-50/80 transition">
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="font-bold text-slate-900">{formattedDate}</div>
                                  <div className="text-[11px] text-slate-400 font-medium">{dayName}</div>
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] print:border print:border-blue-200">
                                    <Layers className="w-3 h-3 print:hidden" />
                                    <span>{d.sessionsCount} Session{d.sessionsCount > 1 ? 's' : ''}</span>
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="text-base font-black text-slate-900">
                                    {d.totalDistance.toFixed(2)}{' '}
                                    <span className="text-xs text-slate-500 font-bold">km</span>
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-500">
                                  ₹{reportData.summary.taRate || 2.5}/km
                                </td>

                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg print:border print:border-emerald-200">
                                    ₹{d.travelPay.toFixed(2)}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 max-w-[180px] truncate text-slate-600" title={d.startAddress}>
                                  {d.startAddress || '—'}
                                </td>

                                <td className="py-3.5 px-4 max-w-[180px] truncate text-slate-600" title={d.endAddress}>
                                  {d.endAddress || '—'}
                                </td>

                                <td className="py-3.5 px-4 text-right no-print print:hidden">
                                  <button
                                    type="button"
                                    onClick={() => toggleDateExpansion(d.date)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                                  >
                                    <span>{isExpanded ? 'Hide' : 'Sessions'}</span>
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </td>
                              </tr>

                              {/* Expanded Individual Sessions Breakdown */}
                              {isExpanded && (
                                <tr className="no-print print:hidden">
                                  <td colSpan="8" className="bg-slate-50 p-4 border-y border-slate-200">
                                    <div className="space-y-2.5 max-w-4xl mx-auto">
                                      <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                                        Individual Session Log for {formattedDate} ({d.sessionsCount} Sessions)
                                      </h5>

                                      <div className="grid grid-cols-1 gap-2">
                                        {d.sessions.map((sess, idx) => {
                                          const startTimeStr = sess.startTime
                                            ? new Date(sess.startTime).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                              })
                                            : 'N/A';
                                          const endTimeStr = sess.endTime
                                            ? new Date(sess.endTime).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                              })
                                            : sess.isActive
                                            ? 'Currently Active'
                                            : 'Completed';

                                          return (
                                            <div
                                              key={sess._id || idx}
                                              className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                            >
                                              <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-[10px] flex items-center justify-center shrink-0">
                                                  {idx + 1}
                                                </span>
                                                <div>
                                                  <span className="font-bold text-slate-800">
                                                    {startTimeStr} → {endTimeStr}
                                                  </span>
                                                  <p className="text-[11px] text-slate-400 font-medium">
                                                    {sess.startAddress || 'Start location'} →{' '}
                                                    {sess.endAddress || 'End location'}
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="text-right font-bold text-slate-900 shrink-0">
                                                <span className="text-blue-600 font-black">
                                                  {sess.distance} km
                                                </span>{' '}
                                                •{' '}
                                                <span className="text-emerald-700">
                                                  ₹{(sess.distance * (reportData.summary.taRate || 2.5)).toFixed(2)}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                        <tr>
                          <td className="py-3.5 px-4" colSpan="2">
                            Total Traveled ({reportData.dailyDistances.length} Active Days)
                          </td>
                          <td className="py-3.5 px-4 text-base text-blue-600">
                            {reportData.summary.totalKm.toFixed(2)} km
                          </td>
                          <td className="py-3.5 px-4">—</td>
                          <td className="py-3.5 px-4 text-base text-emerald-700">
                            ₹{reportData.summary.travelPay}
                          </td>
                          <td className="py-3.5 px-4" colSpan="3">
                            <span className="text-xs text-slate-500 font-semibold">
                              Total TA calculated at ₹{reportData.summary.taRate || 2.5}/km
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold">
                    No distance telemetry recorded for this period.
                  </div>
                )}
              </div>
            )}

            {/* ── 3. CLIENT MEETINGS & VISITS SECTION ── */}
            {(reportType === 'All' || reportType === 'Meetings' || viewLayout === 'categorized') && (
              <div className="print-avoid-break bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-0">
                <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                      <span>Client Meetings & Field Visits Log</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Client discussions, shop check-ins, store locations, and deal status.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
                    {reportData.meetings?.length || 0} Total Meetings
                  </span>
                </div>

                {reportData.meetings && reportData.meetings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Client / Store</th>
                          <th className="py-3 px-4">Phone</th>
                          <th className="py-3 px-4">Address / Location</th>
                          <th className="py-3 px-4">Deal Value</th>
                          <th className="py-3 px-4">Notes / Purpose</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {reportData.meetings.map((m) => (
                          <tr key={m._id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                              {new Date(m.date).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 block">{m.clientName || 'Client'}</span>
                              <span className="text-[11px] text-slate-400 block">{m.companyName || 'Store'}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                              {m.mobileNumber || '—'}
                            </td>
                            <td className="py-3.5 px-4 max-w-[200px] truncate" title={m.meetingAddress}>
                              {m.meetingAddress || '—'}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 whitespace-nowrap">
                              {m.dealAmount > 0 ? `₹${m.dealAmount.toLocaleString()}` : '—'}
                            </td>
                            <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600" title={m.meetingNotes || m.purpose}>
                              {m.meetingNotes || m.purpose || '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  m.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : m.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {m.status || 'Scheduled'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold">
                    No client meetings found for this period.
                  </div>
                )}
              </div>
            )}

            {/* ── 4. EXPENSE CLAIMS SECTION ── */}
            {(reportType === 'All' || reportType === 'Expenses' || viewLayout === 'categorized') && (
              <div className="print-avoid-break bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-0">
                <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-emerald-600" />
                      <span>Expense Claims & Reimbursements</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Itemized travel, meal, fuel, and hotel reimbursement requests.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    Total: ₹{reportData.summary.totalExpenses}
                  </span>
                </div>

                {reportData.expenses && reportData.expenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4 no-print print:hidden">Receipts</th>
                          <th className="py-3 px-4 text-right">Approval Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {reportData.expenses.map((e) => (
                          <tr key={e._id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                              {new Date(e.date).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4 uppercase font-bold text-slate-800">
                              {e.category}
                            </td>
                            <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap">
                              ₹{e.amount}
                            </td>
                            <td className="py-3.5 px-4 max-w-[250px] truncate text-slate-600">
                              {e.description || '—'}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap no-print print:hidden">
                              {e.receipts?.length > 0 ? (
                                <a
                                  href={e.receipts[0]}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Receipt</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 font-normal">No receipt</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  e.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : e.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {e.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold">
                    No expense claims filed for this period.
                  </div>
                )}
              </div>
            )}

            {/* ── 5. TASKS & LEADS GRID ── */}
            {(reportType === 'All' || reportType === 'Tasks' || reportType === 'Leads' || viewLayout === 'categorized') && (
              <div className="print-avoid-break grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks Section */}
                {(reportType === 'All' || reportType === 'Tasks' || viewLayout === 'categorized') && (
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-600" />
                        <span>Tasks & Field Work Orders ({reportData.tasks?.length || 0})</span>
                      </h4>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                      {reportData.tasks?.length > 0 ? (
                        reportData.tasks.map((t) => (
                          <div key={t._id} className="p-4 hover:bg-slate-50/80 transition space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-bold text-slate-900 text-xs">{t.title}</h5>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  t.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {t.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
                              {t.description || 'No description provided.'}
                            </p>
                            <div className="text-[10px] text-slate-400 font-semibold pt-1 flex items-center gap-3">
                              <span>Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</span>
                              <span>Priority: <strong className="uppercase text-slate-700">{t.priority || 'Medium'}</strong></span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-xs font-bold">
                          No tasks recorded in this timeframe.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Leads Section */}
                {(reportType === 'All' || reportType === 'Leads' || viewLayout === 'categorized') && (
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Target className="w-4 h-4 text-rose-600" />
                        <span>Customer Leads & Pipeline ({reportData.leads?.length || 0})</span>
                      </h4>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                      {reportData.leads?.length > 0 ? (
                        reportData.leads.map((l) => (
                          <div key={l._id} className="p-4 hover:bg-slate-50/80 transition space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-bold text-slate-900 text-xs">{l.name}</h5>
                                <span className="text-[11px] font-mono text-slate-500">{l.contactNo || l.phone || 'No phone'}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                                {l.status || 'New'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Address: {l.address || '—'}
                            </p>
                            {l.feedback && (
                              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                "{l.feedback}"
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-xs font-bold">
                          No leads generated in this timeframe.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Official Print Authorization Block ── */}
            <div className="hidden print:block pt-8 mt-6 border-t-2 border-slate-300 print-avoid-break">
              <div className="grid grid-cols-3 gap-6 text-xs text-slate-600">
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900">Employee Signature</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">I verify that all recorded visits & claims are accurate.</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-900">Supervisor / Manager Verification</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Checked & Approved for Reimbursement</p>
                </div>
                <div className="border-t border-slate-400 pt-2 text-right">
                  <p className="font-bold text-slate-900">Official Company Seal</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">KisanConnect Operations Audit</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </KisanConnectLayout>
  );
}
