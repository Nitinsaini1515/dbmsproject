import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  KeyRound,
  CreditCard,
  AlertCircle,
  UserCheck,
  CalendarCheck,
  Database,
  LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/rooms', label: 'Rooms Management', icon: BedDouble },
    { to: '/students', label: 'Students Directory', icon: Users },
    { to: '/allocations', label: 'Room Allocations', icon: KeyRound },
    { to: '/payments', label: 'Fee Payments', icon: CreditCard },
    { to: '/complaints', label: 'Complaints Desk', icon: AlertCircle },
    { to: '/visitors', label: 'Visitor Logs', icon: UserCheck },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    // { to: '/dbms-showcase', label: 'DBMS Viva Showcase', icon: Database, highlight: true },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/my-room', label: 'My Room Details', icon: BedDouble },
    { to: '/my-payments', label: 'My Payments', icon: CreditCard },
    { to: '/complaints', label: 'File / View Complaints', icon: AlertCircle },
    { to: '/visitors', label: 'My Visitors', icon: UserCheck },
    { to: '/attendance', label: 'My Attendance', icon: CalendarCheck },
    // { to: '/dbms-showcase', label: 'DBMS Viva Showcase', icon: Database, highlight: true },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 bg-slate-950 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-sm leading-tight">AMRT HOSTEL</h1>
          <p className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">Accommodation System</p>
        </div>
      </div>

      {/* User Info Capsule */}
      <div className="px-4 py-4 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase ${isAdmin ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
              }`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                  : link.highlight
                    ? 'text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200 border border-indigo-700/40 bg-indigo-950/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className={`w-4 h-4 ${link.highlight ? 'text-indigo-400' : ''}`} />
              <span>{link.label}</span>
              {link.highlight && (
                <span className="ml-auto text-[9px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                  Viva
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg border border-red-900/30 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
