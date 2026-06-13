import type {
  OpeningHours,
  Reservation,
  Restaurant,
  ReservationStatus,
} from "@/lib/types";
import { STATUSES_COUNTING_FOR_CAPACITY } from "@/lib/types";

// Dados mock locais para desenvolvimento de UI sem Supabase (Gate 1 em espera).
// TODO(marco): substituir todos os helpers daqui por queries/mutations reais.

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (combining marks)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const defaultHours = (open = "12:00", close = "23:00", closed = false) => ({
  closed,
  open,
  close,
});

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  seg: defaultHours("12:00", "23:00"),
  ter: defaultHours("12:00", "23:00"),
  qua: defaultHours("12:00", "23:00"),
  qui: defaultHours("12:00", "23:00"),
  sex: defaultHours("12:00", "23:30"),
  sab: defaultHours("12:00", "23:30"),
  dom: defaultHours("12:00", "16:00", true),
};

// Restaurante mock "já com onboarding feito" (usado na Vista de Dia).
export const MOCK_RESTAURANT: Restaurant = {
  id: "mock-rest-1",
  name: "Tasca do Zé",
  slug: "tasca-do-ze",
  vertical: "restaurante",
  timezone: "Europe/Lisbon",
  owner_id: "mock-user-1",
  created_at: new Date().toISOString(),
  email: "geral@tascadoze.pt",
  phone: "+351 210 000 000",
  capacity_per_shift: 40,
  default_duration_min: 120,
  opening_hours: DEFAULT_OPENING_HOURS,
};

function todayAt(hh: number, mm: number): string {
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "r1",
    restaurant_id: MOCK_RESTAURANT.id,
    customer_id: "c1",
    customer_name: "Ana Marques",
    customer_phone: "+351 912 345 678",
    customer_email: "ana@example.pt",
    party_size: 2,
    reserved_at: todayAt(12, 30),
    status: "confirmada",
    table_label: null,
    notes: "Mesa junto à janela, se possível",
    created_at: todayAt(9, 0),
  },
  {
    id: "r2",
    restaurant_id: MOCK_RESTAURANT.id,
    customer_id: "c2",
    customer_name: "Bruno Costa",
    customer_phone: "+351 913 000 111",
    customer_email: null,
    party_size: 4,
    reserved_at: todayAt(13, 0),
    status: "sentada",
    table_label: "8",
    notes: null,
    created_at: todayAt(9, 30),
  },
  {
    id: "r3",
    restaurant_id: MOCK_RESTAURANT.id,
    customer_id: "c3",
    customer_name: "Carla Nogueira",
    customer_phone: "+351 914 222 333",
    customer_email: "carla@example.pt",
    party_size: 6,
    reserved_at: todayAt(20, 0),
    status: "confirmada",
    table_label: null,
    notes: "Aniversário — bolo no fim",
    created_at: todayAt(10, 0),
  },
  {
    id: "r4",
    restaurant_id: MOCK_RESTAURANT.id,
    customer_id: "c4",
    customer_name: "Diogo Pereira",
    customer_phone: "+351 915 444 555",
    customer_email: null,
    party_size: 3,
    reserved_at: todayAt(20, 30),
    status: "cancelada",
    table_label: null,
    notes: null,
    created_at: todayAt(10, 30),
  },
];

// Resumo de lotação do dia (F3 critério 4).
export interface DaySummary {
  totalReservations: number;
  totalPax: number;
  capacity: number;
  capacityPct: number;
  overCapacity: boolean;
}

export function summarizeDay(
  reservations: Reservation[],
  capacity: number,
): DaySummary {
  const counting = reservations.filter((r) =>
    STATUSES_COUNTING_FOR_CAPACITY.includes(r.status),
  );
  const totalPax = counting.reduce((sum, r) => sum + r.party_size, 0);
  const capacityPct = capacity > 0 ? Math.round((totalPax / capacity) * 100) : 0;
  return {
    totalReservations: counting.length,
    totalPax,
    capacity,
    capacityPct,
    overCapacity: totalPax > capacity,
  };
}

export function isSameLocalDay(iso: string, day: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  );
}

// Warning não-bloqueante de sobrelotação (F2 critério 4).
export function exceedsCapacity(
  reservations: Reservation[],
  capacity: number,
  newPartySize: number,
  excludeId?: string,
): boolean {
  const current = reservations
    .filter((r) => r.id !== excludeId)
    .filter((r) => STATUSES_COUNTING_FOR_CAPACITY.includes(r.status))
    .reduce((sum, r) => sum + r.party_size, 0);
  return current + newPartySize > capacity;
}

let mockIdCounter = 100;
export function nextMockId(): string {
  mockIdCounter += 1;
  return `mock-${mockIdCounter}`;
}

export const STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  { value: "confirmada", label: "Confirmada" },
  { value: "sentada", label: "Sentada" },
  { value: "no_show", label: "No-show" },
  { value: "cancelada", label: "Cancelada" },
];
