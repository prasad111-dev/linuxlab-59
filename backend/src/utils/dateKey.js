function localDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysAgoKey(n) {
  return localDateKey(new Date(Date.now() - n * 86400000));
}

module.exports = { localDateKey, daysAgoKey };
