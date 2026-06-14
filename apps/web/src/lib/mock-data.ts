// Dados mock/locais para a UI Fase 1 (mesas + turnos). SEM Supabase.
// TODO(marco): substituir por hooks de dados (TanStack Query) sobre Supabase
// no wiring #4. A forma dos objetos espelha o schema 0001_init.sql.
//
// Inclui DUAS configurações diferentes (restA, restB) para provar que a UI
// suporta 2 layouts/turnos distintos sem assumir planta única (req. spec).

import type {
  Customer,
  Reservation,
  RestaurantTable,
  Turn,
} from "@/lib/types";

// ── Restaurante A: sala de salão, 2 turnos ao almoço + jantar ────────────────
export const mockTablesA: RestaurantTable[] = [
  { id: "tA1", restaurant_id: "A", label: "Mesa 1", seats: 2, sort_order: 1, active: true, created_at: "" },
  { id: "tA2", restaurant_id: "A", label: "Mesa 2", seats: 2, sort_order: 2, active: true, created_at: "" },
  { id: "tA3", restaurant_id: "A", label: "Mesa 3", seats: 4, sort_order: 3, active: true, created_at: "" },
  { id: "tA4", restaurant_id: "A", label: "Mesa 4", seats: 4, sort_order: 4, active: true, created_at: "" },
  { id: "tA5", restaurant_id: "A", label: "Mesa 6", seats: 6, sort_order: 5, active: true, created_at: "" },
  { id: "tA6", restaurant_id: "A", label: "Balcão", seats: 1, sort_order: 6, active: false, created_at: "" },
];

export const mockTurnsA: Turn[] = [
  { id: "sA1", restaurant_id: "A", label: "1º almoço", service: "almoço", start_time: "12:00", weekdays: [2, 3, 4, 5, 6, 7], default_duration_min: 120, active: true, created_at: "" },
  { id: "sA2", restaurant_id: "A", label: "2º almoço", service: "almoço", start_time: "13:30", weekdays: [6, 7], default_duration_min: 120, active: true, created_at: "" },
  { id: "sA3", restaurant_id: "A", label: "Jantar", service: "jantar", start_time: "20:00", weekdays: [4, 5, 6], default_duration_min: 150, active: true, created_at: "" },
];

// ── Restaurante B: layout diferente, 1 turno almoço + brunch ao fim-de-semana
export const mockTablesB: RestaurantTable[] = [
  { id: "tB1", restaurant_id: "B", label: "Esplanada 1", seats: 4, sort_order: 1, active: true, created_at: "" },
  { id: "tB2", restaurant_id: "B", label: "Esplanada 2", seats: 4, sort_order: 2, active: true, created_at: "" },
  { id: "tB3", restaurant_id: "B", label: "Interior A", seats: 2, sort_order: 3, active: true, created_at: "" },
  { id: "tB4", restaurant_id: "B", label: "Interior B", seats: 8, sort_order: 4, active: true, created_at: "" },
];

export const mockTurnsB: Turn[] = [
  { id: "sB1", restaurant_id: "B", label: "Almoço", service: null, start_time: "12:30", weekdays: [3, 4, 5, 6, 7], default_duration_min: 120, active: true, created_at: "" },
  { id: "sB2", restaurant_id: "B", label: "Brunch", service: "brunch", start_time: "11:00", weekdays: [6, 7], default_duration_min: 120, active: true, created_at: "" },
];

// Config activa para a demo da UI (restaurante A).
export const mockTables = mockTablesA;
export const mockTurns = mockTurnsA;

export const mockCustomers: Customer[] = [
  { id: "c1", restaurant_id: "A", name: "Ana Martins", phone: "912345678", email: "ana@example.com", notes: "Alérgica a marisco.", created_at: "" },
  { id: "c2", restaurant_id: "A", name: "João Pereira", phone: "934111222", email: null, notes: null, created_at: "" },
];

// service_date de hoje no formato yyyy-MM-dd (ver computeServiceDate).
const todayIso = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
})();

// Reservas mock para HOJE no turno "1º almoço" (sA1):
// 2 com mesa atribuída, 1 POR ATRIBUIR (table_id null).
export const mockReservations: Reservation[] = [
  {
    id: "r1", restaurant_id: "A", customer_id: "c1",
    customer_name: "Ana Martins", customer_phone: "912345678", customer_email: "ana@example.com",
    party_size: 2, turn_id: "sA1", table_id: "tA1",
    service_date: todayIso, reserved_at: `${todayIso}T12:00:00`,
    status: "confirmada", notes: "Alergia a marisco.", created_at: "",
  },
  {
    id: "r2", restaurant_id: "A", customer_id: "c2",
    customer_name: "João Pereira", customer_phone: "934111222", customer_email: null,
    party_size: 5, turn_id: "sA1", table_id: "tA5",
    service_date: todayIso, reserved_at: `${todayIso}T12:15:00`,
    status: "sentada", notes: null, created_at: "",
  },
  {
    id: "r3", restaurant_id: "A", customer_id: null,
    customer_name: "Marta Sousa", customer_phone: "961000000", customer_email: null,
    party_size: 4, turn_id: "sA1", table_id: null, // POR ATRIBUIR
    service_date: todayIso, reserved_at: null,
    status: "confirmada", notes: "Aniversário.", created_at: "",
  },
];
