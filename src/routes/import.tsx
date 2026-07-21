import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Trash2,
  Building2,
  MapPin,
  ClipboardCheck,
  FileUp,
  Lock as LockIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { useAuth } from "@/lib/auth";
import { LoginScreen } from "@/components/LoginScreen";
import { AppNav } from "@/components/AppNav";
import { useProjects } from "@/lib/projects-store";
import {
  COMPONENTS,
  FREQUENCIES,
  type Commitment,
  type EnvComponent,
  type Frequency,
  type Project,
  type RCA,
} from "@/lib/rca-data";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Importar RCA con IA — VerdeRCA" },
      {
        name: "description",
        content:
          "Sube tu Resolución de Calificación Ambiental (RCA) en PDF y extrae automáticamente los compromisos ambientales con inteligencia artificial.",
      },
      { property: "og:title", content: "Importar RCA con IA — VerdeRCA" },
      {
        property: "og:description",
        content:
          "Extractor inteligente de compromisos ambientales desde documentos RCA chilenos.",
      },
    ],
  }),
  component: ImportRoute,
});

/* --------------- Types --------------- */

type Phase = "Construcción" | "Operación" | "Cierre";
const PHASES: Phase[] = ["Construcción", "Operación", "Cierre"];
type EvalType = "DIA" | "EIA";

type ExtractedCommitment = {
  id: string;
  code: string;
  title: string;
  component: EnvComponent;
  phase: Phase;
  requirement: string;
  frequency: Frequency;
  dueDate: string;
  verificationMethod: string;
  responsible: string;
};

type ExtractedRca = {
  code: string;
  projectName: string;
  region: string;
  evalType: EvalType;
  commitments: ExtractedCommitment[];
};

/* --------------- Root gate --------------- */

function ImportRoute() {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;
  return <ImportPage />;
}

/* --------------- Mock extractor --------------- */

const isoOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

function mockExtract(fileName: string): ExtractedRca {
  const base = fileName.replace(/\.pdf$/i, "").slice(0, 40) || "RCA";
  return {
    code: `RCA N° ${Math.floor(100 + Math.random() * 800)}/2026`,
    projectName: `Proyecto ${base}`,
    region: "Región de Antofagasta",
    evalType: Math.random() > 0.5 ? "EIA" : "DIA",
    commitments: [
      {
        id: crypto.randomUUID(),
        code: "F-01",
        title: "Rescate y relocalización de flora nativa",
        component: "Flora",
        phase: "Construcción",
        requirement:
          "Rescatar ejemplares de especies con problemas de conservación en el área de intervención antes del inicio de obras.",
        frequency: "Única vez",
        dueDate: isoOffset(45),
        verificationMethod: "Informe de rescate con registro fotográfico y planillas GPS",
        responsible: "Consultora Ambiental",
      },
      {
        id: crypto.randomUUID(),
        code: "FA-02",
        title: "Monitoreo de fauna vertebrada",
        component: "Fauna",
        phase: "Operación",
        requirement:
          "Ejecutar campañas estacionales de monitoreo de fauna vertebrada terrestre en el área de influencia directa.",
        frequency: "Trimestral",
        dueDate: isoOffset(90),
        verificationMethod: "Informe de monitoreo trimestral con base de datos de avistamientos",
        responsible: "Consultora Ambiental",
      },
      {
        id: crypto.randomUUID(),
        code: "R-03",
        title: "Monitoreo de niveles de presión sonora",
        component: "Ruido",
        phase: "Operación",
        requirement:
          "Verificar cumplimiento del D.S. N°38/2011 en receptores sensibles identificados en la línea base acústica.",
        frequency: "Semestral",
        dueDate: isoOffset(60),
        verificationMethod: "Informe acústico firmado por profesional competente",
        responsible: "Encargado Ambiental",
      },
      {
        id: crypto.randomUUID(),
        code: "E-04",
        title: "Control de emisiones de material particulado",
        component: "Emisiones",
        phase: "Construcción",
        requirement:
          "Aplicar humectación de caminos internos y cubrir camiones tolva que transporten material fino.",
        frequency: "Mensual",
        dueDate: isoOffset(30),
        verificationMethod: "Bitácora de humectación y reporte fotográfico mensual",
        responsible: "Jefe de Terreno",
      },
      {
        id: crypto.randomUUID(),
        code: "A-05",
        title: "Caracterización de aguas subterráneas",
        component: "Agua",
        phase: "Operación",
        requirement:
          "Realizar muestreo de calidad de aguas subterráneas en pozos de monitoreo aguas arriba y aguas abajo.",
        frequency: "Semestral",
        dueDate: isoOffset(120),
        verificationMethod: "Análisis de laboratorio acreditado ISO 17025",
        responsible: "Consultora Hidrogeológica",
      },
      {
        id: crypto.randomUUID(),
        code: "AR-06",
        title: "Monitoreo arqueológico permanente",
        component: "Arqueología",
        phase: "Construcción",
        requirement:
          "Contar con monitoreo arqueológico permanente durante los movimientos de tierra en el sector norte.",
        frequency: "Mensual",
        dueDate: isoOffset(20),
        verificationMethod: "Informe arqueológico mensual visado por el CMN",
        responsible: "Arqueólogo/a Residente",
      },
      {
        id: crypto.randomUUID(),
        code: "RS-07",
        title: "Manejo y disposición de residuos peligrosos",
        component: "Residuos",
        phase: "Operación",
        requirement:
          "Retirar y disponer los residuos peligrosos con empresas autorizadas por la autoridad sanitaria.",
        frequency: "Trimestral",
        dueDate: isoOffset(75),
        verificationMethod: "Guías de despacho y declaración SIDREP",
        responsible: "Encargado de Residuos",
      },
    ],
  };
}

