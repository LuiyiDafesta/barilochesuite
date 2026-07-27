import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { KeyRound, Menu, Mountain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { property as defaultProperty } from "@/data/site";
import { settingService } from "@/lib/services";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/galeria", label: "Galería" },
  { to: "/ubicacion", label: "Ubicación" },
  { to: "/reservar", label: "Disponibilidad" },
  { to: "/mi-reserva", label: "Mi Reserva" },
];

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [brandName, setBrandName] = useState(defaultProperty.name);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await settingService.get();
        if (s.businessName) setBrandName(s.businessName);
      } catch (e) {
        console.error("Error al cargar ajustes en Navbar:", e);
      }
    };
    loadSettings();

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !transparent || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-border/60 bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:flex sm:justify-between lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors",
              solid ? "border-border bg-primary text-primary-foreground" : "border-white/30 bg-white/10 text-white",
            )}
          >
            <Mountain className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate font-display text-base font-semibold tracking-tight transition-colors",
                solid ? "text-foreground" : "text-white",
              )}
            >
              {brandName}
            </span>
            <span
              className={cn(
                "block truncate text-[11px] uppercase tracking-[0.18em] transition-colors",
                solid ? "text-muted-foreground" : "text-white/70",
              )}
            >
              Bariloche
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors flex items-center gap-1.5",
                solid ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white",
                pathname === l.to && (solid ? "text-foreground" : "text-white"),
              )}
            >
              {l.to === "/mi-reserva" && <KeyRound className="h-3.5 w-3.5 text-teal" />}
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Button
            asChild
            size="sm"
            variant="outline"
            className={cn(
              "hidden rounded-full px-4 text-xs md:inline-flex",
              solid ? "" : "border-white/40 bg-white/10 text-white hover:bg-white/20",
            )}
          >
            <Link to="/mi-reserva">
              <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Mi Reserva
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className={cn(
              "hidden rounded-full px-5 md:inline-flex",
              solid ? "" : "bg-white text-primary hover:bg-white/90",
            )}
          >
            <Link to="/reservar">Reservar</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("md:hidden", solid ? "" : "text-white hover:bg-white/10 hover:text-white")}
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetTitle className="px-5 pt-5 font-display text-lg">{brandName}</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1 px-3">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-base text-foreground transition-colors hover:bg-muted"
                  >
                    {l.to === "/mi-reserva" && <KeyRound className="h-4 w-4 text-teal" />}
                    {l.label}
                  </Link>
                ))}
                <Button asChild className="mt-4 rounded-full" onClick={() => setOpen(false)}>
                  <Link to="/reservar">Consultar disponibilidad</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
