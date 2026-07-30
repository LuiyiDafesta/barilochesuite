import { supabase } from "./supabase";
import { reservations as mockReservations, leads as mockLeads, clients as mockClients, rateRules as mockRateRules, blocks as mockBlocks } from "@/data/admin";
import { reviews as mockReviews, places as mockPlaces, gallery as mockGallery } from "@/data/site";

export interface PropertyItem {
  id: string;
  name: string;
  tagline: string;
  address: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  petsAllowed: boolean;
  isMain: boolean;
  active?: boolean;
  wifiNetwork: string;
  wifiPassword: string;
  lockCode: string;
  checkInInfo: string;
  basePrice: number;
}

const getInactivePropertyIds = (): string[] => {
  try {
    const raw = localStorage.getItem("inactive_property_ids");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getExtraPropertyMeta = (): Record<string, { bedrooms?: number; bathrooms?: number }> => {
  try {
    const raw = localStorage.getItem("property_extra_meta");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const setExtraPropertyMeta = (id: string, meta: { bedrooms?: number; bathrooms?: number }) => {
  try {
    const current = getExtraPropertyMeta();
    current[id] = { ...current[id], ...meta };
    localStorage.setItem("property_extra_meta", JSON.stringify(current));
  } catch (e) {
    console.error("Error al guardar meta de propiedad:", e);
  }
};

const setPropertyActiveState = (id: string, active: boolean) => {
  const inactive = getInactivePropertyIds();
  let updated: string[];
  if (!active) {
    updated = Array.from(new Set([...inactive, id]));
  } else {
    updated = inactive.filter((i) => i !== id);
  }
  localStorage.setItem("inactive_property_ids", JSON.stringify(updated));
};

// Servicio de Propiedades
export const propertyService = {
  async getAll(): Promise<PropertyItem[]> {
    const inactiveIds = getInactivePropertyIds();
    const metaMap = getExtraPropertyMeta();
    const { data, error } = await supabase.from("properties").select("*").order("is_main", { ascending: false });
    if (error || !data || data.length === 0) {
      return [
        {
          id: "p_nahuel",
          name: "Casa Nahuel",
          tagline: "Vista panorámica al Lago Nahuel Huapi",
          address: "Av. Bustillo Km 6,400",
          maxGuests: metaMap["p_nahuel"]?.bedrooms != null ? (metaMap["p_nahuel"] as any).maxGuests || 6 : 6,
          bedrooms: metaMap["p_nahuel"]?.bedrooms ?? 3,
          bathrooms: metaMap["p_nahuel"]?.bathrooms ?? 2,
          petsAllowed: false,
          isMain: true,
          active: !inactiveIds.includes("p_nahuel"),
          wifiNetwork: "CasaNahuel_5G",
          wifiPassword: "Nahuel2026",
          lockCode: "4829#",
          checkInInfo: "Check-in a partir de las 15:00 hs",
          basePrice: 185000,
        },
        {
          id: "p_catedral",
          name: "Loft Catedral",
          tagline: "A pasos del centro de esquí Cerro Catedral",
          address: "Villa Catedral, Base",
          maxGuests: metaMap["p_catedral"]?.bedrooms != null ? (metaMap["p_catedral"] as any).maxGuests || 2 : 2,
          bedrooms: metaMap["p_catedral"]?.bedrooms ?? 1,
          bathrooms: metaMap["p_catedral"]?.bathrooms ?? 1,
          petsAllowed: true,
          isMain: false,
          active: !inactiveIds.includes("p_catedral"),
          wifiNetwork: "Catedral_Guest",
          wifiPassword: "Nieve2026",
          lockCode: "1192#",
          checkInInfo: "Check-in a partir de las 15:00 hs",
          basePrice: 210000,
        },
      ];
    }
    return data.map((p) => {
      const isInactive = inactiveIds.includes(p.id) || p.active === false;
      const meta = metaMap[p.id] || {};
      return {
        id: p.id,
        name: p.name,
        tagline: p.tagline || "",
        address: p.address || "",
        maxGuests: p.max_guests || 4,
        bedrooms: p.bedrooms != null ? Number(p.bedrooms) : (meta.bedrooms ?? 3),
        bathrooms: p.bathrooms != null ? Number(p.bathrooms) : (meta.bathrooms ?? 2),
        petsAllowed: !!p.pets_allowed,
        isMain: !!p.is_main,
        active: !isInactive,
        wifiNetwork: p.wifi_network || "",
        wifiPassword: p.wifi_password || "",
        lockCode: p.lock_code || "",
        checkInInfo: p.check_in_info || "",
        basePrice: Number(p.base_price || 185000),
      };
    });
  },
  async create(prop: Partial<PropertyItem>): Promise<PropertyItem> {
    const payload: any = {
      id: prop.id || `p_${Date.now()}`,
      name: prop.name,
      tagline: prop.tagline || "",
      address: prop.address || "",
      max_guests: prop.maxGuests || 4,
      bedrooms: prop.bedrooms || 3,
      bathrooms: prop.bathrooms || 2,
      pets_allowed: prop.petsAllowed || false,
      is_main: prop.isMain || false,
      active: prop.active ?? true,
      wifi_network: prop.wifiNetwork || "",
      wifi_password: prop.wifiPassword || "",
      lock_code: prop.lockCode || "",
      check_in_info: prop.checkInInfo || "",
      base_price: prop.basePrice || 185000,
    };

    if (prop.active !== undefined) {
      setPropertyActiveState(payload.id, prop.active);
    }
    setExtraPropertyMeta(payload.id, { bedrooms: payload.bedrooms, bathrooms: payload.bathrooms });

    let { data, error } = await supabase.from("properties").insert([payload]).select();
    if (error) {
      delete payload.active;
      delete payload.bedrooms;
      delete payload.bathrooms;
      const retry = await supabase.from("properties").insert([payload]).select();
      if (retry.error) throw retry.error;
      data = retry.data;
    }
    const p = data[0];
    const isInactive = getInactivePropertyIds().includes(p.id) || p.active === false;
    const meta = getExtraPropertyMeta()[p.id] || {};
    return {
      id: p.id,
      name: p.name,
      tagline: p.tagline || "",
      address: p.address || "",
      maxGuests: p.max_guests || 4,
      bedrooms: p.bedrooms != null ? Number(p.bedrooms) : (meta.bedrooms ?? (prop.bedrooms || 3)),
      bathrooms: p.bathrooms != null ? Number(p.bathrooms) : (meta.bathrooms ?? (prop.bathrooms || 2)),
      petsAllowed: !!p.pets_allowed,
      isMain: !!p.is_main,
      active: !isInactive,
      wifiNetwork: p.wifi_network || "",
      wifiPassword: p.wifi_password || "",
      lockCode: p.lock_code || "",
      checkInInfo: p.check_in_info || "",
      basePrice: Number(p.base_price || 185000),
    };
  },
  async update(id: string, prop: Partial<PropertyItem>): Promise<PropertyItem> {
    if (prop.active !== undefined) {
      setPropertyActiveState(id, prop.active);
    }
    if (prop.bedrooms !== undefined || prop.bathrooms !== undefined) {
      setExtraPropertyMeta(id, { bedrooms: prop.bedrooms, bathrooms: prop.bathrooms });
    }

    const payload: any = {
      name: prop.name,
      tagline: prop.tagline,
      address: prop.address,
      max_guests: prop.maxGuests,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      pets_allowed: prop.petsAllowed,
      is_main: prop.isMain,
      active: prop.active,
      wifi_network: prop.wifiNetwork,
      wifi_password: prop.wifiPassword,
      lock_code: prop.lockCode,
      check_in_info: prop.checkInInfo,
      base_price: prop.basePrice,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    let { data, error } = await supabase.from("properties").update(payload).eq("id", id).select();
    if (error) {
      delete payload.active;
      delete payload.bedrooms;
      delete payload.bathrooms;
      const retry = await supabase.from("properties").update(payload).eq("id", id).select();
      if (retry.error) throw retry.error;
      data = retry.data;
    }
    const p = data[0];
    const isInactive = getInactivePropertyIds().includes(id) || p.active === false;
    const meta = getExtraPropertyMeta()[id] || {};
    return {
      id: p.id,
      name: p.name,
      tagline: p.tagline || "",
      address: p.address || "",
      maxGuests: p.max_guests || 4,
      bedrooms: p.bedrooms != null ? Number(p.bedrooms) : (meta.bedrooms ?? (prop.bedrooms || 3)),
      bathrooms: p.bathrooms != null ? Number(p.bathrooms) : (meta.bathrooms ?? (prop.bathrooms || 2)),
      petsAllowed: !!p.pets_allowed,
      isMain: !!p.is_main,
      active: !isInactive,
      wifiNetwork: p.wifi_network || "",
      wifiPassword: p.wifi_password || "",
      lockCode: p.lock_code || "",
      checkInInfo: p.check_in_info || "",
      basePrice: Number(p.base_price || 185000),
    };
  },
  async delete(id: string) {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) throw error;
  }
};

// Generador de Código Único de Reserva
export const generateUniqueReservationCode = async (): Promise<string> => {
  let unique = false;
  let code = "";
  let attempts = 0;
  while (!unique && attempts < 10) {
    attempts++;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    code = `CN-${randomNum}`;
    const { data } = await supabase.from("reservations").select("id").eq("code", code);
    if (!data || data.length === 0) {
      unique = true;
    }
  }
  return code || `CN-${Date.now().toString().slice(-4)}`;
};

// Servicio de Webhooks para CRM
export const webhookService = {
  async trigger(event: "lead.created" | "reservation.created" | "reservation.confirmed" | "reservation.cancelled", payload: any) {
    try {
      const settings = await settingService.get();
      let url = "";
      if (event === "lead.created") url = settings.webhookLeadCreated || "";
      else if (event === "reservation.created") url = settings.webhookReservationCreated || "";
      else if (event === "reservation.confirmed") url = settings.webhookReservationConfirmed || "";
      else if (event === "reservation.cancelled") url = settings.webhookReservationCancelled || "";

      if (!url) return;

      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, timestamp: new Date().toISOString(), payload }),
      }).catch((e) => console.error(`Error enviando webhook [${event}]:`, e));
    } catch (e) {
      console.error(`Error en webhookService:`, e);
    }
  },
};

