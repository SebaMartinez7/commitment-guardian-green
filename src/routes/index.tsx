import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Leaf,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  FileCheck2,
  Search,
  MapPin,
  ChevronRight,
  Building2,
  CalendarDays,
  LogOut,
  ShieldCheck,
  Lock as LockIcon,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  COMPONENTS,
  FREQUENCIES,
  initialProjects,
  type Commitment,
  type EnvComponent,
  type Frequency,
  type Project,
  type Status,
} from "@/lib/rca-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Panel de Compromisos RCA — VerdeRCA" },
      {
        name: "description",
        content:
          "Dashboard de control y cumplimiento de compromisos ambientales RCA para proyectos industriales y de construcción en Chile.",
      },
    ],
  }),
  component: DashboardPage,
});

/* ---------------- Helpers ---------------- */

function computeStatus(dueDate: string, current: Status): Status {
  if (current === "Cumplido") return "Cumplido";
  const due = new Date(dueDate + "T23:59:59");
  return due.getTime() < Date.now() ? "Vencido" : "Pendiente";
}

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(iso: string) {
  const d = new Date(iso + "T23:59:59").getTime();
  return Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    Cumplido: "bg-success/15 text-success border-success/30",
    Pendiente: "bg-warning/20 text-warning-foreground border-warning/40",
    Vencido: "bg-danger/15 text-danger border-danger/30",
  };
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", map[status])}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "Cumplido" && "bg-success",
          status === "Pendiente" && "bg-warning",
          status === "Vencido" && "bg-danger",
        )}
      />
      {status}
    </Badge>
  );
}

function ComponentTag({ c }: { c: EnvComponent }) {
  return (
    <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
      {c}
    </span>
  );
}

/* ---------------- Sidebar ---------------- */

