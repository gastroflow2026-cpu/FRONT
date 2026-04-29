"use client";

import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Plus, Minus, Trash2, Send, X, ChefHat, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { MenuCategory, MenuItem } from "@/types/MenuItem";
import WaiterNavbar from "@/components/waiterDashboard/WaiterNavbar";
import { UsersContext } from "@/context/UsersContext";
import { useTables, Table as BackendTable } from "@/context/TablesContext";
import { getToken } from "@/helpers/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3000";

const getAxiosErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return "";

  const data = error.response?.data as { message?: unknown; error?: unknown } | undefined;

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

// ─── Tipos locales ────────────────────────────────────────────────────────────
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

interface CreateOrderPayload {
  restaurant_id: string;
  table_id: string;
  waiter_id: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    observations?: string;
  }>;
  total_amount: number;
  observations?: string;
}

interface CreatedOrderResponse {
  id?: string;
  order_id?: string;
  status?: string;
}

interface OrderByTableResponse {
  id?: string;
  order_id?: string;
  status?: string;
}

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

const mapBackendTableStatus = (status?: string): TableStatus => {
  const normalizedStatus = (status || "").toUpperCase();

  if (normalizedStatus === "RESERVADA") return "reservada";
  if (normalizedStatus === "OCUPADA") return "ocupada";
  if (normalizedStatus === "LISTO") return "listo";

  return "libre";
};

