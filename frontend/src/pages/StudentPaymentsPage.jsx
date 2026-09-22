import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { CreditCard, CheckCircle2, AlertTriangle, Clock, Receipt, ShieldCheck } from 'lucide-react';

export const StudentPaymentsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [modalLoading, setModalLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/my');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to fetch payment history.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const handleOpenPay = (inv) => {
    setSelectedInvoice(inv);
    setPaymentMethod('UPI');
    setIsPayModalOpen(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const txnId = `TXN_${paymentMethod}_${Date.now().toString().slice(-8)}`;
      const res = await api.put(`/payments/${selectedInvoice.payment_id}`, {
        payment_status: 'Paid',
        payment_method: paymentMethod,
        payment_date: new Date().toISOString().slice(0, 10),
        transaction_id: txnId
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: `Fee payment successful! Generated Transaction ID: ${txnId}`
        });
        setIsPayModalOpen(false);
        fetchPaymentHistory();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Payment failed.' });
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Invoking GetStudentPaymentHistory stored procedure...</p>
      </div>
    );
  }

  const { summary, data: invoices } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hostel Fee Invoices & Receipts</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View your accommodation dues and pay semester hostel fees securely.
        </p>
      </div>

      {feedback.message && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between shadow-xs ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="font-bold text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Invoices</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{summary?.total_invoices || 0}</span>
          <span className="text-[11px] text-slate-500">issued records</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-emerald-600 block">Total Fees Paid</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            ₹{parseFloat(summary?.total_paid || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">settled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-600 block">Pending Balance</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            ₹{parseFloat(summary?.total_pending || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-amber-600 font-medium">due for payment</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-rose-600 block">Overdue Count</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{summary?.overdue_count || 0}</span>
          <span className="text-[11px] text-rose-500">passed due date</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Your Fee Payment Invoices</h3>
          <span className="text-[10px] text-slate-400 font-mono">Source: GetStudentPaymentHistory Stored Proc</span>
        </div>

        {!invoices || invoices.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No fee invoices currently on record for your student ID.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Info</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.payment_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">
                      #INV-{inv.payment_id}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      ₹{parseFloat(inv.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        inv.payment_status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inv.payment_status === 'Overdue'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {inv.payment_status === 'Paid' ? (
                        <div>
                          <span className="font-semibold text-slate-800">{inv.payment_method}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs">{inv.transaction_id}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unsettled</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {inv.payment_status !== 'Paid' ? (
                        <button
                          onClick={() => handleOpenPay(inv)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          Pay Online
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Receipt Cleared
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

      {/* Pay Online Modal */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Complete Hostel Fee Payment">
        <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-slate-700">Invoice: <strong>#INV-{selectedInvoice?.payment_id}</strong></p>
            <p className="text-xl font-black text-blue-900 mt-1">₹{parseFloat(selectedInvoice?.amount || 0).toLocaleString()}</p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Payment Gateway / Method</label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI', 'Net Banking', 'Card'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                    paymentMethod === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Simulated Instant Payment Gateway: Transaction will be recorded directly into MySQL database.</span>
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
              {modalLoading ? 'Processing...' : 'Authorize Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentPaymentsPage;
