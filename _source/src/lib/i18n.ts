export type Language = "es" | "en" | "pt";

export interface Translations {
  nav: {
    home: string;
    properties: string;
    gallery: string;
    location: string;
    availability: string;
    myReservation: string;
    book: string;
  };
  hero: {
    checkAvailability: string;
    viewGallery: string;
    reviews: string;
    guests: string;
    bedrooms: string;
    bathrooms: string;
  };
  booking: {
    title: string;
    subtitle: string;
    checkIn: string;
    checkOut: string;
    selectProperty: string;
    nights: string;
    estimatedTotal: string;
    yourTrip: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    guestsCount: string;
    sendInquiry: string;
    occupied: string;
    available: string;
  };
  footer: {
    contactUs: string;
    allRightsReserved: string;
  };
  myResPortal: {
    title: string;
    subtitle: string;
    enterCode: string;
    loginBtn: string;
    myStay: string;
    helpDesk: string;
    leaveReview: string;
    wifiNet: string;
    wifiPass: string;
    lockCode: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    nav: {
      home: "Inicio",
      properties: "Propiedades",
      gallery: "Galería",
      location: "Ubicación",
      availability: "Disponibilidad",
      myReservation: "Mi Reserva",
      book: "Reservar",
    },
    hero: {
      checkAvailability: "Consultar disponibilidad",
      viewGallery: "Ver galería",
      reviews: "reseñas",
      guests: "huéspedes",
      bedrooms: "habitaciones",
      bathrooms: "baños",
    },
    booking: {
      title: "Disponibilidad y Cotización",
      subtitle: "Seleccioná tus fechas para ver el precio estimado.",
      checkIn: "Check-In",
      checkOut: "Check-Out",
      selectProperty: "Seleccioná tu propiedad de alojamiento:",
      nights: "noches",
      estimatedTotal: "Importe Total Estimado",
      yourTrip: "Contanos sobre tu viaje",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Email de contacto",
      phone: "Teléfono / WhatsApp",
      guestsCount: "Cantidad de huéspedes",
      sendInquiry: "Enviar consulta de disponibilidad",
      occupied: "Ocupada",
      available: "Disponible",
    },
    footer: {
      contactUs: "Contacto y Consultas",
      allRightsReserved: "Todos los derechos reservados.",
    },
    myResPortal: {
      title: "Portal del Huésped",
      subtitle: "Ingresá con tu Email o Código de Reserva para ver las instrucciones.",
      enterCode: "Email o Código de Reserva",
      loginBtn: "Ingresar a Mi Reserva",
      myStay: "Mi Estadía",
      helpDesk: "Mesa de Ayuda",
      leaveReview: "Dejar Reseña",
      wifiNet: "Red WiFi de la propiedad",
      wifiPass: "Clave WiFi",
      lockCode: "Cerradura digital",
    },
  },
  en: {
    nav: {
      home: "Home",
      properties: "Properties",
      gallery: "Gallery",
      location: "Location",
      availability: "Availability",
      myReservation: "My Booking",
      book: "Book Now",
    },
    hero: {
      checkAvailability: "Check availability",
      viewGallery: "View gallery",
      reviews: "reviews",
      guests: "guests",
      bedrooms: "bedrooms",
      bathrooms: "bathrooms",
    },
    booking: {
      title: "Availability & Estimate",
      subtitle: "Select your dates to see the estimated price.",
      checkIn: "Check-In",
      checkOut: "Check-Out",
      selectProperty: "Select your preferred property:",
      nights: "nights",
      estimatedTotal: "Estimated Total Price",
      yourTrip: "Tell us about your trip",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Contact Email",
      phone: "Phone / WhatsApp",
      guestsCount: "Number of guests",
      sendInquiry: "Send availability inquiry",
      occupied: "Occupied",
      available: "Available",
    },
    footer: {
      contactUs: "Contact & Inquiries",
      allRightsReserved: "All rights reserved.",
    },
    myResPortal: {
      title: "Guest Portal",
      subtitle: "Enter your Email or Booking Code to view check-in details.",
      enterCode: "Email or Booking Code",
      loginBtn: "Access My Booking",
      myStay: "My Stay",
      helpDesk: "Help Desk",
      leaveReview: "Leave Review",
      wifiNet: "Property WiFi Network",
      wifiPass: "WiFi Password",
      lockCode: "Digital Lock Code",
    },
  },
  pt: {
    nav: {
      home: "Início",
      properties: "Propriedades",
      gallery: "Galeria",
      location: "Localização",
      availability: "Disponibilidade",
      myReservation: "Minha Reserva",
      book: "Reservar",
    },
    hero: {
      checkAvailability: "Verificar disponibilidade",
      viewGallery: "Ver galeria",
      reviews: "avaliações",
      guests: "hóspedes",
      bedrooms: "quartos",
      bathrooms: "banheiros",
    },
    booking: {
      title: "Disponibilidade e Orçamento",
      subtitle: "Selecione as datas para ver o valor estimado.",
      checkIn: "Check-In",
      checkOut: "Check-Out",
      selectProperty: "Selecione a sua propriedade preferida:",
      nights: "noites",
      estimatedTotal: "Valor Total Estimado",
      yourTrip: "Conte-nos sobre a sua viagem",
      firstName: "Nome",
      lastName: "Sobrenome",
      email: "E-mail de contato",
      phone: "Telefone / WhatsApp",
      guestsCount: "Número de hóspedes",
      sendInquiry: "Enviar consulta de disponibilidade",
      occupied: "Ocupado",
      available: "Disponível",
    },
    footer: {
      contactUs: "Contato e Dúvidas",
      allRightsReserved: "Todos os direitos reservados.",
    },
    myResPortal: {
      title: "Portal do Hóspede",
      subtitle: "Digite seu E-mail ou Código de Reserva para acessar os detalhes.",
      enterCode: "E-mail ou Código de Reserva",
      loginBtn: "Acessar Minha Reserva",
      myStay: "Minha Estadia",
      helpDesk: "Central de Ajuda",
      leaveReview: "Deixar Avaliação",
      wifiNet: "Rede Wi-Fi da propriedade",
      wifiPass: "Senha do Wi-Fi",
      lockCode: "Fechadura Digital",
    },
  },
};

export const getCurrentLanguage = (): Language => {
  if (typeof window === "undefined") return "es";
  const saved = localStorage.getItem("active_app_language") as Language;
  if (saved && (saved === "es" || saved === "en" || saved === "pt")) {
    return saved;
  }
  const navLang = navigator.language.toLowerCase();
  if (navLang.startsWith("pt")) return "pt";
  if (navLang.startsWith("en")) return "en";
  return "es";
};

export const setCurrentLanguage = (lang: Language) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("active_app_language", lang);
  window.dispatchEvent(new CustomEvent("language_changed", { detail: lang }));
};
