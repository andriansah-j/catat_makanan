/**
 * Simple parser to extract Date, Items, and Total from raw receipt text.
 * Note: Real-world receipt parsing is complex and better handled by specialized APIs.
 * This is a basic implementation using regex heuristics.
 */
export const parseReceiptText = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let extractedDate = '';
  let extractedTotal = '';
  let extractedItems = [];

  // 1. Try to find a date (DD/MM/YYYY, MM/DD/YY, YYYY-MM-DD, etc)
  const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      extractedDate = match[1];
      break;
    }
  }

  // 2. Try to find Total Price
  // Look for "Total", "Amount", "Rp", followed by numbers
  const totalRegex = /(?:total|amount|rp|idr)[\s\:\.\=]*([\d\,\.]+)/i;
  let totalCandidates = [];
  
  for (const line of lines) {
    const match = line.match(totalRegex);
    if (match) {
      totalCandidates.push(match[1]);
    }
  }
  
  // If we found candidates, usually the last one or largest one might be the total. 
  // For simplicity, take the last matched one.
  if (totalCandidates.length > 0) {
    extractedTotal = totalCandidates[totalCandidates.length - 1];
  } else {
    // Fallback: look for the largest currency-like number at the bottom of the receipt
    const currencyRegex = /(?:Rp|IDR)?\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi;
    const bottomLines = lines.slice(-10); // Check last 10 lines
    for (const line of bottomLines) {
      let match;
      while ((match = currencyRegex.exec(line)) !== null) {
        totalCandidates.push(match[1]);
      }
    }
    if (totalCandidates.length > 0) {
      extractedTotal = totalCandidates[totalCandidates.length - 1];
    }
  }

  // Clean up total to just numbers for easier editing later, or keep format
  extractedTotal = extractedTotal.replace(/[^\d.,]/g, '');

  // 3. Try to extract Items (rough heuristic: lines with a number at the end, not containing "total")
  // For a simple app, we might just put the raw text in a big textarea, but let's try to parse
  let foundItems = [];
  const itemRegex = /^(.*?)\s+([\d.,]+)$/;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('total') || lowerLine.includes('subtotal') || lowerLine.includes('tax') || lowerLine.includes('cash')) {
      continue; // Skip summary lines
    }
    
    const match = line.match(itemRegex);
    if (match) {
      const name = match[1].trim();
      const price = match[2].trim();
      if (name.length > 2) { // arbitrary threshold
        foundItems.push(`${name} - ${price}`);
      }
    }
  }

  // If items parsing fails, just join some middle lines as a fallback
  if (foundItems.length === 0) {
    const middleLines = lines.slice(Math.max(0, lines.length - 15), lines.length - 5);
    extractedItems = [middleLines.join(', ')];
  } else {
    extractedItems = foundItems;
  }

  return {
    date: extractedDate || new Date().toLocaleDateString(),
    total: extractedTotal || '0',
    items: extractedItems.join('\n')
  };
};
