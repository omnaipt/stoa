import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, Users, CalendarDays, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/reservations/StatusBadge";
import { ReservationFormDialog } from "@/components/reservations/ReservationFormDialog";
import type { Reservation, ReservationStatus } from "@/lib/types";
import type { ReservationValues } from "@/lib/schemas";
import {
  MOCK_RESERVATIONS,
  MOCK_RESTAURANT,
  STATUS_OPTIONS,
  isSameLocalDay,
  nextMockId,
  summarizeDay,
} from "@/lib/mock-data";

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function timeOf(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function prettyDate(d: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(d);
}

// TODO(marco): substituir por query Supabase real:
//   select * from reservations where restaurant_id = tenant
//   and reserved_at::date = $day order by reserved_at asc
// e por mutations de update de estado / criação. Aqui simulamos latência + erro.
async function fetchDayReservations(dayKey: string): Promise<Reservation[]> {
  await new Promise((r) => setTimeout(r, 450));
  const [y, m, d] = dayKey.split("-").map(Number);
  const day = new Date(y, m - 1, d);
  return MOCK_RESERVATIONS.filter((r) => isSameLocalDay(r.reserved_at, day)).sort(
    (a, b) => a.reserved_at.localeCompare(b.reserved_at),
  );
}

export default function Reservations() {
  const restaurant = MOCK_RESTAURANT;
  const queryClient = useQueryClient();
  const [day, setDay] = useState<Date>(() => new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | undefined>(undefined);

  const dayKey = ymd(day);
  const queryKey = ["reservations", dayKey] as const;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () => fetchDayReservations(dayKey),
  });

  const reservations = data ?? [];
  const summary = useMemo(
    () => summarizeDay(reservations, restaurant.capacity_per_shift),
    [reservations, restaurant.capacity_per_shift],
  );

  const shiftDay = (delta: number) => {
    const next = new Date(day);
    next.setDate(next.getDate() + delta);
    setDay(next);
  };

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (r: Reservation) => {
    setEditing(r);
    setFormOpen(true);
  };

  // Mutação otimista local (sem Supabase). Sucesso = toast + atualização da lista.
  const handleSubmit = (values: ReservationValues) => {
    const reservedAt = new Date(`${values.date}T${values.time}`).toISOString();
    queryClient.setQueryData<Reservation[]>(["reservations", values.date], (prev) => {
      const base = prev ?? [];
      if (editing) {
        return base
          .map((r) =>
            r.id === editing.id
              ? {
                  ...r,
                  customer_name: values.customerName,
                  customer_phone: values.customerPhone,
                  customer_email: values.customerEmail || null,
                  party_size: values.partySize,
                  reserved_at: reservedAt,
                  table_label: values.tableLabel || null,
                  notes: values.notes || null,
                }
              : r,
          )
          .sort((a, b) => a.reserved_at.localeCompare(b.reserved_at));
      }
      const created: Reservation = {
        id: nextMockId(),
        restaurant_id: restaurant.id,
        customer_id: null,
        customer_name: values.customerName,
        customer_phone: values.customerPhone,
        customer_email: values.customerEmail || null,
        party_size: values.partySize,
        reserved_at: reservedAt,
        status: "confirmada",
        table_label: values.tableLabel || null,
        notes: values.notes || null,
        created_at: new Date().toISOString(),
      };
      return [...base, created].sort((a, b) => a.reserved_at.localeCompare(b.reserved_at));
    });
    // TODO(marco): aqui entra o insert/update real + invalidateQueries; remover o setQueryData mock.
    toast.success(editing ? "Reserva guardada" : "Reserva criada", {
      description: `${values.customerName} · ${values.partySize} pax · ${values.time}`,
    });
  };

  // Mudança de estado inline (F3.3). Mock local.
  const changeStatus = (r: Reservation, status: ReservationStatus) => {
    queryClient.setQueryData<Reservation[]>(queryKey, (prev) =>
      (prev ?? []).map((x) => (x.id === r.id ? { ...x, status } : x)),
    );
    // TODO(marco): update reservations set status = $status where id = r.id (com RLS).
    toast.success("Estado atualizado");
  };

  const isToday = isSameLocalDay(new Date().toISOString(), day);

  return (
    <div className="container max-w-3xl py-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link to="/" className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Voltar">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">Reservas</h1>
        </div>
        <Button onClick={openCreate} className="h-11">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova reserva</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </header>

      {/* Seletor de data (F3) */}
      <div className="mb-4 flex items-center justify-between rounded-lg border bg-card p-2">
        <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Dia anterior" onClick={() => shiftDay(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium capitalize">{prettyDate(day)}</p>
          {!isToday && (
            <button
              type="button"
              onClick={() => setDay(new Date())}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Saltar para hoje
            </button>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Dia seguinte" onClick={() => shiftDay(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Resumo de lotação (F3.4) */}
      {!isLoading && !isError && reservations.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <SummaryStat icon={<CalendarDays className="h-4 w-4" />} label="Reservas" value={summary.totalReservations} />
          <SummaryStat icon={<Users className="h-4 w-4" />} label="Pessoas" value={summary.totalPax} />
          <SummaryStat
            label="Lotação"
            value={`${summary.capacityPct}%`}
            valueClassName={summary.overCapacity ? "text-destructive" : undefined}
          />
        </div>
      )}

      {/* Estado: LOADING (skeleton) */}
      {isLoading && (
        <div className="space-y-3" aria-busy="true" aria-label="A carregar reservas">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 py-4">
                <Skeleton className="h-10 w-14" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado: ERRO (banner + retry) */}
      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Não foi possível carregar as reservas.</p>
            <Button variant="outline" className="h-11" onClick={() => refetch()} disabled={isFetching}>
              Tentar de novo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Estado: VAZIO */}
      {!isLoading && !isError && reservations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-medium">Sem reservas para este dia</p>
              <p className="text-sm text-muted-foreground">Cria a primeira reserva para começar.</p>
            </div>
            <Button onClick={openCreate} className="h-11">
              <Plus className="h-4 w-4" />
              Criar reserva
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Estado: SUCESSO (lista) */}
      {!isLoading && !isError && reservations.length > 0 && (
        <ul className="space-y-3">
          {reservations.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="flex items-center gap-3 py-3">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="flex flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Editar reserva de ${r.customer_name}`}
                  >
                    <span className="w-14 shrink-0 text-lg font-semibold tabular-nums">
                      {timeOf(r.reserved_at)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.customer_name}</span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {r.party_size} pax
                        {r.table_label ? ` · Mesa ${r.table_label}` : ""}
                        {r.notes ? ` · ${r.notes}` : ""}
                      </span>
                    </span>
                    <StatusBadge status={r.status} />
                  </button>
                  <label className="sr-only" htmlFor={`status-${r.id}`}>
                    Estado de {r.customer_name}
                  </label>
                  <Select
                    id={`status-${r.id}`}
                    className="h-11 w-[7.5rem] shrink-0"
                    value={r.status}
                    onChange={(e) => changeStatus(r, e.target.value as ReservationStatus)}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ReservationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        restaurant={restaurant}
        dayReservations={reservations}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function SummaryStat({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}
