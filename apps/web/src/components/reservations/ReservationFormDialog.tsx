import { Dialog } from "@/components/ui/dialog";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import type { Reservation, Restaurant } from "@/lib/types";
import type { ReservationValues } from "@/lib/schemas";

interface ReservationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
  dayReservations: Reservation[];
  initial?: Reservation;
  onSubmit: (values: ReservationValues) => Promise<void> | void;
}

export function ReservationFormDialog({
  open,
  onOpenChange,
  restaurant,
  dayReservations,
  initial,
  onSubmit,
}: ReservationFormDialogProps) {
  const editing = Boolean(initial);
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Editar reserva" : "Nova reserva"}
      description={editing ? undefined : "Preenche os dados da reserva."}
    >
      <ReservationForm
        restaurant={restaurant}
        dayReservations={dayReservations}
        initial={initial}
        onSubmit={async (values) => {
          await onSubmit(values);
          onOpenChange(false);
        }}
        onCancel={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
