// CONTRATO service_date (FROZEN) — fonte de verdade para o dia de serviço.
//
// A APP é responsável por calcular service_date a partir da data escolhida no
// form, NO FUSO DO RESTAURANTE (restaurants.timezone, ex.: "Europe/Lisbon").
// O default UTC do schema (reservations.service_date default now() at UTC) é
// APENAS fallback; perto da meia-noite a data UTC diverge da data local e está
// ERRADA para o produto. Por isso a escrita NUNCA deve depender desse default.
//
// Na Fase 1 (UI sem wiring) o form trabalha com a data já escolhida pelo staff
// (input type=date no fuso local do browser), que é a service_date. O ponto de
// integração com a timezone real do restaurante fica marcado abaixo.
//
// TODO(marco): no wiring #4, ENFORCE este contrato:
//   1. Ler restaurant.timezone.
//   2. Combinar a `date` (yyyy-MM-dd) escolhida no form com a `time` (ou o
//      start_time do turno) e interpretar no fuso do restaurante.
//   3. Derivar service_date = dia de calendário dessa instância NESSE fuso.
//   4. Enviar service_date EXPLÍCITO no insert/update (nunca confiar no default
//      UTC do schema). reserved_at = timestamptz da hora exacta (se houver).
//   Para fazer conversão de fuso real no cliente, usar Intl.DateTimeFormat com
//   timeZone, ou mover o cálculo para uma edge function/RPC do Marco.

/**
 * Data local de hoje no formato yyyy-MM-dd (fuso do browser).
 * Usada como default e como limite mínimo de reserva (walk-in só para hoje+).
 * TODO(marco): no servidor, "hoje" tem de ser calculado no fuso do restaurante.
 */
export function todayServiceDate(): string {
  const d = new Date();
  return toIsoDate(d);
}

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * service_date a enviar para o backend.
 * Fase 1 (UI): a data escolhida no form JÁ É a service_date (input date local).
 * Marco #4 substitui por derivação no fuso do restaurante (ver TODO acima).
 */
export function computeServiceDate(formDate: string /* , restaurantTimezone: string */): string {
  // TODO(marco): wire Supabase — recalcular no fuso de restaurant.timezone.
  return formDate;
}

/** true se a data (yyyy-MM-dd) é anterior a hoje => reserva bloqueada. */
export function isPastDate(isoDate: string): boolean {
  return isoDate < todayServiceDate();
}

/** Navega N dias a partir de uma data yyyy-MM-dd e devolve yyyy-MM-dd. */
export function shiftIsoDate(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return toIsoDate(dt);
}
