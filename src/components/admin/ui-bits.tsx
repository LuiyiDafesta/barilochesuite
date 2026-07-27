import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStage, ReservationStatus } from "@/data/admin";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const statusStyles: Record<ReservationStatus, string> = {
  confirmada: "bg-success/12 text-success border-success/30",
  pendiente: "bg-warning/15 text-warning-foreground border-warning/40",
  cancelada: "bg-destructive/10 text-destructive border-destructive/30",
  bloqueo: "bg-muted text-muted-foreground border-border",
  mantenimiento: "bg-lake/10 text-lake border-lake/30",
  personal: "bg-accent text-accent-foreground border-border",
};

const statusLabels: Record<ReservationStatus, string> = {
  confirmada: "Confirmada",
  pendiente: "Pendiente",
  cancelada: "Cancelada",
  bloqueo: "Bloqueado",
  mantenimiento: "Mantenimiento",
  personal: "Uso personal",
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-normal", statusStyles[status])}>
      {statusLabels[status]}
    </Badge>
  );
}

const stageStyles: Record<LeadStage, string> = {
  nueva: "bg-teal/12 text-teal border-teal/30",
  contactado: "bg-lake/10 text-lake border-lake/30",
  cotizacion: "bg-warning/15 text-warning-foreground border-warning/40",
  pendiente: "bg-accent text-accent-foreground border-border",
  confirmado: "bg-success/12 text-success border-success/30",
  cancelado: "bg-destructive/10 text-destructive border-destructive/30",
  perdido: "bg-muted text-muted-foreground border-border",
};

export function StageBadge({ stage, label }: { stage: LeadStage; label: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-normal", stageStyles[stage])}>
      {label}
    </Badge>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="mt-4 font-display text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
