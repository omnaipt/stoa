import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { reservationSchema, type ReservationValues } from "@/lib/schemas";
import type { Reservation, Restaurant } from "@/lib/types";
import { exceedsCapacity } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";

interface ReservationFormProps {
  restaurant: Restaurant;
  dayReservations: Reservation[];
  // Reserva existente => modo edição. Ausente => criação.
  initial?: Reservation;
  onSubmit: (values: ReservationValues) => Promise<void> | void;
  onCancel: () => void;
}

function toDateInput(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function toTimeInput(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const todayStr = toDateInput(new Date().toISOString());

export function ReservationForm({
  restaurant,
  dayReservations,
  initial,
  onSubmit,
  onCancel,
}: ReservationFormProps) {
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReservationValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: initial
      ? {
          customerName: initial.customer_name,
          customerPhone: initial.customer_phone ?? "",
          customerEmail: initial.customer_email ?? "",
          partySize: initial.party_size,
          date: toDateInput(initial.reserved_at),
          time: toTimeInput(initial.reserved_at),
          tableLabel: initial.table_label ?? "",
          notes: initial.notes ?? "",
        }
      : {
          customerName: "",
          customerPhone: "",
          customerEmail: "",
          partySize: 2,
          date: todayStr,
          time: "20:00",
          tableLabel: "",
          notes: "",
        },
  });

  const partySize = Number(watch("partySize")) || 0;
  const date = watch("date");
  const time = watch("time");

  // Warnings não-bloqueantes (F2.4 sobrelotação, F2.5 fora de horário).
  const overCapacity = useMemo(
    () =>
      partySize > 0 &&
      exceedsCapacity(dayReservations, restaurant.capacity_per_shift, partySize, initial?.id),
    [partySize, dayReservations, restaurant.capacity_per_shift, initial?.id],
  );

  const outOfHours = useMemo(() => {
    if (!date || !time) return false;
    const d = new Date(`${date}T${time}`);
    const wd = (["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const)[d.getDay()];
    const h = restaurant.opening_hours[wd];
    if (!h || h.closed) return true;
    return time < h.open || time > h.close;
  }, [date, time, restaurant.opening_hours]);

  const submit = handleSubmit(async (values) => {
    setSaveError(null);
    try {
      // TODO(marco): wire Supabase — recolher customer por telefone (F4.1):
      //   1. select customers where phone = values.customerPhone and restaurant_id = tenant
      //   2. se existir, usar customer_id; senão insert customer novo (F4.2)
      //   3. insert into reservations { restaurant_id, customer_id, customer_name,
      //      customer_phone, party_size, reserved_at: `${date}T${time}`, status:'confirmada',
      //      table_label, notes }
      //   4. invalidar a query ["reservations", date] (TanStack Query)
      //   5. F5: disparar edge function de email best-effort se customerEmail preenchido
      await onSubmit(values);
    } catch {
      // Estado de ERRO de save (não-validação).
      setSaveError("Não foi possível guardar. Tenta de novo.");
    }
  });

  const inputBase = "h-11"; // alvo táctil >= 44px

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field id="customerName" label="Nome do cliente" required error={errors.customerName?.message}>
        {(p) => (
          <Input
            {...p}
            {...register("customerName")}
            className={inputBase}
            placeholder="Ex.: Ana Marques"
            autoComplete="name"
          />
        )}
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="customerPhone"
          label="Telefone"
          required
          error={errors.customerPhone?.message}
          hint="Liga à ficha de cliente"
        >
          {(p) => (
            <Input
              {...p}
              {...register("customerPhone")}
              className={inputBase}
              type="tel"
              inputMode="tel"
              placeholder="+351 ..."
              autoComplete="tel"
            />
          )}
        </Field>

        <Field
          id="customerEmail"
          label="Email (opcional)"
          error={errors.customerEmail?.message}
          hint="Necessário para enviar confirmação"
        >
          {(p) => (
            <Input
              {...p}
              {...register("customerEmail")}
              className={inputBase}
              type="email"
              inputMode="email"
              placeholder="cliente@email.pt"
              autoComplete="email"
            />
          )}
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field id="date" label="Data" required error={errors.date?.message}>
          {(p) => (
            <Input {...p} {...register("date")} className={inputBase} type="date" min={todayStr} />
          )}
        </Field>
        <Field id="time" label="Hora" required error={errors.time?.message}>
          {(p) => <Input {...p} {...register("time")} className={inputBase} type="time" />}
        </Field>
        <Field id="partySize" label="Pessoas" required error={errors.partySize?.message}>
          {(p) => (
            <Input
              {...p}
              {...register("partySize")}
              className={inputBase}
              type="number"
              min={1}
              inputMode="numeric"
            />
          )}
        </Field>
      </div>

      <Field
        id="tableLabel"
        label="Mesa (opcional)"
        error={errors.tableLabel?.message}
      >
        {(p) => (
          <Input {...p} {...register("tableLabel")} className={inputBase} placeholder="Ex.: 8" />
        )}
      </Field>

      <Field id="notes" label="Notas (opcional)" error={errors.notes?.message}>
        {(p) => (
          <Textarea
            {...p}
            {...register("notes")}
            placeholder="Alergias, ocasião, pedido especial..."
          />
        )}
      </Field>

      {(overCapacity || outOfHours) && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-[hsl(var(--status-pending-fg))]/30 bg-[hsl(var(--status-pending-bg))] px-3 py-2 text-sm text-[hsl(var(--status-pending-fg))]"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="space-y-0.5">
            {overCapacity && <p>Esta reserva ultrapassa a capacidade do turno. Podes confirmar à mesma.</p>}
            {outOfHours && <p>A hora escolhida está fora do horário de funcionamento.</p>}
          </div>
        </div>
      )}

      {saveError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {saveError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="h-11" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" className="h-11" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {initial ? "Guardar alterações" : "Criar reserva"}
        </Button>
      </div>
    </form>
  );
}
