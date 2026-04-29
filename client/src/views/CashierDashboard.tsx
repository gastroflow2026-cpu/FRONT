"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import CashierNavbar from "@/components/cashierDashboard/CashierNavbar";
import MetricCards from "@/components/cashierDashboard/MetricCards";
import TableGrid from "@/components/cashierDashboard/TableGrid";
import TableDrawer from "@/components/cashierDashboard/TableDrawer";
import ReservationsTab from "@/components/cashierDashboard/ReservationsTab";
import TicketsTab from "@/components/cashierDashboard/TicketsTab";
import { mockMetrics, mockTables } from "@/utils/cashierMockData";
import { PaymentMethod, Table } from "@/types/cashier";

type MainTab = "mesas" | "reservas" | "tickets";

const TABS: { value: MainTab; label: string }[] = [
  { value: "mesas", label: "Mesas y órdenes" },
  { value: "reservas", label: "Reservas" },
  { value: "tickets", label: "Tickets" },
];

export default function CashierDashboard() {
  const [activeTab, setActiveTab] = useState<MainTab>("mesas");
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  function handleTableClick(table: Table) {
    setSelectedTable(table);
  }

  function handleCloseDrawer() {
    setSelectedTable(null);
  }

  async function handleCloseOrder(table: Table, paymentMethod: PaymentMethod) {
  const result = await Swal.fire({
    title: "¿Cobrar orden?",
    html: `¿Confirmás el cobro de la orden <strong>#${table.currentOrder?.id}</strong> de la mesa <strong>${table.id}</strong>?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, cobrar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#f97316",
    cancelButtonColor: "#6b7280",
  });

  if (result.isConfirmed) {
    await Swal.fire({
      title: "¡Cobro registrado!",
      text: `Pago registrado correctamente con ${paymentMethod}.`,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#f97316",
    });
    // TODO: cuando el back esté listo, enviar paymentMethod junto con el cobro
    // Ejemplo: await fetch(`/api/orders/${table.currentOrder?.id}/pay`, {
    //   method: "POST",
    //   body: JSON.stringify({ paymentMethod }),
    // });
    setSelectedTable(null);
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      <CashierNavbar
        restaurantName="La Parrilla del Chef"
        cashierName="Carlos M."
      />

      <main className="p-6">
        {/* Título */}
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

        {/* Métricas */}
        <MetricCards metrics={mockMetrics} />

        {/* Tabs principales */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl shadow-sm p-1 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido según tab */}
        {activeTab === "mesas" && (
          <TableGrid tables={mockTables} onTableClick={handleTableClick} />
        )}
        {activeTab === "reservas" && <ReservationsTab />}
        {activeTab === "tickets" && <TicketsTab />}
      </main>

      <TableDrawer
        table={selectedTable}
        onClose={handleCloseDrawer}
        onCloseOrder={handleCloseOrder}
      />
    </div>
  );
}