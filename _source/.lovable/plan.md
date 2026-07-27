## Objetivo

Diseño UX/UI completo y navegable de una plataforma premium para un departamento de alta gama en San Carlos de Bariloche: sitio público orientado al huésped y panel administrativo tipo SaaS. Todo con datos ficticios, sin backend ni lógica de negocio.

## Identidad visual

- Paleta "Lago Profundo": `#0c2340` (azul profundo), `#1a4a6e`, `#2d8a9e`, `#5cbdb9`, sobre fondos claros casi blancos con mucho aire.
- Tipografía: Urbanist para títulos, Epilogue para cuerpo (cargadas por `<link>` en el root).
- Bordes suaves, sombras sutiles, fotografía protagonista, animaciones discretas de entrada y hover.
- Todos los colores como tokens semánticos; modo claro para el sitio público, admin con superficie neutra y acentos del mismo sistema.

## Sitio público (`/`)

Página principal con secciones ancladas y rutas propias para las secciones que merecen SEO:

- `/` — Hero fullscreen con imagen/video, navbar transparente, título, subtítulo, botones "Consultar disponibilidad" y "Ver galería", scroll indicator. Debajo: bloques de experiencia (imagen grande + texto alternado), grid de características con iconos, preview de galería, ubicación, calendario + cotizador, formulario, testimonios, FAQ, footer.
- `/galeria` — Galería premium: filtros (Todas, Exterior, Interior, Habitaciones, Baño, Cocina, Vista, Videos, Tour 360), toggle Grid/Masonry, imagen destacada, lightbox fullscreen con zoom y navegación por teclado.
- `/ubicacion` — Mapa grande (embebido estático), descripción y cards de lugares cercanos.
- `/reservar` — Calendario de rango estilo Airbnb con estados visuales (disponible, reservado, pendiente, bloqueado), tarjeta de cotización (noches, precio/noche, subtotal, limpieza, impuestos, total estimado) y formulario de consulta (nombre, apellido, email, WhatsApp, adultos, niños, mascotas, comentarios). Mensaje claro: la disponibilidad se valida antes de confirmar; nunca se confirma automáticamente.

Testimonios en carrusel, FAQ en accordion, footer con Instagram, Facebook, WhatsApp, email, mapa y links.

## Panel administrativo (`/admin/*`)

Layout con sidebar colapsable, selector de propiedad (preparado para multi-propiedad), breadcrumb, command palette y toasts.

- `/admin` — KPIs (reservas del mes, consultas nuevas, ingresos estimados, ocupación), gráfico anual, calendario resumido, próximos check-in/check-out, últimas consultas y reservas.
- `/admin/calendario` — Calendario maestro con vistas diaria, semanal, mensual y anual; estados por color; selección de rango que abre modal para crear/editar/cancelar reserva o bloquear/desbloquear.
- `/admin/reservas` — Tabla con filtros, buscador, paginación, badges de estado y origen (directo, Airbnb, Booking), acciones por fila.
- `/admin/consultas` — Mini CRM: pipeline Kanban (Nueva, Contactado, Cotización enviada, Pendiente, Confirmado, Cancelado, Perdido) con drag & drop visual + vista tabla.
- `/admin/clientes` y ficha de cliente — Datos, fechas solicitadas, importe, notas internas, historial, mensajes, reservas previas y acciones (WhatsApp, Email, Confirmar, Cancelar).
- `/admin/tarifas` — Motor de reglas: calendario visual tipo Google Calendar con rangos coloreados, modal (nombre, tipo de temporada, fechas, precio, estadía mínima, color, prioridad) y tabla resumen.
- `/admin/temporadas`, `/admin/bloqueos` — Gestión de temporadas y bloqueos por rango con motivo.
- `/admin/galeria` — Grid ordenable con drag & drop, subida múltiple simulada, imagen principal, categorías, editar/eliminar.
- `/admin/contenido` — CMS visual por pestañas: Hero, textos, servicios, FAQ, footer, ubicación, SEO.
- `/admin/resenas`, `/admin/lugares` — ABM con foto, texto, puntuación/distancia, mostrar/ocultar, orden.
- `/admin/configuracion` — Datos generales, contacto, redes, horarios, políticas, y una pestaña "Integraciones" con tarjetas desconectadas para Airbnb, Booking, VRBO, iCal, Google Calendar, Mercado Pago, Stripe, WhatsApp y Email.

## Detalles técnicos

- TanStack Start con rutas en `src/routes/`; layout admin como ruta padre con `<Outlet />`.
- shadcn/ui para card, table, dialog, drawer, tabs, accordion, calendar, popover, dropdown, badge, tooltip, hover-card, breadcrumb, toast, command, skeleton; iconos Lucide; gráficos con Recharts.
- Datos ficticios centralizados en `src/data/*` (reservas, leads, clientes, tarifas, galería, reseñas, lugares) y componentes compartidos en `src/components/{public,admin}`.
- Imágenes: se generan assets propios de interiores/exteriores/paisaje de Bariloche para que la galería y los heroes se vean reales.
- Metadatos `head()` únicos por ruta pública; el admin marcado `noindex`.
- Responsive completo: navbar con drawer móvil, sidebar admin colapsable, tablas con scroll horizontal y tarjetas en mobile.

## Fuera de alcance

Sin backend, sin Supabase, sin autenticación real, sin pagos ni sincronización con canales externos: solo interfaz con estados simulados.
