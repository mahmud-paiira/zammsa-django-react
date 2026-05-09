import React, { useRef, useState } from 'react';
import { UploadIcon, DownloadIcon } from '@heroicons/react/outline';
import * as XLSX from 'xlsx';

interface Props {
  onImport: (data: any[]) => void;
  templateData?: Record<string, any>[];
  className?: string;
}

export const ImportButton: React.FC<Props> = ({ onImport, templateData, className = '' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      onImport(data);
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    if (!templateData) return;
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'import_template.xlsx');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer text-sm ${
          dragging ? 'border-zammsa-green bg-green-50' : 'border-gray-300'
        }`}
      >
        <UploadIcon className="h-5 w-5 text-gray-500" />
        Import
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />
      {templateData && (
        <button onClick={downloadTemplate} className="text-sm text-zammsa-green hover:underline flex items-center gap-1">
          <DownloadIcon className="h-4 w-4" /> Template
        </button>
      )}
    </div>
  );
};
