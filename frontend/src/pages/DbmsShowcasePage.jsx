import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Database, 
  Code2, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  GitMerge, 
  Layers, 
  FileCode, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const DbmsShowcasePage = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchShowcaseData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/dashboard/dbms-demo');
      if (res.data.success) {
        setData(res.data.dbms_concepts);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load DBMS showcase data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcaseData();
  }, []);

  const tabs = [
    { id: 'view', label: '1. Database View', icon: Layers },
    { id: 'procedure', label: '2. Stored Procedure', icon: Code2 },
    { id: 'transaction', label: '3. ACID Transactions', icon: ShieldCheck },
    { id: 'queries', label: '4. Joins, Group By & Having', icon: GitMerge },
    { id: 'normalization', label: '5. Normalization (3NF)', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-indigo-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> College DBMS Project Viva Evaluation
            </span>
            <span className="text-xs text-indigo-200">MySQL 8.x Live Demonstrations</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1.5">
            DBMS Architecture, Relations & Query Proofs
          </h1>
          <p className="text-xs text-indigo-200 mt-1">
            Interactive viva demonstration panel showing Views, Stored Procedures, ACID Transactions, and Normalization.
          </p>
        </div>

        <button
          onClick={fetchShowcaseData}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-800/80 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold border border-indigo-600/40 transition self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-execute Queries</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Database View */}
      {activeTab === 'view' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">DBMS Requirement #1</span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">Database View: `active_allocations_view`</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              In college DBMS syllabus, a <strong>View</strong> is a virtual table based on the result-set of an SQL statement. 
              Our view joins the <code>allocations</code>, <code>students</code>, and <code>rooms</code> tables, automatically filtering for active tenancies so reports never need repetitive 3-way joins.
            </p>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
            <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">// DDL Definition in schema.sql</p>
            <pre className="text-blue-300">
{`CREATE OR REPLACE VIEW active_allocations_view AS
SELECT 
    a.allocation_id,
    a.student_id,
    s.name AS student_name,
    s.email AS student_email,
    s.course,
    r.room_number,
    r.block,
    r.floor,
    r.room_type,
    r.rent,
    a.allocation_date,
    a.check_in_date
FROM allocations a
INNER JOIN students s ON a.student_id = s.student_id
INNER JOIN rooms r ON a.room_id = r.room_id
WHERE a.status = 'Active';`}
            </pre>
          </div>

          <div>
            <h4 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Query Execution: <code>SELECT * FROM active_allocations_view LIMIT 5;</code></span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Alloc ID</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-3">Room</th>
                    <th className="py-2.5 px-3">Rent (₹)</th>
                    <th className="py-2.5 px-3">Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.database_view?.sample_data?.map((row) => (
                    <tr key={row.allocation_id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-600">#{row.allocation_id}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{row.student_name}</td>
                      <td className="py-2 px-3 text-slate-600">{row.course}</td>
                      <td className="py-2 px-3 font-extrabold text-blue-700">Room {row.room_number}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">₹{row.rent}</td>
                      <td className="py-2 px-3 text-slate-600">{new Date(row.check_in_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Stored Procedure */}
      {activeTab === 'procedure' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">DBMS Requirement #2</span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">Stored Procedure: `GetStudentPaymentHistory(p_student_id)`</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              A <strong>Stored Procedure</strong> encapsulates reusable procedural SQL code compiled and stored in the database catalog. 
              Our procedure takes an input parameter (<code>IN p_student_id INT</code>) and outputs two separate tabular streams: the complete payment history ledger and dynamic aggregate totals.
            </p>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
            <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">// Procedure Definition</p>
            <pre className="text-indigo-300">
{`CREATE PROCEDURE GetStudentPaymentHistory(IN p_student_id INT)
BEGIN
    -- Query 1: Individual Ledger Invoices
    SELECT payment_id, amount, payment_date, due_date, payment_status, transaction_id
    FROM payments WHERE student_id = p_student_id ORDER BY due_date DESC;

    -- Query 2: Aggregate Financial Summary
    SELECT 
        COUNT(*) AS total_invoices,
        COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END), 0) AS total_paid,
        COALESCE(SUM(CASE WHEN payment_status IN ('Pending', 'Overdue') THEN amount ELSE 0 END), 0) AS total_pending
    FROM payments WHERE student_id = p_student_id;
END;`}
            </pre>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <h4 className="font-bold text-xs text-indigo-950 flex items-center gap-1.5 mb-2">
              <Play className="w-3.5 h-3.5 text-indigo-600" />
              <span>Live Result: <code>CALL GetStudentPaymentHistory(1);</code></span>
            </h4>

            <div className="grid grid-cols-3 gap-3 my-3">
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Invoices</span>
                <span className="text-sm font-extrabold text-slate-900">{data?.stored_procedure?.summary?.total_invoices}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-emerald-600 font-bold uppercase block">Total Paid</span>
                <span className="text-sm font-extrabold text-emerald-700">₹{data?.stored_procedure?.summary?.total_paid}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                <span className="text-[10px] text-amber-600 font-bold uppercase block">Total Pending</span>
                <span className="text-sm font-extrabold text-amber-700">₹{data?.stored_procedure?.summary?.total_pending}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-indigo-100 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2 px-3">Invoice</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.stored_procedure?.payments?.map((p) => (
                    <tr key={p.payment_id}>
                      <td className="py-2 px-3 font-mono font-bold">#INV-{p.payment_id}</td>
                      <td className="py-2 px-3 font-bold">₹{p.amount}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-500">{p.transaction_id || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ACID Transactions */}
      {activeTab === 'transaction' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">DBMS Requirement #3</span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">ACID Transactions: Room Allocation & Vacate</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              A <strong>Transaction</strong> is a sequence of database operations treated as a single logical unit of work satisfying ACID properties (Atomicity, Consistency, Isolation, Durability). 
              If any step fails, MySQL executes a <code>ROLLBACK</code>, ensuring no student is assigned to a phantom bed or ghost room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Room Allocation Transaction Workflow:</span>
              </h4>
              <ol className="list-decimal pl-4 text-xs text-slate-600 space-y-1.5">
                <li><code>START TRANSACTION;</code></li>
                <li>Verify student exists and does not already have an active allocation (<code>FOR UPDATE</code>).</li>
                <li>Verify room exists, status is <code>'Available'</code>, and <code>occupied &lt; capacity</code>.</li>
                <li><code>INSERT INTO allocations (student_id, room_id, status) VALUES (..., 'Active');</code></li>
                <li><code>UPDATE rooms SET occupied = occupied + 1;</code></li>
                <li>If <code>occupied == capacity</code>, set <code>status = 'Full'</code>.</li>
                <li><code>COMMIT;</code> (or <code>ROLLBACK</code> on any error).</li>
              </ol>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Room Vacate Transaction Workflow:</span>
              </h4>
              <ol className="list-decimal pl-4 text-xs text-slate-600 space-y-1.5">
                <li><code>START TRANSACTION;</code></li>
                <li>Lock active allocation record with <code>FOR UPDATE</code>.</li>
                <li><code>UPDATE allocations SET status = 'Vacated', check_out_date = CURDATE();</code></li>
                <li><code>UPDATE rooms SET occupied = GREATEST(0, occupied - 1);</code></li>
                <li>If room was marked <code>'Full'</code>, revert status to <code>'Available'</code>.</li>
                <li><code>COMMIT;</code></li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Complex Queries */}
      {activeTab === 'queries' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-purple-600 tracking-wider">DBMS Requirement #4</span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">Aggregates, Group By, Having & Subqueries</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Demonstrates practical college viva queries showcasing <code>GROUP BY</code>, <code>HAVING</code>, aggregate functions (<code>SUM</code>, <code>AVG</code>, <code>COUNT</code>), and subqueries.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-800">Query 1: Group By & Having: Room Types Summary</h4>
            <div className="bg-slate-900 text-purple-300 p-3 rounded-lg font-mono text-[11px]">
{`SELECT room_type, COUNT(*) AS room_count, SUM(capacity) AS total_capacity, SUM(occupied) AS total_occupied, ROUND(AVG(rent), 2) AS average_rent
FROM rooms
GROUP BY room_type
HAVING room_count > 0;`}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2 px-3">Room Type</th>
                    <th className="py-2 px-3">Rooms Count</th>
                    <th className="py-2 px-3">Total Beds</th>
                    <th className="py-2 px-3">Occupied</th>
                    <th className="py-2 px-3">Avg Rent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.group_by_having?.data?.map((r) => (
                    <tr key={r.room_type}>
                      <td className="py-2 px-3 font-bold text-slate-800">{r.room_type}</td>
                      <td className="py-2 px-3">{r.room_count}</td>
                      <td className="py-2 px-3">{r.total_capacity}</td>
                      <td className="py-2 px-3">{r.total_occupied}</td>
                      <td className="py-2 px-3 font-semibold text-emerald-700">₹{r.average_rent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-800">Query 2: Subquery: Finding Unallocated Students</h4>
            <div className="bg-slate-900 text-blue-300 p-3 rounded-lg font-mono text-[11px]">
{`SELECT student_id, name, course, email 
FROM students 
WHERE student_id NOT IN (
    SELECT student_id FROM allocations WHERE status = 'Active'
);`}
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                Currently Unallocated Students ({data?.subquery?.unallocated_students?.length || 0}):
              </span>
              <div className="flex flex-wrap gap-2">
                {data?.subquery?.unallocated_students?.map((stu) => (
                  <span key={stu.student_id} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                    {stu.name} ({stu.course})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Normalization */}
      {activeTab === 'normalization' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">DBMS Theory & Practice</span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">Database Normalization: 1NF, 2NF, and 3NF Proof</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Our schema adheres strictly to **Third Normal Form (3NF)**:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">1. First Normal Form (1NF)</h3>
              <ul className="list-disc pl-4 text-slate-600 space-y-1">
                <li>All columns contain atomic, indivisible values.</li>
                <li>No repeating groups or multivalued attributes (e.g. phone numbers are atomic).</li>
                <li>Each table has a clearly defined Primary Key.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">2. Second Normal Form (2NF)</h3>
              <ul className="list-disc pl-4 text-slate-600 space-y-1">
                <li>Must satisfy 1NF.</li>
                <li>Zero Partial Dependencies: Every non-key attribute is fully functionally dependent on the entire primary key.</li>
                <li>Separate tables for <code>rooms</code>, <code>students</code>, and <code>allocations</code>.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">3. Third Normal Form (3NF)</h3>
              <ul className="list-disc pl-4 text-slate-600 space-y-1">
                <li>Must satisfy 2NF.</li>
                <li>Zero Transitive Dependencies: No non-key attribute depends on another non-key attribute.</li>
                <li>Auth credentials in <code>users</code> separated from academic details in <code>students</code>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DbmsShowcasePage;
