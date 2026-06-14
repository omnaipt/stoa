import * as React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableManager, type TableRow } from "@/components/tables/TableManager";
import { TurnManager, type TurnRow } from "@/components/turns/TurnManager";
import { mockTables, mockTurns } from "@/lib/mock-data";

// C1 + C2 em definições: gerir mesas e turnos depois do onboarding.
// 5 estados: loading (skeleton), vazio (CTA via manager), erro (retry),
// sucesso (toast ao guardar), default. TODO(marco): wire Supabase (CRUD).

type LoadState = "loading" | "error" | "ready";

export default function Settings() {
  const [loadState, setLoadState] = React.useState<LoadState>("loading");
  const [tables, setTables] = React.useState<TableRow[]>([]);
  const [turns, setTurns] = React.useState<TurnRow[]>([]);

  React.useEffect(() => {
    // TODO(marco): wire Supabase — carregar mesas + turnos do restaurante.
    const t = setTimeout(() => {
      setTables(
        mockTables.map((m) => ({ id: m.id, label: m.label, seats: m.seats, sortOrder: m.sort_order, active: m.active })),
      );
      setTurns(
        mockTurns.map((m) => ({
          id: m.id,
          label: m.label,
          startTime: m.start_time,
          service: m.service ?? "",
          weekdays: m.weekdays,
          active: m.active,
        })),
      );
      setLoadState("ready");
    }, 500);
    return () => clearTimeout(t);
  }, []);

  function persistTables(next: TableRow[]) {
    setTables(next);
    // TODO(marco): wire Supabase — persistir alteração da mesa.
    toast.success("Mesa guardada");
  }
  function persistTurns(next: TurnRow[]) {
    setTurns(next);
    // TODO(marco): wire Supabase — persistir alteração do turno.
    toast.success("Turno guardado");
  }

  return (
    <div className="container max-w-2xl py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mesas e turnos</h1>
        <Link to="/disponibilidade" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Voltar
        </Link>
      </header>

      {loadState === "error" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">Não foi possível carregar as definições.</p>
            <button className={buttonVariants({ variant: "outline", size: "sm" })} onClick={() => setLoadState("loading")}>
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      )}

      {loadState === "loading" && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {loadState === "ready" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Esquema de mesas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tables.length === 0 && (
                <p className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
                  Ainda não tens mesas. Adiciona a primeira.
                </p>
              )}
              <TableManager tables={tables} onChange={persistTables} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Turnos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {turns.length === 0 && (
                <p className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
                  Ainda não tens turnos. Adiciona o primeiro.
                </p>
              )}
              <TurnManager turns={turns} onChange={persistTurns} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
