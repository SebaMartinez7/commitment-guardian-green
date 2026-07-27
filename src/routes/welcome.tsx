import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileUp, LayoutDashboard, Leaf, Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { LoginScreen } from "@/components/LoginScreen";
import { UserMenu } from "@/components/UserMenu";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Bienvenido — VerdeRCA" },
      {
        name: "description",
        content:
          "Crea un nuevo proyecto cargando tu RCA en PDF o accede al panel de compromisos ambientales existentes.",
      },
      { property: "og:title", content: "Bienvenido — VerdeRCA" },
      {
        property: "og:description",
        content:
          "Crea un nuevo proyecto cargando tu RCA en PDF o accede al panel de compromisos ambientales existentes.",
      },
    ],
  }),
  component: WelcomeRoute,
});

function WelcomeRoute() {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;
  return <WelcomePage name={user.name} />;
}

function WelcomePage({ name }: { name: string }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background">
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-semibold">VerdeRCA</span>
          </div>
          <div className="flex items-center gap-2">
            <AppNav />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Extracción asistida por IA
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Hola, {name.split(" ")[0]} 👋
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            ¿Por dónde quieres partir hoy? Carga una nueva RCA para crear el proyecto
            automáticamente, o revisa tus compromisos existentes.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <Card
            role="button"
            tabIndex={0}
            onClick={() => navigate({ to: "/import" })}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate({ to: "/import" });
            }}
            className="group cursor-pointer border-primary/30 bg-card shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-xl"
          >
            <CardContent className="flex h-full flex-col gap-4 p-6 sm:p-8">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                <FileUp className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Crear nuevo proyecto cargando RCA (PDF)
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  La IA lee tu resolución y extrae los compromisos de los puntos 8°, 9°, 10°,
                  14, 15, 16, 20 y 21, creando el proyecto automáticamente.
                </p>
              </div>
              <Button className="mt-auto w-fit gap-2" size="lg">
                Subir RCA y extraer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/70 transition-colors hover:border-primary/40">
            <CardContent className="flex h-full flex-col gap-4 p-6 sm:p-8">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-foreground">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Ir al panel de proyectos existentes
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Revisa el estado de cumplimiento, plazos y medios de verificación de tus RCA
                  ya cargadas.
                </p>
              </div>
              <Button asChild variant="outline" className="mt-auto w-fit gap-2">
                <Link to="/">
                  Ver dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
