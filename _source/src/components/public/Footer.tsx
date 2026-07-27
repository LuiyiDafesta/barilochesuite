import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle, Mail, MapPin, Mountain, KeyRound } from "lucide-react";

import { property as defaultProperty } from "@/data/site";
import { Separator } from "@/components/ui/separator";
import { settingService } from "@/lib/services";

export function Footer() {
  const [info, setInfo] = useState({
    businessName: defaultProperty.name,
    address: defaultProperty.address,
    whatsapp: defaultProperty.whatsapp,
    email: defaultProperty.email,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await settingService.get();
        setInfo({
          businessName: s.businessName || defaultProperty.name,
          address: s.address || defaultProperty.address,
          whatsapp: s.whatsapp || defaultProperty.whatsapp,
          email: s.email || defaultProperty.email,
        });
      } catch (e) {
        console.error("Error al cargar ajustes en Footer:", e);
      }
    };
    loadSettings();
  }, []);

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Mountain className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-lg font-semibold">{info.businessName}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {defaultProperty.tagline} en San Carlos de Bariloche. Un refugio de diseño con vistas al Nahuel Huapi.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Navegación</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link to="/" className="text-foreground/80 transition-colors hover:text-foreground">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="text-foreground/80 transition-colors hover:text-foreground">
                  Galería
                </Link>
              </li>
              <li>
                <Link to="/ubicacion" className="text-foreground/80 transition-colors hover:text-foreground">
                  Ubicación
                </Link>
              </li>
              <li>
                <Link to="/reservar" className="text-foreground/80 transition-colors hover:text-foreground">
                  Disponibilidad
                </Link>
              </li>
              <li>
                <Link to="/mi-reserva" className="text-teal font-medium transition-colors hover:text-teal/80 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" /> Portal del Huésped (Mi Reserva)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Contacto</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-foreground/80">
                <MessageCircle className="h-4 w-4 shrink-0 text-teal" /> {info.whatsapp}
              </li>
              <li className="flex items-center gap-2 text-foreground/80">
                <Mail className="h-4 w-4 shrink-0 text-teal" /> {info.email}
              </li>
              <li className="flex items-center gap-2 text-foreground/80">
                <Instagram className="h-4 w-4 shrink-0 text-teal" /> {defaultProperty.instagram}
              </li>
              <li className="flex items-center gap-2 text-foreground/80">
                <Facebook className="h-4 w-4 shrink-0 text-teal" /> {defaultProperty.facebook}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Dónde estamos</h4>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              <iframe
                title="Mapa de ubicación"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-71.42%2C-41.16%2C-71.24%2C-41.08&layer=mapnik"
                className="h-36 w-full"
                loading="lazy"
              />
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {info.address}
            </p>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {info.businessName}. Todos los derechos reservados.</p>
          <div className="flex gap-5">
            <span>Políticas de cancelación</span>
            <Link to="/admin/login" className="transition-colors hover:text-foreground font-medium">
              Panel del anfitrión (Admin)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
