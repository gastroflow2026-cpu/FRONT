"use client";

import { Users, Clock, DollarSign } from "lucide-react";
import { Table } from "@/types/cashier";

interface TableGridProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
}

const STATUS_STYLES: Record<string, string> = {
  libre: "bg-teal-50 border-teal-200",
  ocupada: "bg-red-50 border-red-200",
  reservada: "bg-orange-50 border-orange-200",
};

const NUMBER_STYLES: Record<string, string> = {
  libre: "bg-teal-500",
  ocupada: "bg-red-500",
  reservada: "bg-orange-400",
};

const DOT_STYLES: Record<string, string> = {
  libre: "bg-teal-400",
  ocupada: "bg-red-400",
  reservada: "bg-orange-400",
};

export default function TableGrid({ tables, onTableClick }: TableGridProps) {
  const freeTables = tables.filter((t) => t.status === "libre").length;
  const occupiedTables = tables.filter((t) => t.status === "ocupada").length;
  const reservedTables = tables.filter((t) => t.status === "reservada").length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 h-full">
      {/* Leyenda */}
      <div className="flex items-center justify-end gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
          {freeTables} libres
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          {occupiedTables} ocupadas
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
          {reservedTables} reservadas
        </span>
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-3 gap-3">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onClick={() => onTableClick(table)}
          />
        ))}
      </div>
    </div>
  );
}

function TableCard({ table, onClick }: { table: Table; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left rounded-xl border p-3 transition-all hover:shadow-md hover:scale-[1.02] ${STATUS_STYLES[table.status]}`}
    >
      {/* Dot de estado */}
      <span
        className={`absolute top-2 right-2 w-2 h-2 rounded-full ${DOT_STYLES[table.status]}`}
      />

      {/* Número */}
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-sm mb-2 ${NUMBER_STYLES[table.status]}`}
      >
        {table.id}
      </span>

      {/* Info */}
      <div className="space-y-1">
        {table.persons && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={11} />
            <span>{table.persons}</span>
          </div>
        )}
        {table.currentOrder && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <DollarSign size={11} />
            <span>${table.currentOrder.total.toLocaleString("es-AR")}</span>
          </div>
        )}
        {table.reservation && table.status === "reservada" && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={11} />
            <span>{table.reservation.time}</span>
          </div>
        )}
      </div>
    </button>
  );
}