import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { 
  CreditCard, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Database,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isProcModalOpen, setIsProcModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [procOutput, setProcOutput] = useState(null);

  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Add Form
  const [addForm, setAddForm] = useState({
    student_id: '',
    amount: '6000',
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    payment_status: 'Pending',
    payment_method: 'Pending'
  });

  // Pay Form
  const [payForm, setPayForm] = useState({
    payment_method: 'UPI',
    payment_date: new Date().toISOString().slice(0, 10),
    transaction_id: ''
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/payments', { params });
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to fetch payments.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, search]);

  const handleOpenAddModal = async () => {
    try {
      const res = await api.get('/students');
      setStudentsList(res.data.data || []);
      setAddForm({
        student_id: res.data.data?.[0]?.student_id || '',
        amount: '6000',
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        payment_status: 'Pending',
        payment_method: 'Pending'
      });
      setIsAddModalOpen(true);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to load students.' });
    }
  };

  const handleOpenPayModal = (payment) => {
    setSelectedPayment(payment);
    setPayForm({
      payment_method: 'UPI',
      payment_date: new Date().toISOString().slice(0, 10),
      transaction_id: `TXN_${Date.now().toString().slice(-6)}`
    });
    setIsPayModalOpen(true);
  };

  const handleOpenProcModal = async (studentId, studentName) => {
    try {
      setModalLoading(true);
      setIsProcModalOpen(true);
      const res = await api.get(`/payments/student/${studentId}`);
      if (res.data.success) {
        setProcOutput({
          studentName,
          ...res.data
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to run stored procedure.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post('/payments', addForm);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Payment invoice recorded in MySQL!' });
        setIsAddModalOpen(false);
        fetchPayments();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to record payment.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.put(`/payments/${selectedPayment.payment_id}`, {
        payment_status: 'Paid',
        payment_method: payForm.payment_method,
        payment_date: payForm.payment_date,
        transaction_id: payForm.transaction_id
      });
      if (res.data.success) {
        setFeedback({ type: 'success', message: `Invoice marked as Paid! Txn ID: ${res.data.transaction_id}` });
        setIsPayModalOpen(false);
        fetchPayments();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update payment.' });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hostel Fee & Payment Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student room rent invoicing, payment reconciliation, and stored procedure execution.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Invoice</span>
        </button>
      </div>

      {/* Global Feedback */}
      {feedback.message && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
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
            placeholder="Search by student, email, or transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="text-[11px] text-blue-600 hover:underline px-2 py-1 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading fee payment ledger...
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No payment records found</p>
            <p className="text-xs text-slate-400 mt-1">Use the "Record New Invoice" button to generate a payment request.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Method / Transaction ID</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">
                      #INV-{p.payment_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900">{p.student_name}</div>
                      <div className="text-[10px] text-slate-500">
                        {p.room_number ? `Room ${p.room_number}` : 'No Room'} • {p.student_phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      ₹{parseFloat(p.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(p.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.payment_status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.payment_status === 'Overdue'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {p.transaction_id ? (
                        <div>
                          <span className="text-slate-800 font-semibold">{p.payment_method}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs">{p.transaction_id}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {p.payment_status !== 'Paid' && (
                        <button
                          onClick={() => handleOpenPayModal(p)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenProcModal(p.student_id, p.student_name)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
                        title="Execute Stored Procedure"
                      >
                        Run Stored Proc
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Issue New Fee Invoice">
        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Student *</label>
            <select
              required
              value={addForm.student_id}
              onChange={(e) => setAddForm({ ...addForm, student_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50"
            >
              <option value="">-- Choose Student --</option>
              {studentsList.map((stu) => (
                <option key={stu.student_id} value={stu.student_id}>
                  {stu.name} ({stu.course})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min="100"
                step="50"
                value={addForm.amount}
                onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={addForm.due_date}
                onChange={(e) => setAddForm({ ...addForm, due_date: e.target.value })}
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
              {modalLoading ? 'Saving...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title={`Reconcile Invoice #INV-${selectedPayment?.payment_id}`}>
        <form onSubmit={handlePaySubmit} className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-slate-600">Student: <strong className="text-slate-900">{selectedPayment?.student_name}</strong></p>
            <p className="text-slate-600 mt-1">Amount: <strong className="text-emerald-700 text-sm">₹{selectedPayment?.amount}</strong></p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Payment Method *</label>
            <select
              value={payForm.payment_method}
              onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50"
            >
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Cash">Cash (Warden Counter)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Payment Date *</label>
            <input
              type="date"
              required
              value={payForm.payment_date}
              onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Transaction / Reference ID</label>
            <input
              type="text"
              placeholder="e.g. TXN_UPI_8761234"
              value={payForm.transaction_id}
              onChange={(e) => setPayForm({ ...payForm, transaction_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              {modalLoading ? 'Updating...' : 'Confirm Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stored Procedure Live Output Modal */}
      <Modal isOpen={isProcModalOpen} onClose={() => setIsProcModalOpen(false)} title="MySQL Stored Procedure: GetStudentPaymentHistory" maxWidth="max-w-2xl">
        {modalLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Executing CALL GetStudentPaymentHistory(?) in MySQL...
          </div>
        ) : procOutput ? (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900">
              <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                <span>SQL: CALL GetStudentPaymentHistory({procOutput.student_id});</span>
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px]">Active Procedure</span>
              </div>
              <p className="mt-1 text-xs text-indigo-800">
                Returns 2 result sets: (1) All ledger invoices, (2) Calculated financial aggregations.
              </p>
            </div>

            {/* Aggregated Summary from Procedure Query 2 */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Invoices</span>
                <span className="text-base font-extrabold text-slate-900">{procOutput.summary?.total_invoices}</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl text-center">
                <span className="text-[10px] text-emerald-600 font-bold uppercase block">Total Paid</span>
                <span className="text-base font-extrabold text-emerald-700">₹{parseFloat(procOutput.summary?.total_paid || 0).toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl text-center">
                <span className="text-[10px] text-amber-600 font-bold uppercase block">Pending Dues</span>
                <span className="text-base font-extrabold text-amber-700">₹{parseFloat(procOutput.summary?.total_pending || 0).toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl text-center">
                <span className="text-[10px] text-rose-600 font-bold uppercase block">Overdue Count</span>
                <span className="text-base font-extrabold text-rose-700">{procOutput.summary?.overdue_count}</span>
              </div>
            </div>

            {/* Invoices List from Procedure Query 1 */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Ledger Records ({procOutput.count}):</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3">Invoice</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Due Date</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Transaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {procOutput.data?.map((item) => (
                      <tr key={item.payment_id}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-600">#INV-{item.payment_id}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">₹{parseFloat(item.amount).toLocaleString()}</td>
                        <td className="py-2 px-3 text-slate-600">{new Date(item.due_date).toLocaleDateString()}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            item.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.payment_status}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                          {item.transaction_id || '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsProcModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close Output
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default PaymentsPage;
