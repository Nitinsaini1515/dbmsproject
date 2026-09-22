import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, ShieldCheck, User } from 'lucide-react';
import api from '../services/api';

export const Navbar = ({ title = 'AMRT Accommodation Management' }) => {
  const { user, isAdmin } = useAuth();
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await api.get('/health');
        if (res.data?.status === 'online') {
          setDbStatus('connected');
        } else {
          setDbStatus('error');
        }
      } catch (err) {
        setDbStatus('error');
      }
    };
    checkDb();
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">



        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            {isAdmin ? <ShieldCheck className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-indigo-600" />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-500 capitalize mt-0.5">{user?.role} Portal</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
