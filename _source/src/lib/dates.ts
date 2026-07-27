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

/**
 * Valida si un rango de fechas [fromStr, toStr] se superpone con reservas existentes o bloqueos.
 */
export const checkRangeOverlap = (
  fromStr: string,
  toStr: string,
  reservations: Reservation[],
  blocks: Block[],
  excludeId?: string
) => {
  // Verificar reservas activas (confirmadas o pendientes)
  const conflictingRes = reservations.find((r) => {
    if (r.id === excludeId) return false;
    if (r.status === "cancelada") return false;
    // Condición estricta de superposición: checkIn < toStr AND checkOut > fromStr
    return r.checkIn < toStr && r.checkOut > fromStr;
  });

  if (conflictingRes) {
    return {
      hasConflict: true,
      reason: `Las fechas seleccionadas (${fromStr} a ${toStr}) se superponen con la reserva de "${conflictingRes.guest}" (${conflictingRes.checkIn} a ${conflictingRes.checkOut}).`,
    };
  }

  // Verificar bloqueos activos
  const conflictingBlock = blocks.find((b) => {
    if (b.id === excludeId) return false;
    return b.from < toStr && b.to > fromStr;
  });

  if (conflictingBlock) {
    return {
      hasConflict: true,
      reason: `Las fechas seleccionadas (${fromStr} a ${toStr}) coinciden con un bloqueo (${conflictingBlock.reason}: ${conflictingBlock.from} a ${conflictingBlock.to}).`,
    };
  }

  return { hasConflict: false, reason: "" };
};

/**
 * Recalcula automáticamente el precio estimado en función de las noches, las reglas por temporada y los descuentos activos.
 */
export const calculateEstimatedPrice = (
  checkInStr: string,
  checkOutStr: string,
  rateRules: any[] = [],
  settings: any = {}
) => {
  if (!checkInStr || !checkOutStr) return { nights: 0, amount: 0 };
  const dFrom = toDate(checkInStr);
  const dTo = toDate(checkOutStr);
  const nights = nightsBetween(dFrom, dTo);
  if (nights <= 0) return { nights: 0, amount: 0 };

  const basePrice = settings.basePrice || 185000;
  const weekendSurcharge = (settings.weekendSurchargePercent || 15) / 100;
  let totalSubtotal = 0;

  const dates = eachDay(dFrom, new Date(dTo.getTime() - 86400000));
  dates.forEach((d) => {
    const dStr = d.toISOString().split("T")[0];
    const isWeekend = d.getDay() === 5 || d.getDay() === 6;

    // Buscar regla de temporada que cubra este día
    const matchingRule = rateRules.find((r) => r.from <= dStr && r.to >= dStr);
    if (matchingRule && matchingRule.price) {
      totalSubtotal += Number(matchingRule.price);
    } else {
      totalSubtotal += isWeekend ? Math.round(basePrice * (1 + weekendSurcharge)) : basePrice;
    }
  });

  // Aplicar descuentos por estadía si corresponden
  if (nights >= 28 && settings.monthlyDiscountEnabled) {
    totalSubtotal *= (1 - (settings.monthlyDiscountPercent || 22) / 100);
  } else if (nights >= 7 && settings.weeklyDiscountEnabled) {
    totalSubtotal *= (1 - (settings.weeklyDiscountPercent || 10) / 100);
  }

  return {
    nights,
    amount: Math.round(totalSubtotal),
  };
};

export const formatLong = (date?: Date) =>
  date
    ? date.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
