import React from "react";
import type { Table } from "@/context/TablesContext";
import { Bath, Check, ChefHat, DoorOpen } from "lucide-react";

const COLUMNS = 6;
const ROWS = 5;

export type PublicLayoutMarkerType = "entrance" | "bathroom" | "kitchen";

export interface PublicLayoutMarker {
  id: string;
  type: PublicLayoutMarkerType;
  layout_x: number;
  layout_y: number;
}

interface TableGridProps {
  tables: Table[];
  markers?: PublicLayoutMarker[];
  selectedTableId: string | null;
  onTableSelect: (table: Table) => void;
}

const hasTableLayout = (table: Table) => typeof table.layout_x === "number" && typeof table.layout_y === "number";

const isPublicVisibleTable = (table: Table) => table.is_visible !== false && hasTableLayout(table);

const getCellKey = (x: number, y: number) => `${x}-${y}`;

const getNormalizedStatus = (status?: string) => (status || "").toUpperCase();

const getBlockedLabel = (table: Table) => {
  const status = getNormalizedStatus(table.status);

  if (!table.is_active) return "Inactiva";
  if (status === "OCUPADA") return "Ocupada";
  if (status === "RESERVADA") return "Reservada";

  return "";
};

const getShapeClass = (table: Table) => {
  if (table.layout_shape === "round") return "rounded-full";
  if (table.layout_shape === "rectangle") return "rounded-xl";

  return "rounded-xl";
};

const getMarkerLabel = (type: PublicLayoutMarkerType) => {
  if (type === "entrance") return "Entrada";
  if (type === "bathroom") return "Baños";
  return "Cocina";
};

const getMarkerIcon = (type: PublicLayoutMarkerType) => {
  if (type === "entrance") return DoorOpen;
  if (type === "bathroom") return Bath;
  return ChefHat;
};

const buildPerimeterSlots = () => {
  const top = Array.from({ length: COLUMNS }, (_, index) => ({
    key: `top-${index}`,
    layout_x: index + 1,
    layout_y: 0,
  }));

  const bottom = Array.from({ length: COLUMNS }, (_, index) => ({
    key: `bottom-${index}`,
    layout_x: index + 1,
    layout_y: ROWS + 1,
  }));

  const left = Array.from({ length: ROWS }, (_, index) => ({
    key: `left-${index}`,
    layout_x: 0,
    layout_y: index + 1,
  }));

  const right = Array.from({ length: ROWS }, (_, index) => ({
    key: `right-${index}`,
    layout_x: COLUMNS + 1,
    layout_y: index + 1,
  }));

  return { top, bottom, left, right };
};

const TableGrid: React.FC<TableGridProps> = ({ tables, markers = [], selectedTableId, onTableSelect }) => {
  const tablesByCell = new Map<string, Table>();

  tables.filter(isPublicVisibleTable).forEach((table) => {
    const key = getCellKey(table.layout_x as number, table.layout_y as number);

    if (!tablesByCell.has(key)) {
      tablesByCell.set(key, table);
    }
  });

  const markersByCell = new Map<string, PublicLayoutMarker>();

  markers.forEach((marker) => {
    const key = getCellKey(marker.layout_x, marker.layout_y);

    if (!markersByCell.has(key)) {
      markersByCell.set(key, marker);
    }
  });

  const cells = Array.from({ length: COLUMNS * ROWS }, (_, index) => ({
    x: index % COLUMNS,
    y: Math.floor(index / COLUMNS),
  }));

  const perimeterSlots = buildPerimeterSlots();

  const renderMarkerSlot = (slot: { key: string; layout_x: number; layout_y: number }) => {
    const marker = markersByCell.get(getCellKey(slot.layout_x, slot.layout_y));

    if (!marker) {
      return <div key={slot.key} className="min-h-8 rounded-lg border border-dashed border-slate-200 bg-white/40" />;
    }

    const Icon = getMarkerIcon(marker.type);

    return (
      <div
        key={slot.key}
        className="flex min-h-8 flex-col items-center justify-center gap-0.5 rounded-lg border border-indigo-200 bg-indigo-50 px-1 py-1 text-center text-indigo-700"
      >
        <Icon size={14} />
        <span className="max-w-full truncate text-[9px] font-bold uppercase leading-tight">
          {getMarkerLabel(marker.type)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-bold text-slate-900">Selecciona tu mesa</h3>

        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-emerald-200 bg-emerald-50" />
            Disponible
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-orange-200 bg-orange-50" />
            Reservada
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-red-200 bg-red-50" />
            Ocupada
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-indigo-200 bg-indigo-50" />
            Referencia
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-orange-500" />
            Tu selección
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <div className="min-w-[430px] space-y-2">
          <div className="grid grid-cols-6 gap-2 px-[3.75rem]">{perimeterSlots.top.map(renderMarkerSlot)}</div>

          <div className="grid grid-cols-[3.25rem_minmax(0,1fr)_3.25rem] gap-3">
            <div className="grid grid-rows-5 gap-2">{perimeterSlots.left.map(renderMarkerSlot)}</div>

            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
              }}
            >
              {cells.map(({ x, y }) => {
                const cellKey = getCellKey(x, y);
                const table = tablesByCell.get(cellKey);

                if (!table) {
                  return (
                    <div
                      key={cellKey}
                      className="aspect-square min-w-0 rounded-xl border border-dashed border-slate-200 bg-white/60"
                    />
                  );
                }

                const status = getNormalizedStatus(table.status);
                const isSelected = selectedTableId === table.id;
                const isReserved = status === "RESERVADA";
                const isOccupied = status === "OCUPADA";
                const isBlocked = isReserved || isOccupied || !table.is_active;
                const blockedLabel = getBlockedLabel(table);

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => onTableSelect(table)}
                    className={`relative flex aspect-square min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden border p-1.5 text-center transition-all ${getShapeClass(table)} ${
                      !table.is_active
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70"
                        : isOccupied
                          ? "cursor-not-allowed border-red-200 bg-red-50 text-red-500"
                          : isReserved
                            ? "cursor-not-allowed border-orange-200 bg-orange-50 text-orange-500"
                            : isSelected
                              ? "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-orange-300 hover:bg-white"
                    }`}
                  >
                    <span className="max-w-full truncate text-[11px] font-bold leading-tight">
                      Mesa {table.table_number}
                    </span>

                    <span className="max-w-full truncate text-[9px] font-semibold uppercase leading-tight">
                      Cap. {table.capacity}
                    </span>

                    <span className="max-w-full truncate text-[9px] uppercase leading-tight">{table.zone}</span>

                    {blockedLabel && (
                      <span className="max-w-full truncate text-[9px] font-bold uppercase leading-tight">
                        {blockedLabel}
                      </span>
                    )}

                    {isSelected && (
                      <span className="absolute right-1 top-1 text-orange-600">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-rows-5 gap-2">{perimeterSlots.right.map(renderMarkerSlot)}</div>
          </div>

          <div className="grid grid-cols-6 gap-2 px-[3.75rem]">{perimeterSlots.bottom.map(renderMarkerSlot)}</div>
        </div>
      </div>
    </div>
  );
};

export default TableGrid;
