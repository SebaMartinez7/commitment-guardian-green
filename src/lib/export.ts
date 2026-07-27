import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Commitment, Project, RCA } from "./rca-data";

function fmtDateEs(iso: string) {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fileBaseName(project: Project, rca: RCA) {
  return `${slug(project.name)}_${slug(rca.code)}_${new Date()
    .toISOString()
    .slice(0, 10)}`;
}

function summaryRows(project: Project, rca: RCA, commitments: Commitment[]) {
  const total = commitments.length;
  const compliant = commitments.filter((c) => c.status === "Cumplido").length;
  const pending = commitments.filter((c) => c.status === "Pendiente").length;
  const overdue = commitments.filter((c) => c.status === "Vencido").length;

  return [
    ["VerdeRCA — Reporte de Compromisos Ambientales"],
    [],
    ["Proyecto", project.name],
    ["Ubicación", project.location],
    ["RCA", rca.code],
    ["Componente / Etapa", rca.name],
    ["Generado el", new Date().toLocaleString("es-CL")],
    [],
    ["Total compromisos", total],
    ["Cumplidos", compliant],
    ["Pendientes", pending],
    ["Vencidos / Críticos", overdue],
  ];
}

function commitmentRows(commitments: Commitment[]) {
  return commitments.map((c) => ({
    ID: c.code,
    Componente: c.component,
    Descripción: c.description,
    Frecuencia: c.frequency,
    Vencimiento: fmtDateEs(c.dueDate),
    Responsable: c.responsible,
    Estado: c.status,
    "Medio de Verificación": c.verificationFile ?? "Pendiente de carga",
  }));
}

/** Exporta los compromisos filtrados de una RCA a un archivo Excel (.xlsx) con hoja de resumen + detalle. */
export function exportCommitmentsToExcel(
  project: Project,
  rca: RCA,
  commitments: Commitment[],
) {
  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.aoa_to_sheet(
    summaryRows(project, rca, commitments),
  );
  wsSummary["!cols"] = [{ wch: 24 }, { wch: 46 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

  const wsDetail = XLSX.utils.json_to_sheet(commitmentRows(commitments));
  wsDetail["!cols"] = [
    { wch: 10 },
    { wch: 14 },
    { wch: 55 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 12 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, "Compromisos");

  XLSX.writeFile(wb, `${fileBaseName(project, rca)}.xlsx`);
}

/** Exporta los compromisos filtrados de una RCA a un reporte PDF formal, listo para entregar a fiscalización. */
export function exportCommitmentsToPDF(
  project: Project,
  rca: RCA,
  commitments: Commitment[],
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 42;

  doc.setFontSize(16);
  doc.setTextColor(21, 101, 52);
  doc.text("VerdeRCA — Reporte de Compromisos Ambientales", marginX, y);
  y += 20;

  doc.setFontSize(9.5);
  doc.setTextColor(70, 70, 70);
  doc.text(`Proyecto: ${project.name}`, marginX, y);
  y += 13;
  doc.text(`Ubicación: ${project.location}`, marginX, y);
  y += 13;
  doc.text(`${rca.code} — ${rca.name}`, marginX, y);
  y += 13;
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`, marginX, y);
  y += 18;

  const total = commitments.length;
  const compliant = commitments.filter((c) => c.status === "Cumplido").length;
  const pending = commitments.filter((c) => c.status === "Pendiente").length;
  const overdue = commitments.filter((c) => c.status === "Vencido").length;

  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text(
    `Total: ${total}    Cumplidos: ${compliant}    Pendientes: ${pending}    Vencidos/Críticos: ${overdue}`,
    marginX,
    y,
  );
  y += 14;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [
      [
        "ID",
        "Componente",
        "Descripción",
        "Frecuencia",
        "Vencimiento",
        "Responsable",
        "Estado",
        "Medio de Verificación",
      ],
    ],
    body: commitments.map((c) => [
      c.code,
      c.component,
      c.description,
      c.frequency,
      fmtDateEs(c.dueDate),
      c.responsible,
      c.status,
      c.verificationFile ?? "Pendiente de carga",
    ]),
    styles: { fontSize: 8, cellPadding: 5, valign: "middle", overflow: "linebreak" },
    headStyles: { fillColor: [21, 101, 52], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      2: { cellWidth: 210 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        const val = String(data.cell.raw);
        if (val === "Vencido") data.cell.styles.textColor = [185, 28, 28];
        else if (val === "Cumplido") data.cell.styles.textColor = [21, 128, 61];
        else data.cell.styles.textColor = [161, 98, 7];
      }
    },
  });

  doc.save(`${fileBaseName(project, rca)}.pdf`);
}
