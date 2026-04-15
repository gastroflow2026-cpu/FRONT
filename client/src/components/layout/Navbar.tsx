'use client';

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Importamos el logo con fondo oscuro para este Navbar
import Logo from '../assets/logo gastro f.webp'; // Asegúrate de que este es el logo correcto
import { UsersContext } from '@/context/UsersContext';

const Navbar = () => {
  // Estado para el menú móvil
  const [isOpen, setIsOpen] = useState(false);
  const {isLogged, logoutUser} = useContext(UsersContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Mientras no está montado en el cliente, renderiza lo mismo que el servidor
 

  // Variable de prueba para logueado (cambia a true para probar ese estado)

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#090b12]/95 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* LADO IZQUIERDO: LOGO */}
          <div className="shrink-0 flex items-center">
            <Link href="/">
              <Image 
                className="h-16 w-auto" 
                src={Logo} 
                alt="GastroFlow Logo" 
                width={150} // Ajusta según el tamaño de tu imagen
                height={60}
                priority // Carga prioritaria para el logo
              />
            </Link>
          </div>

          {/* MENÚ CENTRAL (Escritorio) */}
          <div className="hidden md:flex space-x-8">
            {/* CAMBIO 2: Texto blanco por defecto (text-white) y naranja suave al hover */}
            <Link href="/" className="text-white hover:text-orange-400 font-medium transition duration-150">
              Inicio
            </Link>
            <Link href="/restaurants" className="text-white hover:text-orange-400 font-medium transition duration-150">
              Restaurantes
            </Link>
            <Link href="/reservas" className="text-white hover:text-orange-400 font-medium transition duration-150">
              Mis Reservas
            </Link>
          </div>

          {/* LADO DERECHO: BOTONES / USUARIO (Escritorio) */}
          <div className="hidden md:flex items-center space-x-4">
            {isLogged && mounted  ? (
              /* Renderizado si está LOGUEADO */
              <div className="flex items-center space-x-3">
                {/* CAMBIO 3: Texto de "Hola" en gris claro y nombre en blanco */}
                <span className="text-gray-300">Hola, <span className="font-semibold text-white">{isLogged?.name}!</span></span>
                <button onClick={ async () =>{logoutUser()} }  className="text-gray-400 hover:text-white transition">
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              /* Renderizado si NO está logueado */
              <>
                <Link href="/login">
                  {/* CAMBIO 4: Botón Login transparente, borde gris y texto blanco */}
                  <button className="bg-transparent text-white px-6 py-2.5 rounded-full font-medium border border-gray-600 hover:bg-gray-900 transition duration-150">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/register">
                  {/* Mantenemos tu degradado original, resalta mucho mejor ahora */}
                  <button className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition duration-150 shadow-md">
                    Registrarse
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* BOTÓN MENÚ MÓVIL */}
          <div className="md:hidden flex items-center">
            {/* CAMBIO 5: Icono del menú en blanco (text-white) */}
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

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {isOpen && (
        // CAMBIO 6: Fondo oscuro para el menú móvil también
        <div className="border-t border-white/10 bg-[#090b12]/98 md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* CAMBIO 7: Texto blanco para los links móviles */}
            <Link href="/" className="block text-white hover:bg-gray-900 hover:text-orange-400 px-3 py-2 rounded-md font-medium">Inicio</Link>
            <Link href="/restaurantes" className="block text-white hover:bg-gray-900 hover:text-orange-400 px-3 py-2 rounded-md font-medium">Restaurantes</Link>
            <Link href="/reservas" className="block text-white hover:bg-gray-900 hover:text-orange-400 px-3 py-2 rounded-md font-medium">Mis Reservas</Link>
          </div>
          {/* Botones móviles */}
          <div className="px-5 py-4 border-t border-gray-800 flex flex-col space-y-3">
            {isLogged ? (
              <button className="text-gray-400 hover:text-white transition w-full text-left px-3 py-2">
                Cerrar Sesión
              </button>
            ) : (
              <>
                <Link href="/login" className="w-full">
                  <button className="bg-transparent text-white px-6 py-2.5 rounded-full font-medium border border-gray-600 hover:bg-gray-900 transition duration-150 w-full">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/register" className="w-full">
                  <button className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition duration-150 w-full shadow-md">
                    Registrarse
                  </button>
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