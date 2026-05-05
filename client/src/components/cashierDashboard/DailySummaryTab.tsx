"use client";

import { useState } from "react";
import { RefreshCw, ReceiptText, Calendar, Wallet } from "lucide-react";
import { CashierDailySummary } from "@/services/orderLifecycle";

interface DailySummaryTabProps {
  summary: CashierDailySummary | null;
  date: string;
  isLoading: boolean;
  error: string | null;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
}

function formatMoney(value: number) {
  return `$ ${value.toLocaleString("es-AR")}`;
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function paymentMethodLabel(method: string) {
  const map: Record<string, string> = {
    efectivo: "Efectivo",
    tarjeta: "Tarjeta",
    transferencia: "Transferencia",
    qr: "QR",
    unknown: "No definido",
  };
  return map[method] || method;
}

function paymentMethodCardClass(method: string) {
  const normalized = method.toLowerCase();

  if (normalized === "efectivo") return "border-emerald-200 bg-emerald-50";
  if (normalized === "tarjeta") return "border-sky-200 bg-sky-50";
  if (normalized === "transferencia") return "border-violet-200 bg-violet-50";
  if (normalized === "qr") return "border-amber-200 bg-amber-50";

  return "border-gray-200 bg-gray-50";
}

export default function DailySummaryTab({
  summary,
  date,
  isLoading,
  error,
  onDateChange,
  onRefresh,
}: DailySummaryTabProps) {
  const [isExporting, setIsExporting] = useState(false);

  const methods = summary
    ? [
        { key: "efectivo", ...summary.byPaymentMethod.efectivo },
        { key: "tarjeta", ...summary.byPaymentMethod.tarjeta },
        { key: "transferencia", ...summary.byPaymentMethod.transferencia },
        { key: "qr", ...summary.byPaymentMethod.qr },
        { key: "unknown", ...summary.byPaymentMethod.unknown },
      ]
    : [];

  const handleExportExcel = async () => {
    if (!summary || isExporting) return;

    setIsExporting(true);

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const grossTotal = summary.totals.gross;
      const debitFromReceipts = summary.receipts
        .filter((receipt) => {
          const method = receipt.paymentMethod.toLowerCase();
          return method.includes("debito") || method.includes("debit");
        })
        .reduce((acc, receipt) => acc + receipt.total, 0);
      const creditFromReceipts = summary.receipts
        .filter((receipt) => {
          const method = receipt.paymentMethod.toLowerCase();
          return method.includes("credito") || method.includes("credit");
        })
        .reduce((acc, receipt) => acc + receipt.total, 0);
      const hasCardBreakdown = debitFromReceipts > 0 || creditFromReceipts > 0;
      const debitTotal = hasCardBreakdown ? debitFromReceipts : summary.byPaymentMethod.tarjeta.total;
      const creditTotal = hasCardBreakdown ? creditFromReceipts : 0;

      const setNumberFormats = (
        worksheet: Record<string, unknown>,
        formatsByHeader: Record<string, string>,
      ) => {
        const ref = worksheet["!ref"] as string | undefined;
        if (!ref) return;

        const range = XLSX.utils.decode_range(ref);
        const headers = new Map<string, number>();

        for (let col = range.s.c; col <= range.e.c; col += 1) {
          const headerRef = XLSX.utils.encode_cell({ c: col, r: 0 });
          const headerCell = worksheet[headerRef] as { v?: unknown } | undefined;
          if (typeof headerCell?.v === "string") {
            headers.set(headerCell.v, col);
          }
        }

        Object.entries(formatsByHeader).forEach(([header, format]) => {
          const column = headers.get(header);
          if (column === undefined) return;

          for (let row = 1; row <= range.e.r; row += 1) {
            const cellRef = XLSX.utils.encode_cell({ c: column, r: row });
            const cell = worksheet[cellRef] as { v?: unknown; z?: string } | undefined;
            if (cell && typeof cell.v === "number") {
              cell.z = format;
            }
          }
        });
      };

      const summarySheet = XLSX.utils.json_to_sheet([
        {
          Fecha: summary.day || date,
          Total_ventas_brutas: grossTotal,
          Ticket_promedio: summary.totals.averageTicket,
          Ordenes_pagadas: summary.totals.ordersCount,
          Ventas_efectivo: summary.byPaymentMethod.efectivo.total,
          Ventas_debito: debitTotal,
          Ventas_credito: creditTotal,
          Ventas_transferencia: summary.byPaymentMethod.transferencia.total,
          Ventas_qr: summary.byPaymentMethod.qr.total,
        },
      ]);
      summarySheet["!cols"] = [
        { wch: 12 },
        { wch: 20 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 12 },
      ];
      summarySheet["!autofilter"] = { ref: summarySheet["!ref"] as string };
      setNumberFormats(summarySheet as Record<string, unknown>, {
        Total_ventas_brutas: '"$" #,##0.00',
        Ticket_promedio: '"$" #,##0.00',
        Ventas_efectivo: '"$" #,##0.00',
        Ventas_debito: '"$" #,##0.00',
        Ventas_credito: '"$" #,##0.00',
        Ventas_transferencia: '"$" #,##0.00',
        Ventas_qr: '"$" #,##0.00',
      });
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen diario");

      const safeDate = (summary.day || date || new Date().toISOString().slice(0, 10)).replace(/[^0-9-]/g, "");
      XLSX.writeFile(workbook, `resumen-diario-${safeDate}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-linear-to-r from-orange-50 via-white to-pink-50 rounded-xl border border-orange-100 shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700"
          />
        </div>
        <button
          onClick={onRefresh}
          className="h-10 px-4 rounded-lg border border-orange-200 text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 inline-flex items-center gap-2"
        >
          <RefreshCw size={14} />
          Actualizar resumen
        </button>
        <button
          onClick={() => void handleExportExcel()}
          disabled={!summary || isLoading || isExporting}
          className="h-10 px-4 rounded-lg border border-pink-200 bg-pink-50 text-sm font-medium text-pink-700 hover:bg-pink-100 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {isExporting ? "Generando..." : "Descargar Excel"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-sm text-gray-400">
          Cargando resumen diario...
        </div>
      ) : !summary ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-sm text-gray-400">
          No hay datos para el día seleccionado.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-linear-to-br from-orange-50 to-pink-50 rounded-xl border border-orange-100 shadow-sm p-4">
              <p className="text-xs text-orange-700 mb-1 inline-flex items-center gap-1 font-medium">
                <Wallet size={12} /> Total bruto
              </p>
              <p className="text-xl font-bold text-gray-900">{formatMoney(summary.totals.gross)}</p>
            </div>
            <div className="bg-linear-to-br from-sky-50 to-indigo-50 rounded-xl border border-sky-100 shadow-sm p-4">
              <p className="text-xs text-sky-700 mb-1 inline-flex items-center gap-1 font-medium">
                <ReceiptText size={12} /> Órdenes pagadas
              </p>
              <p className="text-xl font-bold text-gray-900">{summary.totals.ordersCount}</p>
            </div>
            <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 shadow-sm p-4">
              <p className="text-xs text-emerald-700 mb-1 inline-flex items-center gap-1 font-medium">
                <Calendar size={12} /> Ticket promedio
              </p>
              <p className="text-xl font-bold text-gray-900">{formatMoney(summary.totals.averageTicket)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Totales por método de pago</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {methods.map((method) => (
                <div key={method.key} className={`rounded-lg border p-3 ${paymentMethodCardClass(method.key)}`}>
                  <p className="text-xs text-gray-600 font-medium">{paymentMethodLabel(method.key)}</p>
                  <p className="text-sm font-semibold text-gray-900">{formatMoney(method.total)}</p>
                  <p className="text-xs text-gray-500">{method.count} cobros</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Comprobantes del día</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-3">Orden</th>
                    <th className="py-2 pr-3">Mesa</th>
                    <th className="py-2 pr-3">Método</th>
                    <th className="py-2 pr-3">Total</th>
                    <th className="py-2 pr-3">Hora pago</th>
                    <th className="py-2 pr-3">Cajero</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.receipts.map((receipt) => (
                    <tr key={receipt.orderId} className="border-b border-gray-50 text-gray-700">
                      <td className="py-2 pr-3">#{receipt.displayId || receipt.orderId.slice(0, 8)}</td>
                      <td className="py-2 pr-3">{receipt.tableNumber > 0 ? receipt.tableNumber : "-"}</td>
                      <td className="py-2 pr-3">{paymentMethodLabel(receipt.paymentMethod)}</td>
                      <td className="py-2 pr-3 font-semibold">{formatMoney(receipt.total)}</td>
                      <td className="py-2 pr-3">{formatDateTime(receipt.paidAt)}</td>
                      <td className="py-2 pr-3">{receipt.paidBy || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
