/**
 * Escape a CSV cell and wrap it in quotes.
 */
function escapeCsvCell(cell) {
  const value = cell == null ? "" : String(cell);
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Build a CSV string and trigger a browser download.
 * @param {Object} options
 * @param {string[]} options.headers
 * @param {Array<Array<string|number|boolean|null|undefined>>} options.rows
 * @param {string} options.filename
 */
export function downloadCsv({ headers, rows, filename }) {
  const csvContent = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
