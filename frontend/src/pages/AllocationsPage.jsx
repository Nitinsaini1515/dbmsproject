import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { 
  KeyRound, 
  DoorOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Building, 
  User, 
  Database,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const AllocationsPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('active'); // 'active' (via View) or 'all'
  const [statusFilter, setStatusFilter] = useState('');

  // Allocate Modal
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [allocateForm, setAllocateForm] = useState({
    student_id: '',
    room_id: '',
    allocation_date: new Date().toISOString().slice(0, 10),
    check_in_date: new Date().toISOString().slice(0, 10),
  });

  // Vacate Modal
  const [isVacateModalOpen, setIsVacateModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [vacateDate, setVacateDate] = useState(new Date().toISOString().slice(0, 10));

  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      if (viewMode === 'active') {
        // Direct Query from MySQL DATABASE VIEW: active_allocations_view
        const res = await api.get('/allocations/active');
        if (res.data.success) {
          setAllocations(res.data.data);
        }
      } else {
        const res = await api.get('/allocations', {
          params: statusFilter ? { status: statusFilter } : {}
        });
        if (res.data.success) {
          setAllocations(res.data.data);
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to fetch allocations.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [viewMode, statusFilter]);

  const handleOpenAllocateModal = async () => {
    try {
      setModalLoading(true);
      // Fetch unallocated students
      const stuRes = await api.get('/students', { params: { allocated: 'false' } });
      // Fetch available rooms
      const roomRes = await api.get('/rooms/available');

      setStudentsList(stuRes.data.data || []);
      setAvailableRooms(roomRes.data.data || []);
      setAllocateForm({
        student_id: stuRes.data.data?.[0]?.student_id || '',
        room_id: roomRes.data.data?.[0]?.room_id || '',
        allocation_date: new Date().toISOString().slice(0, 10),
        check_in_date: new Date().toISOString().slice(0, 10),
      });
      setIsAllocateModalOpen(true);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load eligible students or available rooms.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post('/allocations', allocateForm);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: `${res.data.message} (MySQL Transaction committed successfully)`
        });
        setIsAllocateModalOpen(false);
        fetchAllocations();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Transaction aborted: Allocation failed.'
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenVacateModal = (alloc) => {
    setSelectedAllocation(alloc);
    setVacateDate(new Date().toISOString().slice(0, 10));
    setIsVacateModalOpen(true);
  };

  const handleVacateConfirm = async () => {
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.put(`/allocations/${selectedAllocation.allocation_id}/vacate`, {
        check_out_date: vacateDate
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: `${res.data.message} (MySQL Transaction: Occupancy decremented and room marked Available)`
        });
        setIsVacateModalOpen(false);
        fetchAllocations();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Transaction aborted: Vacate failed.'
      });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hostel Room Allocations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ACID transaction-based student bed assignment and check-out management.
          </p>
        </div>

        <button
          onClick={handleOpenAllocateModal}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition"
        >
          <KeyRound className="w-4 h-4" />
          <span>Allocate Student to Room</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback.message && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between shadow-xs ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="font-bold text-xs underline ml-3">Dismiss</button>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('active')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'active'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Active Allocations (active_allocations_view)</span>
          </button>

          <button
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Tenancies History</span>
          </button>
        </div>

        {viewMode === 'all' && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Vacated">Vacated</option>
            </select>
          </div>
        )}
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading room allocation records...
          </div>
        ) : allocations.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <KeyRound className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No allocations found</p>
            <p className="text-xs text-slate-400 mt-1">Use the "Allocate Student" button to assign a student to an available room.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Allocation ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Course & Phone</th>
                  <th className="py-3 px-4">Assigned Room</th>
                  <th className="py-3 px-4">Check-in Date</th>
                  <th className="py-3 px-4">Check-out Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map((alloc) => {
                  const isActive = (alloc.status === 'Active' || alloc.allocation_status === 'Active');
                  return (
                    <tr key={alloc.allocation_id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        #ALC-{alloc.allocation_id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900">{alloc.student_name}</div>
                        <div className="text-[10px] text-slate-400">{alloc.student_email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{alloc.course} (Yr {alloc.year})</div>
                        <div className="text-[11px] text-slate-500">{alloc.student_phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-blue-700 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-blue-500" />
                          <span>Room {alloc.room_number}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Block {alloc.block}, Floor {alloc.floor} • {alloc.room_type}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {new Date(alloc.check_in_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {alloc.check_out_date ? new Date(alloc.check_out_date).toLocaleDateString() : (
                          <span className="text-emerald-600 font-semibold italic text-[11px]">Currently Residing</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {isActive ? 'Active' : 'Vacated'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isActive && (
                          <button
                            onClick={() => handleOpenVacateModal(alloc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                          >
                            <DoorOpen className="w-3.5 h-3.5" />
                            <span>Vacate</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocate Student Modal */}
      <Modal isOpen={isAllocateModalOpen} onClose={() => setIsAllocateModalOpen(false)} title="Allocate Student to Room (ACID Transaction)">
        <form onSubmit={handleAllocateSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>MySQL Transaction Logic:</span>
            </p>
            <ul className="list-disc pl-4 text-[11px] space-y-0.5 text-blue-700">
              <li>Locks student & room rows for atomic update.</li>
              <li>Verifies student has no active allocation and room has available capacity.</li>
              <li>Inserts allocation record, increments occupancy by +1.</li>
              <li>If capacity is reached, automatically marks room status as 'Full'.</li>
            </ul>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Student *</label>
              {studentsList.length === 0 ? (
                <p className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                  All registered students are currently allocated. Register a new student first to allocate them!
                </p>
              ) : (
                <select
                  required
                  value={allocateForm.student_id}
                  onChange={(e) => setAllocateForm({ ...allocateForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- Choose Student --</option>
                  {studentsList.map((stu) => (
                    <option key={stu.student_id} value={stu.student_id}>
                      {stu.name} ({stu.course}, Yr {stu.year}) - ID #{stu.student_id}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Available Room *</label>
              {availableRooms.length === 0 ? (
                <p className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                  No rooms currently have available beds. Add a room or vacate an existing resident.
                </p>
              ) : (
                <select
                  required
                  value={allocateForm.room_id}
                  onChange={(e) => setAllocateForm({ ...allocateForm, room_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- Choose Room --</option>
                  {availableRooms.map((room) => (
                    <option key={room.room_id} value={room.room_id}>
                      Room {room.room_number} (Block {room.block}, Floor {room.floor}) - {room.room_type} [{room.available_beds} beds free / rent ₹{room.rent}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Allocation Date *</label>
                <input
                  type="date"
                  required
                  value={allocateForm.allocation_date}
                  onChange={(e) => setAllocateForm({ ...allocateForm, allocation_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Check-in Date *</label>
                <input
                  type="date"
                  required
                  value={allocateForm.check_in_date}
                  onChange={(e) => setAllocateForm({ ...allocateForm, check_in_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAllocateModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading || studentsList.length === 0 || availableRooms.length === 0}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50"
            >
              {modalLoading ? 'Executing Transaction...' : 'Confirm Allocation (COMMIT)'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Vacate Room Modal */}
      <Modal isOpen={isVacateModalOpen} onClose={() => setIsVacateModalOpen(false)} title="Vacate Room (ACID Transaction)">
        {selectedAllocation && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <p className="font-bold">Transaction Notice:</p>
              <p className="text-[11px] mt-0.5">
                Vacating student <strong>{selectedAllocation.student_name}</strong> from <strong>Room {selectedAllocation.room_number}</strong> will mark the allocation as Vacated, decrement room occupancy by -1, and revert the room status to 'Available' if it was previously Full.
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Check-out Date *</label>
              <input
                type="date"
                required
                value={vacateDate}
                onChange={(e) => setVacateDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsVacateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVacateConfirm}
                disabled={modalLoading}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                {modalLoading ? 'Executing Vacate...' : 'Confirm Vacate (COMMIT)'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllocationsPage;
