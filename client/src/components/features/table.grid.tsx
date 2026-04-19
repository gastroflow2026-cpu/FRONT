import React from 'react';
import type { Table } from '@/app/data/restaurants.data';
import { Check, DoorOpen, Bath, Beer, ChefHat } from 'lucide-react';

interface TableGridProps {
  tables: Table[];
  selectedTableId: string | null;
  onTableSelect: (table: Table) => void;
}

const TableGrid: React.FC<TableGridProps> = ({ tables, selectedTableId, onTableSelect }) => {
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
        {tables.map((item) => {
          // 1. Si es un elemento decorativo
          if (item.status === 'decorative') {
            return (
              <div key={item.id} className="flex flex-col items-center justify-center p-5 opacity-40 text-slate-400">
                {item.type === 'entrance' && <><DoorOpen size={24} /> <span className="text-[10px] font-bold uppercase">Entrada</span></>}
                {item.type === 'bathroom' && <><Bath size={24} /> <span className="text-[10px] font-bold uppercase">Baños</span></>}
                {item.type === 'bar' && <><Beer size={24} /> <span className="text-[10px] font-bold uppercase">Barra</span></>}
                {item.type === 'kitchen' && <><ChefHat size={24} /> <span className="text-[10px] font-bold uppercase">Cocina</span></>}
              </div>
            );
          }

          const isSelected = selectedTableId === item.id;
          const isOccupied = item.status === 'occupied';

          return (
            <button
              key={item.id}
              type="button" // Importante: para que no haga submit al formulario
              disabled={isOccupied}
              onClick={() => onTableSelect(item)}
              className={`
                relative p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1
                ${isOccupied 
                  ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-40' 
                  : isSelected 
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20' 
                    : 'border-gray-100 hover:border-orange-200 bg-white shadow-xs'}
              `}
            >
              <span className={`text-lg font-bold ${isSelected ? 'text-orange-600' : 'text-slate-800'}`}>
                #{item.number}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Cap. {item.capacity}
              </span>
              
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