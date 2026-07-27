import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  BookMarked,
  Inbox,
  Users,
  Tags,
  Sun,
  Ban,
  Images,
  FileText,
  Star,
  MapPin,
  Settings,
  Mountain,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { properties } from "@/data/admin";

const groups = [
  {
    label: "Operación",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Calendario", url: "/admin/calendario", icon: CalendarDays },
      { title: "Reservas", url: "/admin/reservas", icon: BookMarked },
      { title: "Consultas", url: "/admin/consultas", icon: Inbox },
      { title: "Clientes", url: "/admin/clientes", icon: Users },
    ],
  },
  {
    label: "Precios y disponibilidad",
    items: [
      { title: "Tarifas", url: "/admin/tarifas", icon: Tags },
      { title: "Temporadas", url: "/admin/temporadas", icon: Sun },
      { title: "Bloqueos", url: "/admin/bloqueos", icon: Ban },
    ],
  },
  {
    label: "Contenido",
    items: [
      { title: "Galería", url: "/admin/galeria", icon: Images },
      { title: "Contenido", url: "/admin/contenido", icon: FileText },
      { title: "Reseñas", url: "/admin/resenas", icon: Star },
      { title: "Lugares cercanos", url: "/admin/lugares", icon: MapPin },
    ],
  },
  {
    label: "Sistema",
    items: [{ title: "Configuración", url: "/admin/configuracion", icon: Settings }],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (url: string) => (url === "/admin" ? pathname === "/admin" : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 px-3 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Mountain className="h-4.5 w-4.5" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold">Casa Nahuel</p>
              <p className="truncate text-[11px] text-muted-foreground">Panel del anfitrión</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Select defaultValue={properties[0].id}>
            <SelectTrigger className="h-9 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={p.id !== "prop-1"}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </SidebarHeader>

      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Ver sitio público">
              <Link to="/" className="flex items-center gap-2">
                <Mountain className="h-4 w-4" />
                <span>Ver sitio público</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