/* --------------- Page --------------- */

type Stage = "upload" | "processing" | "review";

const STEPS = [
  "Leyendo documento RCA...",
  "Identificando componentes ambientales (Fauna, Ruido, Agua)...",
  "Extrayendo compromisos y plazos de vencimiento...",
  "Sugiriendo medios de verificación...",
];

function ImportPage() {
  const { can, user } = useAuth();
  const navigate = useNavigate();
  const { projects, addExtractedRca } = useProjects();

  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [extracted, setExtracted] = useState<ExtractedRca | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>(projects[0].id);

  const fileRef = useRef<HTMLInputElement>(null);

  const canImport = can.edit; // Only admin can import new RCA structures

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (f.type && f.type !== "application/pdf") {
      toast.error("Formato no válido", {
        description: "Solo se admiten archivos PDF de RCA.",
      });
      return;
    }
    if (f.size > 40 * 1024 * 1024) {
      toast.error("Archivo demasiado grande", {
        description: "El PDF supera el límite de 40 MB.",
      });
      return;
    }
    setFile(f);
  };

  const startExtraction = useCallback(() => {
    if (!file) {
      toast.error("Selecciona un PDF primero");
      return;
    }
    setStage("processing");
    setProgress(0);
    setStepIdx(0);

    const total = 3600;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / total) * 100);
      setProgress(pct);
      setStepIdx(Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length)));
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        const result = mockExtract(file.name);
        setExtracted(result);
        setStage("review");
        toast.success("Extracción completada", {
          description: `${result.commitments.length} compromisos identificados.`,
        });
      }
    };
    requestAnimationFrame(tick);
  }, [file]);

  const updateRow = (id: string, patch: Partial<ExtractedCommitment>) => {
    setExtracted((prev) =>
      prev
        ? {
            ...prev,
            commitments: prev.commitments.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          }
        : prev,
    );
  };

  const removeRow = (id: string) => {
    setExtracted((prev) =>
      prev ? { ...prev, commitments: prev.commitments.filter((c) => c.id !== id) } : prev,
    );
  };

  const approveImport = () => {
    if (!extracted) return;
    if (extracted.commitments.length === 0) {
      toast.error("No hay compromisos para importar");
      return;
    }
    const rcaId = `rca-${Date.now()}`;
    const rca: RCA = {
      id: rcaId,
      code: extracted.code,
      name: extracted.projectName,
      commitments: extracted.commitments.map<Commitment>((c) => ({
        id: `${rcaId}-${c.code}`,
        code: c.code,
        component: c.component,
        description: `[${c.phase}] ${c.title}. ${c.requirement} Medio de verificación sugerido: ${c.verificationMethod}.`,
        frequency: c.frequency,
        dueDate: c.dueDate,
        responsible: c.responsible,
        status: "Pendiente",
      })),
    };
    addExtractedRca(targetProjectId, rca);
    toast.success("Compromisos importados", {
      description: `${rca.commitments.length} compromisos añadidos al dashboard.`,
    });
    navigate({ to: "/" });
  };

  const reset = () => {
    setFile(null);
    setExtracted(null);
    setProgress(0);
    setStepIdx(0);
    setStage("upload");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">VerdeRCA</div>
              <h1 className="text-base font-semibold text-foreground sm:text-lg">
                Importar RCA con IA
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AppNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {!canImport && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
            <LockIcon className="mt-0.5 h-4 w-4 text-warning-foreground" />
            <div>
              <div className="font-semibold text-warning-foreground">
                Acción restringida
              </div>
              <div className="text-warning-foreground/80">
                Tu rol actual ({user?.role}) puede previsualizar el extractor, pero solo un
                Administrador puede aprobar e importar compromisos al dashboard.
              </div>
            </div>
          </div>
        )}

        {stage === "upload" && (
          <UploadStage
            file={file}
            dragOver={dragOver}
            setDragOver={setDragOver}
            onPick={pickFile}
            onStart={startExtraction}
            onClear={() => setFile(null)}
            fileRef={fileRef}
          />
        )}

        {stage === "processing" && (
          <ProcessingStage progress={progress} stepIdx={stepIdx} fileName={file?.name ?? ""} />
        )}

        {stage === "review" && extracted && (
          <ReviewStage
            data={extracted}
            projects={projects}
            targetProjectId={targetProjectId}
            setTargetProjectId={setTargetProjectId}
            onEditMeta={(patch) =>
              setExtracted((prev) => (prev ? { ...prev, ...patch } : prev))
            }
            onUpdateRow={updateRow}
            onRemoveRow={removeRow}
            onReset={reset}
            onApprove={approveImport}
            canImport={canImport}
          />
        )}
      </main>
    </div>
  );
}

