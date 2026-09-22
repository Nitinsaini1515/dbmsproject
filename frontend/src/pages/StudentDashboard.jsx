import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  BedDouble, 
  CreditCard, 
  AlertCircle, 
  CalendarCheck, 
  User, 
  Users, 
  Building, 
  ArrowRight,
  PlusCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard/student-stats');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch student details from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Loading your accommodation records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
        <h3 className="font-bold text-sm">Unable to load dashboard</h3>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  const { student, allocated_room, roommates, financials, recent_complaints, recent_attendance } = data || {};

  return (
    <div className="space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-800/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
            Student Portal
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1.5">
            Welcome back, {student?.name}!
          </h1>
          <p className="text-xs text-indigo-200 mt-1">
            {student?.course} • Year {student?.year} • ID: STU-00{student?.student_id}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/complaints"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>File Complaint</span>
          </Link>
          <Link
            to="/my-payments"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment History</span>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Allocated Room Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Allocated Room</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BedDouble className="w-4 h-4" />
              </div>
            </div>

            {allocated_room ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{allocated_room.room_number}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Block & Floor</span>
                    <span className="font-bold text-slate-800">Block {allocated_room.block}, Floor {allocated_room.floor}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Room Type</span>
                    <span className="font-bold text-slate-800">{allocated_room.room_type}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Check-in Date</span>
                    <span className="font-bold text-slate-800">{new Date(allocated_room.check_in_date).toLocaleDateString()}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Monthly Rent</span>
                    <span className="font-bold text-slate-800">₹{parseFloat(allocated_room.rent).toLocaleString()}</span>
                  </div>
                </div>

                {/* Roommates section */}
                {roommates && roommates.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Roommates ({roommates.length})
                    </span>
                    <div className="space-y-1">
                      {roommates.map(rm => (
                        <div key={rm.student_id} className="text-xs text-slate-700 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-medium">{rm.name}</span>
                          <span className="text-[10px] text-slate-400">({rm.course})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-500">No active room allocation currently assigned.</p>
                <p className="text-[11px] text-slate-400 mt-1">Please contact the hostel chief warden desk.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/my-room" className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              <span>View full room details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Financial Status Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Status</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Dues</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  ₹{parseFloat(financials?.total_pending || 0).toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid Fees:</span>
                  <span className="font-bold text-emerald-600">₹{parseFloat(financials?.total_paid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Invoices:</span>
                  <span className="font-semibold text-slate-700">{financials?.total_invoices || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Overdue Invoices:</span>
                  <span className={`font-bold ${financials?.overdue_count > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {financials?.overdue_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/my-payments" className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              <span>View ledger & receipts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Profile</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Email</span>
                <span className="font-semibold text-slate-800">{student?.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Mobile Phone</span>
                <span className="font-semibold text-slate-800">{student?.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Guardian Details</span>
                <span className="font-semibold text-slate-800">{student?.guardian_name} ({student?.guardian_phone})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Address</span>
                <span className="text-slate-600 truncate block">{student?.address}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Student Record
            </span>
          </div>
        </div>
      </div>

      {/* Complaints and Attendance sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>My Maintenance Complaints</span>
            </h3>
            <Link to="/complaints" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {!recent_complaints || recent_complaints.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No maintenance complaints filed.</p>
            ) : (
              recent_complaints.map(comp => (
                <div key={comp.complaint_id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{comp.title}</p>
                    <p className="text-[10px] text-slate-400">{new Date(comp.complaint_date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    comp.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {comp.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Recent Attendance Logs</span>
            </h3>
            <Link to="/attendance" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {!recent_attendance || recent_attendance.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent attendance records logged.</p>
            ) : (
              recent_attendance.map(att => (
                <div key={att.attendance_id} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{new Date(att.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span>In: <strong className="text-slate-700">{att.check_in || '--'}</strong></span>
                    <span>Out: <strong className="text-slate-700">{att.check_out || '--'}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
