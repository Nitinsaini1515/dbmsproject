import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { CalendarCheck, Plus, Calendar, Clock, CheckCircle2, User } from 'lucide-react';

export const AttendancePage = () => {
  const { user, isAdmin } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    student_id: '',
    date: new Date().toISOString().slice(0, 10),
    check_in: new Date().toTimeString().slice(0, 5),
    check_out: '08:30'
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter) params.date = dateFilter;

      const res = await api.get('/attendance', { params });
      if (res.data.success) {
        setAttendance(res.data.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to fetch attendance.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const handleOpenAddModal = async () => {
    if (isAdmin) {
      const res = await api.get('/students');
      setStudentsList(res.data.data || []);
    }
    setFormData({
      student_id: user?.student_id || '',
      date: new Date().toISOString().slice(0, 10),
      check_in: new Date().toTimeString().slice(0, 5),
      check_out: '08:30'
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post('/attendance', formData);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Hostel attendance stamped successfully in MySQL!' });
        setIsAddModalOpen(false);
        fetchAttendance();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to record attendance.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuickCheckIn = async () => {
    try {
      setModalLoading(true);
      const res = await api.post('/attendance', {
        student_id: user.student_id,
        date: new Date().toISOString().slice(0, 10),
        check_in: new Date().toTimeString().slice(0, 8)
      });
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Quick Check-in stamped for today!' });
        fetchAttendance();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to record quick check-in.' });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hostel In/Out Attendance Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily resident biometric / manual hostel curfew tracking and timestamp records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <button
              onClick={handleQuickCheckIn}
              disabled={modalLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark My Evening In</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Log Roll Call</span>
          </button>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between shadow-xs ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="font-bold text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Date Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-[11px] text-blue-600 underline font-semibold ml-2">
              Clear
            </button>
          )}
        </div>

        <span className="text-xs text-slate-400 font-medium">{attendance.length} roll call entries</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading attendance records...
          </div>
        ) : attendance.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <CalendarCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No attendance records found</p>
            <p className="text-xs text-slate-400 mt-1">Click "Log Roll Call" to stamp attendance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Hostel Room</th>
                  <th className="py-3 px-4">Curfew Check-in</th>
                  <th className="py-3 px-4">Morning Check-out</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((att) => (
                  <tr key={att.attendance_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      {new Date(att.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{att.student_name}</p>
                      <p className="text-[10px] text-slate-400">{att.student_email}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {att.room_number ? `Room ${att.room_number}` : '--'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {att.check_in ? (
                        <span className="font-bold text-slate-900">{att.check_in}</span>
                      ) : (
                        <span className="text-slate-400 italic">Not Checked In</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {att.check_out ? (
                        <span className="font-bold text-slate-900">{att.check_out}</span>
                      ) : (
                        <span className="text-slate-400 italic">Not Checked Out</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Present
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Attendance Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log Resident Hostel Attendance">
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          {isAdmin && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Student *</label>
              <select
                required
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-medium"
              >
                <option value="">-- Choose Student --</option>
                {studentsList.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.name} (Room {s.room_number || 'Unallocated'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Check-in Time (Curfew)</label>
              <input
                type="time"
                value={formData.check_in}
                onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Check-out Time (Morning)</label>
              <input
                type="time"
                value={formData.check_out}
                onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {modalLoading ? 'Saving...' : 'Record Attendance (UPSERT)'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