// ─── Componente principal ─────────────────────────────────────────────────────
// Extrae el restaurantId tolerando distintos nombres de campo que puede devolver el back
function resolveRestaurantId(user: Record<string, unknown> | null): string | null {
  if (!user) return null;
  const candidates = [
    user.restaurant_id,
    user.restaurantId,
    (user.restaurant as Record<string, unknown>)?.id,
    (user.restaurant as Record<string, unknown>)?.restaurant_id,
  ];
  for (const val of candidates) {
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return null;
}

const getCategoryId = (category: MenuCategory): string =>
  category.category_id || category.id || "";

const getCategoryName = (category: MenuCategory): string =>
  category.category_name || category.name || "Sin categoria";

export default function WaiterDashboard() {
  const { isLogged } = useContext(UsersContext);
  const { tables: backendTables, loading: loadingTables, getTables } = useTables();
  const waiterName = isLogged?.name ?? "Mozo";
  const restaurantId = resolveRestaurantId(isLogged as Record<string, unknown> | null);
  const waiterId = isLogged?.id ?? "";

  const [localStatusByTable, setLocalStatusByTable] = useState<Record<string, TableStatus>>({});
  const [activeOrderByTable, setActiveOrderByTable] = useState<Record<string, string>>({});
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [isClosingOrder, setIsClosingOrder] = useState(false);

  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(false);
  const [menuErrorMessage, setMenuErrorMessage] = useState("Verificá la conexión con el servidor.");

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
        } catch (error: unknown) {
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
      const message = getAxiosErrorMessage(error) || "Verificá la conexión con el servidor.";

      console.error("Error al cargar el menú:", error);
      setMenuError(true);
      setMenuErrorMessage(message);
      setMenu([]);
    } finally {
      setLoadingMenu(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [generalNote, setGeneralNote] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [itemObservation, setItemObservation] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!restaurantId) return;
    getTables(restaurantId);
  }, [restaurantId, getTables]);

  const tables = useMemo<WaiterTable[]>(() => {
    return backendTables.map((table: BackendTable) => {
      const backendStatus = mapBackendTableStatus(table.status);
      return {
        id: table.id,
        tableNumber: table.table_number,
        status: localStatusByTable[table.id] ?? backendStatus,
      };
    });
  }, [backendTables, localStatusByTable]);

  const selectedTable = tables.find((t) => t.id === selectedTableId) ?? null;

  const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  const extractOrderId = (data: CreatedOrderResponse | OrderByTableResponse): string | null => {
    const directId = typeof data.id === "string" ? data.id : null;
    const altId = typeof data.order_id === "string" ? data.order_id : null;
    return directId || altId;
  };

  const resolveActiveOrderId = async (tableId: string): Promise<string | null> => {
    const cachedOrderId = activeOrderByTable[tableId];
    if (cachedOrderId) return cachedOrderId;

    try {
      const headers = getAuthHeaders();
      const { data } = await axios.get<OrderByTableResponse[]>(`${API_URL}/table/${tableId}`, {
        headers,
      });

      if (!Array.isArray(data) || data.length === 0) return null;

      const activeOrder = [...data]
        .reverse()
        .find((order) => ((order.status || "").toLowerCase() !== "closed"));

      if (!activeOrder) return null;
      const orderId = extractOrderId(activeOrder);
      if (!orderId) return null;

      setActiveOrderByTable((prev) => ({ ...prev, [tableId]: orderId }));
      return orderId;
    } catch {
      return null;
    }
  };

  // ─── Carrito ──────────────────────────────────────────────────────────────
  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1, observation: itemObservation[item.id] ?? "" }];
    });
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  }

  function changeQty(itemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  }

  function updateCartItemObservation(itemId: string, obs: string) {
    setCart((prev) =>
      prev.map((c) => (c.item.id === itemId ? { ...c, observation: obs } : c))
    );
  }

  const cartTotal = cart.reduce(
    (acc, c) => acc + Number(c.item.price) * c.quantity,
    0
  );

  // ─── Acciones de mesa ─────────────────────────────────────────────────────
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
          setSelectedTableId(table.id);
        }
      });
      return;
    }
    setSelectedTableId(table.id);
  }

  async function handleSendToKitchen() {
  if (!selectedTable || cart.length === 0 || !waiterId) return;

  const result = await Swal.fire({
    title: `Enviar pedido – Mesa ${selectedTable.tableNumber}`,
    html: `<p>Se enviará el pedido de <strong>${cart.length} ítem(s)</strong> a cocina.</p>`,
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
    const headers = getAuthHeaders();

    // 1. Abrir la orden
    const { data: openedOrder } = await axios.post(
      `${API_URL}/order/open`,
      { tableId: selectedTable.id },
      { headers }
    );

    const orderId = openedOrder?.id || openedOrder?.order_id;
    if (!orderId) throw new Error("No se recibió el id de la orden");

  // 2. Agregar cada ítem
for (const c of cart) {
  await axios.post(
    `${API_URL}/order/${orderId}/items`,
    {
      menuItemId: c.item.id,
      name: c.item.name.slice(0, 59),
      quantity: c.quantity,
      notes: c.observation?.trim() || "",
    },
    { headers }
  );
}

    // 3. Enviar a cocina
   await axios.patch(
  `${API_URL}/order/${orderId}`,
  { status: "EN_PROGRESO" },  // ← valor real del enum IN_PROGRESS
  { headers }
);

    // Guardar orderId para poder cerrarla después
    setActiveOrderByTable((prev) => ({ ...prev, [selectedTable.id]: orderId }));
    setLocalStatusByTable((prev) => ({ ...prev, [selectedTable.id]: "ocupada" }));
    await getTables(restaurantId!);

    await Swal.fire({
      title: "Pedido enviado",
      text: "La orden fue enviada a cocina.",
      icon: "success",
      confirmButtonColor: "#f97316",
      timer: 1800,
      showConfirmButton: false,
    });

    setCart([]);
    setGeneralNote("");
    setSelectedTableId(null);
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || "No se pudo enviar la orden."
      : "No se pudo enviar la orden.";
    await Swal.fire({
      title: "Error al enviar",
      text: message,
      icon: "error",
      confirmButtonColor: "#f97316",
    });
  } finally {
    setIsSendingOrder(false);
  }
}

async function handleCloseOrder() {
  if (!selectedTable) return;

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
    // Buscar orderId: primero en cache local, luego en el back
    let orderId: string | null = activeOrderByTable[selectedTable.id] ?? null;

    if (!orderId) {
      try {
        const headers = getAuthHeaders();
        const { data } = await axios.get(
          `${API_URL}/order/table/${selectedTable.id}`,
          { headers }
        );
        const orders = Array.isArray(data) ? data : [];
        const active = [...orders].reverse().find(
          (o) => (o.status || "").toLowerCase() !== "closed"
        );
        orderId = active?.id || active?.order_id || null;
      } catch {
        orderId = null;
      }
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

    const headers = getAuthHeaders();
    await axios.patch(`${API_URL}/order/${orderId}/close`, {}, { headers });

    setActiveOrderByTable((prev) => {
      const next = { ...prev };
      delete next[selectedTable.id];
      return next;
    });
    setLocalStatusByTable((prev) => ({ ...prev, [selectedTable.id]: "libre" }));
    await getTables(restaurantId!);

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
    setSelectedTableId(null);
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || "No se pudo cerrar la orden."
      : "No se pudo cerrar la orden.";
    await Swal.fire({
      title: "Error al cerrar",
      text: message,
      icon: "error",
      confirmButtonColor: "#f97316",
    });
  } finally {
    setIsClosingOrder(false);
  }
}

  // ─── Menú activo ──────────────────────────────────────────────────────────
  const activeMenuCategory: MenuCategory | undefined = menu.find(
    (c) => getCategoryId(c) === activeCategory
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <WaiterNavbar
        restaurantName="Bella Vita"
        waiterName={waiterName}
        notificationCount={tables.filter((t) => t.status === "listo").length}
      />

      <main className="p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* ── ZONA 1: MESAS ─────────────────────────────────────────────── */}
        <div className="xl:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 text-sm mb-1">Mesas – Bella Vita</h2>
          <p className="text-xs text-gray-400 mb-4">Seleccioná una mesa para tomar el pedido</p>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
            {(["libre", "ocupada", "reservada", "listo"] as TableStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${TABLE_DOT_STYLES[s]}`} />
                {s === "libre"
                  ? "Libre"
                  : s === "ocupada"
                    ? "Ocupada"
                    : s === "reservada"
                      ? "Reservada"
                      : "Listo para entregar"}
              </span>
            ))}
          </div>

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

        {/* ── ZONA 2: MENÚ + PEDIDO ──────────────────────────────────────── */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {selectedTable ? (
            <>
              {/* Header de mesa seleccionada */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-800">Mesa {selectedTable.tableNumber}</h2>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    Tomando pedido
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedTableId(null); setCart([]); setGeneralNote(""); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs de categorías */}
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
                      onClick={fetchMenu}
                      className="mt-4 inline-flex items-center justify-center rounded-lg border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-500 transition-colors hover:bg-orange-50"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {menu.map((cat) => (
                        (() => {
                          const categoryId = getCategoryId(cat);
                          const categoryName = getCategoryName(cat);
                          return (
                        <button
                          key={categoryId}
                          onClick={() => setActiveCategory(categoryId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeCategory === categoryId
                              ? "bg-linear-to-r from-orange-500 to-pink-500 text-white shadow-sm"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {categoryName}
                        </button>
                          );
                        })()
                      ))}
                    </div>

                    {/* Ítems del menú */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeMenuCategory?.items.map((item) => {
                    const inCart = cart.find((c) => c.item.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className={`border rounded-xl p-3 transition-all ${
                          inCart
                            ? "border-orange-300 bg-orange-50"
                            : "border-gray-100 bg-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                              {item.description}
                            </p>
                            <p className="text-sm font-bold text-orange-500 mt-1">
                              ${Number(item.price).toLocaleString("es-AR")}
                            </p>
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            className="shrink-0 w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Observación por ítem */}
                        <input
                          type="text"
                          placeholder="Observación (ej: sin cebolla)"
                          value={itemObservation[item.id] ?? ""}
                          onChange={(e) => {
                            setItemObservation((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }));
                            if (inCart) updateCartItemObservation(item.id, e.target.value);
                          }}
                          className="mt-2 w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 bg-white text-gray-700 placeholder:text-gray-300"
                        />
                      </div>
                    );
                  })}
                    </div>
                  </>
                )}
              </div>

              {/* Observación general */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  <ChefHat size={13} className="inline mr-1" />
                  Observaciones generales para cocina
                </label>
                <textarea
                  rows={3}
                  value={generalNote}
                  onChange={(e) => setGeneralNote(e.target.value)}
                  placeholder="Ej: mesa con alergia al gluten, sin picante…"
                  className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 resize-none text-gray-700 placeholder:text-gray-300"
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

        {/* ── ZONA 3: CARRITO / RESUMEN DE ORDEN ────────────────────────── */}
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
              <p className="text-xs text-gray-400">
                Agregá ítems desde el menú para armar el pedido.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
              {cart.map((c) => (
                <div
                  key={c.item.id}
                  className="border border-gray-100 rounded-xl p-3 bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {c.item.name}
                      </p>
                      {c.observation && (
                        <p className="text-xs text-orange-500 mt-0.5 italic truncate">
                          ✎ {c.observation}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(c.item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQty(c.item.id, -1)}
                        className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold text-gray-800 w-4 text-center">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => changeQty(c.item.id, 1)}
                        className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-orange-500">
                      ${(Number(c.item.price) * c.quantity).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total + acciones */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Total estimado</span>
              <span className="text-lg font-bold text-gray-800">
                ${cartTotal.toLocaleString("es-AR")}
              </span>
            </div>

            <button
              onClick={handleSendToKitchen}
              disabled={!selectedTable || cart.length === 0 || isSendingOrder || isClosingOrder}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all bg-linear-to-r from-orange-500 to-pink-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm mb-2"
            >
              {isSendingOrder ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {isSendingOrder ? "Enviando..." : "Enviar a cocina"}
            </button>

            <button
              onClick={handleCloseOrder}
              disabled={
                !selectedTable ||
                isSendingOrder ||
                isClosingOrder ||
                selectedTable.status === "libre" ||
                selectedTable.status === "reservada"
              }
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isClosingOrder ? "Cerrando..." : "Cerrar orden → Caja"}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
