export type ReservationStatus =
  | "confirmada"
  | "pendiente"
  | "cancelada"
  | "bloqueo"
  | "mantenimiento"
  | "personal";

export type Channel = "Directo" | "Airbnb" | "Booking" | "VRBO";

export type Reservation = {
  id: string;
  code: string;
  guest: string;
  clientId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: ReservationStatus;
  channel: Channel;
  note?: string;
};

export const reservations: Reservation[] = [
  {
    id: "b1",
    code: "CN-2481",
    guest: "Valentina Rossi",
    clientId: "c1",
    checkIn: "2026-07-28",
    checkOut: "2026-08-03",
    guests: 4,
    amount: 1_290_000,
    status: "confirmada",
    channel: "Directo",
  },
  {
    id: "b2",
    code: "CN-2482",
    guest: "Martín Etchegaray",
    clientId: "c2",
    checkIn: "2026-08-05",
    checkOut: "2026-08-12",
    guests: 6,
    amount: 1_680_000,
    status: "confirmada",
    channel: "Airbnb",
  },
  {
    id: "b3",
    code: "CN-2483",
    guest: "Sophie Laurent",
    clientId: "c3",
    checkIn: "2026-08-14",
    checkOut: "2026-08-18",
    guests: 2,
    amount: 860_000,
    status: "pendiente",
    channel: "Booking",
  },
  {
    id: "b4",
    code: "CN-2484",
    guest: "James Whitfield",
    clientId: "c4",
    checkIn: "2026-08-20",
    checkOut: "2026-08-27",
    guests: 5,
    amount: 1_940_000,
    status: "confirmada",
    channel: "Directo",
  },
  {
    id: "b5",
    code: "CN-2485",
    guest: "Mantenimiento caldera",
    clientId: "",
    checkIn: "2026-08-28",
    checkOut: "2026-08-30",
    guests: 0,
    amount: 0,
    status: "mantenimiento",
    channel: "Directo",
  },
  {
    id: "b6",
    code: "CN-2486",
    guest: "Carolina Méndez",
    clientId: "c5",
    checkIn: "2026-09-02",
    checkOut: "2026-09-07",
    guests: 4,
    amount: 1_120_000,
    status: "confirmada",
    channel: "Airbnb",
  },
  {
    id: "b7",
    code: "CN-2487",
    guest: "Uso personal — familia",
    clientId: "",
    checkIn: "2026-09-10",
    checkOut: "2026-09-14",
    guests: 4,
    amount: 0,
    status: "personal",
    channel: "Directo",
  },
  {
    id: "b8",
    code: "CN-2488",
    guest: "Lucas Ferreira",
    clientId: "c6",
    checkIn: "2026-09-18",
    checkOut: "2026-09-23",
    guests: 3,
    amount: 990_000,
    status: "pendiente",
    channel: "VRBO",
  },
  {
    id: "b9",
    code: "CN-2489",
    guest: "Ana Kowalski",
    clientId: "c7",
    checkIn: "2026-10-01",
    checkOut: "2026-10-06",
    guests: 2,
    amount: 875_000,
    status: "cancelada",
    channel: "Booking",
  },
];

export type LeadStage =
  | "nueva"
  | "contactado"
  | "cotizacion"
  | "pendiente"
  | "confirmado"
  | "cancelado"
  | "perdido";

export const leadStages: { id: LeadStage; label: string }[] = [
  { id: "nueva", label: "Nueva" },
  { id: "contactado", label: "Contactado" },
  { id: "cotizacion", label: "Cotización enviada" },
  { id: "pendiente", label: "Pendiente" },
  { id: "confirmado", label: "Confirmado" },
  { id: "cancelado", label: "Cancelado" },
  { id: "perdido", label: "Perdido" },
];

export type Lead = {
  id: string;
  clientId: string;
  name: string;
  country: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  pets: boolean;
  amount: number;
  stage: LeadStage;
  createdAt: string;
  message: string;
};

