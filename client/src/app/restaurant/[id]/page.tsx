"use client";

import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Star, MapPin, Utensils } from "lucide-react";
import { reservationSchema } from "@/validations/reservationSchema";
import { UsersContext } from "@/context/UsersContext";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { ValidationError } from "yup";
import TableGrid from "@/components/features/table.grid";
import { ReservationsContext } from "@/context/ReservationsContext";
import { useTables } from "@/context/TablesContext";
import type { Table } from "@/context/TablesContext";
import {
  buildHeadersWithRequestId,
  CRITICAL_OPERATION_TIMEOUT_MS,
  getOrCreateRequestId,
  logAsyncOperation,
} from "@/helpers/asyncOperations";
import { getToken } from "@/helpers/getToken";
import "react-chatbot-kit/build/main.css";
import ActionProvider from "@/chatbot/ActionProvider";
import MessageParser from "@/chatbot/MessageParser";
import config from "@/chatbot/config";

type PublicMenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  image_url?: string | null;
  allergens?: string | null;
};

type RestaurantLayoutMarkerType = "entrance" | "bathroom" | "kitchen";

type RestaurantLayoutMarker = {
  id: string;
  type: RestaurantLayoutMarkerType;
  layout_x: number;
  layout_y: number;
};

type PublicMenuCategory = {
  category_id: string;
  category_name: string;
  category_description?: string | null;
  display_order?: number;
  items: PublicMenuItem[];
};

type PublicRestaurantResponse = {
  id?: string;
  slug?: string | null;
  name?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
  logo_url?: string | null;
  rating?: number | string | null;
  about?: string | null;
  layout_markers?: RestaurantLayoutMarker[] | null;
};

type RestaurantDetailData = {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: string;
  image: string;
  about: string;
  layout_markers: RestaurantLayoutMarker[];
};

type ReservationFormValues = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
};

type ReservationFormErrors = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
};

