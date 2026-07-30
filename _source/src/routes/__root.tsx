import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { settingService } from "@/lib/services";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que estás buscando no existe o fue movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("TanStack Root Error caught:", error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-lift text-center space-y-4">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Ocurrió un inconveniente al cargar la página
        </h1>
        <p className="text-sm text-muted-foreground">
          Se detectó una excepción temporal en la ejecución de la aplicación.
        </p>

        {error?.message && (
          <div className="mt-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-3.5 text-left">
            <p className="font-mono text-xs font-semibold text-destructive">Detalle del error:</p>
            <p className="font-mono text-xs text-foreground/80 mt-1 break-words leading-relaxed">{error.message}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2 pt-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reintentar
          </button>
          <button
            onClick={handleClearCacheAndReload}
            className="inline-flex items-center justify-center rounded-full border border-border bg-secondary/50 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Limpiar caché y recargar
          </button>
          <a
            href={window.location.pathname.startsWith("/barilochesuite") ? "/barilochesuite/" : "/"}
            className="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-2.5 text-sm font-medium text-teal hover:underline"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

function applyDynamicSEO(s: any) {
  if (!s) return;
  const title = s.metaTitle || s.businessName || "Duplex Turístico Bariloche";
  if (title) document.title = title;

  if (s.metaDescription) {
    let descEl = document.getElementById("meta-description") as HTMLMetaElement;
    if (!descEl) {
      descEl = document.createElement("meta");
      descEl.id = "meta-description";
      descEl.name = "description";
      document.head.appendChild(descEl);
    }
    descEl.content = s.metaDescription;
  }

  if (s.keywords) {
    let keyEl = document.getElementById("meta-keywords") as HTMLMetaElement;
    if (!keyEl) {
      keyEl = document.createElement("meta");
      keyEl.id = "meta-keywords";
      keyEl.name = "keywords";
      document.head.appendChild(keyEl);
    }
    keyEl.content = s.keywords;
  }

  if (s.faviconUrl) {
    let favEl = document.getElementById("dynamic-favicon") as HTMLLinkElement;
    if (!favEl) {
      favEl = document.createElement("link");
      favEl.id = "dynamic-favicon";
      favEl.rel = "icon";
      document.head.appendChild(favEl);
    }
    favEl.href = s.faviconUrl;
  }
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    // 1. Aplicar sincrónicamente desde caché para cero parpadeo
    try {
      const cached = localStorage.getItem("cached_site_settings");
      if (cached) applyDynamicSEO(JSON.parse(cached));
    } catch {}

    // 2. Cargar en vivo desde Supabase
    settingService.get().then((s) => {
      applyDynamicSEO(s);
    }).catch((e) => console.error("Error al aplicar SEO dinámico:", e));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
