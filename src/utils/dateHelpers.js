/**
 * Helper to safely parse date strings into Date objects.
 * Handles common variations from OCR or default toLocaleDateString.
 */
export const parseDateString = (dateStr) => {
  if (!dateStr) return new Date();
  
  // Try direct parse
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  // If failed, try handling DD/MM/YYYY or DD-MM-YYYY manually
  // Assume generic DD/MM/YYYY since we are in Indonesia context mostly
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    // try to construct as YYYY-MM-DD
    // If year is first
    if (parts[0].length === 4) {
       d = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
    } else if (parts[2].length >= 2) {
       // Assume DD/MM/YYYY
       const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
       d = new Date(`${year}-${parts[1]}-${parts[0]}`);
    }
    if (!isNaN(d.getTime())) return d;
  }
  
  return new Date(); // Fallback to now
};

/**
 * Helper to calculate week of the year
 */
const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
};

/**
 * Group receipts by a specific interval (day, week, month, year)
 */
export const groupReceiptsBy = (receipts, interval) => {
  const grouped = {};
  
  receipts.forEach(receipt => {
    const d = parseDateString(receipt.date);
    let key = '';
    
    switch (interval) {
      case 'daily':
        // YYYY-MM-DD
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        break;
      case 'weekly':
        // Year-WXX
        key = `${d.getFullYear()}-W${String(getWeekNumber(d)).padStart(2, '0')}`;
        break;
      case 'monthly':
        // YYYY-MM
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'yearly':
        // YYYY
        key = `${d.getFullYear()}`;
        break;
      default:
        key = 'all';
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        label: formatGroupLabel(key, interval),
        total: 0,
        receipts: []
      };
    }
    
    // Parse total properly
    const amountStr = String(receipt.total).replace(/[^\d.-]/g, '');
    const amount = Number(amountStr) || 0;
    
    grouped[key].total += amount;
    grouped[key].receipts.push(receipt);
  });
  
  // Sort descending by key
  return Object.keys(grouped).sort().reverse().map(key => ({
    key,
    ...grouped[key]
  }));
};

/**
 * Format the raw group key into a human-readable label
 */
const formatGroupLabel = (key, interval) => {
  if (interval === 'daily') {
    const d = new Date(key);
    return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (interval === 'weekly') {
    return `Week ${key.split('-W')[1]}, ${key.split('-W')[0]}`;
  }
  if (interval === 'monthly') {
    const [year, month] = key.split('-');
    const d = new Date(year, parseInt(month) - 1, 1);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }
  if (interval === 'yearly') {
    return key;
  }
  return key;
};
