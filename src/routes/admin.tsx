import { Fragment, useEffect, useState } from "react";
import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel del anfitrión — Casa Nahuel" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const commands = [
  { label: "Dashboard", to: "/admin" },
  { label: "Calendario maestro", to: "/admin/calendario" },
  { label: "Reservas", to: "/admin/reservas" },
  { label: "Consultas (CRM)", to: "/admin/consultas" },
  { label: "Clientes", to: "/admin/clientes" },
  { label: "Tarifas", to: "/admin/tarifas" },
  { label: "Temporadas", to: "/admin/temporadas" },
  { label: "Bloqueos", to: "/admin/bloqueos" },
  { label: "Galería", to: "/admin/galeria" },
  { label: "Contenido", to: "/admin/contenido" },
  { label: "Reseñas", to: "/admin/resenas" },
  { label: "Lugares cercanos", to: "/admin/lugares" },
  { label: "Configuración", to: "/admin/configuracion" },
];

const labels: Record<string, string> = {
  admin: "Panel",
  calendario: "Calendario",
  reservas: "Reservas",
  consultas: "Consultas",
  clientes: "Clientes",
  tarifas: "Tarifas",
  temporadas: "Temporadas",
  bloqueos: "Bloqueos",
  galeria: "Galería",
  contenido: "Contenido",
  resenas: "Reseñas",
  lugares: "Lugares cercanos",
  configuracion: "Configuración",
};

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segments = pathname.split("/").filter(Boolean);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-3 backdrop-blur-xl sm:px-5">
            <SidebarTrigger />
            <Breadcrumb className="hidden min-w-0 sm:block">
              <BreadcrumbList>
                {segments.map((seg, i) => (
                  <Fragment key={seg}>
                    <BreadcrumbItem>
                      {i === segments.length - 1 ? (
                        <BreadcrumbPage className="truncate">{labels[seg] ?? seg}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={`/${segments.slice(0, i + 1).join("/")}`}>
                          {labels[seg] ?? seg}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {i < segments.length - 1 && <BreadcrumbSeparator />}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full text-muted-foreground"
                onClick={() => setOpen(true)}
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Buscar</span>
                <kbd className="hidden rounded border border-border bg-muted px-1.5 text-[10px] sm:inline">⌘K</kbd>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notificaciones">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">MA</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar pantallas, reservas o clientes..." />
        <CommandList>
          <CommandEmpty>Sin resultados.</CommandEmpty>
          <CommandGroup heading="Navegación">
            {commands.map((c) => (
              <CommandItem
                key={c.to}
                value={c.label}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: c.to });
                }}
              >
                {c.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  );
}
