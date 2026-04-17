'use client';

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../assets/logo gastro f.webp'; 
import { UsersContext } from '@/context/UsersContext';
import { Search } from 'lucide-react'; 
import { ALL_RESTAURANTS } from '@/app/data/restaurants.data';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLogged, logoutUser } = useContext(UsersContext);
  const [mounted, setMounted] = useState(false);
  
  // Estados para la búsqueda global
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lógica de búsqueda en tiempo real
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    const filtered = ALL_RESTAURANTS.filter(res =>
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
  }, [searchTerm]);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#090b12]/95 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4">
          
          {/* LADO IZQUIERDO: LOGO */}
          <div className="shrink-0 flex items-center">
            <Link href="/">
              <Image 
                className="h-16 w-auto" 
                src={Logo} 
                alt="GastroFlow Logo" 
                width={150} 
                height={60}
                priority 
              />
            </Link>
          </div>

          {/* BUSCADOR GLOBAL (Centro-Escritorio) */}
          <div className="hidden lg:block relative grow max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar cocina o restaurante..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-orange-500/50 transition-all text-sm text-white placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Dropdown de Resultados */}
            {results.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-60">
                {results.map(res => (
                  <Link 
                    key={res.id} 
                    href={`/restaurant/${res.id}`}
                    onClick={() => setSearchTerm("")}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-none"
                  >
                    <img src={res.image} alt={res.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-sm text-white">{res.name}</p>
                      <p className="text-xs text-gray-400">{res.description} • {res.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* MENÚ CENTRAL / LINKS */}
          <div className="hidden md:flex space-x-6 shrink-0">
            <Link href="/" className="text-white hover:text-orange-400 font-medium transition duration-150 text-sm">
              Inicio
            </Link>
            <Link href="/restaurants" className="text-white hover:text-orange-400 font-medium transition duration-150 text-sm">
              Restaurantes
            </Link>
            <Link href="/reservations" className="text-white hover:text-orange-400 font-medium transition duration-150 text-sm">
              Mis Reservas
            </Link>
          </div>

          {/* LADO DERECHO: USUARIO */}
          <div className="hidden md:flex items-center space-x-4 shrink-0">
            {isLogged && mounted ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 text-sm">Hola, <span className="font-semibold text-white">{isLogged?.name}!</span></span>
                <button onClick={() => logoutUser()} className="text-gray-400 hover:text-white transition text-sm">
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button className="bg-transparent text-white px-5 py-2 rounded-full font-medium border border-gray-600 hover:bg-gray-900 transition duration-150 text-sm">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-5 py-2 rounded-full font-medium hover:opacity-90 transition duration-150 shadow-md text-sm">
                    Registrarse
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* BOTÓN MENÚ MÓVIL */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-orange-400 focus:outline-none">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isOpen && (
        <div className="border-t border-white/10 bg-[#090b12]/98 md:hidden">
          {/* Buscador móvil */}
          <div className="px-4 pt-4">
             <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block text-white hover:bg-gray-900 hover:text-orange-400 px-3 py-2 rounded-md font-medium">Inicio</Link>
            <Link href="/restaurants" className="block text-white hover:bg-gray-900 hover:text-orange-400 px-3 py-2 rounded-md font-medium">Restaurantes</Link>
            <Link href="/reservations" className="block text-white hover:bg-gray-900 hover:text-orange-400 px-3 py-2 rounded-md font-medium">Mis Reservas</Link>
          </div>

          <div className="px-5 py-4 border-t border-gray-800 flex flex-col space-y-3">
            {isLogged ? (
              <button onClick={() => logoutUser()} className="text-gray-400 hover:text-white transition w-full text-left px-3 py-2">
                Cerrar Sesión
              </button>
            ) : (
              <>
                <Link href="/login" className="w-full">
                  <button className="bg-transparent text-white px-6 py-2.5 rounded-full font-medium border border-gray-600 w-full">Iniciar Sesión</button>
                </Link>
                <Link href="/register" className="w-full">
                  <button className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-6 py-2.5 rounded-full font-medium w-full">Registrarse</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;