import { Block, Reservation, reservations as mockReservations } from "@/data/admin";

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

export type DetailedDayState = "reservada" | "pendiente" | "bloqueada" | "mantenimiento" | "personal";

export const buildOccupancyMap = (reservations: Reservation[], blocks: Block[]) => {
  const map: Record<DetailedDayState, Date[]> = {
    reservada: [],
    pendiente: [],
    bloqueada: [],
    mantenimiento: [],
    personal: [],
  };

  reservations.forEach((r) => {
    let state: DetailedDayState | null = null;
    if (r.status === "confirmada") state = "reservada";
    else if (r.status === "pendiente") state = "pendiente";
    else if (r.status === "mantenimiento") state = "mantenimiento";
    else if (r.status === "personal") state = "personal";
    else if (r.status === "bloqueo") state = "bloqueada";

    if (state) {
      eachDay(toDate(r.checkIn), toDate(r.checkOut)).forEach((d) => map[state!].push(d));
    }
  });

  blocks.forEach((b) => {
    let state: DetailedDayState = "bloqueada";
    if (b.reason === "Mantenimiento") state = "mantenimiento";
    else if (b.reason === "Uso personal") state = "personal";

    eachDay(toDate(b.from), toDate(b.to)).forEach((d) => map[state].push(d));
  });

  return map;
};

export const occupancyDays = () => {
  return buildOccupancyMap(mockReservations, []);
};

export const isDayTaken = (day: Date) => {
  const map = occupancyDays();
  return [...map.reservada, ...map.pendiente, ...map.bloqueada, ...map.mantenimiento, ...map.personal].some((d) => sameDay(d, day));
};

export const formatLong = (date?: Date) =>
  date
    ? date.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
