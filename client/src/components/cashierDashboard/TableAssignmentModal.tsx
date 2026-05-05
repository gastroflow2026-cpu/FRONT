"use client";

import { X } from "lucide-react";
import { AssignmentWaiter, TableAssignment } from "@/services/tableAssignments";

interface TableAssignmentModalProps {
  isOpen: boolean;
  embedded?: boolean;
  isLoading: boolean;
  error: string | null;
  tables: TableAssignment[];
  waiters: AssignmentWaiter[];
  selectedWaiterByTable: Record<string, string>;
  submittingTableId: string | null;
  onClose: () => void;
  onRefresh: () => void;
  onSelectWaiter: (tableId: string, waiterId: string) => void;
  onAssign: (table: TableAssignment) => void;
  onUnassign: (table: TableAssignment) => void;
}

const formatStatus = (status: string) => {
  const normalized = status.trim().toUpperCase();

  if (["LIBRE", "AVAILABLE"].includes(normalized)) return "Libre";
  if (["OCUPADA", "OCCUPIED"].includes(normalized)) return "Ocupada";
  if (["RESERVADA", "RESERVED"].includes(normalized)) return "Reservada";

  return status || "-";
};

const statusBadgeClass = (status: string) => {
  const normalized = status.trim().toUpperCase();

  if (["LIBRE", "AVAILABLE"].includes(normalized)) {
    return "bg-teal-100 text-teal-700";
  }

  if (["OCUPADA", "OCCUPIED"].includes(normalized)) {
    return "bg-red-100 text-red-700";
  }

  if (["RESERVADA", "RESERVED"].includes(normalized)) {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-gray-100 text-gray-700";
};

export default function TableAssignmentModal({
  isOpen,
  embedded = false,
  isLoading,
  error,
  tables,
  waiters,
  selectedWaiterByTable,
  submittingTableId,
  onClose,
  onRefresh,
  onSelectWaiter,
  onAssign,
  onUnassign,
}: TableAssignmentModalProps) {
  if (!isOpen) return null;

  const content = (
    <div className="mx-auto w-full max-w-5xl bg-white rounded-2xl border border-gray-200 shadow-2xl">
      <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Asignación de mesas a mozos</h2>
          <p className="text-sm text-gray-500">Asigná o quitá mozos por mesa activa.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Actualizar
          </button>
          {!embedded && (
            <button
              onClick={onClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="p-5">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            Cargando mesas y mozos...
          </div>
        ) : tables.length === 0 ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            No se encontraron mesas para asignar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-3">Mesa</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 pr-3">Asignación</th>
                  <th className="py-2 pr-3">Mozo</th>
                  <th className="py-2 pr-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => {
                  const selectedWaiterId = selectedWaiterByTable[table.tableId] || "";
                  const isSubmitting = submittingTableId === table.tableId;
                  const hasAssignedWaiter = Boolean(table.assignedWaiter?.id);

                  return (
                    <tr key={table.tableId} className="border-b border-gray-50 text-gray-700 align-top">
                      <td className="py-3 pr-3 min-w-45">
                        <p className="font-semibold">Mesa {table.tableNumber || "-"}</p>
                        <p className="text-xs text-gray-500 capitalize">Zona: {table.zone || "-"}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(table.status)}`}
                        >
                          {formatStatus(table.status)}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            hasAssignedWaiter
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {hasAssignedWaiter ? "Asignada" : "Sin asignar"}
                        </span>
                        {hasAssignedWaiter && (
                          <p className="mt-1 text-xs text-gray-500">Actual: {table.assignedWaiter?.name}</p>
                        )}
                      </td>
                      <td className="py-3 pr-3 min-w-55">
                        <select
                          className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700"
                          value={selectedWaiterId}
                          onChange={(event) => onSelectWaiter(table.tableId, event.target.value)}
                          disabled={isSubmitting || waiters.length === 0 || !table.isActive}
                        >
                          <option value="">Seleccionar mozo</option>
                          {waiters.map((waiter) => (
                            <option key={waiter.id} value={waiter.id}>
                              {waiter.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-3 min-w-55">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onAssign(table)}
                            disabled={isSubmitting || !selectedWaiterId || !table.isActive}
                            className="h-9 px-3 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {hasAssignedWaiter ? "Reasignar" : "Asignar"}
                          </button>
                          <button
                            onClick={() => onUnassign(table)}
                            disabled={isSubmitting || !hasAssignedWaiter}
                            className="h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            Quitar
                          </button>
                        </div>
                        {!table.isActive && (
                          <p className="mt-1 text-xs text-amber-600">Mesa inactiva: no se puede asignar.</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-70 bg-gray-950/40 backdrop-blur-[1px] p-4 md:p-6 overflow-y-auto">
      {content}
    </div>
  );
}