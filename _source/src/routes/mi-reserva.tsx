import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  KeyRound,
  LifeBuoy,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Send,
  ShieldCheck,
  Star,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatARS, formatDate } from "@/data/admin";
import { clientAuthService, reviewService, ticketService } from "@/lib/services";

export const Route = createFileRoute("/mi-reserva")({
  component: PortalHuesped,
});

function PortalHuesped() {
  const [session, setSession] = useState<{ client: any; activeReservation: any } | null>(null);
  const [loading, setLoading] = useState(false);

  // Formulario Login
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Formulario Ticket / Pregunta
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [sendingTicket, setSendingTicket] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);

  // Formulario Reseña
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Cargar sesión guardada en localStorage
    const saved = localStorage.getItem("bariloche_guest_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession(parsed);
        loadGuestTickets(parsed.client.id);
      } catch (e) {
        localStorage.removeItem("bariloche_guest_session");
      }
    }
  }, []);

  const loadGuestTickets = async (clientId: string) => {
    try {
      const data = await ticketService.getByClientId(clientId);
      setTickets(data);
    } catch (e) {
      console.error("Error al cargar tickets:", e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Por favor ingresá tu email/código y clave.");
      return;
    }

    try {
      setLoading(true);
      const res = await clientAuthService.login(identifier, password);
      setSession(res);
      localStorage.setItem("bariloche_guest_session", JSON.stringify(res));
      toast.success(`¡Bienvenido/a, ${res.client.firstName}!`);
      loadGuestTickets(res.client.id);
    } catch (err: any) {
      toast.error(err.message || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("bariloche_guest_session");
    toast.info("Sesión cerrada correctamente.");
  };

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !ticketSubject || !ticketMessage) {
      toast.error("Por favor completa el asunto y tu pregunta.");
      return;
    }

    try {
      setSendingTicket(true);
      const newTicket = await ticketService.create({
        clientId: session.client.id,
        reservationId: session.activeReservation?.id || null,
        subject: ticketSubject,
        message: ticketMessage,
      });

      setTickets((prev) => [newTicket, ...prev]);
      toast.success("Consulta enviada al anfitrión", {
        description: "Te responderemos a la brevedad por WhatsApp o email.",
      });
      setTicketSubject("");
      setTicketMessage("");
    } catch (e: any) {
      toast.error("Error al enviar la consulta");
    } finally {
      setSendingTicket(false);
    }
  };

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !reviewComment) {
      toast.error("Por favor escribe tu opinión.");
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.create({
        name: `${session.client.firstName} ${session.client.lastName[0]}.`,
        country: session.client.country || "Argentina",
        comment: reviewComment,
        rating,
      });

      toast.success("¡Muchas gracias por tu reseña!", {
        description: "Tu comentario se ha publicado en el sitio web de Bariloche Suite.",
      });
      setReviewComment("");
    } catch (e: any) {
      toast.error("Error al guardar reseña.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // VISTA 1: Pantalla de Login para el Huésped
  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md border-border/80 shadow-lift">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal/15 text-teal">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="font-display text-2xl">Portal del Huésped</CardTitle>
            <CardDescription>
              Ingresá con tu Email o Código de Reserva (`CN-XXXX`) para consultar tu estadía e instrucciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email o Código de Reserva</Label>
                <Input
                  id="identifier"
                  placeholder="ej: tuemail@gmail.com o CN-8492"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña o Código de Reserva</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                Ingresar a Mi Reserva
              </Button>
            </form>

            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">¿No sabés tu clave?</p>
              <p>Tu clave de acceso coincide con tu **Código de Reserva (CN-XXXX)** brindado al confirmar.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // VISTA 2: Dashboard del Huésped Autenticado
  const client = session.client;
  const activeRes = session.activeReservation;

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4">
      {/* Header del Huésped */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-gradient-to-r from-primary/95 to-primary p-6 text-primary-foreground shadow-lift">
        <div>
          <Badge className="mb-2 bg-teal text-teal-foreground">Huésped Autenticado</Badge>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">¡Hola, {client.firstName}!</h1>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Bienvenido/a a tu portal exclusivo de Bariloche Suite.
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full bg-background/10 text-primary-foreground hover:bg-background/20" onClick={handleLogout}>
          <LogOut className="mr-1.5 h-3.5 w-3.5" /> Cerrar sesión
        </Button>
      </div>

      <Tabs defaultValue="estadia">
        <TabsList className="grid w-full grid-cols-3 rounded-full">
          <TabsTrigger value="estadia" className="rounded-full">
            <Calendar className="mr-1.5 h-4 w-4" /> Mi Estadía
          </TabsTrigger>
          <TabsTrigger value="tickets" className="rounded-full">
            <LifeBuoy className="mr-1.5 h-4 w-4" /> Mesa de Ayuda
          </TabsTrigger>
          <TabsTrigger value="resena" className="rounded-full">
            <Star className="mr-1.5 h-4 w-4" /> Dejar Reseña
          </TabsTrigger>
        </TabsList>

        {/* Pestaña 1: Mi Estadía */}
        <TabsContent value="estadia" className="mt-6 space-y-6">
          {activeRes ? (
            <Card className="border-border/70 shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-xl">Estadía Confirmada</CardTitle>
                  <Badge variant="secondary" className="font-mono">{activeRes.code}</Badge>
                </div>
                <CardDescription>
                  {formatDate(activeRes.check_in || activeRes.checkIn)} → {formatDate(activeRes.check_out || activeRes.checkOut)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Check-in</p>
                    <p className="mt-1 font-display font-semibold text-sm">15:00 hs en adelante</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Check-out</p>
                    <p className="mt-1 font-display font-semibold text-sm">Hasta las 11:00 hs</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Importe Total</p>
                    <p className="mt-1 font-display font-semibold text-sm text-teal">
                      {formatARS(activeRes.amount)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Guía de la Propiedad */}
                <div>
                  <h3 className="font-display text-lg font-semibold mb-4">Datos útiles para tu estadía</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex gap-4 rounded-2xl border border-border/80 p-4 bg-card">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal">
                        <Wifi className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Red WiFi</p>
                        <p className="text-xs text-muted-foreground">Red: <span className="font-mono text-foreground font-semibold">BarilocheSuite_5G</span></p>
                        <p className="text-xs text-muted-foreground">Clave: <span className="font-mono text-foreground font-semibold">Bariloche2026</span></p>
                      </div>
                    </div>

                    <div className="flex gap-4 rounded-2xl border border-border/80 p-4 bg-card">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Acceso a la Suite</p>
                        <p className="text-xs text-muted-foreground">Cerradura digital: <span className="font-mono text-foreground font-semibold">4829#</span></p>
                        <p className="text-xs text-muted-foreground">Caja fuerte interior: <span className="font-mono text-foreground font-semibold">1234#</span></p>
                      </div>
                    </div>

                    <div className="flex gap-4 rounded-2xl border border-border/80 p-4 bg-card sm:col-span-2">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Ubicación y Dirección</p>
                        <p className="text-xs text-muted-foreground">Av. Bustillo Km 6,400, San Carlos de Bariloche, Río Negro.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/70 p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-display text-base font-semibold">No tenés reservas activas por el momento</p>
              <p className="mt-1 text-sm text-muted-foreground">Podés realizar una nueva consulta directamente desde el sitio principal.</p>
            </Card>
          )}
        </TabsContent>

        {/* Pestaña 2: Mesa de Ayuda / Tickets */}
        <TabsContent value="tickets" className="mt-6 space-y-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-xl">¿Tenés alguna consulta durante tu viaje?</CardTitle>
              <CardDescription>
                Enviá tu pregunta directamente al anfitrión (solicitud de toallas extra, late check-out, recomendaciones).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tSubject">Asunto</Label>
                  <Input
                    id="tSubject"
                    placeholder="Ej: Consulta por late check-out / Código de wifi"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tMessage">Mensaje o Pregunta</Label>
                  <Textarea
                    id="tMessage"
                    rows={4}
                    placeholder="Detallá tu solicitud para ayudarte..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="rounded-full" disabled={sendingTicket}>
                  {sendingTicket ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Enviar Consulta al Anfitrión
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Historial de Tickets */}
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Tus consultas enviadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="rounded-xl border border-border p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{t.subject}</p>
                    <Badge variant="secondary" className="rounded-full text-[10px]">
                      {t.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.message}</p>
                  <p className="text-[10px] text-muted-foreground pt-1">{formatDate(t.createdAt)}</p>
                </div>
              ))}

              {tickets.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">No tenés consultas anteriores.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña 3: Dejar Reseña */}
        <TabsContent value="resena" className="mt-6">
          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-xl">Dejá tu opinión sobre Bariloche Suite</CardTitle>
              <CardDescription>
                Tu reseña nos ayuda a seguir brindando una experiencia 5 estrellas en Bariloche.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendReview} className="space-y-6">
                <div className="space-y-2">
                  <Label>Calificación (Estrellas)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            star <= rating ? "fill-warning text-warning" : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rComment">Tu Reseña / Comentario</Label>
                  <Textarea
                    id="rComment"
                    rows={4}
                    placeholder="Excelente vista al lago, muy confortable el departamento..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="rounded-full" disabled={submittingReview}>
                  {submittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Publicar Reseña en la Web
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
