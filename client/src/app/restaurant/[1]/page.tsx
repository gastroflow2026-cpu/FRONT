"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Star, MapPin, Utensils } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RestaurantDetail = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const params = useParams();
  const { id } = params;
  const today = new Date();
  const minReservationDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "12:00 PM",
    guests: 2,
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
  });

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          axios.get("http://localhost:3000/menu/categories"),
          axios.get("http://localhost:3000/menu/items?view=public"),
        ]);

        setCategories(categoriesRes.data);
        setMenuItems(itemsRes.data);
      } catch (error) {
        console.error("Error cargando menú:", error);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenu();
  }, []);

  const validateName = (value: string) => {
    if (!value.trim()) {
      return "Ingresa tu nombre.";
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
      return "El nombre no puede contener números ni símbolos.";
    }

    return "";
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Ingresa tu email.";
    }

    if (!EMAIL_REGEX.test(value)) {
      return "Ingresa un email válido.";
    }

    return "";
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) {
      return "Ingresa tu teléfono.";
    }
    if (!/^\d+$/.test(value)) {
      return 'El teléfono debe contener solo números.';
    }
    if (value.length !== 10) {
      return 'El teléfono debe tener exactamente 10 números.';
    }
    return '';
  };

  const validateDate = (value: string, timeValue?: string) => {
  if (!value) {
    return 'Selecciona una fecha.';
  }
  if (value < minReservationDate) {
    return 'No se puede reservar en fechas pasadas.';
  }
  // Validar hora si la fecha es hoy
  if (value === minReservationDate && timeValue) {
    const match = timeValue.match(/(\d+):(\d+) (AM|PM)/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const ampm = match[3];
      if (ampm && ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (ampm && ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
      const selectedTotal = hour * 60 + minute;
      const now = new Date();
      const nowTotal = now.getHours() * 60 + now.getMinutes();
      if (selectedTotal <= nowTotal) {
        return 'No se puede reservar en una hora pasada.';
      }
    }
  }
  return '';
};

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = event.target.value.replace(
      /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
      "",
    );

    setFormValues((currentValues) => ({
      ...currentValues,
      name: sanitizedValue,
    }));
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      name: validateName(sanitizedValue),
    }));
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    setFormValues((currentValues) => ({
      ...currentValues,
      email: nextValue,
    }));
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      email: nextValue ? validateEmail(nextValue) : "",
    }));
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = event.target.value.replace(/\D/g, "");

    setFormValues((currentValues) => ({
      ...currentValues,
      phone: sanitizedValue,
    }));
    // Validación en tiempo real
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      phone: validatePhone(sanitizedValue),
    }));
  };



  const handleBlur = (field: 'name' | 'email' | 'phone' | 'date' | 'time') => {
  const validators = {
    name: validateName,
    email: validateEmail,
    phone: validatePhone,
    date: (v: string) => validateDate(v, formValues.time),
    time: (v: string) => validateDate(formValues.date, v),
  };
  setFormErrors((currentErrors) => ({
    ...currentErrors,
    [field]: validators[field](formValues[field]),
  }));
};

  const updateGuests = (delta: number) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      guests: Math.max(1, currentValues.guests + delta),
    }));
  };

  const isFormValid =
  !validateName(formValues.name) &&
  !validateEmail(formValues.email) &&
  !validatePhone(formValues.phone) &&
  Boolean(formValues.date) &&
  !validateDate(formValues.date, formValues.time);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="grow pt-20">
        {/* Banner del Restaurante */}
        <section className="relative h-[40vh] w-full">
          <img 
            src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop" 
            className="w-full h-full object-cover"
            alt="Restaurante"
          />
          <div className="absolute inset-0 bg-black/40 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">La Bella Vita {id}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white">
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                  <Star size={16} className="text-orange-400 fill-orange-400" />{" "}
                  4.8
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} /> Palermo, CABA
                </span>
                <span className="flex items-center gap-1">
                  <Utensils size={16} /> Italiana
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Contenido Principal */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Columna Izquierda: Información y Menú */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Sobre nosotros
              </h2>
              <p className="text-gray-600 leading-relaxed">
                La Bella Vita ofrece una experiencia italiana auténtica en el corazón de Palermo. Con pastas amasadas a mano y recetas transmitidas por generaciones, cada plato es un viaje a las raíces de Italia.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">Menú</h2>

              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedCategory === null
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Todas
                </button>

                {categories.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedCategory === category.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Algunos platos pueden contener gluten, lácteos u otros
                alérgenos. Revisa las etiquetas de cada plato antes de ordenar.
              </div>

              {loadingMenu ? (
                <p className="text-slate-500">Cargando menú...</p>
              ) : (
                categories
                  .filter((category: any) =>
                    selectedCategory ? category.id === selectedCategory : true,
                  )
                  .map((category: any) => {
                    const itemsByCategory = menuItems.filter(
                      (item: any) => item.category?.id === category.id,
                    );

                    if (itemsByCategory.length === 0) return null;

                    return (
                      <div key={category.id} className="mb-8">
                        <h3 className="mb-4 text-xl font-semibold text-slate-800">
                          {category.name}
                        </h3>

                        <div className="space-y-4">
                          {itemsByCategory.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex justify-between gap-4 rounded-xl border border-gray-200 p-4"
                            >
                              <div>
                                <h4 className="font-semibold text-slate-900">
                                  {item.name}
                                </h4>

                                {item.description && (
                                  <p className="mt-1 text-sm text-slate-600">
                                    {item.description}
                                  </p>
                                )}

                                {(item.tags || item.allergens) && (
                                  <div className="mt-3 space-y-2">
                                    {item.tags && (
                                      <div className="flex flex-wrap gap-2">
                                        {item.tags
                                          .split(",")
                                          .map((tag: string) => (
                                            <span
                                              key={tag}
                                              className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                                            >
                                              {tag.trim()}
                                            </span>
                                          ))}
                                      </div>
                                    )}

                                    {item.allergens && (
                                      <div>
                                        <p className="mb-1 text-xs font-semibold text-red-600">
                                          Contiene:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {item.allergens
                                            .split(",")
                                            .map((allergen: string) => (
                                              <span
                                                key={allergen}
                                                className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700"
                                              >
                                                {allergen.trim()}
                                              </span>
                                            ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="font-bold text-slate-900">
                                {new Intl.NumberFormat("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                  maximumFractionDigits: 0,
                                }).format(Number(item.price))}
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

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formValues.name}
                    onChange={handleNameChange}
                    onBlur={() => handleBlur("name")}
                    placeholder="Ej.: Juan Perez"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gastro-coral transition-all"
                  />
                  {formErrors.name && (
                    <p className="mt-2 text-sm text-rose-500">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formValues.email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur("email")}
                    placeholder="Ej.: juan@email.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gastro-coral transition-all"
                  />
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-rose-500">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formValues.phone}
                    onChange={handlePhoneChange}
                    onBlur={() => handleBlur("phone")}
                    placeholder="Ej.: 3515551234"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gastro-coral transition-all"
                  />
                  {formErrors.phone && (
                    <p className="mt-2 text-sm text-rose-500">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Fecha
                  </label>
                  <input
                    type="date"
                    aria-label="Fecha de reserva"
                    min={minReservationDate}
                    value={formValues.date}
                    onChange={(event) =>
                      setFormValues((currentValues) => ({
                        ...currentValues,
                        date: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gastro-coral transition-all"
                  />
                </div>

                {/* Selección de Hora */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Hora
                  </label>
                  <select
                    aria-label="Hora de reserva"
                    value={formValues.time}
                    onChange={(event) =>
                      setFormValues((currentValues) => ({
                        ...currentValues,
                        time: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gastro-coral transition-all"
                  >
                    <option>12:00 PM</option>
                    <option>12:30 PM</option>
                    <option>13:00 PM</option>
                    <option>13:30 PM</option>
                    <option>14:00 PM</option>
                    <option>14:30 PM</option>
                    <option>15:00 PM</option>
                    <option>20:00 PM</option>
                    <option>20:30 PM</option>
                    <option>21:00 PM</option>
                    <option>21:30 PM</option>
                    <option>22:00 PM</option>
                    <option>22:30 PM</option>
                    <option>23:00 PM</option>
                    <option>23:30 PM</option>
                  </select>
                </div>

                {/* Cantidad de Personas */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Comensales
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => updateGuests(-1)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-bold text-slate-900 shadow-sm hover:text-gastro-coral"
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
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-bold text-slate-900 shadow-sm hover:text-gastro-coral"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!isFormValid}
                  className="w-full rounded-xl bg-linear-to-r from-gastro-coral to-gastro-magenta py-4 font-bold text-white transition-all shadow-lg shadow-orange-200 enabled:hover:scale-[1.02] enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  Confirmar Reserva
                </button>

                <p className="text-xs text-center text-gray-400">
                  Recibirás una confirmación inmediata por email. <br />
                  (puede que la reserva solicite una seña para ser confirmada,
                  dependiendo del restaurante)
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
