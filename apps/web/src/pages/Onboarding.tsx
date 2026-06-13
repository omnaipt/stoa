import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

// F1 — Onboarding do restaurante.
// Ecrã pós-login que cria o tenant. Sem membership o RLS esconde tudo, por isso
// este é o ecrã que destranca o resto do produto.
// UI estática contra mock: o write real fica como TODO(marco) no OnboardingForm.
export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl py-8">
      <header className="mb-6 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">STOA · Configuração</p>
        <h1 className="text-2xl font-semibold tracking-tight">Vamos pôr o teu restaurante a funcionar</h1>
        <p className="text-sm text-muted-foreground">
          Só os dados essenciais. Em menos de 10 minutos podes criar a tua primeira reserva.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do restaurante</CardTitle>
        </CardHeader>
        <CardContent>
          <OnboardingForm
            onSubmit={async (values) => {
              // Simulação local de latência/sucesso (sem Supabase).
              await new Promise((resolve) => setTimeout(resolve, 600));
              // TODO(marco): substituir simulação por insert real + membership (ver OnboardingForm).
              toast.success("Restaurante criado", {
                description: `${values.name} está pronto. Bom serviço!`,
              });
              navigate("/reservas");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
