import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { 
  BedDouble, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  Building
} from 'lucide-react';

export const RoomsPage = () => {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form state
  const [formData, setFormData] = useState({
    room_number: '',
    block: 'A',
    floor: '1',
    room_type: 'Double',
    capacity: '2',
    rent: '6000',
    status: 'Available'
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterBlock) params.block = filterBlock;
      if (filterType) params.room_type = filterType;
      if (filterStatus) params.status = filterStatus;

      const res = await api.get('/rooms', { params });
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to load rooms.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [search, filterBlock, filterType, filterStatus]);

  const handleOpenAddModal = () => {
    setFormData({
      room_number: '',
      block: 'A',
      floor: '1',
      room_type: 'Double',
      capacity: '2',
      rent: '6000',
      status: 'Available'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setSelectedRoom(room);
    setFormData({
      room_number: room.room_number,
      block: room.block,
      floor: room.floor.toString(),
      room_type: room.room_type,
      capacity: room.capacity.toString(),
      rent: room.rent.toString(),
      status: room.status
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (room) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post('/rooms', formData);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Room created successfully in MySQL!' });
        setIsAddModalOpen(false);
        fetchRooms();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to create room.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.put(`/rooms/${selectedRoom.room_id}`, formData);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Room updated successfully in MySQL!' });
        setIsEditModalOpen(false);
        fetchRooms();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update room.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.delete(`/rooms/${selectedRoom.room_id}`);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Room deleted from MySQL database.' });
        setIsDeleteModalOpen(false);
        fetchRooms();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete room.' });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hostel Rooms Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage hostel room configurations, capacity bounds, and live occupancy status in MySQL.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        )}
      </div>

      {/* Global Feedback Banner */}
      {feedback.message && (
        <div className={`p-3 rounded-xl text-xs flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="font-bold text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search room number (e.g. A-101)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="">All Blocks</option>
            <option value="A">Block A</option>
            <option value="B">Block B</option>
            <option value="C">Block C</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Triple">Triple</option>
            <option value="Four-Sharing">Four-Sharing</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          {(search || filterBlock || filterType || filterStatus) && (
            <button
              onClick={() => { setSearch(''); setFilterBlock(''); setFilterType(''); setFilterStatus(''); }}
              className="text-[11px] text-blue-600 hover:underline px-2 py-1 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading room records...
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <BedDouble className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No rooms found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new room.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Room No.</th>
                  <th className="py-3 px-4">Block / Floor</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Occupancy</th>
                  <th className="py-3 px-4">Monthly Rent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Current Occupants</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => {
                  const isFull = room.occupied >= room.capacity;
                  return (
                    <tr key={room.room_id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-extrabold text-slate-900 flex items-center gap-1.5">
                        <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                        <span>{room.room_number}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        Block {room.block}, Floor {room.floor}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {room.room_type}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isFull ? 'text-rose-600' : 'text-slate-800'}`}>
                            {room.occupied} / {room.capacity}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({room.available_beds} free)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        ₹{parseFloat(room.rent).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          room.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : room.status === 'Full'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {room.current_occupants || <span className="text-slate-300 italic">None</span>}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(room)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Room"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(room)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Hostel Room">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Room Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. A-302"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Block *</label>
              <select
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Floor *</label>
              <input
                type="number"
                min="0"
                max="10"
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Room Type *</label>
              <select
                value={formData.room_type}
                onChange={(e) => {
                  const type = e.target.value;
                  const defaultCap = type === 'Single' ? '1' : type === 'Double' ? '2' : type === 'Triple' ? '3' : '4';
                  setFormData({ ...formData, room_type: type, capacity: defaultCap });
                }}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Four-Sharing">Four-Sharing</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Capacity (Beds) *</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Monthly Rent (₹) *</label>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={formData.rent}
                onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
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
              {modalLoading ? 'Saving...' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Room Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Room ${selectedRoom?.room_number}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Room Number *</label>
              <input
                type="text"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Block *</label>
              <select
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Floor *</label>
              <input
                type="number"
                min="0"
                max="10"
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Room Type *</label>
              <select
                value={formData.room_type}
                onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Four-Sharing">Four-Sharing</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Capacity (Occupied: {selectedRoom?.occupied}) *
              </label>
              <input
                type="number"
                min={selectedRoom?.occupied || 1}
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Monthly Rent (₹) *</label>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={formData.rent}
                onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Room Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="Available">Available</option>
                <option value="Full">Full</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {modalLoading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Room Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Room ${selectedRoom?.room_number}`}
        message={`Are you sure you want to delete Room ${selectedRoom?.room_number}? This operation will remove the room from MySQL. Occupancy must be 0.`}
        confirmText="Delete Room"
        loading={modalLoading}
      />
    </div>
  );
};

export default RoomsPage;
