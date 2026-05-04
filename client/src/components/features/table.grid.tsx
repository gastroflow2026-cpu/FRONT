import React from 'react';
import type { Table } from '@/context/TablesContext';
import { Check } from 'lucide-react';

const COLUMNS = 6;
const ROWS = 5;

interface TableGridProps {
  tables: Table[];
  selectedTableId: string | null;
  onTableSelect: (table: Table) => void;
}

const hasTableLayout = (table: Table) =>
  typeof table.layout_x === 'number' && typeof table.layout_y === 'number';

const isPublicVisibleTable = (table: Table) =>
  table.is_visible !== false && hasTableLayout(table);

const getCellKey = (x: number, y: number) => `${x}-${y}`;

const getNormalizedStatus = (status?: string) => (status || '').toUpperCase();

const getBlockedLabel = (table: Table) => {
  const status = getNormalizedStatus(table.status);

  if (!table.is_active) return 'Inactiva';
  if (status === 'OCUPADA') return 'Ocupada';
  if (status === 'RESERVADA') return 'Reservada';

  return '';
};

const getShapeClass = (table: Table) => {
  if (table.layout_shape === 'round') return 'rounded-full aspect-square';
  if (table.layout_shape === 'rectangle') return 'rounded-xl min-h-[4.5rem]';

  return 'rounded-xl aspect-square';
};

const TableGrid: React.FC<TableGridProps> = ({
  tables,
  selectedTableId,
  onTableSelect,
}) => {
  const tablesByCell = new Map<string, Table>();

  tables.filter(isPublicVisibleTable).forEach((table) => {
    const key = getCellKey(table.layout_x as number, table.layout_y as number);

    if (!tablesByCell.has(key)) {
      tablesByCell.set(key, table);
    }
  });

  const cells = Array.from({ length: COLUMNS * ROWS }, (_, index) => ({
    x: index % COLUMNS,
    y: Math.floor(index / COLUMNS),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-bold text-slate-900">
          Selecciona tu mesa
        </h3>
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
            <span className="h-3 w-3 rounded-sm bg-orange-500" />
            Tu selección
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
        {cells.map(({ x, y }) => {
          const cellKey = getCellKey(x, y);
          const table = tablesByCell.get(cellKey);

          if (!table) {
            return (
              <div
                key={cellKey}
                className="min-h-[4.5rem] rounded-xl border border-dashed border-slate-200 bg-white/60"
              />
            );
          }

          const status = getNormalizedStatus(table.status);
          const isSelected = selectedTableId === table.id;
          const isReserved = status === 'RESERVADA';
          const isOccupied = status === 'OCUPADA';
          const isBlocked = isReserved || isOccupied || !table.is_active;
          const blockedLabel = getBlockedLabel(table);

          return (
            <button
              key={table.id}
              type="button"
              disabled={isBlocked}
              onClick={() => onTableSelect(table)}
              className={`relative flex min-h-[4.5rem] flex-col items-center justify-center gap-1 border p-2 text-center transition-all ${getShapeClass(table)} ${
                !table.is_active
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70'
                  : isOccupied
                    ? 'cursor-not-allowed border-red-200 bg-red-50 text-red-500'
                    : isReserved
                      ? 'cursor-not-allowed border-orange-200 bg-orange-50 text-orange-500'
                      : isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-orange-300 hover:bg-white'
              }`}
            >
              <span className="text-sm font-bold">
                Mesa {table.table_number}
              </span>
              <span className="text-[10px] font-semibold uppercase">
                Cap. {table.capacity}
              </span>
              <span className="max-w-full truncate text-[10px] uppercase">
                {table.zone}
              </span>
              {blockedLabel && (
                <span className="text-[10px] font-bold uppercase">
                  {blockedLabel}
                </span>
              )}
              {isSelected && (
                <span className="absolute right-1.5 top-1.5 text-orange-600">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableGrid;
