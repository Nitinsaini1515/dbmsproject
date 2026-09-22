import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  AlertCircle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Building, 
  User,
  Wrench
} from 'lucide-react';

export const ComplaintsPage = () => {
  const { user, isAdmin } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Add Form
  const [addForm, setAddForm] = useState({
    title: '',
    description: '',
    complaint_date: new Date().toISOString().slice(0, 10)
  });

  // Resolve Form
  const [resolveStatus, setResolveStatus] = useState('In Progress');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/complaints', { params });
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to fetch complaints.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleOpenAddModal = () => {
    setAddForm({
      title: '',
      description: '',
      complaint_date: new Date().toISOString().slice(0, 10)
    });
    setIsAddModalOpen(true);
  };

  const handleOpenResolveModal = (comp) => {
    setSelectedComplaint(comp);
    setResolveStatus(comp.status === 'Pending' ? 'In Progress' : 'Resolved');
    setIsResolveModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post('/complaints', addForm);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Complaint submitted to warden maintenance desk!' });
        setIsAddModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to file complaint.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.put(`/complaints/${selectedComplaint.complaint_id}`, {
        status: resolveStatus,
        resolved_date: resolveStatus === 'Resolved' ? new Date().toISOString().slice(0, 10) : null
      });
      if (res.data.success) {
        setFeedback({ type: 'success', message: res.data.message });
        setIsResolveModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update complaint.' });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hostel Maintenance Grievances</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin 
              ? 'Review, investigate, and mark maintenance requests as In Progress or Resolved.'
              : 'Submit repair or maintenance issues concerning your allocated room.'}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>File Maintenance Complaint</span>
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

      {/* Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">Showing {complaints.length} tickets</span>
      </div>

      {/* Complaints List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading complaints data...
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No complaints registered</p>
            <p className="text-xs text-slate-400 mt-1">Everything looks smooth and fully operational.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject & Description</th>
                  <th className="py-3 px-4">Room / Block</th>
                  <th className="py-3 px-4">Logged By</th>
                  <th className="py-3 px-4">Date Filed</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((comp) => (
                  <tr key={comp.complaint_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      #CMP-{comp.complaint_id}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-extrabold text-slate-900">{comp.title}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{comp.description}</p>
                      {comp.resolved_date && (
                        <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                          Resolved on: {new Date(comp.resolved_date).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      Room {comp.room_number} ({comp.block})
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{comp.student_name}</div>
                      <div className="text-[10px] text-slate-400">{comp.student_email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {new Date(comp.complaint_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        comp.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : comp.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {comp.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenResolveModal(comp)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        >
                          Update Status
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File Complaint Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Submit Hostel Maintenance Ticket">
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Issue Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bathroom light flickering or Bed frame loose"
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Detailed Description *</label>
            <textarea
              rows="3"
              required
              placeholder="Please provide specific details so the maintenance technician can address it efficiently..."
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"
            ></textarea>
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
              {modalLoading ? 'Filing...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Resolve / Update Complaint Modal (Admin) */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title={`Update Ticket #CMP-${selectedComplaint?.complaint_id}`}>
        <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="font-bold text-slate-800">{selectedComplaint?.title}</p>
            <p className="text-slate-600 text-[11px] mt-1">{selectedComplaint?.description}</p>
            <p className="text-slate-500 text-[10px] mt-1">Logged by {selectedComplaint?.student_name} (Room {selectedComplaint?.room_number})</p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Update Status *</label>
            <select
              value={resolveStatus}
              onChange={(e) => setResolveStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-medium"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress (Assigned to Technician)</option>
              <option value="Resolved">Resolved (Work Completed)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsResolveModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {modalLoading ? 'Saving...' : 'Save Resolution Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplaintsPage;
