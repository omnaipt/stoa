import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

// C3 — Onboarding do restaurante (mesas + turnos). Sucesso => toast + redirect
// para a Vista de Disponibilidade (ecrã âncora).
export default function Onboarding() {
  const navigate = useNavigate();
  return (
    <div className="container max-w-2xl py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Criar restaurante</h1>
        <p className="text-sm text-muted-foreground">
          Regista o teu restaurante, as tuas mesas e os teus turnos para começares a aceitar reservas.
        </p>
      </header>
      <OnboardingForm
        onCreated={() => {
          toast.success("Restaurante criado");
          navigate("/disponibilidade");
        }}
      />
    </div>
  );
}
