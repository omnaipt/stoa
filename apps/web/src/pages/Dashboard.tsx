import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  return (
    <div className="container py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">STOA</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{user?.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>Sair</Button>
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Reservas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Gerir as reservas do restaurante.</p>
            <Link to="/reservas" className={buttonVariants()}>Abrir reservas</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Configuração</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Configurar os dados do restaurante (onboarding).</p>
            <Link to="/onboarding" className={buttonVariants({ variant: "outline" })}>Abrir onboarding</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
