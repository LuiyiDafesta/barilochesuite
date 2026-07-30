import heroExterior from "@/assets/hero-exterior.jpg";
import living from "@/assets/living.jpg";
import bedroom from "@/assets/bedroom.jpg";
import kitchen from "@/assets/kitchen.jpg";
import bathroom from "@/assets/bathroom.jpg";
import terrace from "@/assets/terrace.jpg";
import lakeView from "@/assets/lake-view.jpg";
import centroCivico from "@/assets/centro-civico.jpg";

export const images = {
  heroExterior,
  living,
  bedroom,
  kitchen,
  bathroom,
  terrace,
  lakeView,
  centroCivico,
};

export const property = {
  name: "Casa Nahuel",
  tagline: "Departamento boutique frente al lago",
  city: "San Carlos de Bariloche",
  region: "Patagonia, Argentina",
  address: "Av. Bustillo km 6,4 — San Carlos de Bariloche, Río Negro",
  guests: 4,
  bedrooms: 1,
  bathrooms: 1,
  checkIn: "15:00",
  checkOut: "10:00",
  basePrice: 185000,
  cleaningFee: 45000,
  taxRate: 0.21,
  whatsapp: "+54 9 294 400 1234",
  email: "reservas@casanahuel.com.ar",
  instagram: "@casanahuel.bariloche",
  facebook: "Casa Nahuel Bariloche",
  rating: 4.94,
  reviewsCount: 128,
};

export const experiences = [
  {
    title: "Dormí con vistas increíbles",
    text: "Ventanales de piso a techo enmarcan el Nahuel Huapi y los Andes nevados. Amanecés con el lago cambiando de color y te dormís con el silencio de la montaña.",
    image: bedroom,
    tag: "Descanso",
  },
  {
    title: "Cociná como en casa",
    text: "Cocina completa con isla de mármol, horno doble y todo lo necesario para largas sobremesas patagónicas con vino y cordero.",
    image: kitchen,
    tag: "Gastronomía",
  },
  {
    title: "Descansá en un ambiente cálido",
    text: "Pisos de roble, hogar a leña, textiles naturales y calefacción central. La calidez de una casa de montaña con estándares de hotel.",
    image: living,
    tag: "Living",
  },
  {
    title: "Ideal para familias",
    text: "Tres habitaciones, dos baños completos, espacios amplios y seguros. Hasta seis huéspedes con la comodidad de un hogar propio.",
    image: bathroom,
    tag: "Familias",
  },
  {
    title: "Excelente ubicación",
    text: "A ocho minutos del Centro Cívico y a veinte del Cerro Catedral, sobre el corredor de Bustillo, con acceso directo a playas y restaurantes.",
    image: terrace,
    tag: "Ubicación",
  },
];

export type Amenity = { icon: string; label: string; detail: string };

export const amenities: Amenity[] = [
  { icon: "Users", label: "Huéspedes", detail: "Hasta 6 personas" },
  { icon: "BedDouble", label: "Habitaciones", detail: "3 dormitorios" },
  { icon: "Bath", label: "Baños", detail: "2 completos" },
  { icon: "Wifi", label: "WiFi", detail: "Fibra 300 Mb" },
  { icon: "Tv", label: "Smart TV", detail: "55'' + streaming" },
  { icon: "ChefHat", label: "Cocina", detail: "Equipada completa" },
  { icon: "Flame", label: "Calefacción", detail: "Central + hogar" },
  { icon: "Beef", label: "Parrilla", detail: "Quincho privado" },
  { icon: "Car", label: "Garage", detail: "Cubierto para 1 auto" },
  { icon: "Mountain", label: "Vista", detail: "Lago y montaña" },
  { icon: "LogIn", label: "Check In", detail: "Desde 15:00" },
  { icon: "LogOut", label: "Check Out", detail: "Hasta 10:00" },
  { icon: "PawPrint", label: "Mascotas", detail: "Bajo consulta" },
  { icon: "Snowflake", label: "Guarda esquí", detail: "Con secado" },
];

