import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  BedDouble, 
  CheckCircle, 
  XCircle,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';

export const StudentsPage = () => {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterAllocated, setFilterAllocated] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'student123',
    phone: '',
    gender: 'Male',
    course: 'B.Tech CSE',
    year: '1',
    address: '',
    guardian_name: '',
    guardian_phone: ''
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterCourse) params.course = filterCourse;
      if (filterYear) params.year = filterYear;
      if (filterAllocated) params.allocated = filterAllocated;

      const res = await api.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to load students.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, filterCourse, filterYear, filterAllocated]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: 'student123',
      phone: '',
      gender: 'Male',
      course: 'B.Tech CSE',
      year: '1',
      address: '',
      guardian_name: '',
      guardian_phone: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (stu) => {
    setSelectedStudent(stu);
    setFormData({
      name: stu.name,
      email: stu.email,
      phone: stu.phone,
      gender: stu.gender,
      course: stu.course,
      year: stu.year.toString(),
      address: stu.address,
      guardian_name: stu.guardian_name,
      guardian_phone: stu.guardian_phone
    });
    setIsEditModalOpen(true);
  };

  const handleOpenViewModal = (stu) => {
    setSelectedStudent(stu);
    setIsViewModalOpen(true);
  };

  const handleOpenDeleteModal = (stu) => {
    setSelectedStudent(stu);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Student and login user account created in MySQL!' });
        setIsAddModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to create student.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.put(`/students/${selectedStudent.student_id}`, formData);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Student details updated successfully!' });
        setIsEditModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update student.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.delete(`/students/${selectedStudent.student_id}`);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Student deleted from MySQL.' });
        setIsDeleteModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete student.' });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Students Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered students, academic profile details, and current room allocations in MySQL.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Global Feedback */}
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
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, email, phone, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="">All Courses</option>
            <option value="B.Tech CSE">B.Tech CSE</option>
            <option value="B.Tech IT">B.Tech IT</option>
            <option value="B.Tech ECE">B.Tech ECE</option>
            <option value="B.Tech Mech">B.Tech Mech</option>
            <option value="B.Tech Civil">B.Tech Civil</option>
            <option value="MCA">MCA</option>
            <option value="MBA">MBA</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          <select
            value={filterAllocated}
            onChange={(e) => setFilterAllocated(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="">All Allocation States</option>
            <option value="true">Allocated Room</option>
            <option value="false">Unallocated</option>
          </select>

          {(search || filterCourse || filterYear || filterAllocated) && (
            <button
              onClick={() => { setSearch(''); setFilterCourse(''); setFilterYear(''); setFilterAllocated(''); }}
              className="text-[11px] text-blue-600 hover:underline px-2 py-1 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading student records...
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No students found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or register a new student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course & Year</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Allocated Room</th>
                  <th className="py-3 px-4">Guardian</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => (
                  <tr key={stu.student_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {stu.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{stu.name}</p>
                          <p className="text-[10px] text-slate-400">{stu.gender} • STU-{stu.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{stu.course}</p>
                      <p className="text-[10px] text-slate-500">Year {stu.year}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="flex items-center gap-1 text-[11px]"><Mail className="w-3 h-3 text-slate-400" /> {stu.email}</p>
                      <p className="flex items-center gap-1 text-[11px] mt-0.5"><Phone className="w-3 h-3 text-slate-400" /> {stu.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      {stu.room_number ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <BedDouble className="w-3 h-3" />
                          <span>Room {stu.room_number} (Block {stu.block})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          Unallocated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      <p className="font-medium text-slate-700">{stu.guardian_name}</p>
                      <p className="text-slate-400">{stu.guardian_phone}</p>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenViewModal(stu)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(stu)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(stu)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Student Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Student Profile: ${selectedStudent?.name}`}>
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedStudent.name}</h4>
                <p className="text-slate-500">{selectedStudent.course} • Year {selectedStudent.year} • Gender: {selectedStudent.gender}</p>
                <p className="text-[11px] text-blue-600 font-medium">Student ID: STU-00{selectedStudent.student_id} (User ID #{selectedStudent.user_id})</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Accommodation Status</span>
                {selectedStudent.room_number ? (
                  <p className="font-bold text-emerald-700">Room {selectedStudent.room_number} (Block {selectedStudent.block}, Floor {selectedStudent.floor})</p>
                ) : (
                  <p className="font-bold text-slate-500">Not Currently Allocated</p>
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contact Email</span>
                <p className="font-semibold text-slate-800">{selectedStudent.email}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Student Phone</span>
                <p className="font-semibold text-slate-800">{selectedStudent.phone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Parent / Guardian</span>
                <p className="font-semibold text-slate-800">{selectedStudent.guardian_name} ({selectedStudent.guardian_phone})</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Permanent Residential Address</span>
              <p className="text-slate-700">{selectedStudent.address}</p>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Student & Login Account">
        <form onSubmit={handleAddSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Student Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Institutional Email *</label>
              <input
                type="email"
                required
                placeholder="name@amrt.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Initial Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Course *</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="B.Tech CSE">B.Tech CSE</option>
                <option value="B.Tech IT">B.Tech IT</option>
                <option value="B.Tech ECE">B.Tech ECE</option>
                <option value="B.Tech Mech">B.Tech Mech</option>
                <option value="B.Tech Civil">B.Tech Civil</option>
                <option value="MCA">MCA</option>
                <option value="MBA">MBA</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Year of Study *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Guardian Name *</label>
              <input
                type="text"
                required
                placeholder="Parent Name"
                value={formData.guardian_name}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Guardian Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 94480..."
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Address</label>
              <input
                type="text"
                placeholder="Permanent Home Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              {modalLoading ? 'Creating...' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Student: ${selectedStudent?.name}`}>
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Course *</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="B.Tech CSE">B.Tech CSE</option>
                <option value="B.Tech IT">B.Tech IT</option>
                <option value="B.Tech ECE">B.Tech ECE</option>
                <option value="B.Tech Mech">B.Tech Mech</option>
                <option value="B.Tech Civil">B.Tech Civil</option>
                <option value="MCA">MCA</option>
                <option value="MBA">MBA</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Year of Study *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Guardian Name *</label>
              <input
                type="text"
                required
                value={formData.guardian_name}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Guardian Phone *</label>
              <input
                type="tel"
                required
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
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
              {modalLoading ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Student Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Student: ${selectedStudent?.name}`}
        message={`Are you sure you want to delete ${selectedStudent?.name}? This will remove both the student record and login account from MySQL. Student must not have an active room allocation.`}
        confirmText="Delete Student"
        loading={modalLoading}
      />
    </div>
  );
};

export default StudentsPage;
