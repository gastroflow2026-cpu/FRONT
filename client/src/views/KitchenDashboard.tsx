"use client";

import { useState } from "react";
import KitchenNavbar from "@/components/kitchenDashboard/kitchenNavbar";
import KitchenOrdersList from "@/components/kitchenDashboard/KitchenOrdersList";
import KitchenOrderDetail from "@/components/kitchenDashboard/KitchenOrderDetail";
import { KitchenOrder, KitchenOrderStatus } from "@/types/kitchen";
import { mockKitchenOrders } from "@/utils/kitchenMockData";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<KitchenOrder[]>(mockKitchenOrders);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelectOrder(order: KitchenOrder) {
    setSelectedOrder(order);
  }

  function handleCloseDetail() {
    setSelectedOrder(null);
  }

  async function handleChangeStatus(
    orderId: string,
    newStatus: KitchenOrderStatus
  ) {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: reemplazar por llamado real al back cuando esté listo
      // Ejemplo:
      // await fetch(`/api/orders/${orderId}/status`, {
      //   method: "PATCH",
      //   body: JSON.stringify({ status: newStatus }),
      // });

      // Simulamos delay de red
      await new Promise((resolve) => setTimeout(resolve, 400));

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            status: newStatus,
            startedAt:
              newStatus === "preparacion"
                ? new Date().toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : o.startedAt,
            finishedAt:
              newStatus === "servido"
                ? new Date().toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : o.finishedAt,
          };
        })
      );

      // Actualizamos el panel de detalle si la orden seleccionada es la que cambió
      setSelectedOrder((prev) => {
        if (!prev || prev.id !== orderId) return prev;
        return {
          ...prev,
          status: newStatus,
          startedAt:
            newStatus === "preparacion"
              ? new Date().toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : prev.startedAt,
          finishedAt:
            newStatus === "servido"
              ? new Date().toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : prev.finishedAt,
        };
      });
    } catch {
      setError("No se pudo actualizar el estado. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KitchenNavbar
        restaurantName="La Parrilla del Chef"
        chefName="Roberto S."
      />

      <main className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <UtensilsCrossedIcon />
          <h1 className="text-xl font-semibold text-gray-800">
            Dashboard de Cocina
          </h1>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <KitchenOrdersList
            orders={orders}
            selectedOrderId={selectedOrder?.id ?? null}
            onSelectOrder={handleSelectOrder}
          />
          <KitchenOrderDetail
            order={selectedOrder}
            isLoading={isLoading}
            onChangeStatus={handleChangeStatus}
            onClose={handleCloseDetail}
          />
        </div>
      </main>
    </div>
  );
}

function UtensilsCrossedIcon() {
  return (
    <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-700 rounded-[2px]" />
      ))}
    </div>
  );
}