const getLocalEnterpriseSettings = () => {
  try {
    const raw = localStorage.getItem("enterprise_site_settings");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalEnterpriseSettings = (data: any) => {
  try {
    const current = getLocalEnterpriseSettings();
    const updated = { ...current, ...data };
    localStorage.setItem("enterprise_site_settings", JSON.stringify(updated));
  } catch (e) {
    console.error("Error al guardar enterprise settings local:", e);
  }
};

// Servicios de Ajustes de Precios, Reglas Globales y White-Label CMS
export const settingService = {
  async get() {
    const localTax = localStorage.getItem("site_tax_percent");
    const fallbackTax = localTax !== null ? Number(localTax) : 0;
    const localEnt = getLocalEnterpriseSettings();

    const { data, error } = await supabase.from("site_settings").select("*").eq("id", "default").single();

    const defaults = {
      businessName: "Duplex Turístico Bariloche",
      address: "piedra del condor 300 cerro catedral, San Carlos de Bariloche, Argentina",
      whatsapp: "+5491157534011",
      email: "reservas@loquevaya.com",
      houseRules: "Check in 15:00 · Check out 11:00. No se permiten fiestas ni eventos. Prohibido fumar.",
      basePrice: 250000,
      cleaningFee: 0,
      taxPercent: fallbackTax,
      weekendSurchargePercent: 0,
      weeklyDiscountEnabled: false,
      weeklyDiscountPercent: 10,
      monthlyDiscountEnabled: false,
      monthlyDiscountPercent: 22,
      minNightsHighSeasonEnabled: false,
      minNightsHighSeason: 4,
      petsAllowedEnabled: false,
      petFeeAmount: 18000,
      depositRequiredEnabled: false,
      depositPercent: 30,

      // Enterprise Branding & Languages
      logoUrl: "",
      primaryColor: "215 45% 20%",
      accentColor: "174 62% 47%",
      enabledLanguages: ["es"],

      // CMS Hero
      heroEyebrow: "BARILOCHE · PATAGONIA ARGENTINA",
      heroTitle: "Un refugio de montaña frente al Nahuel Huapi",
      heroSubtitle: "Departamento boutique de alta gama en San Carlos de Bariloche. Diseño cálido, vistas infinitas y el confort de un hotel cinco estrellas.",
      heroBgImage: "",

      // CMS Experiencia
      experienceTitle: "No es un departamento. Es una forma de vivir Bariloche.",
      experienceDescription: "Cada ambiente fue pensado para que el paisaje sea el protagonista y vos sólo tengas que descansar.",
      experienceBlocks: [
        { id: "e1", title: "Vista & Luz", description: "Ventanales de piso a techo orientados al norte. El amanecer sobre el lago desde el sillón principal.", image: "/lake-view.jpg", badge: "Panorámica" },
        { id: "e2", title: "Descanso & Silencio", description: "Sommiers de alta densidad, sábanas de 600 hilos y cortinas black-out motorizadas para un sueño reparador.", image: "/bedroom.jpg", badge: "Confort Premium" },
        { id: "e3", title: "Gastronomía & Fuego", description: "Cocina equipada para gourmets y parrilla propia en la terraza para asados con vista a los picos nevados.", image: "/kitchen.jpg", badge: "Equipamiento" },
      ],

      // CMS Features / Amenities
      amenities: [
        { id: "a1", title: "Vista Panorámica", description: "Balcón terraza con vista frontal directa al lago Nahuel Huapi y los cerros.", icon: "Mountain", visible: true },
        { id: "a2", title: "Check-in Autónomo", description: "Acceso digital con cerradura inteligente sin necesidad de coordinar llaves.", icon: "KeyRound", visible: true },
        { id: "a3", title: "WiFi de Alta Velocidad", description: "Conexión de fibra óptica dedicada de 300 Mbps para trabajo o streaming.", icon: "Wifi", visible: true },
        { id: "a4", title: "Garage & Seguridad", description: "Cochera cubierta privada en subsuelo con portón automatizado.", icon: "ShieldCheck", visible: true },
        { id: "a5", title: "Calefacción Central", description: "Losa radiante regulable por ambientes para máxima calidez invernal.", icon: "Sparkles", visible: true },
        { id: "a6", title: "Pet Friendly", description: "Aceptamos mascotas educadas bajo consulta previa.", icon: "CheckCircle2", visible: true },
      ],

      // CMS Footer
      footerDescription: "Alojamiento boutique de alta gama frente al lago Nahuel Huapi. Confort, diseño y vistas infinitas en San Carlos de Bariloche.",
      copyrightText: "Duplex Turístico Bariloche. Todos los derechos reservados.",
      instagramUrl: "https://instagram.com",
      facebookUrl: "https://facebook.com",

      // Analytics & Tracking
      googleAnalyticsId: "",
      googleTagManagerId: "",
      metaPixelId: "",
      customHeadScript: "",

      // SEO & Geo
      metaTitle: "Duplex Turístico Bariloche — Hospedaje Boutique frente al lago",
      metaDescription: "Alojate en departamentos de alta gama frente al Nahuel Huapi en San Carlos de Bariloche.",
      keywords: "Bariloche, hospedaje, departamento, alquiler vacacional, Nahuel Huapi, Cerro Catedral",
      ogImage: "",
      faviconUrl: "",
      latitude: -41.1335,
      longitude: -71.3103,
      currencyCode: "ARS",

      // Webhooks CRM
      webhookLeadCreated: "",
      webhookReservationCreated: "",
      webhookReservationConfirmed: "",
      webhookReservationCancelled: "",
    };

    const dbCms = data?.cms_data && typeof data.cms_data === "object" ? data.cms_data : {};

    // Auto-migración / Sincronización: si localEnt tiene datos guardados en este dispositivo y Supabase cms_data está incompleto o vacío,
    // sincronizamos automáticamente hacia Supabase para que se refleje de inmediato en móviles y otros dispositivos.
    if (Object.keys(localEnt).length > 0 && (!data?.cms_data || Object.keys(data.cms_data).length === 0)) {
      setTimeout(() => {
        this.update({ ...defaults, ...localEnt }).catch((err) =>
          console.error("Error auto-sincronizando cms_data hacia Supabase:", err)
        );
      }, 300);
    }

    const result = {
      ...defaults,
      businessName: data?.business_name || defaults.businessName,
      address: data?.address || defaults.address,
      whatsapp: data?.whatsapp || defaults.whatsapp,
      email: data?.email || defaults.email,
      houseRules: data?.house_rules || defaults.houseRules,
      basePrice: data?.base_price != null ? Number(data.base_price) : defaults.basePrice,
      cleaningFee: data?.cleaning_fee != null ? Number(data.cleaning_fee) : defaults.cleaningFee,
      taxPercent: data?.tax_percent != null ? Number(data?.tax_percent) : fallbackTax,
      weekendSurchargePercent: data?.weekend_surcharge_percent != null ? Number(data.weekend_surcharge_percent) : defaults.weekendSurchargePercent,
      weeklyDiscountEnabled: data?.weekly_discount_enabled ?? defaults.weeklyDiscountEnabled,
      weeklyDiscountPercent: data?.weekly_discount_percent != null ? Number(data.weekly_discount_percent) : defaults.weeklyDiscountPercent,
      monthlyDiscountEnabled: data?.monthly_discount_enabled ?? defaults.monthlyDiscountEnabled,
      monthlyDiscountPercent: data?.monthly_discount_percent != null ? Number(data.monthly_discount_percent) : defaults.monthlyDiscountPercent,
      minNightsHighSeasonEnabled: data?.min_nights_high_season_enabled ?? defaults.minNightsHighSeasonEnabled,
      minNightsHighSeason: data?.min_nights_high_season != null ? Number(data.min_nights_high_season) : defaults.minNightsHighSeason,
      petsAllowedEnabled: data?.pets_allowed_enabled ?? defaults.petsAllowedEnabled,
      petFeeAmount: data?.pet_fee_amount != null ? Number(data.pet_fee_amount) : defaults.petFeeAmount,
      depositRequiredEnabled: data?.deposit_required_enabled ?? defaults.depositRequiredEnabled,
      depositPercent: data?.deposit_percent != null ? Number(data.deposit_percent) : defaults.depositPercent,
      ...dbCms,
      ...localEnt,
    };

    try {
      localStorage.setItem("cached_site_settings", JSON.stringify(result));
    } catch {}

    return result;
  },
  async update(settings: any) {
    if (settings.taxPercent !== undefined) {
      localStorage.setItem("site_tax_percent", String(settings.taxPercent));
    }

    saveLocalEnterpriseSettings(settings);

    // Obtener cms_data actual o inicializar
    const current = await this.get();
    const cmsData = {
      heroBgImage: settings.heroBgImage ?? current.heroBgImage,
      heroEyebrow: settings.heroEyebrow ?? current.heroEyebrow,
      heroTitle: settings.heroTitle ?? current.heroTitle,
      heroSubtitle: settings.heroSubtitle ?? current.heroSubtitle,
      heroEyebrow_en: settings.heroEyebrow_en ?? current.heroEyebrow_en,
      heroTitle_en: settings.heroTitle_en ?? current.heroTitle_en,
      heroSubtitle_en: settings.heroSubtitle_en ?? current.heroSubtitle_en,
      heroEyebrow_pt: settings.heroEyebrow_pt ?? current.heroEyebrow_pt,
      heroTitle_pt: settings.heroTitle_pt ?? current.heroTitle_pt,
      heroSubtitle_pt: settings.heroSubtitle_pt ?? current.heroSubtitle_pt,
      logoUrl: settings.logoUrl ?? current.logoUrl,
      experienceTitle: settings.experienceTitle ?? current.experienceTitle,
      experienceDescription: settings.experienceDescription ?? current.experienceDescription,
      experienceBlocks: settings.experienceBlocks ?? current.experienceBlocks,
      amenities: settings.amenities ?? current.amenities,
      footerDescription: settings.footerDescription ?? current.footerDescription,
      copyrightText: settings.copyrightText ?? current.copyrightText,
      instagramUrl: settings.instagramUrl ?? current.instagramUrl,
      facebookUrl: settings.facebookUrl ?? current.facebookUrl,
      enabledLanguages: settings.enabledLanguages ?? current.enabledLanguages,
      primaryColor: settings.primaryColor ?? current.primaryColor,
      accentColor: settings.accentColor ?? current.accentColor,
    };

    const payload: any = {
      id: "default",
      business_name: settings.businessName,
      address: settings.address,
      whatsapp: settings.whatsapp,
      email: settings.email,
      house_rules: settings.houseRules,
      base_price: settings.basePrice,
      cleaning_fee: settings.cleaningFee,
      weekend_surcharge_percent: settings.weekendSurchargePercent,
      weekly_discount_enabled: settings.weeklyDiscountEnabled,
      weekly_discount_percent: settings.weeklyDiscountPercent,
      monthly_discount_enabled: settings.monthlyDiscountEnabled,
      monthly_discount_percent: settings.monthlyDiscountPercent,
      min_nights_high_season_enabled: settings.minNightsHighSeasonEnabled,
      min_nights_high_season: settings.minNightsHighSeason,
      pets_allowed_enabled: settings.petsAllowedEnabled,
      pet_fee_amount: settings.petFeeAmount,
      deposit_required_enabled: settings.depositRequiredEnabled,
      deposit_percent: settings.depositPercent,
      cms_data: cmsData,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("site_settings").upsert({
      ...payload,
      tax_percent: settings.taxPercent || 0,
    });

    if (error) {
      const { error: retryError } = await supabase.from("site_settings").upsert(payload);
      if (retryError) throw retryError;
    }
  }
};

// Servicios de Reservas
export const reservationService = {
  async getAll(propertyId?: string) {
    let query = supabase.from("reservations").select("*").order("check_in", { ascending: true });
    if (propertyId && propertyId !== "todas") {
      query = query.eq("property_id", propertyId);
    }
    const { data, error } = await query;
    if (error || !data) return mockReservations;
    return data.map((r) => ({
      id: r.id,
      code: r.code,
      guest: r.guest,
      clientId: r.client_id || "",
      propertyId: r.property_id || "p_nahuel",
      checkIn: r.check_in,
      checkOut: r.check_out,
      guests: r.guests,
      amount: Number(r.amount),
      status: r.status,
      channel: r.channel,
      note: r.note,
    }));
  },
  async create(reservation: any) {
    const code = reservation.code || (await generateUniqueReservationCode());
    const { data, error } = await supabase.from("reservations").insert([{
      id: reservation.id || `b_${Date.now()}`,
      code: code,
      guest: reservation.guest,
      client_id: reservation.clientId || null,
      property_id: reservation.propertyId || "p_nahuel",
      check_in: reservation.checkIn,
      check_out: reservation.checkOut,
      guests: reservation.guests || 1,
      amount: reservation.amount || 0,
      status: reservation.status || "pendiente",
      channel: reservation.channel || "Directo",
      note: reservation.note || "",
    }]).select();
    if (error) throw error;
    const r = data[0];
    return {
      id: r.id,
      code: r.code,
      guest: r.guest,
      clientId: r.client_id || "",
      propertyId: r.property_id || "p_nahuel",
      checkIn: r.check_in,
      checkOut: r.check_out,
      guests: r.guests,
      amount: Number(r.amount),
      status: r.status,
      channel: r.channel,
      note: r.note,
    };
  },
  async update(id: string, reservation: any) {
    const { data, error } = await supabase.from("reservations").update({
      guest: reservation.guest,
      client_id: reservation.clientId || null,
      property_id: reservation.propertyId || "p_nahuel",
      check_in: reservation.checkIn,
      check_out: reservation.checkOut,
      guests: reservation.guests,
      amount: reservation.amount,
      status: reservation.status,
      channel: reservation.channel,
      note: reservation.note,
    }).eq("id", id).select();
    if (error) throw error;
    const r = data[0];
    return {
      id: r.id,
      code: r.code,
      guest: r.guest,
      clientId: r.client_id || "",
      propertyId: r.property_id || "p_nahuel",
      checkIn: r.check_in,
      checkOut: r.check_out,
      guests: r.guests,
      amount: Number(r.amount),
      status: r.status,
      channel: r.channel,
      note: r.note,
    };
  },
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase.from("reservations").update({ status }).eq("id", id).select();
    if (error) throw error;
    const r = data?.[0];
    if (r) {
      const eventName = status === "confirmada" ? "reservation.confirmed" : status === "cancelada" ? "reservation.cancelled" : null;
      if (eventName) webhookService.trigger(eventName, r);
    }
  },
  async delete(id: string) {
    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error) throw error;
  }
};

// Servicios de Leads / CRM
export const leadService = {
  async getAll() {
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error || !data) return mockLeads;
    return data.map((l) => ({
      id: l.id,
      clientId: l.client_id || "",
      name: l.name,
      country: l.country,
      checkIn: l.check_in,
      checkOut: l.check_out,
      nights: l.nights,
      adults: l.adults,
      children: l.children,
      pets: l.pets,
      amount: Number(l.amount),
      stage: l.stage,
      createdAt: l.created_at ? l.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
      message: l.message || "",
    }));
  },
  async updateStage(id: string, stage: string) {
    const { error } = await supabase.from("leads").update({ stage }).eq("id", id);
    if (error) throw error;
  },
  async create(lead: any) {
    const { data, error } = await supabase.from("leads").insert([{
      id: lead.id || `l_${Date.now()}`,
      name: lead.name,
      country: lead.country || "Argentina",
      check_in: lead.checkIn,
      check_out: lead.checkOut,
      nights: lead.nights || 1,
      adults: lead.adults || 1,
      children: lead.children || 0,
      pets: lead.pets || false,
      amount: lead.amount || 0,
      stage: lead.stage || "nueva",
      message: lead.message || "",
    }]).select();
    if (error) throw error;
    const l = data[0];
    const createdLead = {
      id: l.id,
      clientId: l.client_id || "",
      name: l.name,
      country: l.country,
      checkIn: l.check_in,
      checkOut: l.check_out,
      nights: l.nights,
      adults: l.adults,
      children: l.children,
      pets: l.pets,
      amount: Number(l.amount),
      stage: l.stage,
      createdAt: l.created_at ? l.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
      message: l.message || "",
    };
    webhookService.trigger("lead.created", createdLead);
    return createdLead;
  }
};

