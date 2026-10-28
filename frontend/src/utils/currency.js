export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);
}

export function formatCurrencyTotals(items = [], amountKey = 'amount') {
  const total = items.reduce((sum, item) => sum + (Number(item[amountKey]) || 0), 0);
  return formatCurrency(total);
}
