import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Leaf, Loader2, Mail, Lock, User as UserIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, useAuth, type Role } from "@/lib/auth";

type Mode = "signin" | "signup";

export function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("admin");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast.success("Sesión iniciada", { description: "Bienvenido a VerdeRCA." });
      } else {
        if (!name.trim()) throw new Error("Ingresa tu nombre");
        if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");
        await signUp({ name: name.trim(), email, password, role });
        toast.success("Cuenta creada", { description: "Bienvenido a VerdeRCA." });
      }
      navigate({ to: "/welcome" });
    } catch (err) {
      toast.error("No se pudo continuar", {
        description: err instanceof Error ? err.message : "Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo1234");
    setMode("signin");
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background px-4 py-10">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-success/20 blur-3xl" />

      <div className="relative grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="hidden flex-col gap-6 lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">VerdeRCA</div>
              <div className="text-xs text-muted-foreground">
                Gestión de Compromisos Ambientales
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
            Cumplimiento ambiental,{" "}
            <span className="text-primary">bajo control</span>.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Centraliza el seguimiento de compromisos RCA, evidencia de verificación y responsables por proyecto — con visibilidad en tiempo real para todo tu equipo SEA / SMA.
          </p>

          <div className="mt-4 space-y-2 rounded-xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cuentas demo
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { email: "admin@verderca.cl", label: "Admin" },
                { email: "contratista@verderca.cl", label: "Contratista" },
                { email: "auditor@verderca.cl", label: "Auditor" },
              ].map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => fillDemo(d.email)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-left text-xs transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <div className="font-semibold text-foreground">{d.label}</div>
                  <div className="truncate text-muted-foreground">{d.email}</div>
                </button>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Contraseña: <span className="font-mono">demo1234</span>
            </div>
          </div>
        </div>

        <Card className="border-border/60 shadow-xl shadow-primary/5">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">VerdeRCA</div>
                <div className="text-xs text-muted-foreground">Compromisos Ambientales</div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                {mode === "signin" ? "Inicia sesión" : "Crea tu cuenta"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Accede a tu panel de compromisos RCA."
                  : "Configura tu acceso al sistema VerdeRCA."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["signin", "signup"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    mode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "signin" ? "Iniciar sesión" : "Registrarse"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="María Pérez"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@empresa.cl"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() =>
                        toast.info("Recuperación de contraseña", {
                          description:
                            "Contacta a tu administrador VerdeRCA para restablecer el acceso.",
                        })
                      }
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label>Rol</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {mode === "signin" ? "¿Nuevo en VerdeRCA?" : "¿Ya tienes cuenta?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="font-medium text-primary hover:underline"
                >
                  {mode === "signin" ? "Regístrate" : "Inicia sesión"}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
