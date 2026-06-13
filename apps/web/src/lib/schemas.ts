import { z } from "zod";
import type { Weekday } from "@/lib/types";

// Validação na fronteira (forms) com zod, em PT-PT.
// Estes schemas estão prontos para o Marco reutilizar no wiring Supabase:
// o output validado mapeia diretamente para os inserts.

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

const dayHoursSchema = z
  .object({
    closed: z.boolean(),
    open: z.string().regex(HHMM, "Hora inválida (HH:mm)"),
    close: z.string().regex(HHMM, "Hora inválida (HH:mm)"),
  })
  .refine((d) => d.closed || d.open < d.close, {
    message: "A abertura tem de ser antes do fecho",
    path: ["close"],
  });

const phoneSchema = z
  .string()
  .trim()
  .min(9, "Telefone inválido (mín. 9 dígitos)")
  .regex(/^[0-9+\s]+$/, "Telefone só pode ter números, espaços e +");

// --- F1: Onboarding do restaurante ---------------------------------------

export const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Indica o nome do restaurante"),
  email: z.string().trim().email("Email de contacto inválido"),
  phone: phoneSchema,
  capacityPerShift: z.coerce
    .number({ invalid_type_error: "Indica a capacidade" })
    .int("Tem de ser um número inteiro")
    .min(1, "A capacidade tem de ser ≥ 1")
    .max(2000, "Valor demasiado alto"),
  defaultDurationMin: z.coerce
    .number()
    .int()
    .min(30, "Mínimo 30 minutos")
    .max(360, "Máximo 360 minutos")
    .default(120),
  openingHours: z.object({
    seg: dayHoursSchema,
    ter: dayHoursSchema,
    qua: dayHoursSchema,
    qui: dayHoursSchema,
    sex: dayHoursSchema,
    sab: dayHoursSchema,
    dom: dayHoursSchema,
  }) satisfies z.ZodType<Record<Weekday, unknown>>,
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

// --- F2: Criar / editar reserva -------------------------------------------

export const reservationSchema = z.object({
  customerName: z.string().trim().min(2, "Indica o nome do cliente"),
  customerPhone: phoneSchema,
  customerEmail: z
    .string()
    .trim()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  partySize: z.coerce
    .number({ invalid_type_error: "Indica o nº de pessoas" })
    .int("Tem de ser um número inteiro")
    .min(1, "Mínimo 1 pessoa")
    .max(100, "Valor demasiado alto"),
  date: z.string().min(1, "Indica a data"), // "yyyy-MM-dd"
  time: z.string().regex(HHMM, "Indica a hora (HH:mm)"),
  tableLabel: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
});

export type ReservationValues = z.infer<typeof reservationSchema>;
