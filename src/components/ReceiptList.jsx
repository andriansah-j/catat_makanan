import React from 'react';
import { Utensils, Calendar, CreditCard, Trash2 } from 'lucide-react';

export default function ReceiptList({ receipts, onDelete }) {
  if (!receipts || receipts.length === 0) {
    return (
      <div className="glass-panel empty-state">
        <Utensils className="empty-icon text-muted" />
        <h3 className="text-xl font-medium mb-2">No Receipts Yet</h3>
        <p>Scan and save your first food receipt to start tracking!</p>
      </div>
    );
  }

  // Helper to format currency
  const formatCurrency = (value) => {
    const number = Number(value.replace(/[^\d.-]/g, ''));
    if (isNaN(number)) return value;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in delay-200">
      {receipts.map((receipt) => (
        <div key={receipt.id} className="receipt-card relative overflow-hidden group">
          <div className="receipt-header">
            <div className="flex items-center gap-2 text-sm text-muted mb-1">
              <Calendar size={14} />
              <span>{receipt.date}</span>
            </div>
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Utensils size={16} className="text-primary" />
              Food Record
            </h4>
          </div>
          
          <div className="mb-4 text-sm max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
            {receipt.items ? (
              receipt.items.split('\n').map((item, idx) => (
                <div key={idx} className="receipt-item">
                  <span className="truncate flex-1">{item}</span>
                </div>
              ))
            ) : (
              <span className="text-muted italic">No items recorded</span>
            )}
          </div>
          
          <div className="receipt-total">
            <span className="text-sm font-normal text-muted flex items-center gap-1">
              <CreditCard size={14} /> Total
            </span>
            <span>{formatCurrency(receipt.total)}</span>
          </div>

          <button 
            onClick={() => onDelete(receipt.id)}
            className="absolute top-4 right-4 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/80 p-2 rounded-full backdrop-blur-sm"
            aria-label="Delete receipt"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
