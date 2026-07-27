import { supabase } from "./supabase";
import { reservations as mockReservations, leads as mockLeads, clients as mockClients, rateRules as mockRateRules, blocks as mockBlocks } from "@/data/admin";
import { reviews as mockReviews, places as mockPlaces } from "@/data/site";

// Servicios de Ajustes de Precios y Reglas Globales
export const settingService = {
  async get() {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", "default").single();
    if (error || !data) {
      return {
        basePrice: 185000,
        cleaningFee: 45000,
        weekendSurchargePercent: 15,
        weeklyDiscountEnabled: true,
        weeklyDiscountPercent: 10,
        monthlyDiscountEnabled: true,
        monthlyDiscountPercent: 22,
        minNightsHighSeasonEnabled: true,
        minNightsHighSeason: 4,
        petsAllowedEnabled: false,
        petFeeAmount: 18000,
        depositRequiredEnabled: true,
        depositPercent: 30,
      };
    }
    return {
      basePrice: data.base_price != null ? Number(data.base_price) : 185000,
      cleaningFee: data.cleaning_fee != null ? Number(data.cleaning_fee) : 45000,
      weekendSurchargePercent: data.weekend_surcharge_percent != null ? Number(data.weekend_surcharge_percent) : 15,
      weeklyDiscountEnabled: data.weekly_discount_enabled ?? true,
      weeklyDiscountPercent: data.weekly_discount_percent != null ? Number(data.weekly_discount_percent) : 10,
      monthlyDiscountEnabled: data.monthly_discount_enabled ?? true,
      monthlyDiscountPercent: data.monthly_discount_percent != null ? Number(data.monthly_discount_percent) : 22,
      minNightsHighSeasonEnabled: data.min_nights_high_season_enabled ?? true,
      minNightsHighSeason: data.min_nights_high_season != null ? Number(data.min_nights_high_season) : 4,
      petsAllowedEnabled: data.pets_allowed_enabled ?? false,
      petFeeAmount: data.pet_fee_amount != null ? Number(data.pet_fee_amount) : 18000,
      depositRequiredEnabled: data.deposit_required_enabled ?? true,
      depositPercent: data.deposit_percent != null ? Number(data.deposit_percent) : 30,
    };
  },
  async update(settings: any) {
    const { error } = await supabase.from("site_settings").upsert({
      id: "default",
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
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
};

// Servicios de Reservas
export const reservationService = {
  async getAll() {
    const { data, error } = await supabase.from("reservations").select("*").order("check_in", { ascending: true });
    if (error || !data) return mockReservations;
    return data.map((r) => ({
      id: r.id,
      code: r.code,
      guest: r.guest,
      clientId: r.client_id || "",
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
    const { data, error } = await supabase.from("reservations").insert([{
      id: reservation.id || `b_${Date.now()}`,
      code: reservation.code || `CN-${Math.floor(1000 + Math.random() * 9000)}`,
      guest: reservation.guest,
      client_id: reservation.clientId || null,
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
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) throw error;
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
    return {
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
  }
};

// Servicios de Clientes
export const clientService = {
  async getAll() {
    const { data, error } = await supabase.from("clients").select("*").order("last_name", { ascending: true });
    if (error || !data) return mockClients;
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
    }));
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
    };
  }
};

// Servicios de Tarifas y Reglas
export const rateService = {
  async getAll() {
    const { data, error } = await supabase.from("rate_rules").select("*").order("from_date", { ascending: true });
    if (error || !data) return mockRateRules;
    return data.map((r) => ({
      id: r.id,
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
  async getAll() {
    const { data, error } = await supabase.from("blocks").select("*").order("from_date", { ascending: true });
    if (error || !data) return mockBlocks;
    return data.map((b) => ({
      id: b.id,
      from: b.from_date,
      to: b.to_date,
      reason: b.reason,
      note: b.note || "",
    }));
  },
  async create(block: any) {
    const { data, error } = await supabase.from("blocks").insert([{
      id: block.id || `k_${Date.now()}`,
      from_date: block.from,
      to_date: block.to,
      reason: block.reason,
      note: block.note || "",
    }]).select();
    if (error) throw error;
    const b = data[0];
    return {
      id: b.id,
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
  async getAll() {
    const { data, error } = await supabase.from("reviews").select("*").order("date_str", { ascending: false });
    if (error || !data) return mockReviews;
    return data.map((r) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      comment: r.comment,
      rating: Number(r.rating),
      date: r.date_str,
      visible: r.visible,
    }));
  },
  async toggleVisibility(id: string, visible: boolean) {
    const { error } = await supabase.from("reviews").update({ visible }).eq("id", id);
    if (error) throw error;
  }
};

// Servicios de Lugares Cercanos
export const placeService = {
  async getAll() {
    const { data, error } = await supabase.from("places").select("*").order("name", { ascending: true });
    if (error || !data) return mockPlaces;
    return data.map((p) => ({
      id: p.id,
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