export type GalleryCategory =
  | "exterior"
  | "interior"
  | "habitaciones"
  | "bano"
  | "cocina"
  | "vista"
  | "videos"
  | "tour";

export const galleryCategories: { id: GalleryCategory | "todas"; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
  { id: "habitaciones", label: "Habitaciones" },
  { id: "bano", label: "Baño" },
  { id: "cocina", label: "Cocina" },
  { id: "vista", label: "Vista" },
  { id: "videos", label: "Videos" },
  { id: "tour", label: "Tour 360" },
];

export type MediaItem = {
  id: string;
  src: string;
  title: string;
  category: GalleryCategory;
  type: "foto" | "video" | "video-vertical" | "drone" | "tour";
  featured?: boolean;
  ratio: "tall" | "wide" | "square";
};

export const gallery: MediaItem[] = [
  {
    id: "m1",
    src: heroExterior,
    title: "Fachada al atardecer",
    category: "exterior",
    type: "foto",
    featured: true,
    ratio: "wide",
  },
  { id: "m2", src: living, title: "Living con hogar", category: "interior", type: "foto", ratio: "wide" },
  {
    id: "m3",
    src: bedroom,
    title: "Suite principal",
    category: "habitaciones",
    type: "foto",
    ratio: "square",
  },
  { id: "m4", src: kitchen, title: "Cocina isla", category: "cocina", type: "foto", ratio: "wide" },
  { id: "m5", src: bathroom, title: "Baño principal", category: "bano", type: "foto", ratio: "tall" },
  { id: "m6", src: terrace, title: "Terraza y parrilla", category: "exterior", type: "foto", ratio: "wide" },
  { id: "m7", src: lakeView, title: "Nahuel Huapi desde el drone", category: "vista", type: "drone", ratio: "wide" },
  { id: "m8", src: centroCivico, title: "Centro Cívico", category: "vista", type: "foto", ratio: "square" },
  { id: "m9", src: terrace, title: "Atardecer en la terraza", category: "videos", type: "video", ratio: "wide" },
  {
    id: "m10",
    src: bedroom,
    title: "Recorrido vertical",
    category: "videos",
    type: "video-vertical",
    ratio: "tall",
  },
  { id: "m11", src: living, title: "Tour virtual 360°", category: "tour", type: "tour", ratio: "square" },
  { id: "m12", src: kitchen, title: "Detalles de cocina", category: "interior", type: "foto", ratio: "square" },
  { id: "m13", src: bathroom, title: "Segundo baño", category: "bano", type: "foto", ratio: "square" },
  { id: "m14", src: bedroom, title: "Habitación de niños", category: "habitaciones", type: "foto", ratio: "wide" },
  { id: "m15", src: lakeView, title: "Vuelo sobre las islas", category: "videos", type: "drone", ratio: "wide" },
];

export type Place = {
  id: string;
  name: string;
  category: "Restaurante" | "Excursión" | "Supermercado" | "Centro" | "Ski";
  distance: string;
  description: string;
  image: string;
  visible: boolean;
};

export const places: Place[] = [
  {
    id: "p1",
    name: "Centro Cívico",
    category: "Centro",
    distance: "6,4 km · 8 min",
    description: "El corazón histórico de Bariloche, con su arquitectura de piedra y madera frente al lago.",
    image: centroCivico,
    visible: true,
  },
  {
    id: "p2",
    name: "Cerro Catedral",
    category: "Ski",
    distance: "13 km · 20 min",
    description: "El centro de esquí más grande de Sudamérica, con más de 120 hectáreas esquiables.",
    image: lakeView,
    visible: true,
  },
  {
    id: "p3",
    name: "Playa Bonita",
    category: "Excursión",
    distance: "1,6 km · 4 min",
    description: "Playa de arena volcánica sobre el Nahuel Huapi, perfecta para atardeceres.",
    image: terrace,
    visible: true,
  },
  {
    id: "p4",
    name: "Butterfly Patagonia",
    category: "Restaurante",
    distance: "3 km · 6 min",
    description: "Alta cocina patagónica con menú de pasos y maridaje de vinos argentinos.",
    image: kitchen,
    visible: true,
  },
  {
    id: "p5",
    name: "Circuito Chico",
    category: "Excursión",
    distance: "12 km · 18 min",
    description: "El recorrido panorámico clásico: Llao Llao, Punto Panorámico y Cerro Campanario.",
    image: lakeView,
    visible: true,
  },
  {
    id: "p6",
    name: "La Anónima Bustillo",
    category: "Supermercado",
    distance: "900 m · 2 min",
    description: "Supermercado completo a pocas cuadras para abastecerse al llegar.",
    image: centroCivico,
    visible: false,
  },
];

