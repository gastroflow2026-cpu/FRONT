"use client";

import { useState } from "react";
import { Users, Clock, DollarSign } from "lucide-react";
import { Table, TableZone } from "@/types/cashier";

interface TableGridProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
}

const ZONE_LABELS: Record<TableZone, string> = {
  salon: "SALÓN",
  terraza: "TERRAZA",
  privado: "PRIVADO",
};

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

type FilterTab = "todas" | TableZone;

const TABS: { value: FilterTab; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "salon", label: "Salón" },
  { value: "terraza", label: "Terraza" },
  { value: "privado", label: "Privado" },
];

export default function TableGrid({ tables, onTableClick }: TableGridProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("todas");

  const filteredTables =
    activeTab === "todas"
      ? tables
      : tables.filter((t) => t.zone === activeTab);

  const zones =
    activeTab === "todas"
      ? (["salon", "terraza", "privado"] as TableZone[])
      : [activeTab as TableZone];

  const freeTables = tables.filter((t) => t.status === "libre").length;
  const occupiedTables = tables.filter((t) => t.status === "ocupada").length;
  const reservedTables = tables.filter((t) => t.status === "reservada").length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-600 rounded-xs" />
            ))}
          </div>
          <h2 className="font-semibold text-gray-800 text-sm">
            Distribución de mesas
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
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
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mesas por zona */}
      <div className="space-y-4">
        {zones.map((zone) => {
          const zoneTables = filteredTables.filter((t) => t.zone === zone);
          if (zoneTables.length === 0) return null;
          return (
            <div key={zone}>
              <p className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
                {ZONE_LABELS[zone]}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {zoneTables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    onClick={() => onTableClick(table)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableCard({
  table,
  onClick,
}: {
  table: Table;
  onClick: () => void;
}) {
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
            <span>
              ${table.currentOrder.total.toLocaleString("es-AR")}
            </span>
          </div>
        )}
        {table.reservation && table.status === "reservada" && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={11} />
            <span>{table.reservation.time}</span>
          </div>
        )}
        <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">
          {ZONE_LABELS[table.zone]}
        </p>
      </div>
    </button>
  );
}