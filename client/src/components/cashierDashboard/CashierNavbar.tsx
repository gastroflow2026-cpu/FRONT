"use client";

import { useEffect, useState } from "react";
import { UtensilsCrossed, RefreshCw, Bell, ChevronDown } from "lucide-react";

interface CashierNavbarProps {
  restaurantName: string;
  cashierName: string;
  notificationCount?: number;
}

export default function CashierNavbar({
  restaurantName,
  cashierName,
  notificationCount = 0,
}: CashierNavbarProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
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

  const initials = cashierName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Logo + nombre restaurante */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-pink-500">
          <UtensilsCrossed size={18} className="text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-gray-800 text-sm">{restaurantName}</p>
          <p className="text-xs text-gray-400">Sistema de gestión</p>
        </div>
      </div>

      {/* Hora y fecha */}
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <RefreshCw size={14} className="text-gray-400" />
        <span>{formattedTime}</span>
        <span className="text-gray-300">|</span>
        <span className="capitalize">{formattedDate}</span>
      </div>

      {/* Notificaciones + usuario */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-500" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-800">{cashierName}</p>
            <p className="text-xs text-gray-400">Cajero</p>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </nav>
  );
}