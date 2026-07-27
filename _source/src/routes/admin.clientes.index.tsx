import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/ui-bits";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Client, formatARS } from "@/data/admin";
import { clientService } from "@/lib/services";

export const Route = createFileRoute("/admin/clientes/")({
  component: Clientes,
});

function Clientes() {
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

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
        description={`${items.length} huéspedes en la base de datos de Supabase`}
        actions={
          <Button size="sm" className="rounded-full" onClick={() => toast("Formulario de alta de cliente")}>
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
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                              {c.firstName[0]}
                              {c.lastName[0]}
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
                        {c.city}, {c.country}
                      </TableCell>
                      <TableCell className="text-center">{c.stays}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">{formatARS(c.totalSpent)}</TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm" className="rounded-full">
                          <Link to="/admin/clientes/$id" params={{ id: c.id }}>
                            Ver ficha
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
