import { Link } from "@tanstack/react-router";
import { LayoutDashboard, FileUp, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppNav() {
  const base =
    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors";
  const inactive = "text-muted-foreground hover:bg-accent hover:text-foreground";
  const active = "bg-primary/10 text-primary";
  return (
    <nav className="flex items-center gap-1">
      <Link
        to="/welcome"
        className={cn(base, inactive)}
        activeProps={{ className: cn(base, active) }}
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>
      <Link
        to="/"
        activeOptions={{ exact: true }}
        className={cn(base, inactive)}
        activeProps={{ className: cn(base, active) }}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      <Link
        to="/import"
        className={cn(base, inactive)}
        activeProps={{ className: cn(base, active) }}
      >
        <FileUp className="h-4 w-4" />
        <span className="hidden sm:inline">Importar RCA</span>
      </Link>
    </nav>
  );
}
