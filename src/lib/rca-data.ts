export type EnvComponent =
  | "Flora"
  | "Fauna"
  | "Ruido"
  | "Emisiones"
  | "Arqueología"
  | "Agua"
  | "Residuos"
  | "Suelo";

export type Frequency =
  | "Mensual"
  | "Trimestral"
  | "Semestral"
  | "Anual"
  | "Única vez";

export type Status = "Cumplido" | "Pendiente" | "Vencido";

export interface Commitment {
  id: string;
  code: string;
  component: EnvComponent;
  description: string;
  frequency: Frequency;
  dueDate: string; // ISO
  responsible: string;
  status: Status;
  verificationFile?: string;
}

export interface RCA {
  id: string;
  code: string;
  name: string;
  commitments: Commitment[];
}

export interface Project {
  id: string;
  name: string;
  location: string;
  rcas: RCA[];
}

const today = new Date();
const iso = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const initialProjects: Project[] = [
  {
    id: "p-minera-andes",
    name: "Minera Los Andes — Expansión Fase III",
    location: "Región de Antofagasta",
    rcas: [
      {
        id: "rca-101-2021",
        code: "RCA N° 101/2021",
        name: "Ampliación planta concentradora",
        commitments: [
          {
            id: "c1",
            code: "R-01",
            component: "Ruido",
            description:
              "Monitoreo trimestral de niveles de presión sonora en receptores sensibles según D.S. N°38/2011.",
            frequency: "Trimestral",
            dueDate: iso(-5),
            responsible: "Camila Rojas",
            status: "Vencido",
          },
          {
            id: "c2",
            code: "F-02",
            component: "Flora",
            description:
              "Rescate y relocalización de ejemplares de Prosopis tamarugo en área de intervención.",
            frequency: "Única vez",
            dueDate: iso(20),
            responsible: "Ignacio Pardo",
            status: "Pendiente",
          },
          {
            id: "c3",
            code: "E-03",
            component: "Emisiones",
            description:
              "Reporte mensual de emisiones de MP10 en chimenea principal a la SMA.",
            frequency: "Mensual",
            dueDate: iso(-30),
            responsible: "María Fernández",
            status: "Cumplido",
            verificationFile: "reporte-mp10-agosto.pdf",
          },
          {
            id: "c4",
            code: "A-04",
            component: "Agua",
            description:
              "Caracterización semestral de calidad de aguas subterráneas en pozos de monitoreo P1–P4.",
            frequency: "Semestral",
            dueDate: iso(45),
            responsible: "Diego Salinas",
            status: "Pendiente",
          },
          {
            id: "c5",
            code: "AR-05",
            component: "Arqueología",
            description:
              "Monitoreo arqueológico permanente durante movimientos de tierra en sector norte.",
            frequency: "Mensual",
            dueDate: iso(8),
            responsible: "Valentina Cortés",
            status: "Pendiente",
          },
        ],
      },
      {
        id: "rca-88-2023",
        code: "RCA N° 88/2023",
        name: "Depósito de relaves modificado",
        commitments: [
          {
            id: "c6",
            code: "RS-01",
            component: "Residuos",
            description:
              "Retiro y disposición final de residuos peligrosos con empresa autorizada.",
            frequency: "Trimestral",
            dueDate: iso(12),
            responsible: "Pedro Nuñez",
            status: "Pendiente",
          },
          {
            id: "c7",
            code: "FA-02",
            component: "Fauna",
            description:
              "Campaña anual de monitoreo de fauna vertebrada en el área de influencia directa.",
            frequency: "Anual",
            dueDate: iso(-45),
            responsible: "Antonia Vera",
            status: "Vencido",
          },
        ],
      },
    ],
  },
  {
    id: "p-parque-eolico",
    name: "Parque Eólico Valle del Viento",
    location: "Región del Biobío",
    rcas: [
      {
        id: "rca-42-2022",
        code: "RCA N° 42/2022",
        name: "Construcción y operación 45 aerogeneradores",
        commitments: [
          {
            id: "c8",
            code: "FA-01",
            component: "Fauna",
            description:
              "Monitoreo mensual de mortalidad de avifauna y quirópteros bajo aerogeneradores.",
            frequency: "Mensual",
            dueDate: iso(3),
            responsible: "Josefa Miranda",
            status: "Pendiente",
          },
          {
            id: "c9",
            code: "R-02",
            component: "Ruido",
            description:
              "Medición semestral de ruido en viviendas más cercanas al parque.",
            frequency: "Semestral",
            dueDate: iso(60),
            responsible: "Camila Rojas",
            status: "Pendiente",
          },
          {
            id: "c10",
            code: "F-03",
            component: "Flora",
            description:
              "Programa de revegetación de caminos internos con especies nativas.",
            frequency: "Anual",
            dueDate: iso(-10),
            responsible: "Ignacio Pardo",
            status: "Cumplido",
            verificationFile: "revegetacion-2026.pdf",
          },
        ],
      },
    ],
  },
];

export const COMPONENTS: EnvComponent[] = [
  "Flora",
  "Fauna",
  "Ruido",
  "Emisiones",
  "Arqueología",
  "Agua",
  "Residuos",
  "Suelo",
];

export const FREQUENCIES: Frequency[] = [
  "Mensual",
  "Trimestral",
  "Semestral",
  "Anual",
  "Única vez",
];
