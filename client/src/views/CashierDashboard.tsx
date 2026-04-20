"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import CashierNavbar from "@/components/cashierDashboard/CashierNavbar";
import MetricCards from "@/components/cashierDashboard/MetricCards";
import TableGrid from "@/components/cashierDashboard/TableGrid";
import OrdersList from "@/components/cashierDashboard/OrdersList";
import ReservationsList from "@/components/cashierDashboard/ReservationsList";
import TableDrawer from "@/components/cashierDashboard/TableDrawer";
import { mockMetrics, mockTables } from "@/utils/cashierMockData";
import { Table } from "@/types/cashier";

export default function CashierDashboard() {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  function handleTableClick(table: Table) {
    setSelectedTable(table);
  }

  function handleCloseDrawer() {
    setSelectedTable(null);
  }

  async function handleCloseOrder(table: Table) {
    const result = await Swal.fire({
      title: "¿Cerrar orden?",
      html: `¿Confirmás el cierre de la orden <strong>#${table.currentOrder?.id}</strong> de la mesa <strong>${table.id}</strong>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar orden",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      reverseButtons: false,
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: "¡Orden cerrada!",
        text: "La orden fue marcada como pagada correctamente.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#f97316",
      });

      // Cuando el back esté listo, acá va el llamado a la API
      // Por ahora cerramos el drawer
      setSelectedTable(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CashierNavbar
        restaurantName="La Parrilla del Chef"
        cashierName="Carlos M."
        notificationCount={2}
      />
      <main className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-[2px]" />
            ))}
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            Dashboard del Cajero
          </h1>
        </div>
        <MetricCards metrics={mockMetrics} />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <TableGrid tables={mockTables} onTableClick={handleTableClick} />
          </div>
          <div className="col-span-1 flex flex-col gap-6">
            <OrdersList />
            <ReservationsList />
          </div>
        </div>
      </main>

      <TableDrawer
        table={selectedTable}
        onClose={handleCloseDrawer}
        onCloseOrder={handleCloseOrder}
      />
    </div>
  );
}