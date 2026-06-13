import { Badge } from "@/components/ui/badge";
import { RESERVATION_STATUS_LABEL, type ReservationStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge variant={status}>{RESERVATION_STATUS_LABEL[status]}</Badge>;
}
