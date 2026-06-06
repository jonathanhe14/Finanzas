// Utilidades mínimas para exportar datos a CSV y disparar la descarga.

function escapeCell(value) {
  const s = value == null ? "" : String(value);
  // Envolver en comillas si contiene separador, comillas o saltos de línea.
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Convierte filas a una cadena CSV.
 * `columns` es un array de { header, value(row) }.
 */
export function toCsv(rows, columns) {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.value(row))).join(","))
    .join("\r\n");
  return body ? `${header}\r\n${body}` : header;
}

/**
 * Dispara la descarga de un CSV. Antepone un BOM UTF-8 para que Excel
 * respete acentos y el símbolo ₡.
 */
export function downloadCsv(filename, content) {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
