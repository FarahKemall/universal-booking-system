import { toMinutes, toTime } from "../data/configs.js";

export function hasConflict(bookings, candidate, excludeId = null) {
  const start = toMinutes(candidate.time);
  const end = start + Number(candidate.duration);
  return bookings.some((booking) => {
    if (booking.id === excludeId || booking.status === "cancelled") return false;
    if (
      booking.businessId !== candidate.businessId ||
      booking.resourceId !== candidate.resourceId ||
      booking.date !== candidate.date
    ) return false;

    const otherStart = toMinutes(booking.time);
    const otherEnd = otherStart + Number(booking.duration);
    return start < otherEnd && end > otherStart;
  });
}

export function getAvailableSlots(config, bookings, date, resourceId, duration = config.duration, excludeId = null) {
  const start = toMinutes(config.opening);
  const close = toMinutes(config.closing);
  const slots = [];

  for (let minute = start; minute + duration <= close; minute += config.step) {
    const candidate = {
      businessId: config.id,
      resourceId,
      date,
      time: toTime(minute),
      duration
    };
    if (!hasConflict(bookings, candidate, excludeId)) slots.push(candidate.time);
  }
  return slots;
}

export function formatDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("bg-BG", {
    day: "2-digit", month: "long", year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}
