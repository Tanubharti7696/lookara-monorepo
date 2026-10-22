// src/utils/formatters.js
// Centralized localization formatters reading directly from user's Lookara settings

/**
 * Currency Symbol and Formatter
 */
export function getCurrencyInfo() {
  const pref = localStorage.getItem('lookara_pref_currency') || 'USD ($)';
  if (pref.includes('EUR') || pref.includes('€')) return { code: 'EUR', symbol: '€' };
  if (pref.includes('GBP') || pref.includes('£')) return { code: 'GBP', symbol: '£' };
  if (pref.includes('PKR') || pref.includes('₨')) return { code: 'PKR', symbol: '₨' };
  if (pref.includes('CAD')) return { code: 'CAD', symbol: 'CA$' };
  if (pref.includes('AED')) return { code: 'AED', symbol: 'AED ' };
  return { code: 'USD', symbol: '$' };
}

export function formatCurrency(amount, compact = false) {
  const { symbol } = getCurrencyInfo();
  const num = Number(amount) || 0;
  if (compact) {
    if (Math.abs(num) >= 1000000) return `${symbol}${(num / 1000000).toFixed(1)}M`;
    if (Math.abs(num) >= 1000) return `${symbol}${(num / 1000).toFixed(1)}k`;
    return `${symbol}${num.toLocaleString()}`;
  }
  return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Date Formatter respecting Date Format & Timezone
 */
export function formatDate(dateInput, includeTime = false) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const fmt = localStorage.getItem('lookara_pref_dateFormat') || 'MM/DD/YYYY';
  const tzPref = localStorage.getItem('lookara_pref_timezone') || '';
  const timeFormat = localStorage.getItem('lookara_pref_timeFormat') || '12-hour';

  // Map settings timezone label to IANA
  let timeZone = undefined;
  if (tzPref.includes('Karachi') || tzPref.includes('PKT')) timeZone = 'Asia/Karachi';
  else if (tzPref.includes('New_York') || tzPref.includes('Eastern') || tzPref.includes('ET')) timeZone = 'America/New_York';
  else if (tzPref.includes('Chicago') || tzPref.includes('Central') || tzPref.includes('CT')) timeZone = 'America/Chicago';
  else if (tzPref.includes('Los_Angeles') || tzPref.includes('Pacific') || tzPref.includes('PT')) timeZone = 'America/Los_Angeles';
  else if (tzPref.includes('London') || tzPref.includes('GMT')) timeZone = 'Europe/London';
  else if (tzPref.includes('Dubai') || tzPref.includes('GST')) timeZone = 'Asia/Dubai';

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: fmt.includes('MMM') ? 'short' : '2-digit',
    day: '2-digit',
    hour: includeTime ? 'numeric' : undefined,
    minute: includeTime ? '2-digit' : undefined,
    hour12: timeFormat.includes('12'),
  }).formatToParts(date);

  const partMap = {};
  parts.forEach(p => { partMap[p.type] = p.value; });

  let dateStr = '';
  if (fmt.includes('YYYY-MM-DD')) {
    dateStr = `${partMap.year}-${partMap.month}-${partMap.day}`;
  } else if (fmt.includes('DD/MM/YYYY')) {
    dateStr = `${partMap.day}/${partMap.month}/${partMap.year}`;
  } else if (fmt.includes('DD MMM YYYY')) {
    dateStr = `${partMap.day} ${partMap.month} ${partMap.year}`;
  } else {
    dateStr = `${partMap.month}/${partMap.day}/${partMap.year}`;
  }

  if (includeTime && partMap.hour) {
    const timeStr = timeFormat.includes('24')
      ? `${partMap.hour}:${partMap.minute}`
      : `${partMap.hour}:${partMap.minute} ${partMap.dayPeriod || ''}`.trim();
    return `${dateStr} ${timeStr}`;
  }

  return dateStr;
}

/**
 * First Day of the Week calculation (0 = Sunday, 1 = Monday)
 */
export function getFirstDayOfWeek() {
  const pref = (localStorage.getItem('lookara_pref_firstDay') || 'Monday').toLowerCase();
  if (pref.includes('sun')) return 0;
  if (pref.includes('sat')) return 6;
  return 1; // Default Monday
}
