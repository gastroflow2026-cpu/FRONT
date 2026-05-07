"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import Logo from "../assets/logo gastro f.webp";
import { UsersContext } from "@/context/UsersContext";
import { Search, UserCircle, Menu, X } from "lucide-react";

import {
  fetchAllPublicRestaurants,
  PublicRestaurantCardItem,
} from "@/utils/publicRestaurants";

type NavbarRestaurant = PublicRestaurantCardItem & {
  description: string;
};

const Navbar = () => {
  // =========================
  // ESTADOS DEL NAVBAR
  // =========================
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState<NavbarRestaurant[]>([]);

  // =========================
  // REFERENCIAS DEL MENÚ MOBILE
  // =========================
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  // =========================
  // CONTEXTO DE USUARIO
  // =========================
  const { isLogged, logoutUser } = useContext(UsersContext);

  // =========================
  // CARGA DE RESTAURANTES
  // =========================
  useEffect(() => {
    const loadRestaurants = async () => {
      const publicRestaurants = await fetchAllPublicRestaurants();

      const parsedRestaurants: NavbarRestaurant[] = publicRestaurants.map(
        (restaurant) => ({
          ...restaurant,
          description: restaurant.category || "-",
        }),
      );

      setRestaurants(parsedRestaurants);
    };

    loadRestaurants();
  }, []);

  // =========================
  // CERRAR MENÚ AL HACER CLICK FUERA
  // =========================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        isOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // =========================
  // FILTRADO DEL BUSCADOR
  // =========================
  const results = useMemo<NavbarRestaurant[]>(() => {
    if (searchTerm.trim() === "") return [];

    return restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [restaurants, searchTerm]);

  // =========================
  // VALIDACIÓN DE ROLES
  // =========================
  const hasPlatformSession = Boolean(isLogged?.roles?.includes("super_admin"));

  const hasValidOwnerSession =
    !hasPlatformSession && Boolean(isLogged?.roles?.includes("rest_admin"));

  const primaryUserRoute = hasPlatformSession
    ? "/platform/dashboard"
    : hasValidOwnerSession
      ? "/admin"
      : "/reservations";

  const primaryUserLabel = hasPlatformSession
    ? "Dashboard Platform"
    : hasValidOwnerSession
      ? "Dashboard Admin"
      : "Mis Reservas";

  const greetingName = hasPlatformSession
    ? isLogged?.name
    : hasValidOwnerSession
      ? `Owner ${isLogged?.name}`
      : isLogged?.name;

  const showAuthenticatedActions = Boolean(isLogged);

  // =========================
  // CERRAR MENÚ MOBILE
  // =========================
  const closeMobileMenu = () => {
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <>
      {/* =========================
          NAVBAR PRINCIPAL
      ========================= */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#090b12]/95 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* =========================
                LOGO
            ========================= */}
            <div className="flex shrink-0 items-center">
              <Link href="/" onClick={closeMobileMenu}>
                <Image
                  className="h-14 w-auto sm:h-16"
                  src={Logo}
                  alt="GastroFlow Logo"
                  width={150}
                  height={60}
                  priority
                />
              </Link>
            </div>

            {/* =========================
                BUSCADOR DESKTOP
            ========================= */}
            <div className="relative mx-4 hidden grow max-w-md lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  placeholder="Buscar cocina o restaurante..."
                  className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 transition-all focus:border-orange-500/50 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {results.length > 0 && (
                <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#12141c] shadow-2xl">
                  {results.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurant/${restaurant.id}`}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 border-b border-white/5 p-3 transition-colors last:border-none hover:bg-white/5"
                    >
                      <img
                        src={restaurant.image ?? undefined}
                        alt={restaurant.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {restaurant.name}
                        </p>

                        <p className="truncate text-xs text-gray-400">
                          {restaurant.description} • {restaurant.location}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* =========================
                LINKS DESKTOP
            ========================= */}
            <div className="hidden shrink-0 items-center gap-6 md:flex">
              <Link
                href="/"
                className="text-sm font-medium text-white transition duration-150 hover:text-orange-400"
              >
                Inicio
              </Link>

              <Link
                href="/restaurants"
                className="text-sm font-medium text-white transition duration-150 hover:text-orange-400"
              >
                Restaurantes
              </Link>

              <Link
                href={primaryUserRoute}
                className="text-sm font-medium text-white transition duration-150 hover:text-orange-400"
              >
                {primaryUserLabel}
              </Link>
            </div>

            {/* =========================
                ACCIONES DESKTOP
            ========================= */}
            <div className="hidden shrink-0 items-center gap-4 md:flex">
              {showAuthenticatedActions ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="group flex items-center gap-2"
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-gray-600 transition group-hover:border-white">
                      {isLogged?.imgUrl ? (
                        <Image
                          src={isLogged.imgUrl}
                          alt="Foto de perfil"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <UserCircle
                          size={32}
                          className="text-gray-400 transition group-hover:text-white"
                        />
                      )}
                    </div>

                    <span className="max-w-37.5 truncate text-sm text-gray-300">
                      Hola,{" "}
                      <span className="font-semibold text-white transition group-hover:text-orange-400">
                        {greetingName}!
                      </span>
                    </span>
                  </Link>

                  <button
                    onClick={() => logoutUser()}
                    className="text-sm text-gray-400 transition hover:text-white"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <button className="rounded-full border border-gray-600 bg-transparent px-5 py-2 text-sm font-medium text-white transition duration-150 hover:bg-gray-900">
                      Iniciar Sesión
                    </button>
                  </Link>

                  <Link href="/register">
                    <button className="rounded-full bg-linear-to-r from-orange-500 to-pink-500 px-5 py-2 text-sm font-medium text-white shadow-md transition duration-150 hover:opacity-90">
                      Registrarse
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* =========================
                BOTÓN HAMBURGUESA MOBILE
            ========================= */}
            <div className="flex items-center md:hidden">
              <button
                ref={mobileButtonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-xl border border-white/10 p-2 text-white transition hover:border-orange-400 hover:text-orange-400"
                aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* =========================
            MENÚ MOBILE
        ========================= */}
        {isOpen && (
          <div
            ref={mobileMenuRef}
            className="relative z-50 max-h-[calc(100vh-80px)] overflow-y-auto border-t border-white/10 bg-[#090b12] md:hidden"
          >
            {/* =========================
                BUSCADOR MOBILE
            ========================= */}
            <div className="px-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  placeholder="Buscar restaurante..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {results.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#12141c]">
                  {results.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurant/${restaurant.id}`}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 border-b border-white/5 p-3 last:border-none hover:bg-white/5"
                    >
                      <img
                        src={restaurant.image ?? undefined}
                        alt={restaurant.name}
                        className="h-11 w-11 rounded-lg object-cover"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {restaurant.name}
                        </p>

                        <p className="truncate text-xs text-gray-400">
                          {restaurant.description} • {restaurant.location}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* =========================
                LINKS MOBILE
            ========================= */}
            <div className="space-y-1 px-4 pb-3 pt-4">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="block rounded-xl px-4 py-3 font-medium text-white transition hover:bg-white/5 hover:text-orange-400"
              >
                Inicio
              </Link>

              <Link
                href="/restaurants"
                onClick={closeMobileMenu}
                className="block rounded-xl px-4 py-3 font-medium text-white transition hover:bg-white/5 hover:text-orange-400"
              >
                Restaurantes
              </Link>

              <Link
                href={primaryUserRoute}
                onClick={closeMobileMenu}
                className="block rounded-xl px-4 py-3 font-medium text-white transition hover:bg-white/5 hover:text-orange-400"
              >
                {primaryUserLabel}
              </Link>
            </div>

            {/* =========================
                ACCIONES MOBILE
            ========================= */}
            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4">
              {showAuthenticatedActions ? (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3"
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-600">
                      {isLogged?.imgUrl ? (
                        <Image
                          src={isLogged.imgUrl}
                          alt="Foto de perfil"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <UserCircle size={40} className="text-gray-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Usuario</p>

                      <p className="truncate text-sm font-semibold text-white">
                        {greetingName}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      logoutUser();
                      closeMobileMenu();
                    }}
                    className="w-full rounded-full border border-gray-700 px-6 py-3 text-left font-medium text-gray-300 transition hover:border-white hover:text-white"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="w-full"
                  >
                    <button className="w-full rounded-full border border-gray-600 bg-transparent px-6 py-3 font-medium text-white transition hover:bg-gray-900">
                      Iniciar Sesión
                    </button>
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="w-full"
                  >
                    <button className="w-full rounded-full bg-linear-to-r from-orange-500 to-pink-500 px-6 py-3 font-medium text-white shadow-md transition hover:opacity-90">
                      Registrarse
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* =========================
          OVERLAY MOBILE
          Bloquea clicks sobre botones de la página principal
      ========================= */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
