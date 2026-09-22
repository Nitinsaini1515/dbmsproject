import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  BedDouble, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  CreditCard, 
  ArrowRight,
  TrendingUp,
  Building,
  KeyRound,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics from MySQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Computing live MySQL aggregate metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Database Error
        </h3>
        <p className="text-xs mt-1">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              Administration Center
            </span>
            <span className="text-xs text-slate-400">AMRT Hostel Complex</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1">
            Hostel Operations & Inventory Overview
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time telemetry and database aggregations executing against local MySQL server.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh SQL</span>
          </button>
          <Link
            to="/allocations"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Allocate Student</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.total_students}</span>
            <span className="text-xs font-medium text-slate-500">registered</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-blue-600 font-semibold">{stats?.active_allocations}</span> actively residing in hostel
          </p>
        </div>

        {/* Room Inventory */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Room Capacity</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.occupied_beds}</span>
            <span className="text-xs font-medium text-slate-500">/ {stats?.total_capacity} beds</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{stats?.available_beds} beds</span> open for allocation
          </p>
        </div>

        {/* Available vs Full Rooms */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Room Statuses</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{stats?.available_rooms}</span>
            <span className="text-xs font-medium text-slate-500">Available</span>
            <span className="text-slate-300">|</span>
            <span className="text-xl font-bold text-rose-600">{stats?.full_rooms}</span>
            <span className="text-xs font-medium text-slate-500">Full</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Total {stats?.total_rooms} rooms across Blocks A, B, C
          </p>
        </div>

        {/* Unpaid / Pending Fees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Dues</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">₹{parseFloat(stats?.total_pending_amount || 0).toLocaleString()}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {stats?.pending_payments} invoices pending or overdue
          </p>
        </div>
      </div>

      {/* Block Breakdown & Complaints Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block-wise Occupancy (DBMS GROUP BY demonstration) */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>Hostel Blocks (SQL Group By)</span>
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Occupancy</span>
            </div>

            <div className="mt-4 space-y-4">
              {stats?.block_stats?.map((block) => (
                <div key={block.block} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Block {block.block}</span>
                    <span className="font-semibold text-slate-600">
                      {block.occupied_beds} / {block.total_capacity} beds ({block.occupancy_rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        block.occupancy_rate >= 80 ? 'bg-rose-500' : block.occupancy_rate >= 50 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, block.occupancy_rate || 0)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{block.total_rooms} rooms</span>
                    <span>Avg Rent: ₹{parseFloat(block.avg_rent).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Manage all rooms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Complaints Feed */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Recent Maintenance Complaints</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {stats?.pending_complaints} Pending
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {stats?.recent_complaints?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No maintenance complaints logged.</p>
              ) : (
                stats?.recent_complaints?.map((comp) => (
                  <div key={comp.complaint_id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{comp.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {comp.student_name} • Room <span className="font-semibold text-slate-700">{comp.room_number}</span> • {new Date(comp.complaint_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                      comp.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : comp.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Track and resolve student grievances</span>
            <Link
              to="/complaints"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Complaints Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
