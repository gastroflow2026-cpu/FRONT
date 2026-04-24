"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, UtensilsCrossed, BarChart3, ShoppingBag, Menu, X, Settings } from "lucide-react";
import styles from "./Sidebar.module.css";
import { getToken } from "@/helpers/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const MENU_ITEMS = [
  { id: "employees", label: "Empleados", icon: Users },
  { id: "reservations", label: "Reservas", icon: Calendar },
  { id: "menu", label: "Menú", icon: UtensilsCrossed },
  { id: "metrics", label: "Métricas", icon: BarChart3 },
  { id: "orders", label: "Pedidos", icon: ShoppingBag },
  { id: "settings", label: "Configuración", icon: Settings },
];

interface SidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
}

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState("Mi Restaurante");

  useEffect(() => {
    const loadRestaurantName = async () => {
      const storedRestaurantName = localStorage.getItem("restaurantName");

      if (storedRestaurantName) {
        setRestaurantName(storedRestaurantName);
      }

      if (!API_URL) {
        return;
      }

      const token = getToken();

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/restaurant/profile`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { name?: string };

        if (!data.name) {
          return;
        }

        localStorage.setItem("restaurantName", data.name);
        setRestaurantName(data.name);
      } catch {
        // Si el backend no responde, mantenemos el nombre disponible en storage.
      }
    };

    loadRestaurantName();
  }, []);

  return (
    <>
      <button className={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarVisible : styles.sidebarHidden}`}>
        <div className="flex flex-col h-full">
          <div className={styles.header}>
            <h2 className="text-2xl font-bold text-orange-600">{restaurantName}</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Admin Panel</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onModuleChange(id);
                  setIsOpen(false);
                }}
                className={`${styles.navItem} ${activeModule === id ? styles.active : ""}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <footer className={styles.footer}>
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-gray-800">Administrador</p>
              <p className="text-xs text-gray-500 truncate">admin@rest.com</p>
            </div>
          </footer>
        </div>
      </aside>
    </>
  );
}