/* --------------- Stages --------------- */

function UploadStage({
  file,
  dragOver,
  setDragOver,
  onPick,
  onStart,
  onClear,
  fileRef,
}: {
  file: File | null;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onPick: (f: File | undefined) => void;
  onStart: () => void;
  onClear: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Sube tu Resolución de Calificación Ambiental
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Arrastra el PDF de la RCA emitida por el SEA. Nuestro asistente identificará
            automáticamente los compromisos, componentes y plazos.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onPick(e.dataTransfer.files?.[0]);
          }}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary/60 hover:bg-primary/5",
          )}
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Arrastra el PDF de la RCA aquí
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              o haz clic para seleccionar · PDF hasta 40 MB
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-danger/10 text-danger">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">
                  {file.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClear} aria-label="Quitar archivo">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button size="lg" onClick={onStart} disabled={!file} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Subir y extraer compromisos con IA
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          ¿Qué extrae la IA?
        </div>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {[
            "Número de RCA, proyecto, región y tipo de evaluación (DIA/EIA).",
            "Compromisos por componente ambiental (Flora, Fauna, Ruido, etc.).",
            "Fase del proyecto: Construcción, Operación o Cierre.",
            "Frecuencia, plazos de vencimiento y medio de verificación sugerido.",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          Podrás editar y aprobar cada compromiso antes de importarlo al dashboard.
        </div>
      </Card>
    </div>
  );
}