export const leads: Lead[] = [
  {
    id: "l1",
    clientId: "c8",
    name: "Florencia Bianchi",
    country: "Argentina",
    checkIn: "2026-12-26",
    checkOut: "2027-01-02",
    nights: 7,
    adults: 4,
    children: 2,
    pets: false,
    amount: 2_450_000,
    stage: "nueva",
    createdAt: "2026-07-26",
    message: "Hola! Somos una familia de 6, ¿está disponible para fin de año?",
  },
  {
    id: "l2",
    clientId: "c9",
    name: "Diego Ramírez",
    country: "Uruguay",
    checkIn: "2026-08-15",
    checkOut: "2026-08-20",
    nights: 5,
    adults: 2,
    children: 0,
    pets: true,
    amount: 1_050_000,
    stage: "contactado",
    createdAt: "2026-07-24",
    message: "Viajamos con un perro pequeño, ¿es posible?",
  },
  {
    id: "l3",
    clientId: "c10",
    name: "Emma Schneider",
    country: "Alemania",
    checkIn: "2026-09-05",
    checkOut: "2026-09-12",
    nights: 7,
    adults: 2,
    children: 1,
    pets: false,
    amount: 1_480_000,
    stage: "cotizacion",
    createdAt: "2026-07-22",
    message: "Could you send the total price including cleaning?",
  },
  {
    id: "l4",
    clientId: "c11",
    name: "Rodrigo Alves",
    country: "Brasil",
    checkIn: "2026-07-30",
    checkOut: "2026-08-04",
    nights: 5,
    adults: 4,
    children: 0,
    pets: false,
    amount: 1_120_000,
    stage: "pendiente",
    createdAt: "2026-07-20",
    message: "Aguardo confirmação para comprar as passagens.",
  },
  {
    id: "l5",
    clientId: "c1",
    name: "Valentina Rossi",
    country: "Italia",
    checkIn: "2026-07-28",
    checkOut: "2026-08-03",
    nights: 6,
    adults: 4,
    children: 0,
    pets: false,
    amount: 1_290_000,
    stage: "confirmado",
    createdAt: "2026-06-30",
    message: "Confirmado, ya transferí la seña.",
  },
  {
    id: "l6",
    clientId: "c12",
    name: "Paula Giménez",
    country: "Argentina",
    checkIn: "2026-08-08",
    checkOut: "2026-08-11",
    nights: 3,
    adults: 2,
    children: 2,
    pets: false,
    amount: 690_000,
    stage: "cancelado",
    createdAt: "2026-07-11",
    message: "Se nos complicó el viaje, lo dejamos para más adelante.",
  },
  {
    id: "l7",
    clientId: "c13",
    name: "Tomás Ibáñez",
    country: "Chile",
    checkIn: "2026-09-20",
    checkOut: "2026-09-24",
    nights: 4,
    adults: 3,
    children: 0,
    pets: false,
    amount: 840_000,
    stage: "perdido",
    createdAt: "2026-07-05",
    message: "Encontramos otra opción más cerca del centro.",
  },
  {
    id: "l8",
    clientId: "c14",
    name: "Nicole Dubois",
    country: "Canadá",
    checkIn: "2026-10-10",
    checkOut: "2026-10-17",
    nights: 7,
    adults: 2,
    children: 0,
    pets: false,
    amount: 1_390_000,
    stage: "nueva",
    createdAt: "2026-07-27",
    message: "Hi! Is the apartment available for a week in October?",
  },
];

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  city: string;
  country: string;
  language: string;
  notes: string;
  stays: number;
  totalSpent: number;
};

export const clients: Client[] = [
  {
    id: "c1",
    firstName: "Valentina",
    lastName: "Rossi",
    email: "valentina.rossi@mail.it",
    whatsapp: "+39 340 118 2244",
    city: "Milán",
    country: "Italia",
    language: "Italiano",
    notes: "Prefiere check in temprano. Alérgica a plumas: usar almohadas sintéticas.",
    stays: 2,
    totalSpent: 2_310_000,
  },
  {
    id: "c2",
    firstName: "Martín",
    lastName: "Etchegaray",
    email: "metchegaray@mail.com",
    whatsapp: "+54 9 11 5544 8899",
    city: "Buenos Aires",
    country: "Argentina",
    language: "Español",
    notes: "Huésped recurrente, siempre viaja con la familia en receso invernal.",
    stays: 3,
    totalSpent: 4_120_000,
  },
  {
    id: "c3",
    firstName: "Sophie",
    lastName: "Laurent",
    email: "s.laurent@mail.fr",
    whatsapp: "+33 6 22 88 71 05",
    city: "Lyon",
    country: "Francia",
    language: "Francés",
    notes: "Solicitó recomendaciones gastronómicas al llegar.",
    stays: 1,
    totalSpent: 860_000,
  },
  {
    id: "c4",
    firstName: "James",
    lastName: "Whitfield",
    email: "jwhitfield@mail.co.uk",
    whatsapp: "+44 7700 900 233",
    city: "Londres",
    country: "Reino Unido",
    language: "Inglés",
    notes: "Viaja para esquiar, necesita guarda esquí y traslado a Catedral.",
    stays: 1,
    totalSpent: 1_940_000,
  },
  {
    id: "c5",
    firstName: "Carolina",
    lastName: "Méndez",
    email: "caro.mendez@mail.cl",
    whatsapp: "+56 9 8123 4455",
    city: "Santiago",
    country: "Chile",
    language: "Español",
    notes: "Cruza por Cardenal Samoré, llega de noche.",
    stays: 2,
    totalSpent: 2_010_000,
  },
  {
    id: "c6",
    firstName: "Lucas",
    lastName: "Ferreira",
    email: "lucas.ferreira@mail.br",
    whatsapp: "+55 11 99871 2233",
    city: "São Paulo",
    country: "Brasil",
    language: "Portugués",
    notes: "Consultó por traslado desde el aeropuerto.",
    stays: 1,
    totalSpent: 990_000,
  },
  {
    id: "c7",
    firstName: "Ana",
    lastName: "Kowalski",
    email: "ana.k@mail.pl",
    whatsapp: "+48 501 224 118",
    city: "Cracovia",
    country: "Polonia",
    language: "Inglés",
    notes: "Canceló por cambio de itinerario. Reintegro procesado.",
    stays: 0,
    totalSpent: 0,
  },
];

