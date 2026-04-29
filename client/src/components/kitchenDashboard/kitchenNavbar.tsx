"use client";

import { useEffect, useRef, useState } from "react";
import { UtensilsCrossed, RefreshCw, ChevronDown, LogOut } from "lucide-react";

interface KitchenNavbarProps {
  restaurantName: string;
  chefName: string;
}

export default function KitchenNavbar({
  restaurantName,
  chefName,
}: KitchenNavbarProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const timer = setTimeout(() => {
    setMounted(true);
  }, 0);
  const interval = setInterval(() => setCurrentTime(new Date()), 1000);
  return () => {
    clearTimeout(timer);
    clearInterval(interval);
  };
}, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const initials = chefName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      {/* Logo + nombre restaurante */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500">
          <UtensilsCrossed size={18} className="text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-white text-sm">{restaurantName}</p>
          <p className="text-xs text-gray-400">Cocina</p>
        </div>
      </div>

      {/* Hora y fecha */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <RefreshCw size={14} className="text-gray-500" />
        {mounted ? (
          <>
            <span>{formattedTime}</span>
            <span className="text-gray-600">|</span>
            <span className="capitalize">{formattedDate}</span>
          </>
        ) : (
          <span className="text-gray-600">--:--:-- --</span>
        )}
      </div>

      {/* Usuario + menú desplegable */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 hover:bg-gray-800 rounded-lg px-2 py-1 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div className="leading-tight text-left">
            <p className="text-sm font-medium text-white">{chefName}</p>
            <p className="text-xs text-gray-400">Chef</p>
          </div>
          <ChevronDown
            size={14}
            className={`text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left"
            >
              <LogOut size={15} className="text-gray-400 shrink-0" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}