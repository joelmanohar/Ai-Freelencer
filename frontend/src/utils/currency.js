export function formatCurrency(amount, currency = 'USD') {
  const code = currency === 'INR' ? 'INR' : 'USD';
  return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);
}

export function formatCurrencyTotals(items = [], amountKey = 'amount') {
  const totals = items.reduce((result, item) => {
    const currency = item.currency === 'INR' ? 'INR' : 'USD';
    result[currency] = (result[currency] || 0) + (Number(item[amountKey]) || 0);
    return result;
  }, {});
  return Object.entries(totals).map(([currency, amount]) => formatCurrency(amount, currency)).join(' / ') || formatCurrency(0, 'USD');
}
