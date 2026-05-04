"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Loader2,
  Minus,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import WaiterNavbar from "@/components/waiterDashboard/WaiterNavbar";
import { MenuCategory, MenuItem } from "@/types/MenuItem";
import { UsersContext } from "@/context/UsersContext";
import { useSocket } from "@/context/SocketContext";
import { useTables, Table as BackendTable } from "@/context/TablesContext";
import { getToken } from "@/helpers/getToken";
import {
  addItemsToOrder,
  canOrderBeClosedByWaiter,
  closeOrder,
  confirmOrderDelivered,
  fetchOrdersByTable,
  isOrderEditableByWaiter,
  mapOrderStatusToTableStatus,
  OrderLifecycleStatus,
  openOrder,
  resolveRestaurantId,
  RestaurantOrderSummary,
} from "@/services/orderLifecycle";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3000";

type TableStatus = "libre" | "ocupada" | "reservada" | "listo";

interface CartItem {
  item: MenuItem;
  quantity: number;
  observation: string;
}

interface WaiterTable {
  id: string;
  tableNumber: number;
  status: TableStatus;
}

type OrderStateByTable = Record<
  string,
  {
    orderId: string;
    status: OrderLifecycleStatus;
    deliveredAt?: string;
  }
>;

const TABLE_STATUS_STYLES: Record<TableStatus, string> = {
  libre: "border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-400",
  ocupada: "border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-400",
  reservada: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400",
  listo: "border-green-300 bg-green-50 text-green-700 hover:border-green-400 animate-pulse",
};

const TABLE_DOT_STYLES: Record<TableStatus, string> = {
  libre: "bg-teal-400",
  ocupada: "bg-orange-400",
  reservada: "bg-amber-400",
  listo: "bg-green-500",
};

const ORDER_STATUS_LABELS: Record<OrderLifecycleStatus, string> = {
  pendiente: "En espera",
  preparacion: "En preparación",
  servido: "Listo para entregar",
  lista_para_pagar: "Lista para pagar",
  cerrado: "Cerrado",
  pagado: "Pagado",
};

const ORDER_STATUS_BADGES: Record<OrderLifecycleStatus, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  preparacion: "bg-blue-100 text-blue-700",
  servido: "bg-green-100 text-green-700",
  lista_para_pagar: "bg-indigo-100 text-indigo-700",
  cerrado: "bg-gray-100 text-gray-700",
  pagado: "bg-emerald-100 text-emerald-700",
};

const getAxiosErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return "";

  const data = error.response?.data as
    | { message?: unknown; error?: unknown }
    | undefined;

  if (Array.isArray(data?.message) && data.message.length > 0) {
    return data.message.map((item) => String(item)).join(" | ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  return error.message || "";
};

const shouldTryNextMenuEndpoint = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;
  if (status === 404) return true;

  if (status === 400) {
    const message = getAxiosErrorMessage(error).toLowerCase();
    if (message.includes("uuid") || message.includes("restaurant")) {
      return true;
    }
  }

  return false;
};

const buildMenuCandidates = (baseUrl: string, restaurantId: string) => {
  const encodedId = encodeURIComponent(restaurantId);
  return [
    `${baseUrl}/menu/${encodedId}/public`,
    `${baseUrl}/menu/public?restaurant_id=${encodedId}`,
    `${baseUrl}/menu/public?restaurantId=${encodedId}`,
    `${baseUrl}/menu/public/${encodedId}`,
    `${baseUrl}/restaurants/${encodedId}/menu/public`,
    `${baseUrl}/restaurants/${encodedId}/menu`,
    `${baseUrl}/menu/items/public?restaurant_id=${encodedId}`,
    `${baseUrl}/menu/items/public?restaurantId=${encodedId}`,
    `${baseUrl}/menu/public`,
    `${baseUrl}/menu/items/public`,
  ];
};

