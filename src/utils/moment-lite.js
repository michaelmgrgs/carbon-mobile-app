// Minimal date formatter: "12 Aug 2026". Avoids adding moment.js as a dependency
// just for display formatting in the mobile app.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${hour12}:${minutes} ${ampm}`;
}

// A booked class: the server sends class_date as a plain date (serialized as
// midnight UTC) and start_time separately as "HH:MM:SS". Combine them as the
// gym's local date + time instead of converting midnight UTC into a clock time.
function formatClassDateTime(classDate, startTime) {
  if (!classDate) return '';
  const [y, m, day] = String(classDate).slice(0, 10).split('-').map(Number);
  if (!y || !m || !day) return '';
  const datePart = `${day} ${MONTHS[m - 1]}`;
  if (!startTime) return datePart;
  const [h, min] = String(startTime).split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${datePart}, ${hour12}:${String(min || 0).padStart(2, '0')} ${ampm}`;
}

// Exported both ways so it works whether a screen does
// `import formatDate from '...'` or `import { formatDate } from '...'`
export default formatDate;
export { formatDate, formatDateTime, formatClassDateTime };