function ProcessingStage({
  progress,
  stepIdx,
  fileName,
}: {
  progress: number;
  stepIdx: number;
  fileName: string;
}) {
  return (
    <Card className="mx-auto max-w-2xl p-8">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Analizando la RCA con IA
        </h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Estamos procesando <span className="font-medium text-foreground">{fileName}</span>.
          Este proceso puede tardar unos segundos.
        </p>

        <div className="mt-6 w-full">
          <Progress value={progress} />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            <span>{STEPS[stepIdx]}</span>
          </div>
        </div>

        <ul className="mt-6 w-full space-y-2 text-left text-sm">
          {STEPS.map((s, i) => {
            const done = i < stepIdx || progress >= 100;
            const active = i === stepIdx && progress < 100;
            return (
              <li
                key={s}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 transition-colors",
                  done && "border-success/30 bg-success/5 text-success",
                  active && "border-primary/40 bg-primary/5 text-foreground",
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-current" />
                )}
                <span>{s}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}

function ReviewStage({
  data,
  projects,
  targetProjectId,
  setTargetProjectId,
  onEditMeta,
  onUpdateRow,
  onRemoveRow,
  onReset,
  onApprove,
  canImport,
}: {
  data: ExtractedRca;
  projects: { id: string; name: string }[];
  targetProjectId: string;
  setTargetProjectId: (v: string) => void;
  onEditMeta: (patch: Partial<ExtractedRca>) => void;
  onUpdateRow: (id: string, patch: Partial<ExtractedCommitment>) => void;
  onRemoveRow: (id: string) => void;
  onReset: () => void;
  onApprove: () => void;
  canImport: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Metadata header */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1 border-success/30 bg-success/10 text-success"
            >
              <CheckCircle2 className="h-3 w-3" />
              Extracción lista
            </Badge>
            <span className="text-sm text-muted-foreground">
              {data.commitments.length} compromisos detectados
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Cargar otro PDF
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaField
            label="N° RCA"
            value={data.code}
            onChange={(v) => onEditMeta({ code: v })}
            icon={ClipboardCheck}
          />
          <MetaField
            label="Nombre del proyecto"
            value={data.projectName}
            onChange={(v) => onEditMeta({ projectName: v })}
            icon={Building2}
          />
          <MetaField
            label="Región"
            value={data.region}
            onChange={(v) => onEditMeta({ region: v })}
            icon={MapPin}
          />
          <div>
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tipo de evaluación
            </div>
            <Select
              value={data.evalType}
              onValueChange={(v) => onEditMeta({ evalType: v as EvalType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIA">DIA — Declaración de Impacto</SelectItem>
                <SelectItem value="EIA">EIA — Estudio de Impacto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden py-0">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            Compromisos extraídos — revisa y edita antes de importar
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="min-w-[90px]">ID</TableHead>
                <TableHead className="min-w-[220px]">Título</TableHead>
                <TableHead className="min-w-[140px]">Componente</TableHead>
                <TableHead className="min-w-[150px]">Fase</TableHead>
                <TableHead className="min-w-[260px]">Requerimiento</TableHead>
                <TableHead className="min-w-[140px]">Frecuencia</TableHead>
                <TableHead className="min-w-[150px]">Vencimiento</TableHead>
                <TableHead className="min-w-[220px]">Medio de verificación</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.commitments.map((c) => (
                <TableRow key={c.id} className="align-top">
                  <TableCell>
                    <Input
                      value={c.code}
                      onChange={(e) => onUpdateRow(c.id, { code: e.target.value })}
                      className="h-8 w-20 font-mono text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={c.title}
                      onChange={(e) => onUpdateRow(c.id, { title: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={c.component}
                      onValueChange={(v) =>
                        onUpdateRow(c.id, { component: v as EnvComponent })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPONENTS.map((x) => (
                          <SelectItem key={x} value={x}>
                            {x}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={c.phase}
                      onValueChange={(v) => onUpdateRow(c.id, { phase: v as Phase })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PHASES.map((x) => (
                          <SelectItem key={x} value={x}>
                            {x}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <textarea
                      value={c.requirement}
                      onChange={(e) => onUpdateRow(c.id, { requirement: e.target.value })}
                      rows={2}
                      className="w-full resize-y rounded-md border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={c.frequency}
                      onValueChange={(v) =>
                        onUpdateRow(c.id, { frequency: v as Frequency })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((x) => (
                          <SelectItem key={x} value={x}>
                            {x}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={c.dueDate}
                      onChange={(e) => onUpdateRow(c.id, { dueDate: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={c.verificationMethod}
                      onChange={(e) =>
                        onUpdateRow(c.id, { verificationMethod: e.target.value })
                      }
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveRow(c.id)}
                      aria-label="Eliminar compromiso"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-danger" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.commitments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    No hay compromisos. Vuelve a cargar el PDF.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Approve bar */}
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:min-w-[280px]">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Importar a proyecto
          </label>
          <Select value={targetProjectId} onValueChange={setTargetProjectId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className="text-xs text-muted-foreground">
            Se creará una nueva RCA con {data.commitments.length} compromisos.
          </span>
          <Button
            size="lg"
            onClick={onApprove}
            disabled={!canImport || data.commitments.length === 0}
            className="gap-2"
          >
            Aprobar e importar al dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function MetaField({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