const mapBackendTableStatus = (status?: string): TableStatus => {
  const normalizedStatus = (status || "").toUpperCase();

  if (normalizedStatus === "RESERVADA") return "reservada";
  if (normalizedStatus === "OCUPADA") return "ocupada";
  if (normalizedStatus === "LISTO") return "listo";

  return "libre";
};

const getCategoryId = (category: MenuCategory): string =>
  category.category_id || category.id || "";

const getCategoryName = (category: MenuCategory): string =>
  category.category_name || category.name || "Sin categoria";

const buildOrderStateMap = (orders: RestaurantOrderSummary[]): OrderStateByTable => {
  return orders.reduce<OrderStateByTable>((acc, order) => {
    if (!order.tableId || order.status === "cerrado" || order.status === "pagado") {
      return acc;
    }

    acc[order.tableId] = {
      orderId: order.id,
      status: order.status,
    };

    return acc;
  }, {});
};

const pickLastActiveOrder = (orders: RestaurantOrderSummary[]): RestaurantOrderSummary | null => {
  const activeOrders = orders.filter(
    (order) => order.status !== "cerrado" && order.status !== "pagado",
  );

  if (activeOrders.length === 0) {
    return null;
  }

  return activeOrders[activeOrders.length - 1];
};

export default function WaiterDashboard() {
  const { isLogged } = useContext(UsersContext);
  const { socket } = useSocket();
  const { tables: backendTables, loading: loadingTables, getTables } = useTables();
  const waiterName = isLogged?.name ?? "Mozo";
  const restaurantId = resolveRestaurantId(isLogged as Record<string, unknown> | null);
  const [restaurantName, setRestaurantName] = useState("Mi Restaurante");

  const [orderStateByTable, setOrderStateByTable] = useState<OrderStateByTable>({});
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [isClosingOrder, setIsClosingOrder] = useState(false);

  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(false);
  const [menuErrorMessage, setMenuErrorMessage] = useState("Verificá la conexión con el servidor.");

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [generalNote, setGeneralNote] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [itemObservation, setItemObservation] = useState<Record<string, string>>({});
  const backendTablesRef = useRef<BackendTable[]>([]);
  const orderStateByTableRef = useRef<OrderStateByTable>({});
  const isSendingOrderRef = useRef(false);
  const socketRefreshTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    backendTablesRef.current = backendTables;
  }, [backendTables]);

  useEffect(() => {
    orderStateByTableRef.current = orderStateByTable;
  }, [orderStateByTable]);

  useEffect(() => {
    isSendingOrderRef.current = isSendingOrder;
  }, [isSendingOrder]);

  const fetchMenu = useCallback(async () => {
    if (!restaurantId) {
      setLoadingMenu(false);
      setMenuError(true);
      setMenuErrorMessage("No se encontró el restaurante del usuario logueado.");
      setMenu([]);
      return;
    }

    try {
      setLoadingMenu(true);
      setMenuError(false);
      setMenuErrorMessage("Verificá la conexión con el servidor.");

      let menuData: MenuCategory[] = [];
      let lastError: unknown;

      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const menuCandidates = buildMenuCandidates(API_URL, restaurantId);

      for (const endpoint of menuCandidates) {
        try {
          const { data } = await axios.get<MenuCategory[]>(endpoint, { headers });
          menuData = Array.isArray(data) ? data : [];
          lastError = null;
          break;
        } catch (error) {
          lastError = error;

          if (shouldTryNextMenuEndpoint(error)) {
            continue;
          }

          throw error;
        }
      }

      if (lastError) {
        throw lastError;
      }

      setMenu(menuData);
      if (menuData.length > 0) {
        setActiveCategory((prev) => prev || getCategoryId(menuData[0]));
      }
    } catch (error) {
      setMenuError(true);
      setMenuErrorMessage(
        getAxiosErrorMessage(error) || "Verificá la conexión con el servidor.",
      );
      setMenu([]);
    } finally {
      setLoadingMenu(false);
    }
  }, [restaurantId]);

  const syncActiveOrders = useCallback(async () => {
    if (!restaurantId) {
      setOrderStateByTable({});
      return;
    }

    try {
      setIsSyncingOrders(true);
      const tablesSnapshot = backendTablesRef.current;

      if (tablesSnapshot.length === 0) {
        setOrderStateByTable({});
        return;
      }

      const perTableOrders = await Promise.allSettled(
        tablesSnapshot.map(async (table) => {
          const orders = await fetchOrdersByTable(table.id);
          const lastOrder = pickLastActiveOrder(orders);
          return {
            tableId: table.id,
            order: lastOrder,
          };
        }),
      );

      const nextState = perTableOrders.reduce<OrderStateByTable>((acc, tableData) => {
        if (tableData.status !== "fulfilled" || !tableData.value.order) {
          return acc;
        }

        const currentState = orderStateByTableRef.current[tableData.value.tableId];
        const deliveredAtFromBackend = tableData.value.order.deliveredAt;
        const deliveredAt =
          deliveredAtFromBackend ||
          (currentState?.orderId === tableData.value.order.id
            ? currentState.deliveredAt
            : undefined);

        acc[tableData.value.tableId] = {
          orderId: tableData.value.order.id,
          status: tableData.value.order.status,
          deliveredAt,
        };

        return acc;
      }, {});

      setOrderStateByTable(nextState);
    } catch (error) {
      console.warn("No se pudo sincronizar el estado de las órdenes", error);
    } finally {
      setIsSyncingOrders(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void fetchMenu();
  }, [fetchMenu]);

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
    if (!restaurantId) return;
    void getTables(restaurantId);
  }, [getTables, restaurantId]);

  useEffect(() => {
    if (!restaurantId || backendTables.length === 0) return;
    void syncActiveOrders();
  }, [backendTables, restaurantId, syncActiveOrders]);

  useEffect(() => {
    if (!restaurantId) return;

    const intervalId = window.setInterval(() => {
      void syncActiveOrders();
      void getTables(restaurantId);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [getTables, restaurantId, syncActiveOrders]);

  useEffect(() => {
    if (!socket || !restaurantId) return;

    const handleOrderEvent = () => {
      if (isSendingOrderRef.current) {
        return;
      }

      if (socketRefreshTimeoutRef.current) {
        window.clearTimeout(socketRefreshTimeoutRef.current);
      }

      socketRefreshTimeoutRef.current = window.setTimeout(() => {
        void syncActiveOrders();
      }, 350);
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
      if (socketRefreshTimeoutRef.current) {
        window.clearTimeout(socketRefreshTimeoutRef.current);
      }
      events.forEach((eventName) => socket.off(eventName, handleOrderEvent));
    };
  }, [restaurantId, socket, syncActiveOrders]);

  const tables = useMemo<WaiterTable[]>(() => {
    return backendTables.map((table: BackendTable) => {
      const backendStatus = mapBackendTableStatus(table.status);
      const orderState = orderStateByTable[table.id];
      const orderStatus = orderState?.status;
      const statusOverride =
        orderStatus === "servido" && orderState?.deliveredAt
          ? "ocupada"
          : mapOrderStatusToTableStatus(orderStatus);

      return {
        id: table.id,
        tableNumber: table.table_number,
        status: statusOverride ?? backendStatus,
      };
    });
  }, [backendTables, orderStateByTable]);

  const selectedTable = tables.find((table) => table.id === selectedTableId) ?? null;
  const selectedOrderState = selectedTableId ? orderStateByTable[selectedTableId] ?? null : null;
  const selectedOrderStatus = selectedOrderState?.status ?? null;
  const canEditSelectedOrder = isOrderEditableByWaiter(selectedOrderStatus);
  const canCloseSelectedOrder = canOrderBeClosedByWaiter(selectedOrderStatus);
  const isDeliveryConfirmed = Boolean(selectedOrderState?.deliveredAt);
  const needsDeliveryConfirmation = selectedOrderStatus === "servido" && !isDeliveryConfirmed;
  const canCloseAfterDeliveryConfirmation = canCloseSelectedOrder && !needsDeliveryConfirmation;

  const activeMenuCategory = menu.find(
    (category) => getCategoryId(category) === activeCategory,
  );

  const cartTotal = cart.reduce(
    (acc, cartItem) => acc + Number(cartItem.item.price) * cartItem.quantity,
    0,
  );

  function addToCart(item: MenuItem) {
    if (!selectedTable || !canEditSelectedOrder) return;

    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.item.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [
        ...prev,
        {
          item,
          quantity: 1,
          observation: itemObservation[item.id] ?? "",
        },
      ];
    });
  }

  function removeFromCart(itemId: string) {
    if (!canEditSelectedOrder) return;
    setCart((prev) => prev.filter((cartItem) => cartItem.item.id !== itemId));
  }

  function changeQty(itemId: string, delta: number) {
    if (!canEditSelectedOrder) return;

    setCart((prev) =>
      prev
        .map((cartItem) =>
          cartItem.item.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + delta }
            : cartItem,
        )
        .filter((cartItem) => cartItem.quantity > 0),
    );
  }

  function updateCartItemObservation(itemId: string, observation: string) {
    if (!canEditSelectedOrder) return;

    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.item.id === itemId ? { ...cartItem, observation } : cartItem,
      ),
    );
  }

  function handleSelectTable(table: WaiterTable) {
    if (cart.length > 0 && selectedTableId !== table.id) {
      Swal.fire({
        title: "¿Cambiar de mesa?",
        text: "Tenés ítems en el carrito. Al cambiar de mesa se perderán.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#f97316",
        cancelButtonColor: "#6b7280",
      }).then((result) => {
        if (result.isConfirmed) {
          setCart([]);
          setGeneralNote("");
          setItemObservation({});
          setSelectedTableId(table.id);
          void syncActiveOrders();
        }
      });
      return;
    }

    setSelectedTableId(table.id);
    void syncActiveOrders();
  }

  async function handleSendToKitchen() {
    if (!selectedTable || cart.length === 0) return;

    if (!canEditSelectedOrder) {
      await Swal.fire({
        title: "Orden bloqueada",
        text: "La cocina ya tomó esta orden. El mozo no puede editarla hasta que se marque como servida.",
        icon: "info",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Enviar pedido – Mesa ${selectedTable.tableNumber}`,
      html: `<p>Se enviarán <strong>${cart.length} ítem(s)</strong> a la orden de la mesa.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    setIsSendingOrder(true);

    try {
      let orderId = selectedOrderState?.orderId;

      if (!orderId) {
        orderId = await openOrder(selectedTable.id);
      }

      await addItemsToOrder(
        orderId,
        cart.map((cartItem) => ({
          menuItemId: cartItem.item.id,
          name: cartItem.item.name.slice(0, 59),
          quantity: cartItem.quantity,
          notes: [cartItem.observation.trim(), generalNote.trim()]
            .filter(Boolean)
            .join(" | "),
        })),
      );

      setOrderStateByTable((prev) => ({
        ...prev,
        [selectedTable.id]: {
          orderId,
          status: "pendiente",
          deliveredAt: undefined,
        },
      }));

      await syncActiveOrders();
      if (restaurantId) {
        await getTables(restaurantId);
      }

      await Swal.fire({
        title: selectedOrderState ? "Orden actualizada" : "Orden enviada",
        text: selectedOrderState
          ? "Los nuevos ítems quedaron agregados a la orden en espera."
          : "La orden fue enviada a cocina y quedó en espera.",
        icon: "success",
        confirmButtonColor: "#f97316",
        timer: 1800,
        showConfirmButton: false,
      });

      setCart([]);
      setGeneralNote("");
      setItemObservation({});
    } catch (error) {
      await Swal.fire({
        title: "Error al enviar",
        text: getAxiosErrorMessage(error) || "No se pudo enviar la orden.",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setIsSendingOrder(false);
    }
  }

  async function handleCloseOrder() {
    if (!selectedTable) return;

    if (!canCloseAfterDeliveryConfirmation) {
      await Swal.fire({
        title: "Todavía no se puede cerrar",
        text: needsDeliveryConfirmation
          ? "Primero confirmá que la mesa recibió el pedido para poder cerrar la orden."
          : "La orden debe estar en estado servido para enviarla a caja.",
        icon: "info",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Cerrar orden – Mesa ${selectedTable.tableNumber}`,
      text: "La orden pasará al cajero para su cobro.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    setIsClosingOrder(true);

    try {
      let orderId = selectedOrderState?.orderId ?? null;

      if (!orderId) {
        const tableOrders = await fetchOrdersByTable(selectedTable.id);
        const activeOrder = [...tableOrders]
          .reverse()
          .find((order) => order.status !== "cerrado" && order.status !== "pagado");
        orderId = activeOrder?.id ?? null;
      }

      if (!orderId) {
        await Swal.fire({
          title: "Sin orden activa",
          text: "No encontramos una orden abierta para esta mesa.",
          icon: "info",
          confirmButtonColor: "#f97316",
        });
        return;
      }

      await closeOrder(orderId);
      setOrderStateByTable((prev) => {
        const next = { ...prev };
        delete next[selectedTable.id];
        return next;
      });

      await syncActiveOrders();
      if (restaurantId) {
        await getTables(restaurantId);
      }

      await Swal.fire({
        title: "Orden cerrada",
        text: "La orden fue enviada al cajero correctamente.",
        icon: "success",
        confirmButtonColor: "#f97316",
        timer: 1800,
        showConfirmButton: false,
      });

      setCart([]);
      setGeneralNote("");
      setItemObservation({});
      setSelectedTableId(null);
    } catch (error) {
      await Swal.fire({
        title: "Error al cerrar",
        text: getAxiosErrorMessage(error) || "No se pudo cerrar la orden.",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setIsClosingOrder(false);
    }
  }

  async function handleConfirmDelivery() {
    if (!selectedTable || !selectedOrderState || selectedOrderStatus !== "servido") {
      return;
    }

    const result = await Swal.fire({
      title: `Confirmar entrega – Mesa ${selectedTable.tableNumber}`,
      text: "Confirmá cuando el pedido ya fue entregado en la mesa.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar entrega",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await confirmOrderDelivered(selectedOrderState.orderId);

      setOrderStateByTable((prev) => ({
        ...prev,
        [selectedTable.id]: {
          ...selectedOrderState,
          deliveredAt: new Date().toISOString(),
        },
      }));

      await syncActiveOrders();
      if (restaurantId) {
        await getTables(restaurantId);
      }
    } catch (error) {
      await Swal.fire({
        title: "No se pudo confirmar",
        text: getAxiosErrorMessage(error) || "No se pudo guardar la confirmación de entrega.",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    await Swal.fire({
      title: "Entrega confirmada",
      text: "Ahora podés cerrar la orden cuando el comensal pida la cuenta.",
      icon: "success",
      confirmButtonColor: "#16a34a",
      timer: 1400,
      showConfirmButton: false,
    });
  }

  const sendButtonLabel = isSendingOrder
    ? "Enviando..."
    : selectedOrderStatus === "pendiente"
      ? "Agregar a orden en espera"
      : "Enviar a cocina";

  return (
    <div className="min-h-screen bg-gray-50">
      <WaiterNavbar
        restaurantName={restaurantName}
        waiterName={waiterName}
        notificationCount={tables.filter((table) => table.status === "listo").length}
      />

      <main className="p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 text-sm mb-1">Mesas – {restaurantName}</h2>
          <p className="text-xs text-gray-400 mb-4">Seleccioná una mesa para tomar el pedido</p>

          <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
            {(["libre", "ocupada", "reservada", "listo"] as TableStatus[]).map((status) => (
              <span key={status} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${TABLE_DOT_STYLES[status]}`} />
                {status === "libre"
                  ? "Libre"
                  : status === "ocupada"
                    ? "Ocupada"
                    : status === "reservada"
                      ? "Reservada"
                      : "Listo para entregar"}
              </span>
            ))}
          </div>

          {isSyncingOrders && !loadingTables && (
            <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              Sincronizando estados de órdenes...
            </div>
          )}

          {!restaurantId ? (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
              <p className="font-semibold">Sin restaurante vinculado</p>
              <p className="text-amber-600">
                Tu usuario no tiene un restaurante asociado. Pedile al administrador que vincule tu cuenta al restaurante.
              </p>
            </div>
          ) : loadingTables ? (
            <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">Cargando mesas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  className={`relative p-4 rounded-xl border-2 transition-all font-medium text-sm ${TABLE_STATUS_STYLES[table.status]} ${
                    selectedTableId === table.id ? "ring-2 ring-orange-400 ring-offset-1" : ""
                  }`}
                >
                  {table.status === "listo" && (
                    <CheckCircle2
                      size={14}
                      className="absolute top-1.5 right-1.5 text-green-600"
                    />
                  )}
                  Mesa {table.tableNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-2 flex flex-col gap-4">
          {selectedTable ? (
            <>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-800">Mesa {selectedTable.tableNumber}</h2>
                  <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                    <Clock size={12} />
                    {selectedOrderStatus ? (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${ORDER_STATUS_BADGES[selectedOrderStatus]}`}>
                        {ORDER_STATUS_LABELS[selectedOrderStatus]}
                      </span>
                    ) : (
                      <span>Tomando pedido</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedTableId(null);
                    setCart([]);
                    setGeneralNote("");
                    setItemObservation({});
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedOrderStatus && (
                <div className={`rounded-xl border px-4 py-3 text-sm ${canEditSelectedOrder ? "border-amber-200 bg-amber-50 text-amber-700" : selectedOrderStatus === "servido" ? "border-green-200 bg-green-50 text-green-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                  {canEditSelectedOrder
                    ? "La orden está en espera. Todavía podés agregar más ítems."
                    : selectedOrderStatus === "servido"
                      ? needsDeliveryConfirmation
                        ? "La cocina marcó la orden como servida. Confirmá entrega en mesa para habilitar el cierre a caja."
                        : "Entrega confirmada. Cuando el comensal lo pida, ya podés cerrar la orden para caja."
                      : "La cocina ya tomó la orden. El mozo no puede editarla hasta que finalice el servicio."}
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                {loadingMenu ? (
                  <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm">Cargando menú...</span>
                  </div>
                ) : menuError ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-red-400 font-medium">No se pudo cargar el menú.</p>
                    <p className="text-xs text-gray-400 mt-1">{menuErrorMessage}</p>
                    <button
                      type="button"
                      onClick={() => void fetchMenu()}
                      className="mt-4 inline-flex items-center justify-center rounded-lg border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-500 transition-colors hover:bg-orange-50"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {menu.map((category) => {
                        const categoryId = getCategoryId(category);
                        const categoryName = getCategoryName(category);

                        return (
                          <button
                            key={categoryId}
                            onClick={() => setActiveCategory(categoryId)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeCategory === categoryId ? "bg-linear-to-r from-orange-500 to-pink-500 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                          >
                            {categoryName}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeMenuCategory?.items.map((item) => {
                        const inCart = cart.find((cartItem) => cartItem.item.id === item.id);
                        const isItemDisabled = !selectedTable || !canEditSelectedOrder;

                        return (
                          <div
                            key={item.id}
                            className={`border rounded-xl p-3 transition-all ${inCart ? "border-orange-300 bg-orange-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"} ${isItemDisabled ? "opacity-60" : ""}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                                <p className="text-sm font-bold text-orange-500 mt-1">${Number(item.price).toLocaleString("es-AR")}</p>
                              </div>
                              <button
                                onClick={() => addToCart(item)}
                                disabled={isItemDisabled}
                                className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <input
                              type="text"
                              placeholder="Observación (ej: sin cebolla)"
                              value={itemObservation[item.id] ?? ""}
                              onChange={(event) => {
                                if (!canEditSelectedOrder) return;

                                setItemObservation((prev) => ({
                                  ...prev,
                                  [item.id]: event.target.value,
                                }));

                                if (inCart) {
                                  updateCartItemObservation(item.id, event.target.value);
                                }
                              }}
                              disabled={isItemDisabled}
                              className="mt-2 w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 bg-white text-gray-700 placeholder:text-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  <ChefHat size={13} className="inline mr-1" />
                  Observaciones generales para cocina
                </label>
                <textarea
                  rows={3}
                  value={generalNote}
                  onChange={(event) => setGeneralNote(event.target.value)}
                  disabled={!canEditSelectedOrder}
                  placeholder="Ej: mesa con alergia al gluten, sin picante…"
                  className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 resize-none text-gray-700 placeholder:text-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ChefHat size={26} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Ninguna mesa seleccionada</p>
              <p className="text-xs text-gray-400 mt-1">
                Seleccioná una mesa en el panel izquierdo para comenzar a tomar el pedido.
              </p>
            </div>
          )}
        </div>

        <div className="xl:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h2 className="font-semibold text-gray-800 text-sm mb-1">
            {selectedTable ? `Orden – Mesa ${selectedTable.tableNumber}` : "Orden"}
          </h2>
          <p className="text-xs text-gray-400 mb-4">Ítems seleccionados</p>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Plus size={18} className="text-gray-300" />
              </div>
              <p className="text-xs text-gray-400">Agregá ítems desde el menú para armar el pedido.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
              {cart.map((cartItem) => (
                <div key={cartItem.item.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{cartItem.item.name}</p>
                      {cartItem.observation && (
                        <p className="text-xs text-orange-500 mt-0.5 italic truncate">✎ {cartItem.observation}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(cartItem.item.id)}
                      disabled={!canEditSelectedOrder}
                      className="text-gray-300 hover:text-red-400 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQty(cartItem.item.id, -1)}
                        disabled={!canEditSelectedOrder}
                        className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold text-gray-800 w-4 text-center">{cartItem.quantity}</span>
                      <button
                        onClick={() => changeQty(cartItem.item.id, 1)}
                        disabled={!canEditSelectedOrder}
                        className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-orange-500">
                      ${(Number(cartItem.item.price) * cartItem.quantity).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Total estimado</span>
              <span className="text-lg font-bold text-gray-800">${cartTotal.toLocaleString("es-AR")}</span>
            </div>

            <button
              onClick={handleSendToKitchen}
              disabled={!selectedTable || cart.length === 0 || !canEditSelectedOrder || isSendingOrder || isClosingOrder}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all bg-linear-to-r from-orange-500 to-pink-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm mb-2"
            >
              {isSendingOrder ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sendButtonLabel}
            </button>

            <button
              onClick={handleCloseOrder}
              disabled={!selectedTable || isSendingOrder || isClosingOrder || !canCloseAfterDeliveryConfirmation}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isClosingOrder ? "Cerrando..." : "Cerrar orden → Caja"}
            </button>

            {selectedOrderStatus === "servido" && (
              <button
                onClick={handleConfirmDelivery}
                disabled={!selectedTable || isClosingOrder || isDeliveryConfirmed}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border-2 border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={16} />
                {isDeliveryConfirmed ? "Entrega confirmada" : "Confirmar entrega en mesa"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}