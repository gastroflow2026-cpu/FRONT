"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import KitchenNavbar from "@/components/kitchenDashboard/kitchenNavbar";
import KitchenOrdersList from "@/components/kitchenDashboard/KitchenOrdersList";
import KitchenOrderDetail from "@/components/kitchenDashboard/KitchenOrderDetail";
import { useSocket } from "@/context/SocketContext";
import { UsersContext } from "@/context/UsersContext";
import { KitchenOrder, KitchenOrderStatus } from "@/types/kitchen";
import {
  fetchKitchenOrders,
  updateKitchenOrderStatus,
} from "@/services/orderLifecycle";

export default function KitchenDashboard() {
  const { isLogged } = useContext(UsersContext);
  const { socket } = useSocket();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState("Mi Restaurante");

  const chefName = isLogged?.name?.trim() || "Chef";

  const orderDisplayIdMap = useMemo(() => {
    const ordered = [...orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return ordered.reduce<Map<string, number>>((acc, order, index) => {
      acc.set(order.id, index + 1);
      return acc;
    }, new Map());
  }, [orders]);

  const selectedOrderDisplayId = selectedOrder ? orderDisplayIdMap.get(selectedOrder.id) ?? null : null;

  const loadOrders = useCallback(async () => {
    try {
      setError(null);
      const nextOrders = await fetchKitchenOrders();
      setOrders(nextOrders);
      setSelectedOrder((prev) => {
        if (!prev) return null;
        return nextOrders.find((order) => order.id === prev.id) ?? null;
      });
    } catch {
      setError("No se pudieron cargar las órdenes de cocina.");
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadOrders();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [loadOrders]);

  useEffect(() => {
    const user = (isLogged as Record<string, unknown> | null) ?? null;
    const nestedRestaurant =
      user?.restaurant && typeof user.restaurant === "object"
        ? (user.restaurant as Record<string, unknown>)
        : null;

    const candidates = [
      user?.restaurant_name,
      user?.restaurantName,
      nestedRestaurant?.name,
      nestedRestaurant?.restaurant_name,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        setRestaurantName(candidate.trim());
        return;
      }
    }

    const storedName = localStorage.getItem("restaurantName");
    if (storedName && storedName.trim()) {
      setRestaurantName(storedName.trim());
      return;
    }

    setRestaurantName("Mi Restaurante");
  }, [isLogged]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderEvent = () => {
      void loadOrders();
    };

    const events = [
      "order:created",
      "order:updated",
      "order:item_added",
      "order:closed",
      "order:status_changed",
      "order:status_updated",
      "kitchen:order_updated",
    ];

    events.forEach((eventName) => socket.on(eventName, handleOrderEvent));

    return () => {
      events.forEach((eventName) => socket.off(eventName, handleOrderEvent));
    };
  }, [loadOrders, socket]);

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
      await updateKitchenOrderStatus(orderId, newStatus);

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
        restaurantName={restaurantName}
        chefName={chefName}
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

        {isBootstrapping && (
          <div className="mb-4 bg-white border border-gray-100 text-gray-500 text-sm px-4 py-3 rounded-xl shadow-sm">
            Cargando órdenes de cocina...
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <KitchenOrdersList
            orders={orders}
            selectedOrderId={selectedOrder?.id ?? null}
            onSelectOrder={handleSelectOrder}
            getDisplayId={(orderId) => orderDisplayIdMap.get(orderId) ?? null}
          />
          <KitchenOrderDetail
            order={selectedOrder}
            displayId={selectedOrderDisplayId}
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
        <div key={i} className="bg-gray-700 rounded-xs" />
      ))}
    </div>
  );
}