export type Review = {
  id: string;
  name: string;
  country: string;
  comment: string;
  rating: number;
  date: string;
  visible: boolean;
};

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Valentina Rossi",
    country: "Italia",
    comment:
      "Una experiencia impecable. El departamento supera cualquier foto: la vista al lago desde la cama es algo que no vamos a olvidar.",
    rating: 5,
    date: "2026-06-12",
    visible: true,
  },
  {
    id: "r2",
    name: "Martín Etchegaray",
    country: "Argentina",
    comment:
      "Fuimos en familia y funcionó perfecto. Espacios amplios, todo muy limpio y la anfitriona respondió en minutos.",
    rating: 5,
    date: "2026-05-02",
    visible: true,
  },
  {
    id: "r3",
    name: "Sophie Laurent",
    country: "Francia",
    comment:
      "Le confort d'un hôtel avec la chaleur d'une maison. La cuisine est un rêve et la terrasse au coucher du soleil, magique.",
    rating: 5,
    date: "2026-04-18",
    visible: true,
  },
  {
    id: "r4",
    name: "James Whitfield",
    country: "Reino Unido",
    comment:
      "Perfect base for skiing at Catedral. Ski storage, garage and a fireplace waiting for you after the slopes.",
    rating: 4.8,
    date: "2026-08-09",
    visible: true,
  },
  {
    id: "r5",
    name: "Carolina Méndez",
    country: "Chile",
    comment:
      "Volvería mil veces. La ubicación sobre Bustillo es ideal y el check in fue súper simple.",
    rating: 5,
    date: "2026-03-27",
    visible: true,
  },
];

export const faqs = [
  {
    q: "¿Cómo confirmo la reserva?",
    a: "Enviás tu consulta con las fechas y en menos de 24 horas te confirmamos la disponibilidad real. Como también recibimos reservas por Airbnb y otros canales, ninguna fecha queda confirmada automáticamente.",
  },
  {
    q: "¿Cuál es la política de cancelación?",
    a: "Cancelación flexible hasta 30 días antes del check in con reintegro del 100% de la seña. Entre 30 y 15 días, 50%. Dentro de los 15 días previos no hay reintegro.",
  },
  {
    q: "¿Se aceptan mascotas?",
    a: "Sí, bajo consulta previa y con un adicional por limpieza. Aceptamos una mascota de hasta 15 kg.",
  },
  {
    q: "¿Cómo funciona el check in?",
    a: "Check in desde las 15:00 y check out hasta las 10:00. Coordinamos la entrega de llaves por WhatsApp y hay opción de check in autónomo con caja de seguridad.",
  },
  {
    q: "¿Incluye estacionamiento?",
    a: "Sí, garage cubierto privado para un vehículo, con acceso directo al edificio.",
  },
  {
    q: "¿Hay estadía mínima?",
    a: "Dos noches en temporada baja y tres a siete noches según la temporada alta o fechas especiales como Navidad y Año Nuevo.",
  },
];

export const heroContent = {
  title: "Un refugio de montaña frente al Nahuel Huapi",
  subtitle:
    "Departamento boutique de alta gama en San Carlos de Bariloche. Diseño cálido, vistas infinitas y el confort de un hotel cinco estrellas.",
  eyebrow: "Bariloche · Patagonia Argentina",
};

export const formatARS = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
