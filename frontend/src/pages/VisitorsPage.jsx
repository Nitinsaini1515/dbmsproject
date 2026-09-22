import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { UserCheck, Plus, Clock, Search, Calendar, User, Phone, CheckCircle2 } from 'lucide-react';

export const VisitorsPage = () => {
  const { user, isAdmin } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    student_id: '',
    visitor_name: '',
    phone: '',
    relation: 'Parent',
    visit_date: new Date().toISOString().slice(0, 10),
    in_time: new Date().toTimeString().slice(0, 5),
    purpose: ''
  });

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter) params.date = dateFilter;

      const res = await api.get('/visitors', { params });
      if (res.data.success) {
        setVisitors(res.data.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to load visitors.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [dateFilter]);

  const handleOpenAddModal = async () => {
    if (isAdmin) {
      const res = await api.get('/students');
      setStudentsList(res.data.data || []);
    }
    setFormData({
      student_id: user?.student_id || '',
      visitor_name: '',
      phone: '',
      relation: 'Parent',
      visit_date: new Date().toISOString().slice(0, 10),
      in_time: new Date().toTimeString().slice(0, 5),
      purpose: ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post('/visitors', formData);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Visitor entry logged successfully into security register!' });
        setIsAddModalOpen(false);
        fetchVisitors();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to log visitor.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleMarkDeparture = async (visitorId) => {
    try {
      const res = await api.put(`/visitors/${visitorId}`, {});
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Visitor departure recorded in MySQL.' });
        fetchVisitors();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to record departure.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hostel Visitor Security Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log and monitor hostel guests, parent visits, and departure timestamps in MySQL.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Guest Visitor</span>
        </button>
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
          <span className="text-xs font-bold text-slate-700">Filter by Date:</span>
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

        <span className="text-xs text-slate-400 font-medium">{visitors.length} records</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading visitor logs...
          </div>
        ) : visitors.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No visitors found</p>
            <p className="text-xs text-slate-400 mt-1">Click "Log Guest Visitor" to register a visitor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Visitor Name</th>
                  <th className="py-3 px-4">Relation</th>
                  <th className="py-3 px-4">Visiting Resident</th>
                  <th className="py-3 px-4">Visit Date</th>
                  <th className="py-3 px-4">In / Out Timings</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4 text-right">Departure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.map((v) => (
                  <tr key={v.visitor_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <p className="font-extrabold text-slate-900">{v.visitor_name}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {v.phone}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {v.relation}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{v.student_name}</p>
                      <p className="text-[10px] text-blue-600 font-medium">Room {v.room_number || '--'}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(v.visit_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                      <div>In: <strong className="text-slate-900">{v.in_time}</strong></div>
                      <div>Out: {v.out_time ? <strong className="text-emerald-700">{v.out_time}</strong> : <span className="text-amber-600 italic">On Premises</span>}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {v.purpose}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!v.out_time ? (
                        <button
                          onClick={() => handleMarkDeparture(v.visitor_id)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition"
                        >
                          Record Departure
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Departed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Visitor Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log Campus Guest / Visitor">
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          {isAdmin && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Student Being Visited *</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Visitor Full Name *</label>
              <input
                type="text"
                required
                placeholder="Guest Name"
                value={formData.visitor_name}
                onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Relationship *</label>
              <select
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="Parent">Parent</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Local Guardian</option>
                <option value="Friend">Friend / Classmate</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Check-in Time *</label>
              <input
                type="time"
                required
                value={formData.in_time}
                onChange={(e) => setFormData({ ...formData, in_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Purpose of Visit *</label>
            <input
              type="text"
              required
              placeholder="e.g. Parental semester visit, delivering clothes..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50"
            />
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
              {modalLoading ? 'Logging...' : 'Log Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VisitorsPage;
