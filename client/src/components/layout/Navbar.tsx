"use client";

import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../assets/logo gastro f.webp";
import { UsersContext } from "@/context/UsersContext";
import { Search } from "lucide-react";
import {
  fetchAllPublicRestaurants,
  PublicRestaurantCardItem,
} from "@/utils/publicRestaurants";

type NavbarRestaurant = PublicRestaurantCardItem & {
  description: string;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLogged, logoutUser } = useContext(UsersContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState<NavbarRestaurant[]>([]);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isOwnerSession = useSyncExternalStore(
    () => () => {},
    () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return false;
      }

      try {
        const parsedUser = JSON.parse(storedUser) as { roles?: string[] };
        return parsedUser.roles?.includes("rest_admin") ?? false;
      } catch {
        return false;
      }
    },
    () => false,
  );

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

  const results = useMemo<NavbarRestaurant[]>(() => {
    if (searchTerm.trim() === "") {
      return [];
    }

    return restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [restaurants, searchTerm]);

  const hasValidOwnerSession = Boolean(
    isHydrated && isLogged && isOwnerSession,
  );
  const primaryUserRoute = hasValidOwnerSession ? "/admin" : "/reservations";
  const primaryUserLabel = hasValidOwnerSession
    ? "Dashboard Admin"
    : "Mis Reservas";
  const greetingName = hasValidOwnerSession
    ? `Owner ${isLogged?.name}`
    : isLogged?.name;
  const showAuthenticatedActions = Boolean(isHydrated && isLogged);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#090b12]/95 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex shrink-0 items-center">
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
              <div className="absolute top-full z-60 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#12141c] shadow-2xl">
                {results.map((restaurant) => (
                  <Link
                    key={restaurant.id}
                    href={`/restaurant/${restaurant.id}`}
                    onClick={() => setSearchTerm("")}
                    className="flex items-center gap-3 border-b border-white/5 p-3 transition-colors last:border-none hover:bg-white/5"
                  >
                    <img
                      src={restaurant.image ?? undefined}
                      alt={restaurant.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">
                        {restaurant.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {restaurant.description} • {restaurant.location}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="hidden shrink-0 space-x-6 md:flex">
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

          <div className="hidden shrink-0 items-center space-x-4 md:flex">
            {showAuthenticatedActions ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300">
                  Hola,{" "}
                  <span className="font-semibold text-white">
                    {greetingName}!
                  </span>
                </span>
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

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-orange-400 focus:outline-none"
            >
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-[#090b12]/98 md:hidden">
          <div className="px-4 pt-4">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 font-medium text-white hover:bg-gray-900 hover:text-orange-400"
            >
              Inicio
            </Link>
            <Link
              href="/restaurants"
              className="block rounded-md px-3 py-2 font-medium text-white hover:bg-gray-900 hover:text-orange-400"
            >
              Restaurantes
            </Link>
            <Link
              href={primaryUserRoute}
              className="block rounded-md px-3 py-2 font-medium text-white hover:bg-gray-900 hover:text-orange-400"
            >
              {primaryUserLabel}
            </Link>
          </div>

          <div className="flex flex-col space-y-3 border-t border-gray-800 px-5 py-4">
            {showAuthenticatedActions ? (
              <button
                onClick={() => logoutUser()}
                className="w-full px-3 py-2 text-left text-gray-400 transition hover:text-white"
              >
                Cerrar Sesión
              </button>
            ) : (
              <>
                <Link href="/login" className="w-full">
                  <button className="w-full rounded-full border border-gray-600 bg-transparent px-6 py-2.5 font-medium text-white">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/register" className="w-full">
                  <button className="w-full rounded-full bg-linear-to-r from-orange-500 to-pink-500 px-6 py-2.5 font-medium text-white">
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
