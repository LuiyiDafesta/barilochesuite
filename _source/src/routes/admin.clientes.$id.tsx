import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Mail, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, StatusBadge } from "@/components/admin/ui-bits";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { clients, formatARS, formatDate, reservations } from "@/data/admin";

export const Route = createFileRoute("/admin/clientes/$id")({
  component: FichaCliente,
  notFoundComponent: () => (
    <div className="py-20 text-center">
      <p className="text-sm text-muted-foreground">No encontramos ese cliente.</p>
      <Button asChild variant="ghost" className="mt-4 rounded-full">
        <Link to="/admin/clientes">Volver a clientes</Link>
      </Button>
    </div>
  ),
});

function FichaCliente() {
  const { id } = Route.useParams();
  const client = clients.find((c) => c.id === id);
  if (!client) throw notFound();

  const history = reservations.filter((r) => r.clientId === client.id);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-full">
        <Link to="/admin/clientes">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Clientes
        </Link>
      </Button>

      <PageHeader
        title={`${client.firstName} ${client.lastName}`}
        description={`${client.city}, ${client.country} · Idioma: ${client.language}`}
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast.success("Abriendo WhatsApp")}>
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Contactar
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-4">
          <Card className="border-border/70 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 shrink-0">
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    {client.firstName[0]}
                    {client.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold">
                    {client.firstName} {client.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {client.stays} estadías · {formatARS(client.totalSpent)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  {client.whatsapp}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {client.city}, {client.country}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-base">Notas internas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea defaultValue={client.notes} rows={5} />
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => toast.success("Notas guardadas")}
              >
                Guardar notas
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-base">Historial de estadías</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {formatDate(r.checkIn)} → {formatDate(r.checkOut)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.code} · {r.channel} · {r.guests} huéspedes
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm">{r.amount ? formatARS(r.amount) : "—"}</span>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Todavía no hay estadías registradas para este cliente.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
