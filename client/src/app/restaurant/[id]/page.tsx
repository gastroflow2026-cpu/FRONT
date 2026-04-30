"use client";

import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Star, MapPin, Utensils } from "lucide-react";
import { reservationSchema } from "@/validations/reservationSchema";
import { UsersContext } from "@/context/UsersContext";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import TableGrid from "@/components/features/table.grid";
import { ReservationsContext } from "@/context/ReservationsContext";
import { useTables } from "@/context/TablesContext";
import type { Table } from "@/context/TablesContext";
import dynamic from "next/dynamic";
import "react-chatbot-kit/build/main.css";
import ActionProvider from "@/chatbot/ActionProvider";
import MessageParser from "@/chatbot/MessageParser";
import config from "@/chatbot/config";

// SSR desactivado — evita el error "class constructors must be invoked with new"
const Chatbot = dynamic(
  () => import("react-chatbot-kit").then((m) => m.default),
  { ssr: false }
);

type PublicMenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  image_url?: string | null;
  allergens?: string | null;
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
};

type RestaurantDetailData = {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: string;
  image: string;
  about: string;
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
  [key: string]: any;
};

const RestaurantDetail = () => {
  const [categories, setCategories] = useState<PublicMenuCategory[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [restaurant, setRestaurant] = useState<RestaurantDetailData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const params = useParams();
  const { id } = params;
  const restaurantId = Array.isArray(id) ? id[0] : id;

  // ── Chatbot state ──────────────────────────────────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  const sessionId = useRef(
    "session_" + Math.random().toString(36).substr(2, 9)
  ).current;

  const chatConfig = {
    ...config,
    state: {
      ...config.state,
      restaurantId,
      sessionId,
    },
  };
  // ──────────────────────────────────────────────────────────────

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const { tables, loading: loadingTables, getTables } = useTables();

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
        const { data } = await axios.get<PublicMenuCategory[]>(
          `${API_URL}/menu/${restaurantId}/public`
        );
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

  // EFECTO 2: Carga de restaurante
  useEffect(() => {
    const buildLocation = (restaurantData: PublicRestaurantResponse) => {
      const cityCountry = [restaurantData.city, restaurantData.country]
        .filter((value): value is string => Boolean(value && value.trim()))
        .join(", ");
      if (cityCountry) return cityCountry;
      return restaurantData.address?.trim() || "-";
    };

    const fetchRestaurant = async () => {
      if (!API_URL || !restaurantId) {
        setRestaurant(null);
        setLoadingRestaurant(false);
        return;
      }
      try {
        const { data } = await axios.get<PublicRestaurantResponse[]>(
          `${API_URL}/restaurant/public/all`
        );
        if (!Array.isArray(data)) { setRestaurant(null); return; }

        const matchedRestaurant = data.find(
          (item) => item.id === restaurantId || item.slug === restaurantId
        );
        if (!matchedRestaurant) { setRestaurant(null); return; }

        const ratingValue = matchedRestaurant.rating;
        const normalizedRating =
          typeof ratingValue === "number"
            ? ratingValue.toFixed(1)
            : ratingValue?.toString().trim() || "-";

        setRestaurant({
          id: matchedRestaurant.id || restaurantId,
          name: matchedRestaurant.name?.trim() || "-",
          location: buildLocation(matchedRestaurant),
          category:
            matchedRestaurant.category?.trim() ||
            matchedRestaurant.description?.trim() ||
            "-",
          rating: normalizedRating,
          image:
            matchedRestaurant.image_url?.trim() ||
            matchedRestaurant.logo_url?.trim() ||
            FALLBACK_RESTAURANT_IMAGE,
          about:
            matchedRestaurant.about?.trim() ||
            matchedRestaurant.description?.trim() ||
            "Información del restaurante no disponible.",
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

  // EFECTO 3: Carga de mesas
  useEffect(() => {
    if (!restaurantId || !formValues.date) return;
    getTables(restaurantId, formValues.date, formValues.time);
  }, [restaurantId, formValues.date, formValues.time]);

  // EFECTO 4: Persistencia de datos
  useEffect(() => {
    const savedBookingData = localStorage.getItem("gastroflow_temp_booking");
    if (savedBookingData) {
      const parsedData = JSON.parse(savedBookingData);
      if (parsedData.restaurantId === restaurantId) {
        setFormValues((prev) => ({ ...prev, ...parsedData.bookingDetails }));
        console.log("Datos de reserva recuperados exitosamente");
        localStorage.removeItem("gastroflow_temp_booking");
      }
    }
  }, [restaurantId]);

  const validateField = async (name: string, value: any, allValues: any) => {
    try {
      await reservationSchema.validateAt(name, allValues);
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err: any) {
      setFormErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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

  const handleConfirmReservation = async () => {
    try {
      await reservationSchema.validate(formValues, { abortEarly: false });
      if (!isLogged) {
        const dataToSave = { restaurantId, bookingDetails: formValues };
        localStorage.setItem("gastroflow_temp_booking", JSON.stringify(dataToSave));
        router.push("/login");
      } else {
        const [year, month, day] = formValues.date.split("-");
        const formattedDate = `${day}/${month}/${year}`;
        Swal.fire({
          icon: "success",
          title: "¡Reserva Exitosa!",
          text: `Tu mesa para ${formValues.guests} personas el ${formattedDate} ha sido confirmada.`,
          confirmButtonText: "¡Buen provecho!",
          confirmButtonColor: "#ff7e5f",
        });
        console.log("Reserva válida enviando al backend:", formValues);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "No se pudo crear la reserva";
      console.warn("Error al crear reserva:", errorMessage);
      Swal.fire({
        icon: "error",
        title: "No se pudo confirmar la reserva",
        text: errorMessage,
        confirmButtonColor: "#ff7e5f",
      });
    }
  };

  if (loadingRestaurant)
    return <div className="p-10">Cargando restaurante...</div>;
  if (!restaurant)
    return <div className="p-10">Restaurante no encontrado</div>;

  const filteredTables = tables.filter(
    (t) =>
      t.capacity >= formValues.guests &&
      (t.status === "DISPONIBLE" || t.status === "RESERVADA") &&
      t.is_active
  );

  // ── Estilos del chatbot ────────────────────────────────────────
  const chatbotWrapperStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "24px",
    right: "16px",
    width: "350px",
    maxWidth: "calc(100vw - 32px)",
    zIndex: 9999,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    borderRadius: "16px",
    overflow: "hidden",
    display: isChatOpen ? "block" : "none",
  };

  const chatbotHeaderStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #f97316, #db2777)",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const headerBtnStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    borderRadius: "6px",
    color: "white",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  };

  const fabStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "24px",
    right: "16px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f97316, #db2777)",
    border: "none",
    cursor: "pointer",
    zIndex: 9999,
    display: isChatOpen ? "none" : "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
    fontSize: "24px",
    transition: "transform 0.15s ease",
  };
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ── Overrides CSS del kit ── */}
      <style>{`
        .react-chatbot-kit-chat-header {
          display: none !important;
        }
        .react-chatbot-kit-chat-container,
        .react-chatbot-kit-chat-inner-container,
        .react-chatbot-kit-chat-message-container,
        .react-chatbot-kit-chat-input-container,
        .react-chatbot-kit-chat-input-form {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .react-chatbot-kit-chat-input-container {
          display: flex !important;
        }
        .react-chatbot-kit-chat-input {
          flex: 1 !important;
          width: auto !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }
        .react-chatbot-kit-chat-btn-send {
          width: 56px !important;
          min-width: 56px !important;
          max-width: 56px !important;
          flex-shrink: 0 !important;
        }
      `}</style>

      <Navbar />

      <main className="grow pt-20">
        {/* Hero */}
        <section className="relative h-[40vh] w-full">
          <img
            src={restaurant.image}
            className="w-full h-full object-cover"
            alt={restaurant.name}
          />
          <div className="absolute inset-0 bg-black/40 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white">
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                  <Star size={16} className="text-orange-400 fill-orange-400" />{" "}
                  {restaurant.rating}
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

        {/* Contenido principal */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Columna Izquierda */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Sobre nosotros
              </h2>
              <p className="text-gray-600 leading-relaxed italic">
                {restaurant.about}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">Menú</h2>
              <p className="mb-4 text-xs text-amber-700">
                Algunos platos contienen ingredientes relevantes para personas
                con restricciones alimentarias.
              </p>

              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    !selectedCategory
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                <p className="py-10 text-center text-slate-500">
                  Cargando platos...
                </p>
              ) : (
                categories
                  .filter((category: PublicMenuCategory) =>
                    selectedCategory
                      ? category.category_id === selectedCategory
                      : true
                  )
                  .map((category: PublicMenuCategory) => {
                    if (!category.items?.length) return null;
                    return (
                      <div key={category.category_id} className="mb-8">
                        <h3 className="mb-4 text-xl font-semibold text-slate-800">
                          {category.category_name}
                        </h3>
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
                                  <h4 className="font-semibold text-slate-900">
                                    {item.name}
                                  </h4>
                                  <p className="mt-1 text-sm text-slate-600">
                                    {item.description || "Sin descripción"}
                                  </p>
                                  {!!item.allergens?.trim() && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {item.allergens
                                        .split(",")
                                        .map((allergen: string, index: number) => {
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
              <h3 className="mb-6 text-xl font-bold text-slate-900">
                Reserva tu mesa
              </h3>
              <div className="space-y-5">
                {/* Nombre */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    placeholder="Ej.: Juan Perez"
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.name ? "border-rose-500 focus:ring-rose-200" : "border-gray-200 focus:ring-gastro-coral bg-gray-50"}`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-rose-500">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    placeholder="juan@email.com"
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.email ? "border-rose-500 focus:ring-rose-200" : "border-gray-200 focus:ring-gastro-coral bg-gray-50"}`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-rose-500">{formErrors.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    placeholder="3515551234"
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.phone ? "border-rose-500 focus:ring-rose-200" : "border-gray-200 focus:ring-gastro-coral bg-gray-50"}`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-rose-500">{formErrors.phone}</p>
                  )}
                </div>

                {/* Fecha */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="date"
                    min={minReservationDate}
                    value={formValues.date}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.date ? "border-rose-500 focus:ring-rose-200" : "border-gray-200 focus:ring-gastro-coral bg-gray-50"}`}
                  />
                  {formErrors.date && (
                    <p className="mt-1 text-xs text-rose-500">{formErrors.date}</p>
                  )}
                </div>

                {/* Hora */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Hora
                  </label>
                  <select
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
                  {formErrors.time && (
                    <p className="mt-1 text-xs text-rose-500">{formErrors.time}</p>
                  )}
                </div>

                {/* Comensales */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Comensales
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => updateGuests(-1)}
                      className="h-10 w-10 rounded-lg bg-white shadow-sm font-bold text-slate-900 hover:text-gastro-coral"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-900">
                      {formValues.guests}{" "}
                      {formValues.guests === 1 ? "Persona" : "Personas"}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateGuests(1)}
                      className="h-10 w-10 rounded-lg bg-white shadow-sm font-bold text-slate-900 hover:text-gastro-coral"
                    >
                      +
                    </button>
                  </div>
                  {formErrors.guests && (
                    <p className="mt-1 text-xs text-rose-500">{formErrors.guests}</p>
                  )}
                </div>

                {/* Selección de mesa */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Selecciona tu mesa
                  </label>
                  {!formValues.date ? (
                    <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm text-slate-500">
                      Seleccioná una fecha para ver las mesas disponibles
                    </p>
                  ) : loadingTables ? (
                    <p className="text-center text-sm text-slate-500 py-4">
                      Cargando mesas...
                    </p>
                  ) : filteredTables.length === 0 ? (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-4 text-center text-sm text-amber-800">
                      No hay mesas disponibles para este restaurante en este momento.
                    </p>
                  ) : (
                    <TableGrid
                      tables={filteredTables}
                      selectedTableId={selectedTable?.id || null}
                      onTableSelect={setSelectedTable}
                    />
                  )}
                  {selectedTable && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-100 rounded-xl flex justify-between items-center">
                      <p className="text-orange-800 text-xs font-medium">
                        Has seleccionado la{" "}
                        <strong>Mesa {selectedTable.table_number}</strong>{" "}
                        (Capacidad: {selectedTable.capacity} personas)
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
                  disabled={!isFormValid}
                  className="w-full rounded-xl bg-linear-to-r from-orange-500 to-pink-600 py-4 font-bold text-white transition-all shadow-lg enabled:hover:scale-[1.02] disabled:opacity-50"
                >
                  Confirmar Reserva
                </button>
                <p className="text-[10px] text-center text-gray-400">
                  Recibirás confirmación inmediata por email.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ── FAB: visible cuando el chat está cerrado/minimizado ── */}
      <button
        onClick={() => setIsChatOpen(true)}
        style={fabStyle}
        aria-label="Abrir asistente"
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        💬
      </button>

      {/* ── Panel del chatbot ── */}
      <div style={chatbotWrapperStyle}>
        <div style={chatbotHeaderStyle}>
          <span style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>
            💬 Asistente GastroFlow
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setIsChatOpen(false)}
              style={headerBtnStyle}
              aria-label="Minimizar chat"
              title="Minimizar"
            >
              —
            </button>
            <button
              onClick={() => {
                setIsChatOpen(false);
                setChatKey((k) => k + 1);
              }}
              style={headerBtnStyle}
              aria-label="Cerrar chat"
              title="Cerrar y limpiar historial"
            >
              ✕
            </button>
          </div>
        </div>

        <Chatbot
          key={chatKey}
          config={chatConfig}
          actionProvider={ActionProvider}
          messageParser={MessageParser}
          placeholderText="Escribí tu mensaje..."
        />
      </div>
    </div>
  );
};

export default RestaurantDetail;