type UserReservationLookup = {
  id: string;
  reservation_date?: string;
  start_time?: string;
  status?: string;
  table?: {
    id?: string;
    table_number?: number;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();
const FALLBACK_RESTAURANT_IMAGE =
  "https://res.cloudinary.com/dgzp5pfmp/image/upload/v1777002092/Pastas_portada_Bella_Vita_t43c1o.png";

type PublicRestaurant = {
  id: string;
  name: string;
  image?: string;
  logo_url?: string;
  rating?: number;
  city?: string;
  country?: string;
  description?: string;
  tables?: Table[];
  [key: string]: unknown;
};

const hasTableLayout = (table: Table) => typeof table.layout_x === "number" && typeof table.layout_y === "number";

const isPublicVisibleTable = (table: Table) =>
  table.is_active === true && table.is_visible !== false && hasTableLayout(table);

const isBlockedTable = (table: Table) => {
  const status = (table.status || "").toUpperCase();
  return status === "RESERVADA" || status === "OCUPADA" || !table.is_active;
};

const isSelectableTable = (table: Table) => isPublicVisibleTable(table) && !isBlockedTable(table);

const RestaurantDetail = () => {
  const [categories, setCategories] = useState<PublicMenuCategory[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [restaurant, setRestaurant] = useState<RestaurantDetailData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const params = useParams();
  const { id } = params;
  const restaurantId = Array.isArray(id) ? id[0] : id;
  //CHATBOT
  const sessionId = useRef("session_" + Math.random().toString(36).substr(2, 9)).current;

  const chatConfig = {
    ...config,
    state: {
      ...config.state,
      restaurantId,
      sessionId,
    },
  };

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [pendingSelectedTableId, setPendingSelectedTableId] = useState<string | null>(null);
  const { tables, loading: loadingTables, getTables } = useTables();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fecha mínima para el atributo 'min' del input date
  const today = new Date();
  const minReservationDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const FALLBACK_MENU_IMAGE = "";

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "12:00",
    guests: 2,
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
  });

  // EFECTO 1: Carga de Menú
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get<PublicMenuCategory[]>(`${API_URL}/menu/${restaurantId}/public`);
        setCategories(data);
      } catch (error) {
        console.warn("Error cargando menú:", error);
        setCategories([]);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenu();
  }, []);

  useEffect(() => {
    const buildLocation = (restaurantData: PublicRestaurantResponse) => {
      const cityCountry = [restaurantData.city, restaurantData.country]
        .filter((value): value is string => Boolean(value && value.trim()))
        .join(", ");

      if (cityCountry) {
        return cityCountry;
      }

      return restaurantData.address?.trim() || "-";
    };

    const fetchRestaurant = async () => {
      if (!API_URL || !restaurantId) {
        setRestaurant(null);
        setLoadingRestaurant(false);
        return;
      }

      try {
        const { data } = await axios.get<PublicRestaurantResponse[]>(`${API_URL}/restaurant/public/all`);

        if (!Array.isArray(data)) {
          setRestaurant(null);
          return;
        }

        const matchedRestaurant = data.find((item) => item.id === restaurantId || item.slug === restaurantId);

        if (!matchedRestaurant) {
          setRestaurant(null);
          return;
        }

        const ratingValue = matchedRestaurant.rating;
        const normalizedRating =
          typeof ratingValue === "number" ? ratingValue.toFixed(1) : ratingValue?.toString().trim() || "-";

        setRestaurant({
          id: matchedRestaurant.id || restaurantId,
          name: matchedRestaurant.name?.trim() || "-",
          location: buildLocation(matchedRestaurant),
          category: matchedRestaurant.category?.trim() || matchedRestaurant.description?.trim() || "-",
          rating: normalizedRating,
          image: matchedRestaurant.image_url?.trim() || matchedRestaurant.logo_url?.trim() || FALLBACK_RESTAURANT_IMAGE,
          about:
            matchedRestaurant.about?.trim() ||
            matchedRestaurant.description?.trim() ||
            "Información del restaurante no disponible.",
          layout_markers: matchedRestaurant.layout_markers ?? [],
        });
      } catch (error) {
        console.warn("Error cargando restaurante:", error);
        setRestaurant(null);
      } finally {
        setLoadingRestaurant(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  // EFECTO 2: Carga de mesas desde el back
  useEffect(() => {
    if (!restaurantId || !formValues.date) return; // ← no llama sin fecha
    getTables(restaurantId, formValues.date, formValues.time);
  }, [restaurantId, formValues.date, formValues.time]);

  // EFECTO 3: Persistencia de datos
  useEffect(() => {
    const savedBookingData = localStorage.getItem("gastroflow_temp_booking");
    if (savedBookingData) {
      const parsedData = JSON.parse(savedBookingData);
      // Solo restaurar si es para este restaurante
      if (parsedData.restaurantId === restaurantId) {
        setFormValues((prev) => ({ ...prev, ...parsedData.bookingDetails }));
        setPendingSelectedTableId(parsedData.selectedTableId ?? null);
        console.log("Datos de reserva recuperados exitosamente");
        // Limpiar LocalStorage inmediatamente después de restaurar
        localStorage.removeItem("gastroflow_temp_booking");
      }
    }
  }, [restaurantId]);

  // Handler para validar campos individuales con Yup
  const validateField = async (
    name: keyof ReservationFormValues,
    value: ReservationFormValues[keyof ReservationFormValues],
    allValues: ReservationFormValues,
  ) => {
    try {
      await reservationSchema.validateAt(name, allValues);
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error de validación";
      setFormErrors((prev) => ({ ...prev, [name]: message }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as keyof ReservationFormValues;
    const { value } = e.target;
    const updatedValues = { ...formValues, [name]: value };
    setFormValues(updatedValues);
    validateField(name, value, updatedValues);
  };

  const updateGuests = (delta: number) => {
    const newValue = Math.max(1, formValues.guests + delta);
    const updatedValues = { ...formValues, guests: newValue };
    setFormValues(updatedValues);
    validateField("guests", newValue, updatedValues);
  };

  // El formulario es válido si no hay errores y todos los campos obligatorios tienen valor

  const getMenuItemImage = (item: PublicMenuItem) => {
    return item.image_url?.trim() || FALLBACK_MENU_IMAGE;
  };

  const isFormValid =
    Object.values(formErrors).every((err) => err === "") &&
    formValues.name !== "" &&
    formValues.email !== "" &&
    formValues.phone !== "" &&
    formValues.date !== "";

  const router = useRouter();
  const { isLogged } = useContext(UsersContext);
  const { handleReservation } = useContext(ReservationsContext);

  const publicLayoutTables = useMemo(() => tables.filter(isPublicVisibleTable), [tables]);

  const filteredTables = useMemo(
    () => publicLayoutTables.filter((table) => table.capacity >= formValues.guests),
    [publicLayoutTables, formValues.guests],
  );

  const selectableTables = useMemo(() => filteredTables.filter(isSelectableTable), [filteredTables]);

  useEffect(() => {
    if (!selectedTable) return;

    const isStillSelectable = selectableTables.some((table) => table.id === selectedTable.id);

    if (!isStillSelectable) {
      setSelectedTable(null);
    }
  }, [selectedTable, selectableTables]);

  useEffect(() => {
    if (!pendingSelectedTableId) return;

    const restoredTable = selectableTables.find((table) => table.id === pendingSelectedTableId);

    if (restoredTable) {
      setSelectedTable(restoredTable);
      setPendingSelectedTableId(null);
      return;
    }

    if (!loadingTables && tables.length > 0) {
      setPendingSelectedTableId(null);
    }
  }, [loadingTables, pendingSelectedTableId, selectableTables, tables.length]);

  const verifyReservationCreated = async () => {
    if (!API_URL || !isLogged?.id || !selectedTable || !restaurantId) {
      return false;
    }

    const actionKey = `reservation:verify:${restaurantId}:${selectedTable.id}:${formValues.date}:${formValues.time}`;
    const requestId = getOrCreateRequestId(actionKey);
    const endpoint = `${API_URL}/users/${isLogged.id}/reservations`;
    const startedAt = performance.now();

    try {
      const token = getToken();
      const { data } = await axios.get<UserReservationLookup[]>(
        endpoint,
        {
          headers: buildHeadersWithRequestId(
            token ? { Authorization: `Bearer ${token}` } : undefined,
            requestId,
          ),
          timeout: CRITICAL_OPERATION_TIMEOUT_MS,
        },
      );

      logAsyncOperation({
        requestId,
        endpoint,
        durationMs: performance.now() - startedAt,
        ok: true,
      });

      const expectedDate = formValues.date;
      const expectedTableId = selectedTable.id;

      return data.some((reservation) => {
        const reservationDate = reservation.reservation_date?.slice(0, 10);
        const tableId = reservation.table?.id;
        const isMatchingDate = reservationDate === expectedDate;
        const isMatchingTable = tableId === expectedTableId;
        const isActiveStatus = reservation.status !== "CANCELADO";
        return isMatchingDate && isMatchingTable && isActiveStatus;
      });
    } catch {
      logAsyncOperation({
        requestId,
        endpoint,
        durationMs: performance.now() - startedAt,
        ok: false,
      });
      return false;
    }
  };

  const handleConfirmReservation = async () => {
    if (isSubmitting) return; 
    setIsSubmitting(true);

    void Swal.fire({
      title: "Procesando solicitud...",
      text: "Estamos gestionando tu reserva.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await reservationSchema.validate(formValues, { abortEarly: false });
      if (!restaurantId) return;

      if (!selectedTable) {
        Swal.close();
        Swal.fire({
          icon: "warning",
          title: "Selecciona una mesa",
          text: "Debes seleccionar una mesa disponible en el plano para continuar.",
          confirmButtonColor: "#ff7e5f",
        });
        return;
      }

      if (!isLogged) {
        const dataToSave = {
          restaurantId: restaurantId,
          bookingDetails: formValues,
          selectedTableId: selectedTable.id,
        };

        localStorage.setItem("gastroflow_temp_booking", JSON.stringify(dataToSave));
        router.push("/login");
        return;
      } else {
        const reservationPayload = {
          customer_name: formValues.name,
          customer_email: formValues.email,
          customer_phone: Number(formValues.phone),
          reservation_date: formValues.date,
          start_time: `${formValues.date}T${formValues.time}:00.000-03:00`,
          guests_count: formValues.guests,
          notes: "",
          table_id: selectedTable.id,
        };

        const result = await handleReservation(restaurantId, reservationPayload);

        if (result?.url) {
          window.location.href = result.url;
          return;
        }

        const wasReservationStored = await verifyReservationCreated();
        Swal.close();

        if (!wasReservationStored) {
          await Swal.fire({
            icon: "info",
            title: "Estamos verificando tu reserva",
            text: "No recibimos confirmación inmediata del pago. Revisa tu sección de reservas en unos segundos.",
            confirmButtonColor: "#ff7e5f",
          });
          return;
        }

        const [year, month, day] = formValues.date.split("-");
        const formattedDate = `${day}/${month}/${year}`;
        Swal.fire({
          icon: "success",
          title: "¡Reserva Exitosa!",
          text: `Tu mesa para ${formValues.guests} personas el ${formattedDate} ha sido confirmada.`,
          confirmButtonText: "¡Buen provecho!",
          confirmButtonColor: "#ff7e5f",
        });
      }
    } catch (err: unknown) {
      Swal.close();
      if (err instanceof ValidationError) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "No se pudo crear la reserva";
      Swal.fire({
        icon: "error",
        title: "No se pudo confirmar la reserva",
        text: errorMessage,
        confirmButtonColor: "#ff7e5f",
      });
    } finally{
      setIsSubmitting(false); 
    }
  };
  if (loadingRestaurant) return <div className="p-10">Cargando restaurante...</div>;
  if (!restaurant) return <div className="p-10">Restaurante no encontrado</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="grow pt-20">
        <section className="relative h-[40vh] w-full">
          <img src={restaurant.image} className="w-full h-full object-cover" alt={restaurant.name} />
          <div className="absolute inset-0 bg-black/40 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white">
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                  <Star size={16} className="text-orange-400 fill-orange-400" /> {restaurant.rating}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} /> {restaurant.location}
                </span>
                <span className="flex items-center gap-1">
                  <Utensils size={16} /> {restaurant.category}
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Columna Izquierda */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">Sobre nosotros</h2>
              <p className="text-gray-600 leading-relaxed italic">{restaurant.about}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">Menú</h2>
              <p className="mb-4 text-xs text-amber-700">
                Algunos platos contienen ingredientes relevantes para personas con restricciones alimentarias.
              </p>

              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    !selectedCategory ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Todas
                </button>
                {categories.map((cat: PublicMenuCategory) => (
                  <button
                    key={cat.category_id}
                    onClick={() => setSelectedCategory(cat.category_id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedCategory === cat.category_id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cat.category_name}
                  </button>
                ))}
              </div>

              {loadingMenu ? (
                <p className="py-10 text-center text-slate-500">Cargando platos...</p>
              ) : (
                categories
                  .filter((category: PublicMenuCategory) =>
                    selectedCategory ? category.category_id === selectedCategory : true,
                  )
                  .map((category: PublicMenuCategory) => {
                    if (!category.items?.length) return null;

                    return (
                      <div key={category.category_id} className="mb-8">
                        <h3 className="mb-4 text-xl font-semibold text-slate-800">{category.category_name}</h3>

                        <div className="space-y-4">
                          {category.items.map((item: PublicMenuItem) => (
                            <div
                              key={item.id}
                              className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 transition hover:border-gastro-coral md:flex-row md:items-center md:justify-between"
                            >
                              <div className="flex gap-4 group">
                                <div className="h-34 w-50 shrink-0 overflow-hidden rounded-xl border border-gray-200">
                                  <img
                                    src={getMenuItemImage(item)}
                                    alt={item.name}
                                    className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-175 group-hover:brightness-110"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = FALLBACK_MENU_IMAGE;
                                    }}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <h4 className="font-semibold text-slate-900">{item.name}</h4>

                                  <p className="mt-1 text-sm text-slate-600">{item.description || "Sin descripción"}</p>

                                  {!!item.allergens?.trim() && (
                                    <>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {item.allergens.split(",").map((allergen: string, index: number) => {
                                          const key = allergen.trim().toLowerCase();

                                          const allergenLabels: Record<string, string> = {
                                            gluten: "Gluten",
                                            lacteos: "Lácteos",
                                            huevo: "Huevo",
                                            sulfitos: "Sulfitos",
                                          };

                                          return (
                                            <span
                                              key={`${item.id}-allergen-${index}`}
                                              className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                                            >
                                              {allergenLabels[key] || allergen.trim()}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="font-bold text-slate-900 md:text-right">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 0,
                                })
                                  .format(Number(item.price))
                                  .replace("$", "US$")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Columna Derecha: Widget de Reserva */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <h3 className="mb-6 text-xl font-bold text-slate-900">Reserva tu mesa</h3>

              <div className="space-y-5">
                {/* Nombre */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    placeholder="Ej.: Juan Perez"
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.name ? "border-rose-500 focus:ring-rose-200" : "border-gray-200 focus:ring-gastro-coral bg-gray-50"}`}
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-rose-500">{formErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    placeholder="juan@email.com"
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.email ? "border-rose-500 focus:ring-rose-200" : "border-gray-200 focus:ring-gastro-coral bg-gray-50"}`}
                  />
                  {formErrors.email && <p className="mt-1 text-xs text-rose-500">{formErrors.email}</p>}
                </div>

                {/* Teléfono */}
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-900">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    placeholder="3515551234"
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.phone ? "border-rose-500 focus:ring-rose-200" : "border-gray-200 focus:ring-gastro-coral bg-gray-50"}`}
                  />
                  {formErrors.phone && <p className="mt-1 text-xs text-rose-500">{formErrors.phone}</p>}
                </div>

                {/* Fecha */}
                <div>
                  <label htmlFor="date" className="mb-2 block text-sm font-semibold text-slate-900">
                    Fecha
                  </label>
                  <input
                    id="date"
                    type="date"
                    name="date"
                    min={minReservationDate}
                    value={formValues.date}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.date ? "border-rose-500 focus:ring-rose-200" : "border-gray-200 focus:ring-gastro-coral bg-gray-50"}`}
                  />
                  {formErrors.date && <p className="mt-1 text-xs text-rose-500">{formErrors.date}</p>}
                </div>

                {/* Hora */}
                <div>
                  <label htmlFor="time" className="mb-2 block text-sm font-semibold text-slate-900">
                    Hora
                  </label>
                  <select
                    id="time"
                    aria-label="Seleccionar hora"
                    name="time"
                    value={formValues.time}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.time ? "border-rose-500 focus:ring-rose-200" : "border-gray-200 focus:ring-gastro-coral bg-gray-50"}`}
                  >
                    <option>12:00</option>
                    <option>12:30</option>
                    <option>13:00</option>
                    <option>13:30</option>
                    <option>14:00</option>
                    <option>14:30</option>
                    <option>15:00</option>
                    <option>20:00</option>
                    <option>21:00</option>
                    <option>22:00</option>
                    <option>23:00</option>
                  </select>
                  {formErrors.time && <p className="mt-1 text-xs text-rose-500">{formErrors.time}</p>}
                </div>

                {/* Comensales */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Comensales</label>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => updateGuests(-1)}
                      className="h-10 w-10 rounded-lg bg-white shadow-sm font-bold text-slate-900 hover:text-gastro-coral"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-900">
                      {formValues.guests} {formValues.guests === 1 ? "Persona" : "Personas"}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateGuests(1)}
                      className="h-10 w-10 rounded-lg bg-white shadow-sm font-bold text-slate-900 hover:text-gastro-coral"
                    >
                      +
                    </button>
                  </div>
                  {formErrors.guests && <p className="mt-1 text-xs text-rose-500">{formErrors.guests}</p>}
                </div>

                {/* Selección de mesa */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Selecciona tu mesa</label>
                  {!formValues.date ? (
                    <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm text-slate-500">
                      Seleccioná una fecha para ver las mesas disponibles
                    </p>
                  ) : loadingTables ? (
                    <p className="text-center text-sm text-slate-500 py-4">Cargando mesas...</p>
                  ) : publicLayoutTables.length === 0 ? (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-4 text-center text-sm text-amber-800">
                      Este restaurante aún no tiene mesas disponibles para seleccionar en el plano.
                    </p>
                  ) : filteredTables.length === 0 ? (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-4 text-center text-sm text-amber-800">
                      No hay mesas disponibles para este horario y cantidad de comensales.
                    </p>
                  ) : (
                    <TableGrid
                      tables={filteredTables}
                      markers={restaurant.layout_markers}
                      selectedTableId={selectedTable?.id || null}
                      onTableSelect={setSelectedTable}
                    />
                  )}
                  {selectedTable && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-100 rounded-xl flex justify-between items-center">
                      <p className="text-orange-800 text-xs font-medium">
                        Has seleccionado la <strong>Mesa {selectedTable.table_number}</strong> (Capacidad:{" "}
                        {selectedTable.capacity} personas)
                      </p>
                      <button
                        onClick={() => setSelectedTable(null)}
                        className="text-orange-600 text-xs underline font-bold"
                      >
                        Cambiar
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmReservation}
                  disabled={!isFormValid || isSubmitting}
                  className="w-full rounded-xl bg-linear-to-r from-orange-500 to-pink-600 py-4 font-bold text-white transition-all shadow-lg enabled:hover:scale-[1.02] disabled:opacity-50"
                >
                 {isSubmitting ? "Procesando..." : "Confirmar Reserva"}
                </button>
                <p className="text-[10px] text-center text-gray-400">Recibirás confirmación inmediata por email.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <div className="fixed bottom-6 right-6 w-87.5 z-9999 shadow-[0_8px_32px_rgba(0,0,0,0.18)] rounded-2xl overflow-hidden"></div>
    </div>
  );
};

export default RestaurantDetail;
