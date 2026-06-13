// Tipos de domínio STOA (vertical Restaurantes).
// Espelham o schema em supabase/migrations/0001_init.sql.
// Mantidos manualmente enquanto o Gate 1 (Supabase) está em espera.
// TODO(marco): substituir por tipos gerados via `supabase gen types typescript`
// quando o projeto Supabase existir; estes ficam como contrato de referência.

export type ReservationStatus =
  | "pendente"
  | "confirmada"
  | "sentada"
  | "cancelada"
  | "no_show";

export interface Restaurant {
  id: string;
  name: string;
  slug: string | null;
  vertical: string;
  timezone: string;
  owner_id: string;
  created_at: string;
  // Dados de onboarding (F1). No schema atual vivem fora da tabela restaurants
  // mínima; tratados aqui como parte do perfil operacional do restaurante.
  email: string;
  phone: string;
  capacity_per_shift: number;
  default_duration_min: number;
  opening_hours: OpeningHours;
}

export type Weekday =
  | "seg"
  | "ter"
  | "qua"
  | "qui"
  | "sex"
  | "sab"
  | "dom";

export interface DayHours {
  closed: boolean;
  open: string; // "HH:mm"
  close: string; // "HH:mm"
}

export type OpeningHours = Record<Weekday, DayHours>;

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  party_size: number;
  reserved_at: string; // ISO timestamptz
  status: ReservationStatus;
  table_label: string | null;
  notes: string | null;
  created_at: string;
}

export const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  sentada: "Sentada",
  cancelada: "Cancelada",
  no_show: "No-show",
};

// Estados que contam para a lotação do turno (exclui cancelada/no_show).
export const STATUSES_COUNTING_FOR_CAPACITY: ReservationStatus[] = [
  "pendente",
  "confirmada",
  "sentada",
];
