import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export const formatDate = (date, fmt = 'MMM DD, YYYY') => {
  if (!date) return '—';
  return dayjs(date).format(fmt);
};

export const formatTime = (date) => {
  if (!date) return '—';
  return dayjs(date).format('hh:mm A');
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return dayjs(date).format('MMM DD, YYYY hh:mm A');
};

export const calcHours = (start, end) => {
  if (!start || !end) return '—';
  const diff = dayjs(end).diff(dayjs(start), 'minute');
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
};

export const calcHoursDecimal = (start, end) => {
  if (!start || !end) return 0;
  return dayjs(end).diff(dayjs(start), 'hour', true);
};

export const fromNow = (date) => {
  if (!date) return '—';
  return dayjs(date).fromNow();
};

export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const todayISO = () => dayjs().format('YYYY-MM-DD');

export default dayjs;
