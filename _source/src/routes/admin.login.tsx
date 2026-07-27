import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, Loader2, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("lsnetinformatica2024@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor completa el email y la contraseña.");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("¡Bienvenido al Panel Administrador!");
      navigate({ to: "/admin" });
    } catch (err: any) {
      console.error("Error de login:", err);
      toast.error(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md border-border/80 p-2 shadow-lift">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal/15 text-teal">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="font-display text-2xl">Bariloche Suite Admin</CardTitle>
          <CardDescription>Acceso exclusivo para administradores</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@barilochesuite.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Iniciar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
