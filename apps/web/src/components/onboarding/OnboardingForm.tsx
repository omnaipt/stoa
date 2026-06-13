import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { onboardingSchema, type OnboardingValues } from "@/lib/schemas";
import { DEFAULT_OPENING_HOURS, slugify } from "@/lib/mock-data";
import { WEEKDAYS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

interface OnboardingFormProps {
  onSubmit: (values: OnboardingValues & { slug: string }) => Promise<void> | void;
}

export function OnboardingForm({ onSubmit }: OnboardingFormProps) {
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      capacityPerShift: 40,
      defaultDurationMin: 120,
      openingHours: DEFAULT_OPENING_HOURS,
    },
  });

  const name = watch("name");
  const slugPreview = slugify(name || "");
  const inputBase = "h-11";

  const submit = handleSubmit(async (values) => {
    setGlobalError(null);
    try {
      const slug = slugify(values.name);
      // TODO(marco): wire Supabase — fluxo de onboarding (F1):
      //   1. (auth já feito antes deste ecrã) obter auth.uid()
      //   2. insert into restaurants { name, slug, owner_id: uid, timezone:'Europe/Lisbon',
      //      + email, phone, capacity_per_shift, default_duration_min, opening_hours }
      //      NOTA: o schema 0001 ainda não tem colunas email/phone/capacity/hours.
      //      Coordenar migration com o Marco (ver relatório).
      //   3. insert into restaurant_members { restaurant_id, user_id: uid, role:'owner' }
      //      -> isto destranca o RLS (sem membership o tenant não vê nada).
      //   4. tratar erro de email duplicado (F1.3) -> setGlobalError específico.
      //   5. redirect para /reservas (Vista de Dia) + toast "Restaurante criado".
      await onSubmit({ ...values, slug });
    } catch {
      setGlobalError("Não foi possível criar a conta. Tenta de novo.");
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <section className="space-y-4">
        <Field
          id="name"
          label="Nome do restaurante"
          required
          error={errors.name?.message}
          hint={slugPreview ? `O teu endereço: stoa.pt/${slugPreview}` : undefined}
        >
          {(p) => (
            <Input {...p} {...register("name")} className={inputBase} placeholder="Ex.: Tasca do Zé" />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="email" label="Email de contacto" required error={errors.email?.message}>
            {(p) => (
              <Input
                {...p}
                {...register("email")}
                className={inputBase}
                type="email"
                inputMode="email"
                placeholder="geral@restaurante.pt"
                autoComplete="email"
              />
            )}
          </Field>
          <Field id="phone" label="Telefone" required error={errors.phone?.message}>
            {(p) => (
              <Input
                {...p}
                {...register("phone")}
                className={inputBase}
                type="tel"
                inputMode="tel"
                placeholder="+351 ..."
                autoComplete="tel"
              />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="capacityPerShift"
            label="Capacidade por turno"
            required
            error={errors.capacityPerShift?.message}
            hint="Nº de lugares — usado para alertas de lotação"
          >
            {(p) => (
              <Input
                {...p}
                {...register("capacityPerShift")}
                className={inputBase}
                type="number"
                min={1}
                inputMode="numeric"
              />
            )}
          </Field>
          <Field
            id="defaultDurationMin"
            label="Duração da reserva (min)"
            error={errors.defaultDurationMin?.message}
            hint="Default 120"
          >
            {(p) => (
              <Input
                {...p}
                {...register("defaultDurationMin")}
                className={inputBase}
                type="number"
                min={30}
                step={15}
                inputMode="numeric"
              />
            )}
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">Horário de funcionamento</h2>
          <p className="text-xs text-muted-foreground">
            Assume 1 turno por dia (default da spec). Desliga os dias em que estás fechado.
          </p>
        </div>
        <div className="space-y-2">
          {WEEKDAYS.map(({ key, label }) => (
            <Controller
              key={key}
              control={control}
              name={`openingHours.${key}`}
              render={({ field, fieldState }) => (
                <div className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <label className="flex min-w-[120px] items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-input"
                        checked={!field.value.closed}
                        onChange={(e) =>
                          field.onChange({ ...field.value, closed: !e.target.checked })
                        }
                        aria-label={`${label} aberto`}
                      />
                      {label}
                    </label>
                    {field.value.closed ? (
                      <span className="text-sm text-muted-foreground">Fechado</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          className="h-11 w-[7.5rem]"
                          value={field.value.open}
                          onChange={(e) => field.onChange({ ...field.value, open: e.target.value })}
                          aria-label={`${label} abertura`}
                        />
                        <span className="text-muted-foreground">às</span>
                        <Input
                          type="time"
                          className="h-11 w-[7.5rem]"
                          value={field.value.close}
                          onChange={(e) =>
                            field.onChange({ ...field.value, close: e.target.value })
                          }
                          aria-label={`${label} fecho`}
                        />
                      </div>
                    )}
                  </div>
                  {fieldState.error && (
                    <p className="mt-1 text-xs font-medium text-destructive">
                      {/* erro do refine vive em .close */}
                      {(fieldState.error as { close?: { message?: string } }).close?.message ??
                        "Horário inválido"}
                    </p>
                  )}
                </div>
              )}
            />
          ))}
        </div>
      </section>

      {globalError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {globalError}
        </p>
      )}

      <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSubmitting ? "A criar conta..." : "Criar restaurante e começar"}
      </Button>
    </form>
  );
}
