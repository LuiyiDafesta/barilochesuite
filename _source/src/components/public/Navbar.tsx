import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Globe, KeyRound, Menu, Mountain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentLanguage, Language, setCurrentLanguage, translations } from "@/lib/i18n";
import { settingService } from "@/lib/services";
import { cn } from "@/lib/utils";

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [brandName, setBrandName] = useState("Bariloche Suite");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [enabledLangs, setEnabledLangs] = useState<Language[]>(["es"]);
  const [currentLang, setLangState] = useState<Language>(getCurrentLanguage());

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = translations[currentLang]?.nav || translations.es.nav;

  const links = [
    { to: "/", label: t.home },
    { to: "/propiedades", label: t.properties },
    { to: "/galeria", label: t.gallery },
    { to: "/ubicacion", label: t.location },
    { to: "/reservar", label: t.availability },
    { to: "/mi-reserva", label: t.myReservation },
  ];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await settingService.get();
        if (s.businessName) setBrandName(s.businessName);
        if (s.logoUrl) setLogoUrl(s.logoUrl);
        if (s.enabledLanguages && s.enabledLanguages.length > 0) {
          setEnabledLangs(s.enabledLanguages as Language[]);
        }
      } catch (e) {
        console.error("Error al cargar ajustes en Navbar:", e);
      }
    };
    loadSettings();

    const onLangChange = (e: any) => setLangState(e.detail);
    window.addEventListener("language_changed", onLangChange);

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("language_changed", onLangChange);
    };
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLangState(lang);
    setCurrentLanguage(lang);
  };

  const solid = !transparent || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-border/60 bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className="h-9 w-auto object-contain" />
          ) : (
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors",
                solid ? "border-border bg-primary text-primary-foreground" : "border-white/30 bg-white/10 text-white"
              )}
            >
              <Mountain className="h-4.5 w-4.5" />
            </span>
          )}
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate font-display text-base font-semibold tracking-tight transition-colors",
                solid ? "text-foreground" : "text-white"
              )}
            >
              {brandName}
            </span>
            <span
              className={cn(
                "block truncate text-[11px] uppercase tracking-[0.18em] transition-colors",
                solid ? "text-muted-foreground" : "text-white/70"
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
                "rounded-full px-3.5 py-1.5 text-sm transition-colors flex items-center gap-1.5",
                solid ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white",
                pathname === l.to && (solid ? "text-foreground font-semibold" : "text-white font-semibold")
              )}
            >
              {l.to === "/mi-reserva" && <KeyRound className="h-3.5 w-3.5 text-teal" />}
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Selector de Idioma SOLO si hay más de 1 idioma habilitado */}
          {enabledLangs.length > 1 && (
            <Select value={currentLang} onValueChange={(v) => handleLanguageChange(v as Language)}>
              <SelectTrigger
                className={cn(
                  "h-8 w-[84px] text-xs rounded-full border px-2.5",
                  solid ? "bg-background border-border" : "bg-white/10 border-white/30 text-white hover:bg-white/20"
                )}
              >
                <Globe className="h-3.5 w-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {enabledLangs.includes("es") && <SelectItem value="es" className="text-xs">🇪🇸 ES</SelectItem>}
                {enabledLangs.includes("en") && <SelectItem value="en" className="text-xs">🇬🇧 EN</SelectItem>}
                {enabledLangs.includes("pt") && <SelectItem value="pt" className="text-xs">🇧🇷 PT</SelectItem>}
              </SelectContent>
            </Select>
          )}

          <Button
            asChild
            size="sm"
            className={cn(
              "hidden rounded-full px-5 md:inline-flex",
              solid ? "" : "bg-white text-primary hover:bg-white/90"
            )}
          >
            <Link to="/reservar">{t.book}</Link>
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
                  <Link to="/reservar">{t.book}</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