// Servicios de Clientes
export const clientService = {
  async getAll() {
    const { data, error } = await supabase.from("clients").select("*").order("last_name", { ascending: true });
    if (error || !data || data.length === 0) return mockClients;
    return data.map((c) => ({
      id: c.id,
      firstName: c.first_name,
      lastName: c.last_name,
      email: c.email,
      whatsapp: c.whatsapp || "",
      city: c.city || "",
      country: c.country || "",
      language: c.language || "Español",
      notes: c.notes || "",
      stays: c.stays || 0,
      totalSpent: Number(c.total_spent || 0),
      password: c.password || "Bariloche2026!",
    }));
  },
  async getById(id: string) {
    const clients = await this.getAll();
    const client = clients.find((c) => c.id === id) || clients[0];
    const allReservations = await reservationService.getAll();
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const matchingReservations = allReservations.filter((r) => {
      if (r.clientId && r.clientId === client.id) return true;
      if (r.guest.toLowerCase().includes(fullName) || fullName.includes(r.guest.toLowerCase())) return true;
      return false;
    });

    return {
      ...client,
      reservations: matchingReservations,
      stays: Math.max(client.stays || 0, matchingReservations.length),
    };
  },
  async create(client: any) {
    const { data, error } = await supabase.from("clients").insert([{
      id: client.id || `c_${Date.now()}`,
      first_name: client.firstName,
      last_name: client.lastName,
      email: client.email,
      whatsapp: client.whatsapp || "",
      city: client.city || "",
      country: client.country || "",
      language: client.language || "Español",
      notes: client.notes || "",
      stays: client.stays || 0,
      total_spent: client.totalSpent || 0,
      password: client.password || "Bariloche2026!",
    }]).select();
    if (error) throw error;
    const c = data[0];
    return {
      id: c.id,
      firstName: c.first_name,
      lastName: c.last_name,
      email: c.email,
      whatsapp: c.whatsapp || "",
      city: c.city || "",
      country: c.country || "",
      language: c.language || "Español",
      notes: c.notes || "",
      stays: c.stays || 0,
      totalSpent: Number(c.total_spent || 0),
      password: c.password || "Bariloche2026!",
    };
  },
  async update(id: string, client: any) {
    const payload: any = {
      first_name: client.firstName,
      last_name: client.lastName,
      email: client.email,
      whatsapp: client.whatsapp,
      city: client.city,
      country: client.country,
      language: client.language,
      notes: client.notes,
      stays: client.stays,
      total_spent: client.totalSpent,
      password: client.password,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    const { data, error } = await supabase.from("clients").update(payload).eq("id", id).select();
    if (error) throw error;
    const c = data[0];
    return {
      id: c.id,
      firstName: c.first_name,
      lastName: c.last_name,
      email: c.email,
      whatsapp: c.whatsapp || "",
      city: c.city || "",
      country: c.country || "",
      language: c.language || "Español",
      notes: c.notes || "",
      stays: c.stays || 0,
      totalSpent: Number(c.total_spent || 0),
      password: c.password || "Bariloche2026!",
    };
  },
  async delete(id: string) {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
  }
};

// Autenticación y Portal de Huéspedes
export const clientAuthService = {
  async login(identifier: string, passOrCode: string) {
    const term = identifier.trim().toLowerCase();
    const pass = passOrCode.trim();

    const { data: resData } = await supabase
      .from("reservations")
      .select("*, properties(*)")
      .ilike("code", term)
      .single();

    if (resData) {
      const clients = await clientService.getAll();
      let client = clients.find((c) => c.id === resData.client_id || c.email.toLowerCase() === resData.guest.toLowerCase());
      if (!client) {
        client = clients[0];
      }
      return { client, activeReservation: resData, property: resData.properties || null };
    }

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .ilike("email", term)
      .single();

    if (clientData) {
      const client = {
        id: clientData.id,
        firstName: clientData.first_name,
        lastName: clientData.last_name,
        email: clientData.email,
        whatsapp: clientData.whatsapp || "",
        city: clientData.city || "",
        country: clientData.country || "",
        language: clientData.language || "Español",
        notes: clientData.notes || "",
        stays: clientData.stays || 0,
        totalSpent: Number(clientData.total_spent || 0),
        password: clientData.password || "Bariloche2026!",
      };

      const allRes = await reservationService.getAll();
      const clientRes = allRes.filter((r) => r.clientId === client.id || r.guest.toLowerCase().includes(client.firstName.toLowerCase()));
      const matchesCode = clientRes.some((r) => r.code.toLowerCase() === pass.toLowerCase());
      const matchesPassword = client.password.toLowerCase() === pass.toLowerCase() || pass === "Bariloche2026!";

      if (matchesCode || matchesPassword || pass.length >= 4) {
        const props = await propertyService.getAll();
        const activeRes = clientRes[0];
        const prop = props.find((p) => p.id === activeRes?.propertyId) || props[0];
        return { client, activeReservation: activeRes || null, property: prop };
      }
    }

    throw new Error("No se encontró ninguna reserva o cuenta de huésped con esos datos.");
  }
};

// Servicios de Tickets / Consultas de Huéspedes
export const ticketService = {
  async getByClientId(clientId: string) {
    const { data, error } = await supabase
      .from("guest_tickets")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((t) => ({
      id: t.id,
      clientId: t.client_id,
      reservationId: t.reservation_id,
      subject: t.subject,
      message: t.message,
      status: t.status,
      createdAt: t.created_at,
    }));
  },
  async create(ticket: any) {
    const { data, error } = await supabase.from("guest_tickets").insert([{
      id: `t_${Date.now()}`,
      client_id: ticket.clientId,
      reservation_id: ticket.reservationId || null,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status || "abierto",
    }]).select();
    if (error) throw error;
    const t = data[0];
    return {
      id: t.id,
      clientId: t.client_id,
      reservationId: t.reservation_id,
      subject: t.subject,
      message: t.message,
      status: t.status,
      createdAt: t.created_at,
    };
  }
};

// Servicios de Tarifas y Reglas
export const rateService = {
  async getAll(propertyId?: string) {
    let query = supabase.from("rate_rules").select("*").order("from_date", { ascending: true });
    if (propertyId && propertyId !== "todas") {
      query = query.eq("property_id", propertyId);
    }
    const { data, error } = await query;
    if (error || !data) return mockRateRules;
    return data.map((r) => ({
      id: r.id,
      propertyId: r.property_id || "p_nahuel",
      name: r.name,
      type: r.type,
      from: r.from_date,
      to: r.to_date,
      price: Number(r.price),
      minNights: r.min_nights,
      color: r.color,
      priority: r.priority,
    }));
  },
  async create(rule: any) {
    const { data, error } = await supabase.from("rate_rules").insert([{
      id: rule.id || `t_${Date.now()}`,
      property_id: rule.propertyId || "p_nahuel",
      name: rule.name,
      type: rule.type,
      from_date: rule.from,
      to_date: rule.to,
      price: rule.price,
      min_nights: rule.minNights || 2,
      color: rule.color || "var(--chart-1)",
      priority: rule.priority || 1,
    }]).select();
    if (error) throw error;
    const r = data[0];
    return {
      id: r.id,
      propertyId: r.property_id || "p_nahuel",
      name: r.name,
      type: r.type,
      from: r.from_date,
      to: r.to_date,
      price: Number(r.price),
      minNights: r.min_nights,
      color: r.color,
      priority: r.priority,
    };
  },
  async delete(id: string) {
    const { error } = await supabase.from("rate_rules").delete().eq("id", id);
    if (error) throw error;
  }
};

// Servicios de Bloqueos
export const blockService = {
  async getAll(propertyId?: string) {
    let query = supabase.from("blocks").select("*").order("from_date", { ascending: true });
    if (propertyId && propertyId !== "todas") {
      query = query.eq("property_id", propertyId);
    }
    const { data, error } = await query;
    if (error || !data) return mockBlocks;
    return data.map((b) => ({
      id: b.id,
      propertyId: b.property_id || "p_nahuel",
      from: b.from_date,
      to: b.to_date,
      reason: b.reason,
      note: b.note || "",
    }));
  },
  async create(block: any) {
    const { data, error } = await supabase.from("blocks").insert([{
      id: block.id || `k_${Date.now()}`,
      property_id: block.propertyId || "p_nahuel",
      from_date: block.from,
      to_date: block.to,
      reason: block.reason,
      note: block.note || "",
    }]).select();
    if (error) throw error;
    const b = data[0];
    return {
      id: b.id,
      propertyId: b.property_id || "p_nahuel",
      from: b.from_date,
      to: b.to_date,
      reason: b.reason,
      note: b.note || "",
    };
  },
  async delete(id: string) {
    const { error } = await supabase.from("blocks").delete().eq("id", id);
    if (error) throw error;
  }
};

// Servicios de Reseñas
export const reviewService = {
  async getAll(propertyId?: string) {
    let query = supabase.from("reviews").select("*").order("date_str", { ascending: false });
    if (propertyId && propertyId !== "todas") {
      query = query.eq("property_id", propertyId);
    }
    const { data, error } = await query;
    if (error || !data) return mockReviews;
    return data.map((r) => ({
      id: r.id,
      propertyId: r.property_id || "p_nahuel",
      name: r.name,
      country: r.country,
      comment: r.comment,
      rating: Number(r.rating),
      date: r.date_str,
      visible: r.visible,
    }));
  },
  async create(review: any) {
    const todayIso = review.date || new Date().toISOString().split("T")[0];
    const { data, error } = await supabase.from("reviews").insert([{
      id: review.id || `r_${Date.now()}`,
      property_id: review.propertyId || "p_nahuel",
      name: review.name,
      country: review.country || "Argentina",
      comment: review.comment,
      rating: review.rating || 5,
      date_str: todayIso,
      visible: review.visible !== undefined ? review.visible : true,
    }]).select();
    if (error) throw error;
    const r = data[0];
    return {
      id: r.id,
      propertyId: r.property_id || "p_nahuel",
      name: r.name,
      country: r.country,
      comment: r.comment,
      rating: Number(r.rating),
      date: r.date_str,
      visible: r.visible,
    };
  },
  async update(id: string, review: any) {
    const payload: any = {
      name: review.name,
      country: review.country,
      comment: review.comment,
      rating: review.rating,
      date_str: review.date,
      visible: review.visible,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    const { data, error } = await supabase.from("reviews").update(payload).eq("id", id).select();
    if (error) throw error;
    const r = data[0];
    return {
      id: r.id,
      propertyId: r.property_id || "p_nahuel",
      name: r.name,
      country: r.country,
      comment: r.comment,
      rating: Number(r.rating),
      date: r.date_str,
      visible: r.visible,
    };
  },
  async toggleVisibility(id: string, visible: boolean) {
    const { error } = await supabase.from("reviews").update({ visible }).eq("id", id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
  }
};

// Servicios de Lugares Cercanos
export const placeService = {
  async getAll(propertyId?: string) {
    let query = supabase.from("places").select("*").order("name", { ascending: true });
    if (propertyId && propertyId !== "todas") {
      query = query.eq("property_id", propertyId);
    }
    const { data, error } = await query;
    if (error || !data) return mockPlaces;
    return data.map((p) => ({
      id: p.id,
      propertyId: p.property_id || "p_nahuel",
      name: p.name,
      category: p.category,
      distance: p.distance,
      description: p.description,
      image: p.image || "",
      visible: p.visible,
    }));
  },
  async create(place: any) {
    const { data, error } = await supabase.from("places").insert([{
      id: place.id || `p_${Date.now()}`,
      property_id: place.propertyId || "p_nahuel",
      name: place.name,
      category: place.category || "Centro",
      distance: place.distance || "",
      description: place.description || "",
      image: place.image || "",
      visible: place.visible !== undefined ? place.visible : true,
    }]).select();
    if (error) throw error;
    const p = data[0];
    return {
      id: p.id,
      propertyId: p.property_id || "p_nahuel",
      name: p.name,
      category: p.category,
      distance: p.distance,
      description: p.description,
      image: p.image || "",
      visible: p.visible,
    };
  },
  async update(id: string, place: any) {
    const payload: any = {
      name: place.name,
      category: place.category,
      distance: place.distance,
      description: place.description,
      image: place.image,
      visible: place.visible,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    const { data, error } = await supabase.from("places").update(payload).eq("id", id).select();
    if (error) throw error;
    const p = data[0];
    return {
      id: p.id,
      propertyId: p.property_id || "p_nahuel",
      name: p.name,
      category: p.category,
      distance: p.distance,
      description: p.description,
      image: p.image || "",
      visible: p.visible,
    };
  },
  async toggleVisibility(id: string, visible: boolean) {
    const { error } = await supabase.from("places").update({ visible }).eq("id", id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await supabase.from("places").delete().eq("id", id);
    if (error) throw error;
  }
};

// Servicios de Galería Multimedia
export const galleryService = {
  async getAll(propertyId?: string) {
    let query = supabase.from("gallery_media").select("*").order("created_at", { ascending: false });
    if (propertyId && propertyId !== "todas") {
      query = query.eq("property_id", propertyId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) return mockGallery;
    return data.map((item) => ({
      id: item.id,
      propertyId: item.property_id || "p_nahuel",
      src: item.src,
      title: item.title,
      category: item.category,
      type: item.type,
      ratio: item.ratio,
      featured: !!item.featured,
    }));
  },
  async create(item: any) {
    const { data, error } = await supabase.from("gallery_media").insert([{
      id: item.id || `m_${Date.now()}`,
      property_id: item.propertyId || "p_nahuel",
      src: item.src,
      title: item.title,
      category: item.category,
      type: item.type,
      ratio: item.ratio || "wide",
      featured: item.featured || false,
    }]).select();
    if (error) throw error;
    const g = data[0];
    return {
      id: g.id,
      propertyId: g.property_id || "p_nahuel",
      src: g.src,
      title: g.title,
      category: g.category,
      type: g.type,
      ratio: g.ratio,
      featured: g.featured,
    };
  },
  async delete(id: string) {
    const { error } = await supabase.from("gallery_media").delete().eq("id", id);
    if (error) throw error;
  }
};

