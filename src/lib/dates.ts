import { reservations } from "@/data/admin";

export const toDate = (iso: string) => new Date(`${iso}T12:00:00`);

export const eachDay = (from: Date, to: Date) => {
  const days: Date[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

export const nightsBetween = (from?: Date, to?: Date) => {
  if (!from || !to) return 0;
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / 86_400_000));
};

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

type DayState = "reservada" | "pendiente" | "bloqueada";

const stateOf = (status: string): DayState | null => {
  if (status === "confirmada") return "reservada";
  if (status === "pendiente") return "pendiente";
  if (status === "mantenimiento" || status === "personal" || status === "bloqueo") return "bloqueada";
  return null;
};

export const occupancyDays = () => {
  const map: Record<DayState, Date[]> = { reservada: [], pendiente: [], bloqueada: [] };
  reservations.forEach((r) => {
    const state = stateOf(r.status);
    if (!state) return;
    eachDay(toDate(r.checkIn), toDate(r.checkOut)).forEach((d) => map[state].push(d));
  });
  return map;
};

export const isDayTaken = (day: Date) => {
  const map = occupancyDays();
  return [...map.reservada, ...map.pendiente, ...map.bloqueada].some((d) => sameDay(d, day));
};

export const formatLong = (date?: Date) =>
  date
    ? date.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
