function toDateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(value));
}

module.exports = { toDateInput, formatDate };
