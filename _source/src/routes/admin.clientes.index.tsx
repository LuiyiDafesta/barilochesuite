import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Search, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Client, formatARS } from "@/data/admin";
import { clientService } from "@/lib/services";

export const Route = createFileRoute("/admin/clientes/")({
  component: Clientes,
});

function Clientes() {
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulario Nuevo Cliente
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Argentina");
  const [language, setLanguage] = useState("Español");
  const [notes, setNotes] = useState("");

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll();
      setItems(data);
    } catch (e) {
      console.error("Error al cargar clientes de Supabase:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreateClient = async () => {
    if (!firstName || !lastName || !email) {
      toast.error("Por favor completa al menos Nombre, Apellido y Email.");
      return;
    }

    try {
      setSubmitting(true);
      const newClient = await clientService.create({
        firstName,
        lastName,
        email,
        whatsapp,
        city,
        country,
        language,
        notes,
        stays: 0,
        totalSpent: 0,
      });

      setItems((prev) => [newClient, ...prev]);
      toast.success("Cliente guardado en Supabase", {
        description: `${firstName} ${lastName} (${email})`,
      });

      setOpenModal(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setWhatsapp("");
      setCity("");
      setNotes("");
    } catch (e: any) {
      toast.error(e.message || "Error al crear cliente");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que querés eliminar al cliente "${name}"?`)) return;
    try {
      await clientService.delete(id);
      setItems((prev) => prev.filter((c) => c.id !== id));
      toast.success("Cliente eliminado correctamente");
    } catch (e) {
      toast.error("Error al eliminar cliente");
    }
  };

  const rows = useMemo(
    () =>
      items.filter((c) =>
        `${c.firstName} ${c.lastName} ${c.email} ${c.country}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [items, q],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={`${items.length} huéspedes en la base de datos`}
        actions={
          <Button size="sm" className="rounded-full" onClick={() => setOpenModal(true)}>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Nuevo cliente
          </Button>
        }
      />

      <Card className="border-border/70 shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar cliente, email o país..."
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead className="text-center">Estadías</TableHead>
                    <TableHead className="text-right">Total gastado</TableHead>
                    <TableHead className="w-32 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                              {c.firstName?.[0] || "C"}
                              {c.lastName?.[0] || ""}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {c.firstName} {c.lastName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{c.language}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <p className="text-sm">{c.email}</p>
                        <p className="text-xs">{c.whatsapp}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {c.city ? `${c.city}, ` : ""}{c.country}
                      </TableCell>
                      <TableCell className="text-center">{c.stays}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">{formatARS(c.totalSpent)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="sm" className="rounded-full">
                            <Link to="/admin/clientes/$id" params={{ id: c.id }}>
                              Ver ficha
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClient(c.id, `${c.firstName} ${c.lastName}`)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Modal Nuevo Cliente */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Carga los datos personales del huésped para registrarlo en la base de datos de Supabase.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                placeholder="Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                placeholder="Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan.perez@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp / Teléfono</Label>
              <Input
                id="whatsapp"
                placeholder="+54 9 11 1234 5678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                placeholder="Buenos Aires"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                placeholder="Argentina"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Idioma preferido</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Español">Español</SelectItem>
                  <SelectItem value="Inglés">Inglés</SelectItem>
                  <SelectItem value="Portugués">Portugués</SelectItem>
                  <SelectItem value="Francés">Francés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notas o preferencias</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Preferencias de almohadas, alergias, cliente recurrente..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient} disabled={submitting}>
              {submitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Guardar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