function ProjectSidebar({
  projects,
  selectedProjectId,
  selectedRcaId,
  onSelect,
}: {
  projects: Project[];
  selectedProjectId: string;
  selectedRcaId: string;
  onSelect: (projectId: string, rcaId: string) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 pt-5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Leaf className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">VerdeRCA</div>
          <div className="truncate text-xs text-muted-foreground">
            Compromisos Ambientales
          </div>
        </div>
      </div>

      <div className="px-3">
        <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Proyectos y RCAs
        </div>
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <div key={p.id} className="rounded-lg">
              <div className="flex items-start gap-2 px-2 pb-1">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{p.location}</span>
                  </div>
                </div>
              </div>
              <div className="ml-6 flex flex-col gap-1">
                {p.rcas.map((rca) => {
                  const active =
                    p.id === selectedProjectId && rca.id === selectedRcaId;
                  return (
                    <button
                      key={rca.id}
                      onClick={() => onSelect(p.id, rca.id)}
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-transform",
                          active && "translate-x-0.5",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold">
                          {rca.code}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {rca.name}
                        </div>
                      </div>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {rca.commitments.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Metric Cards ---------------- */

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "neutral" | "success" | "warning" | "danger";
  hint?: string;
}) {
  const toneMap = {
    neutral: {
      bg: "bg-primary/10",
      fg: "text-primary",
      ring: "ring-primary/20",
      bar: "bg-primary",
    },
    success: {
      bg: "bg-success/15",
      fg: "text-success",
      ring: "ring-success/25",
      bar: "bg-success",
    },
    warning: {
      bg: "bg-warning/25",
      fg: "text-warning-foreground",
      ring: "ring-warning/40",
      bar: "bg-warning",
    },
    danger: {
      bg: "bg-danger/15",
      fg: "text-danger",
      ring: "ring-danger/25",
      bar: "bg-danger",
    },
  }[tone];

  return (
    <Card className="relative overflow-hidden">
      <span className={cn("absolute inset-x-0 top-0 h-1", toneMap.bar)} />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <div
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1",
              toneMap.bg,
              toneMap.fg,
              toneMap.ring,
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {hint && (
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- Main Page ---------------- */

function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  const [selectedRcaId, setSelectedRcaId] = useState(projects[0].rcas[0].id);
  const [search, setSearch] = useState("");
  const [filterComponent, setFilterComponent] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const selectedProject = projects.find((p) => p.id === selectedProjectId)!;
  const selectedRca =
    selectedProject.rcas.find((r) => r.id === selectedRcaId) ??
    selectedProject.rcas[0];

  // Recompute derived statuses without persisting the mutation
  const commitments = useMemo(
    () =>
      selectedRca.commitments.map((c) => ({
        ...c,
        status: computeStatus(c.dueDate, c.status),
      })),
    [selectedRca],
  );

  const filtered = commitments.filter((c) => {
    if (filterComponent !== "all" && c.component !== filterComponent)
      return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !c.code.toLowerCase().includes(s) &&
        !c.description.toLowerCase().includes(s) &&
        !c.responsible.toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  const metrics = {
    total: commitments.length,
    compliant: commitments.filter((c) => c.status === "Cumplido").length,
    pending: commitments.filter((c) => c.status === "Pendiente").length,
    overdue: commitments.filter((c) => c.status === "Vencido").length,
  };

  function updateCommitment(id: string, patch: Partial<Commitment>) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id !== selectedProjectId
          ? p
          : {
              ...p,
              rcas: p.rcas.map((r) =>
                r.id !== selectedRcaId
                  ? r
                  : {
                      ...r,
                      commitments: r.commitments.map((c) =>
                        c.id === id ? { ...c, ...patch } : c,
                      ),
                    },
              ),
            },
      ),
    );
  }

  function handleSelect(projectId: string, rcaId: string) {
    setSelectedProjectId(projectId);
    setSelectedRcaId(rcaId);
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-border lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto pb-8">
          <ProjectSidebar
            projects={projects}
            selectedProjectId={selectedProjectId}
            selectedRcaId={selectedRcaId}
            onSelect={handleSelect}
          />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6">
            <div className="flex min-w-0 items-center gap-3">
              {/* Mobile sidebar trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Abrir proyectos"
                  >
                    <Building2 className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <ProjectSidebar
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    selectedRcaId={selectedRcaId}
                    onSelect={handleSelect}
                  />
                </SheetContent>
              </Sheet>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{selectedProject.name}</span>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="truncate font-medium text-foreground/80">
                    {selectedRca.code}
                  </span>
                </div>
                <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                  {selectedRca.name}
                </h1>
              </div>
            </div>

            {/* Mobile project switcher */}
            <div className="lg:hidden">
              <Select
                value={`${selectedProjectId}::${selectedRcaId}`}
                onValueChange={(v) => {
                  const [pid, rid] = v.split("::");
                  handleSelect(pid, rid);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.flatMap((p) =>
                    p.rcas.map((r) => (
                      <SelectItem
                        key={`${p.id}::${r.id}`}
                        value={`${p.id}::${r.id}`}
                      >
                        {r.code}
                      </SelectItem>
                    )),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Metrics */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <MetricCard
              label="Total Compromisos"
              value={metrics.total}
              icon={FileCheck2}
              tone="neutral"
              hint="En esta RCA"
            />
            <MetricCard
              label="Cumplidos"
              value={metrics.compliant}
              icon={CheckCircle2}
              tone="success"
              hint="Con medio de verificación"
            />
            <MetricCard
              label="En proceso / Pendientes"
              value={metrics.pending}
              icon={Clock}
              tone="warning"
              hint="Dentro del plazo"
            />
            <MetricCard
              label="Vencidos / Críticos"
              value={metrics.overdue}
              icon={AlertTriangle}
              tone="danger"
              hint="Requieren acción inmediata"
            />
          </section>

          {/* Filters */}
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por ID, descripción o responsable…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterComponent} onValueChange={setFilterComponent}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Componente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los componentes</SelectItem>
                  {COMPONENTS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Cumplido">Cumplido</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Table */}
          <Card className="overflow-hidden py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[90px]">ID</TableHead>
                    <TableHead className="min-w-[130px]">Componente</TableHead>
                    <TableHead className="min-w-[280px]">Descripción</TableHead>
                    <TableHead className="min-w-[130px]">Frecuencia</TableHead>
                    <TableHead className="min-w-[150px]">Vencimiento</TableHead>
                    <TableHead className="min-w-[150px]">Responsable</TableHead>
                    <TableHead className="min-w-[130px]">Estado</TableHead>
                    <TableHead className="min-w-[240px] text-right">
                      Medio de Verificación
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No se encontraron compromisos con los filtros actuales.
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((c) => (
                    <CommitmentRow
                      key={c.id}
                      commitment={c}
                      onChange={(patch) => updateCommitment(c.id, patch)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <footer className="pt-2 text-center text-xs text-muted-foreground">
            VerdeRCA · Gestión de compromisos ambientales RCA — SEA / SMA Chile
          </footer>
        </div>
      </main>
    </div>
  );
}

/* ---------------- Row ---------------- */

function CommitmentRow({
  commitment,
  onChange,
}: {
  commitment: Commitment;
  onChange: (patch: Partial<Commitment>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type && file.type !== "application/pdf") {
      toast.error("Formato no válido", {
        description: "Solo se permiten archivos PDF como medio de verificación.",
      });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Archivo demasiado grande", {
        description: "El PDF supera el límite de 20 MB.",
      });
      return;
    }
    onChange({ verificationFile: file.name, status: "Cumplido" });
    toast.success("Documento cargado", {
      description: `${commitment.code} marcado como Cumplido.`,
    });
  };

  const days = daysUntil(commitment.dueDate);
  const dueLabel =
    commitment.status === "Cumplido"
      ? "Completado"
      : days < 0
        ? `${Math.abs(days)} d de atraso`
        : days === 0
          ? "Vence hoy"
          : `${days} d restantes`;

  return (
    <TableRow className="align-top">
      <TableCell className="font-mono text-sm font-semibold text-primary">
        {commitment.code}
      </TableCell>
      <TableCell>
        <Select
          value={commitment.component}
          onValueChange={(v) => onChange({ component: v as EnvComponent })}
        >
          <SelectTrigger className="h-8 border-0 bg-transparent px-2 shadow-none focus:ring-1 focus:ring-ring">
            <SelectValue asChild>
              <ComponentTag c={commitment.component} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COMPONENTS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="max-w-[420px] whitespace-normal text-sm text-foreground">
        {commitment.description}
      </TableCell>
      <TableCell>
        <Select
          value={commitment.frequency}
          onValueChange={(v) => onChange({ frequency: v as Frequency })}
        >
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCIES.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="date"
              value={commitment.dueDate}
              onChange={(e) => onChange({ dueDate: e.target.value })}
              className="cursor-pointer bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </label>
          <span
            className={cn(
              "text-[11px] font-medium",
              commitment.status === "Vencido"
                ? "text-danger"
                : commitment.status === "Cumplido"
                  ? "text-success"
                  : days <= 7
                    ? "text-warning-foreground"
                    : "text-muted-foreground",
            )}
          >
            {fmtDate(commitment.dueDate)} · {dueLabel}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Input
          value={commitment.responsible}
          onChange={(e) => onChange({ responsible: e.target.value })}
          className="h-8 border-0 bg-transparent px-2 shadow-none focus-visible:ring-1"
        />
      </TableCell>
      <TableCell>
        <StatusBadge status={commitment.status} />
      </TableCell>
      <TableCell className="text-right">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {commitment.verificationFile ? (
          <div className="flex items-center justify-end gap-2">
            <span className="inline-flex max-w-[160px] items-center gap-1.5 truncate rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">
              <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{commitment.verificationFile}</span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileRef.current?.click()}
            >
              Reemplazar
            </Button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "inline-flex justify-end rounded-md transition-colors",
              dragOver && "ring-2 ring-primary ring-offset-2",
            )}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              Subir Verificación
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
