// Tipos de domínio STOA (vertical Restaurantes) — modelo Fase 1: mesas + turnos.
// Espelham o schema em supabase/migrations/0001_init.sql (mesas+turnos reais).
// Mantidos manualmente enquanto o wiring Supabase (Marco #4) está em espera.
// TODO(marco): substituir por tipos gerados via `supabase gen types typescript`
// quando o wiring arrancar; estes ficam como contrato de referência da UI.

export type ReservationStatus =
  | "pendente"
  | "confirmada"
  | "sentada"
  | "cancelada"
  | "no_show";

// Dias da semana ISO-8601: 1 = Segunda ... 7 = Domingo (igual ao schema: turns.weekdays int[]).
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Restaurant {
  id: string;
  name: string;
  slug: string | null;
  vertical: string;
  timezone: string; // ex.: "Europe/Lisbon" — fuso para calcular service_date
  email: string | null;
  phone: string | null;
  default_duration_min: number; // Fase 2-ready; não usado no cálculo Fase 1
  assignment_mode: "manual" | "auto"; // Fase 1 = sempre 'manual'
  owner_id: string;
  created_at: string;
}

// ── Mesa (public.tables) ────────────────────────────────────────────────────
export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  label: string; // ex.: "Mesa 1", "Esplanada 3", "Balcão"
  seats: number; // ≥ 1
  sort_order: number; // ordem de apresentação na vista
  active: boolean; // inactiva => não aparece para atribuição, mantém histórico
  created_at: string;
}

// ── Turno (public.turns) ────────────────────────────────────────────────────
export interface Turn {
  id: string;
  restaurant_id: string;
  label: string; // obrigatório, ex.: "1º turno almoço", "Jantar"
  service: string | null; // OPCIONAL, texto livre (almoço/jantar/brunch/lanche/...), NÃO enum
  start_time: string; // "HH:mm"
  weekdays: IsoWeekday[]; // dias em que o turno se aplica
  default_duration_min: number | null; // Fase 2-ready; não usado na Fase 1
  active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null; // notas persistentes do cliente (distintas das da reserva)
  created_at: string;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  party_size: number;
  // Atribuição Fase 1: turno OBRIGATÓRIO; mesa OPCIONAL (null => POR ATRIBUIR).
  turn_id: string;
  table_id: string | null;
  // service_date: dia de calendário no fuso do restaurante (unidade de
  // disponibilidade Fase 1 junto com turn_id). reserved_at = hora exacta/exibição.
  service_date: string; // "yyyy-MM-dd"
  reserved_at: string | null; // ISO timestamptz, opcional (exibição)
  status: ReservationStatus;
  notes: string | null;
  created_at: string;
}

export const WEEKDAYS: { key: IsoWeekday; label: string; short: string }[] = [
  { key: 1, label: "Segunda", short: "Seg" },
  { key: 2, label: "Terça", short: "Ter" },
  { key: 3, label: "Quarta", short: "Qua" },
  { key: 4, label: "Quinta", short: "Qui" },
  { key: 5, label: "Sexta", short: "Sex" },
  { key: 6, label: "Sábado", short: "Sáb" },
  { key: 7, label: "Domingo", short: "Dom" },
];

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  sentada: "Sentada",
  cancelada: "Cancelada",
  no_show: "No-show",
};

// Estados que contam para a ocupação/resumo do turno (exclui cancelada/no_show).
export const STATUSES_COUNTING_FOR_OCCUPANCY: ReservationStatus[] = [
  "pendente",
  "confirmada",
  "sentada",
];

// JS Date.getDay(): 0=Domingo..6=Sábado. Converte para ISO 1..7.
export function isoWeekdayOf(date: Date): IsoWeekday {
  const js = date.getDay();
  return (js === 0 ? 7 : js) as IsoWeekday;
}
