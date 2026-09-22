import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BedDouble, Users, Building, ShieldCheck, User, Calendar, Phone, Mail } from 'lucide-react';

export const MyRoomPage = () => {
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyRoom = async () => {
      try {
        setLoading(true);
        const res = await api.get('/allocations/my');
        if (res.data.success && res.data.hasAllocation) {
          setAllocation(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load room details.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyRoom();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Fetching allocated room details...</p>
      </div>
    );
  }

  if (!allocation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
        <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">No Active Room Allocation</h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          You are currently not assigned to any room in the AMRT Accommodation System. 
          Please consult the Chief Warden administration desk for semester room allotment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Hostel Residence Details</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official room assignment, block specifications, and assigned roommates.
        </p>
      </div>

      {/* Main Room Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                Block {allocation.block} • Floor {allocation.floor}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                Active Tenancy
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tight mt-3">
              Room {allocation.room_number}
            </h2>
            <p className="text-xs text-blue-200 mt-1">
              Configuration: <strong className="text-white">{allocation.room_type}</strong> ({allocation.capacity} Bed Capacity)
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right min-w-[180px]">
            <span className="text-[10px] font-bold uppercase text-blue-300 block">Monthly Hostel Rent</span>
            <span className="text-2xl font-black text-white block mt-0.5">
              ₹{parseFloat(allocation.rent).toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-300 mt-1 block flex items-center justify-end gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Maintenance Included
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Allocation ID</span>
            <span className="font-mono font-bold text-white mt-0.5 block">#ALC-{allocation.allocation_id}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Allotment Date</span>
            <span className="font-semibold text-white mt-0.5 block">{new Date(allocation.allocation_date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Check-in Date</span>
            <span className="font-semibold text-white mt-0.5 block">{new Date(allocation.check_in_date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Occupancy Load</span>
            <span className="font-bold text-white mt-0.5 block">{allocation.occupied} / {allocation.capacity} Beds</span>
          </div>
        </div>
      </div>

      {/* Roommates Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Room Occupants / Roommates</span>
        </h3>

        {!allocation.roommates || allocation.roommates.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">
            You currently have no roommates in this room (Single occupancy or vacant beds).
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allocation.roommates.map((rm) => (
              <div key={rm.student_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {rm.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900">{rm.name}</p>
                  <p className="text-[11px] text-slate-500">{rm.course} • Year {rm.year}</p>
                  <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {rm.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoomPage;