export type SeasonType =
  | "Temporada baja"
  | "Temporada alta"
  | "Vacaciones de invierno"
  | "Semana Santa"
  | "Navidad"
  | "Fin de año";

export type RateRule = {
  id: string;
  name: string;
  type: SeasonType;
  from: string;
  to: string;
  price: number;
  minNights: number;
  color: string;
  priority: number;
};

export const rateRules: RateRule[] = [
  {
    id: "t1",
    name: "Invierno alto",
    type: "Vacaciones de invierno",
    from: "2026-07-10",
    to: "2026-08-10",
    price: 285000,
    minNights: 5,
    color: "var(--chart-1)",
    priority: 10,
  },
  {
    id: "t2",
    name: "Temporada alta ski",
    type: "Temporada alta",
    from: "2026-08-11",
    to: "2026-09-15",
    price: 235000,
    minNights: 4,
    color: "var(--chart-2)",
    priority: 8,
  },
  {
    id: "t3",
    name: "Primavera",
    type: "Temporada baja",
    from: "2026-09-16",
    to: "2026-12-10",
    price: 165000,
    minNights: 2,
    color: "var(--chart-3)",
    priority: 3,
  },
  {
    id: "t4",
    name: "Navidad",
    type: "Navidad",
    from: "2026-12-20",
    to: "2026-12-27",
    price: 320000,
    minNights: 5,
    color: "var(--chart-4)",
    priority: 12,
  },
  {
    id: "t5",
    name: "Fin de año",
    type: "Fin de año",
    from: "2026-12-28",
    to: "2027-01-05",
    price: 360000,
    minNights: 7,
    color: "var(--chart-5)",
    priority: 12,
  },
  {
    id: "t6",
    name: "Semana Santa",
    type: "Semana Santa",
    from: "2027-03-25",
    to: "2027-03-29",
    price: 245000,
    minNights: 3,
    color: "var(--chart-2)",
    priority: 9,
  },
];

export type BlockReason = "Uso personal" | "Mantenimiento" | "Reserva externa";

export type Block = {
  id: string;
  from: string;
  to: string;
  reason: BlockReason;
  note: string;
};

export const blocks: Block[] = [
  { id: "k1", from: "2026-08-28", to: "2026-08-30", reason: "Mantenimiento", note: "Service de caldera y pintura" },
  { id: "k2", from: "2026-09-10", to: "2026-09-14", reason: "Uso personal", note: "Fin de semana largo familiar" },
  { id: "k3", from: "2026-11-05", to: "2026-11-09", reason: "Reserva externa", note: "Reserva tomada por Booking" },
];

export const monthlyRevenue = [
  { month: "Ene", ingresos: 3_120_000, ocupacion: 92 },
  { month: "Feb", ingresos: 2_780_000, ocupacion: 88 },
  { month: "Mar", ingresos: 1_960_000, ocupacion: 64 },
  { month: "Abr", ingresos: 1_420_000, ocupacion: 51 },
  { month: "May", ingresos: 1_180_000, ocupacion: 44 },
  { month: "Jun", ingresos: 2_240_000, ocupacion: 71 },
  { month: "Jul", ingresos: 3_640_000, ocupacion: 96 },
  { month: "Ago", ingresos: 3_410_000, ocupacion: 94 },
  { month: "Sep", ingresos: 2_150_000, ocupacion: 68 },
  { month: "Oct", ingresos: 1_890_000, ocupacion: 59 },
  { month: "Nov", ingresos: 2_060_000, ocupacion: 63 },
  { month: "Dic", ingresos: 3_980_000, ocupacion: 97 },
];

export const properties = [
  { id: "prop-1", name: "Casa Nahuel", location: "Bustillo km 6,4" },
  { id: "prop-2", name: "Loft Catedral (próximamente)", location: "Villa Catedral" },
];

export const integrations = [
  { name: "Airbnb", description: "Sincronizar calendario y reservas", status: "Desconectado" },
  { name: "Booking.com", description: "Importar reservas y tarifas", status: "Desconectado" },
  { name: "VRBO", description: "Canal adicional de distribución", status: "Desconectado" },
  { name: "Sincronización iCal", description: "Importar y exportar calendarios .ics", status: "Desconectado" },
  { name: "Google Calendar", description: "Espejo de ocupación en tu agenda", status: "Desconectado" },
  { name: "Mercado Pago", description: "Cobro de señas y saldos", status: "Desconectado" },
  { name: "Stripe", description: "Pagos internacionales con tarjeta", status: "Desconectado" },
  { name: "WhatsApp Business", description: "Respuestas y plantillas automáticas", status: "Desconectado" },
  { name: "Email transaccional", description: "Confirmaciones y recordatorios", status: "Desconectado" },
];

export const formatARS = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (iso?: string) => {
  if (!iso || iso === "undefined" || iso === "null") return "—";
  const dateStr = iso.includes("T") ? iso : `${iso}T12:00:00`;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

