import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Props {
  data: Record<string, any>[];
  filename?: string;
  className?: string;
}

export const ExportButton: React.FC<Props> = ({ data, filename = 'export', className = '' }) => {
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${filename}.csv`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    const rows = data.map((row) => headers.map((h) => String(row[h] ?? '')));
    (doc as any).autoTable({ head: [headers], body: rows });
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button onClick={exportExcel} className="btn-secondary text-sm">
        Excel
      </button>
      <button onClick={exportCSV} className="btn-secondary text-sm">
        CSV
      </button>
      <button onClick={exportPDF} className="btn-secondary text-sm">
        PDF
      </button>
    </div>
  );
};
