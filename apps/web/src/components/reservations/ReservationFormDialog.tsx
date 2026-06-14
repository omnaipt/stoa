import { Dialog } from "@/components/ui/dialog";
import { ReservationForm, type ReservationFormInitial } from "@/components/reservations/ReservationForm";
import type { Reservation, RestaurantTable, Turn } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: RestaurantTable[];
  turns: Turn[];
  existing: Reservation[];
  initial?: ReservationFormInitial;
  presetTurnId?: string;
  presetDate?: string;
  onSaved: () => void;
}

export function ReservationFormDialog({
  open,
  onOpenChange,
  tables,
  turns,
  existing,
  initial,
  presetTurnId,
  presetDate,
  onSaved,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={initial?.id ? "Editar reserva" : "Nova reserva"}
      description="Turno obrigatório. A mesa pode ficar por atribuir."
    >
      <ReservationForm
        tables={tables}
        turns={turns}
        existing={existing}
        initial={initial}
        presetTurnId={presetTurnId}
        presetDate={presetDate}
        onSaved={onSaved}
        onCancel={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
