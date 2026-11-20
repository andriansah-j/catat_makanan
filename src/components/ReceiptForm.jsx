import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

export default function ReceiptForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    date: '',
    items: '',
    total: '',
    image: null
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || '',
        items: initialData.items || '',
        total: initialData.total || '',
        image: initialData.image || null
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: Date.now().toString()
    });
  };

  return (
    <div className="glass-panel animate-fade-in mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gradient">Review & Edit Data</h3>
      <p className="text-muted mb-6">OCR isn't perfect. Please review the extracted data and make corrections if needed.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                type="text"
                id="date"
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleChange}
                placeholder="DD/MM/YYYY"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="total">Total Price (Rp)</label>
              <input
                type="text"
                id="total"
                name="total"
                className="form-input"
                value={formData.total}
                onChange={handleChange}
                placeholder="e.g. 50000"
                required
              />
            </div>
          </div>
          
          <div className="form-group h-full">
            <label className="form-label" htmlFor="items">Purchased Items</label>
            <textarea
              id="items"
              name="items"
              className="form-input h-[calc(100%-2rem)] min-h-[120px] resize-y"
              value={formData.items}
              onChange={handleChange}
              placeholder="List items here..."
              rows="5"
            ></textarea>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6 justify-end">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            <X size={18} /> Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={18} /> Save Receipt
          </button>
        </div>
      </form>
    </div>
  );
}
