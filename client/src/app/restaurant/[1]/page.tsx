"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Star, MapPin, Utensils } from "lucide-react";
import { reservationSchema } from "@/validations/reservationSchema";
import { UsersContext } from "@/context/UsersContext";
import { useRouter } from 'next/navigation';
import Swal from "sweetalert2";

const RestaurantDetail = () => {
  
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const params = useParams();
  const { id } = params;

  

  // Fecha mínima para el atributo 'min' del input date
  const today = new Date();
  const minReservationDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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

  // EFECTO 2: Persistencia de datos - Recuperar si existen
  useEffect(() => {
    const savedBookingData = localStorage.getItem('gastroflow_temp_booking');
    if (savedBookingData) {
      const parsedData = JSON.parse(savedBookingData);
      // Solo restaurar si es para este restaurante
      if (parsedData.restaurantId === id) {
        setFormValues(prev => ({ ...prev, ...parsedData.bookingDetails }));
        console.log("Datos de reserva recuperados exitosamente");
        // Limpiar LocalStorage inmediatamente después de restaurar
        localStorage.removeItem('gastroflow_temp_booking');
      }
    }
  }, [id]);

  // Handler para validar campos individuales con Yup
  const validateField = async (name: string, value: any, allValues: any) => {
    try {
      await reservationSchema.validateAt(name, allValues);
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (err: any) {
      setFormErrors((prev) => ({ ...prev, [name]: err.message }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  // El formulario es válido si no hay errores y todos los campos obligatorios tienen valor
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
      // Validar formulario completo con Yup
      await reservationSchema.validate(formValues, { abortEarly: false });
      
      if (!isLogged) {
        // Si NO está logueado, guardar datos en LocalStorage y redirigir a login
        console.log("Usuario no logueado, guardando datos temporalmente");
        const dataToSave = {
          restaurantId: id,
          bookingDetails: formValues
        };
        localStorage.setItem('gastroflow_temp_booking', JSON.stringify(dataToSave));
        router.push('/login');
      } else {
        // Si ESTÁ logueado, mostrar alerta de éxito
        Swal.fire({
          icon: "success",
          title: "¡Reserva Exitosa!",
          text: `Tu mesa para ${formValues.guests} personas el ${formValues.date} ha sido confirmada.`,
          confirmButtonText: "¡Buen provecho!",
          confirmButtonColor: "#ff7e5f"
        });
        // Aquí iría la lógica de axios.post al backend para crear la reserva
        console.log("Reserva válida enviando al backend:", formValues);
      }
    } catch (err: any) {
      console.error("Error de validación final:", err.errors ?? err.message);
      // SweetAlert para mostrar la validación general
      Swal.fire({
        icon: "error",
        title: "Formulario incompleto",
        text: "Por favor verifica que todos los campos sean válidos",
        confirmButtonColor: "#ff7e5f"
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="grow pt-20">
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
                  <Star size={16} className="text-orange-400 fill-orange-400" /> 4.8
                </span>
                <span className="flex items-center gap-1"><MapPin size={16} /> Palermo, CABA</span>
                <span className="flex items-center gap-1"><Utensils size={16} /> Italiana</span>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Columna Izquierda */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">Sobre nosotros</h2>
              <p className="text-gray-600 leading-relaxed italic">
                "La Bella Vita ofrece una experiencia italiana auténtica en el corazón de Palermo. Con pastas amasadas a mano y recetas transmitidas por generaciones, cada plato es un viaje a las raíces de Italia."
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">Menú</h2>
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${!selectedCategory ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >Todas</button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === cat.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >{cat.name}</button>
                ))}
              </div>

              {loadingMenu ? (
                <p className="text-slate-500 text-center py-10">Cargando platos...</p>
              ) : (
                categories.filter(c => selectedCategory ? c.id === selectedCategory : true).map(category => {
                  const items = menuItems.filter(i => i.category?.id === category.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={category.id} className="mb-8">
                      <h3 className="mb-4 text-xl font-semibold text-slate-800">{category.name}</h3>
                      <div className="space-y-4">
                        {items.map(item => (
                          <div key={item.id} className="flex justify-between gap-4 rounded-xl border border-gray-200 p-4 transition-hover hover:border-gastro-coral">
                            <div>
                              <h4 className="font-semibold text-slate-900">{item.name}</h4>
                              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                            </div>
                            <div className="font-bold text-slate-900">
                              {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(item.price)}
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
                  <input type="text" name="name" value={formValues.name} onChange={handleInputChange} placeholder="Ej.: Juan Perez"
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.name ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-gastro-coral bg-gray-50'}`} />
                  {formErrors.name && <p className="mt-1 text-xs text-rose-500">{formErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Email</label>
                  <input type="email" name="email" value={formValues.email} onChange={handleInputChange} placeholder="juan@email.com"
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.email ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-gastro-coral bg-gray-50'}`} />
                  {formErrors.email && <p className="mt-1 text-xs text-rose-500">{formErrors.email}</p>}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Teléfono</label>
                  <input type="tel" name="phone" value={formValues.phone} onChange={handleInputChange} placeholder="3515551234"
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.phone ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-gastro-coral bg-gray-50'}`} />
                  {formErrors.phone && <p className="mt-1 text-xs text-rose-500">{formErrors.phone}</p>}
                </div>

                {/* Fecha */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Fecha</label>
                  <input type="date" name="date" min={minReservationDate} value={formValues.date} onChange={handleInputChange}
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.date ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-gastro-coral bg-gray-50'}`} />
                  {formErrors.date && <p className="mt-1 text-xs text-rose-500">{formErrors.date}</p>}
                </div>

                {/* Hora */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Hora</label>
                  <select name="time" value={formValues.time} onChange={handleInputChange}
                    className={`w-full rounded-xl border p-3 focus:outline-none focus:ring-2 transition-all ${formErrors.time ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-gastro-coral bg-gray-50'}`}>
                    <option>12:00</option><option>12:30</option><option>13:00</option><option>13:30</option>
                    <option>14:00</option><option>14:30</option><option>15:00</option><option>20:00</option>
                    <option>21:00</option><option>22:00</option><option>23:00</option>
                  </select>
                  {formErrors.time && <p className="mt-1 text-xs text-rose-500">{formErrors.time}</p>}
                </div>

                {/* Comensales */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">Comensales</label>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <button type="button" onClick={() => updateGuests(-1)} className="h-10 w-10 rounded-lg bg-white shadow-sm font-bold text-slate-900 hover:text-gastro-coral">-</button>
                    <span className="font-bold text-slate-900">{formValues.guests} {formValues.guests === 1 ? "Persona" : "Personas"}</span>
                    <button type="button" onClick={() => updateGuests(1)} className="h-10 w-10 rounded-lg bg-white shadow-sm font-bold text-slate-900 hover:text-gastro-coral">+</button>
                  </div>
                  {formErrors.guests && <p className="mt-1 text-xs text-rose-500">{formErrors.guests}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmReservation}
                  disabled={!isFormValid}
                  className="w-full rounded-xl bg-linear-to-r from-orange-500 to-pink-600 py-4 font-bold text-white transition-all shadow-lg enabled:hover:scale-[1.02] disabled:opacity-50"
                >Confirmar Reserva</button>
                <p className="text-[10px] text-center text-gray-400">Recibirás confirmación inmediata por email.</p>
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