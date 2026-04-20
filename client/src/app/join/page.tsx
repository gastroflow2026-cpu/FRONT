'use client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import React, { useState } from 'react';
import { Check, X, Rocket, ShieldCheck, BarChart3, Users } from 'lucide-react';
import PricingTable from '@/components/features/pricing.table';

const JoinPage = () => {
  const [form, setForm] = useState({ name: '', location: '', email: '', plan: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.plan) return;
    setSubmitted(true);
  };

  return (
    <> <Navbar />
    <div className="pt-20 bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative py-20 overflow-hidden bg-[#090b12] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-linear-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Lleva tu restaurante al siguiente nivel
            </h1>
            <p className="text-lg text-gray-400 mb-10">
              Únete a la red de GastroFlow y optimiza tus reservas, gestiona tus comandas y conoce a tus clientes con métricas avanzadas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#planes" className="px-8 py-4 rounded-full bg-linear-to-r from-orange-500 to-pink-500 hover:opacity-90 font-bold transition-all shadow-lg shadow-orange-500/25">
                Ver Planes
              </a>
              <a href="#contacto" className="px-8 py-4 rounded-full border border-gray-700 hover:bg-gray-800 font-bold transition-all">
                Hablar con un asesor
              </a>
            </div>
          </div>
        </div>
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500 rounded-full blur-[120px]"></div>
        </div>
      </section>

      {/* 2. VALOR AGREGADO (Beneficios rápidos) */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
          <div className="flex gap-4">
            <div className="bg-orange-100 p-3 rounded-2xl h-fit text-orange-600">
              <Rocket size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Implementación veloz</h4>
              <p className="text-gray-500 text-sm">Configura tu menú y mesas en cuestión de minutos.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl h-fit text-blue-600">
              <BarChart3 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Control de métricas</h4>
              <p className="text-gray-500 text-sm">Visualiza tus ingresos y tiempos de cocina en tiempo real.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-purple-100 p-3 rounded-2xl h-fit text-purple-600">
              <Users size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Mejor Experiencia</h4>
              <p className="text-gray-500 text-sm">Brinda a tus comensales la facilidad de reservar desde su móvil.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TABLA DE PRECIOS (El componente que creamos) */}
      <div id="planes">
        <PricingTable />
      </div>

      {/* CTA REGISTRO */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-lg mb-6">
            ¿Ya te decidiste? Registra tu restaurante ahora y empieza a gestionar tus reservas, menú y métricas desde el primer día.
          </p>
          <a
            href="/register"
            className="inline-block px-10 py-4 rounded-full font-bold text-white bg-linear-to-r from-orange-500 to-pink-500 hover:opacity-90 transition-all shadow-lg shadow-orange-500/25 text-lg"
          >
            Impulsa tu restaurante
          </a>
        </div>
      </section>

      {/* 4. FORMULARIO DE CONTACTO */}
      <section id="contacto" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-slate-900">Consultas</h3>
              <p className="text-slate-500 mt-2">Completa el formulario y nos pondremos en contacto contigo.</p>
            </div>

            {submitted ? (
              <div className="text-center py-10">
                <p className="text-2xl font-bold text-slate-800 mb-2">¡Gracias, {form.name}!</p>
                <p className="text-slate-500">Recibimos tu solicitud del <span className="font-semibold text-orange-500">{form.plan === 'premium' ? 'Plan Premium' : 'Plan Básico'}</span>. Te contactaremos pronto.</p>
              </div>
            ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Nombre del Restaurante</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition-all" placeholder="Ej: La Bella Vita" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Ubicación</label>
                  <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition-all" placeholder="Ej: La Falda, Córdoba" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email de contacto</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition-all" placeholder="admin@restaurante.com" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Plan de interés</label>
                <select value={form.plan} onChange={e => setForm({...form, plan: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition-all bg-white text-slate-700" required>
                  <option value="">Seleccioná un plan</option>
                  <option value="basico">Plan Básico</option>
                  <option value="premium">Plan Premium</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-white bg-linear-to-r from-orange-500 to-pink-500 hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                Enviar Solicitud
              </button>
            </form>
            )}
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default JoinPage;