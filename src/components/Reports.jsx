import React, { useState, useMemo } from 'react';
import { BarChart3, CalendarDays, Calendar as CalendarIcon, Wallet, Activity, User } from 'lucide-react';
import { groupReceiptsBy } from '../utils/dateHelpers';
import ReceiptList from './ReceiptList';

export default function Reports({ receipts, onDeleteReceipt, currentUser, allUsers }) {
  const [interval, setInterval] = useState('monthly'); // daily, weekly, monthly, yearly
  const [selectedUserId, setSelectedUserId] = useState('all'); // 'all' or specific ID

  const filteredReceipts = useMemo(() => {
    if (selectedUserId === 'all') return receipts;
    return receipts.filter(r => r.userId === Number(selectedUserId));
  }, [receipts, selectedUserId]);

  const reportData = useMemo(() => {
    return groupReceiptsBy(filteredReceipts, interval);
  }, [filteredReceipts, interval]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
  };

  const calculateTotalAllTime = () => {
    return filteredReceipts.reduce((sum, r) => {
      const amount = Number(String(r.total).replace(/[^\d.-]/g, '')) || 0;
      return sum + amount;
    }, 0);
  };

  return (
    <div className="animate-fade-in">
      {/* Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel flex flex-col justify-center items-center text-center !p-6">
           <div className="bg-primary/20 p-3 rounded-full mb-3 text-primary">
              <Wallet size={24} />
           </div>
           <h3 className="text-muted text-sm font-medium uppercase tracking-wider mb-1">
             {selectedUserId === 'all' ? 'All Time Expenses' : 'User Expenses'}
           </h3>
           <p className="text-3xl font-bold text-gradient">{formatCurrency(calculateTotalAllTime())}</p>
        </div>
        <div className="glass-panel flex flex-col justify-center items-center text-center !p-6">
           <div className="bg-success/20 p-3 rounded-full mb-3 text-success">
              <Activity size={24} />
           </div>
           <h3 className="text-muted text-sm font-medium uppercase tracking-wider mb-1">Total Logs</h3>
           <p className="text-3xl font-bold text-success">{filteredReceipts.length} <span className="text-sm font-normal text-muted">Receipts</span></p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-card-bg border border-card-border p-3 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold flex items-center gap-2 px-2">
            <BarChart3 size={18} className="text-primary" /> Reports View
          </h3>
          
          {/* Admin User Filter */}
          {currentUser && currentUser.id === 6477 && allUsers && (
            <div className="flex items-center gap-2 bg-black/20 p-1 px-3 rounded-lg border border-white/5">
              <User size={14} className="text-muted" />
              <select 
                className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="all" className="bg-slate-800">All Users</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-800">
                    {u.username} (#{u.id})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex bg-black/20 p-1 rounded-lg">
          {['daily', 'weekly', 'monthly', 'yearly'].map(type => (
            <button
              key={type}
              onClick={() => setInterval(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                interval === type 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Report Groups */}
      {reportData.length === 0 ? (
        <div className="glass-panel empty-state">
           <CalendarDays className="empty-icon text-muted" />
           <h3 className="text-xl font-medium mb-2">No Data Available</h3>
           <p>Start scanning receipts to generate reports.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {reportData.map((group) => (
            <div key={group.key} className="glass-panel !p-0 overflow-hidden">
              <div className="bg-white/5 p-4 md:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg text-primary">
                    <CalendarIcon size={20} />
                  </div>
                  <h4 className="text-xl font-semibold">{group.label}</h4>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted uppercase tracking-wider mb-1">Period Total</p>
                  <p className="text-2xl font-bold text-gradient">{formatCurrency(group.total)}</p>
                </div>
              </div>
              <div className="p-4 md:p-6 bg-black/10">
                <h5 className="text-sm font-medium text-muted mb-4">Receipts in this period ({group.receipts.length})</h5>
                <ReceiptList receipts={group.receipts} onDelete={onDeleteReceipt} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
