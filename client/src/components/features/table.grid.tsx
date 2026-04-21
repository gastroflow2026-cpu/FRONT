import React from 'react';
import type { Table } from '@/context/TablesContext';
import { Check, DoorOpen, Bath, Beer, ChefHat } from 'lucide-react';

interface DecorativeItem {
  id: string;
  type: 'entrance' | 'bathroom' | 'bar' | 'kitchen';
  isDecorative: true;
}

type GridItem = Table | DecorativeItem;

interface TableGridProps {
  tables: Table[];
  selectedTableId: string | null;
  onTableSelect: (table: Table) => void;
}

const DecorativeCard = ({ type }: { type: DecorativeItem['type'] }) => {
  const config = {
    entrance: { icon: <DoorOpen size={24} />, label: 'Entrada' },
    bathroom: { icon: <Bath size={24} />, label: 'Baños' },
    bar: { icon: <Beer size={24} />, label: 'Barra' },
    kitchen: { icon: <ChefHat size={24} />, label: 'Cocina' },
  };
  const { icon, label } = config[type];

  return (
    <div className="flex flex-col items-center justify-center p-5 opacity-100 text-slate-400 border-2 border-dashed border-gray-200 rounded-2xl">
      {icon}
      <span className="text-[10px] font-bold uppercase mt-1">{label}</span>
    </div>
  );
};

const TableGrid: React.FC<TableGridProps> = ({ tables, selectedTableId, onTableSelect }) => {
  const sorted = [...tables].sort((a, b) => a.table_number - b.table_number);

  const gridItems: GridItem[] = [
    { id: 'deco-entrance', isDecorative: true, type: 'entrance' },
    sorted[0],
    { id: 'deco-bathroom', isDecorative: true, type: 'bathroom' },
    sorted[1],
    sorted[2],
    sorted[3],
    sorted[4],
    sorted[5],
    sorted[6],
    sorted[7],
    sorted[8],
    { id: 'deco-bar', isDecorative: true, type: 'bar' },
    sorted[9],
    { id: 'deco-kitchen', isDecorative: true, type: 'kitchen' },
  ].filter(Boolean) as GridItem[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Selecciona tu mesa</h3>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200"></div>
            Libre
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
            Tu selección
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {gridItems.map((item) => {
          if ('isDecorative' in item) {
            return <DecorativeCard key={item.id} type={item.type} />;
          }

          const table = item as Table;
          const isSelected = selectedTableId === table.id;
          const isOccupied = table.status === 'OCUPADA' || !table.is_active;
          const isReserved = table.status === 'RESERVADA';

          return (
            <button
              key={table.id}
              type="button"
              disabled={isOccupied || isReserved}
              onClick={() => onTableSelect(table)}
              className={`
                relative p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1
                ${isOccupied
                  ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-40'
                  : isReserved
                    ? 'bg-orange-50 border-orange-200 cursor-not-allowed opacity-80'
                    : isSelected
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20'
                      : 'border-gray-100 hover:border-orange-200 bg-white shadow-xs'}
              `}
            >
              <span className={`text-lg font-bold ${isSelected ? 'text-orange-600' : isReserved ? 'text-orange-400' : 'text-slate-800'}`}>
                #{table.table_number}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Cap. {table.capacity}
              </span>
              <span className="text-[10px] text-slate-400 uppercase">
                {table.zone}
              </span>
              {isReserved && (
                <span className="text-[10px] font-bold text-orange-500 uppercase mt-1">
                  Reservada
                </span>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2 text-orange-600">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableGrid;