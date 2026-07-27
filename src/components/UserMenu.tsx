import { LogOut, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_SHORT, useAuth, type Role } from "@/lib/auth";

function roleBadgeTone(role: Role) {
  switch (role) {
    case "admin":
      return "bg-primary/15 text-primary border-primary/30";
    case "contractor":
      return "bg-warning/25 text-warning-foreground border-warning/40";
    case "auditor":
      return "bg-muted text-muted-foreground border-border";
  }
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-border bg-background px-1.5 py-1 pr-3 transition-colors hover:bg-accent">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <div className="text-xs font-semibold leading-tight text-foreground">
              {user.name}
            </div>
            <div className="text-[10px] leading-tight text-muted-foreground">
              {ROLE_SHORT[user.role]}
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold">{user.name}</div>
            <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
            <Badge
              variant="outline"
              className={cn("mt-1 w-fit gap-1 text-[10px]", roleBadgeTone(user.role))}
            >
              <ShieldCheck className="h-3 w-3" />
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-danger focus:text-danger">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
