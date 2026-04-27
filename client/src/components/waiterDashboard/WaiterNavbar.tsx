"use client";

import { useContext, useEffect, useState } from "react";
import { UtensilsCrossed, Bell, LogOut } from "lucide-react";
import { UsersContext } from "@/context/UsersContext";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface WaiterNavbarProps {
  restaurantName: string;
  waiterName: string;
  notificationCount?: number;
}

export default function WaiterNavbar({
  restaurantName,
  waiterName,
  notificationCount = 0,
}: WaiterNavbarProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const { logoutUser } = useContext(UsersContext);
  const router = useRouter();

  async function handleLogout() {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Vas a salir del panel del mozo.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
    });
    if (result.isConfirmed) {
      logoutUser();
      router.push("/login");
    }
  }

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

  const initials = waiterName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="bg-[#0b0f1a] border-b border-white/10 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-linear-to-br from-orange-500 to-pink-500">
          <UtensilsCrossed size={18} className="text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-white text-sm">{restaurantName}</p>
          <p className="text-xs text-gray-400">Panel del mozo</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span>{formattedTime}</span>
        <span className="text-white/20">|</span>
        <span className="capitalize">{formattedDate}</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Bell size={18} className="text-gray-400" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">{waiterName}</p>
            <p className="text-xs text-gray-400">Mozo</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
