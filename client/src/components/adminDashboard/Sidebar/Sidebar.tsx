"use client";

import { useState } from "react";
import { Users, Calendar, UtensilsCrossed, BarChart3, ShoppingBag, Menu, X } from "lucide-react";
import styles from "./Sidebar.module.css";

const MENU_ITEMS = [
  { id: "employees", label: "Empleados", icon: Users },
  { id: "reservations", label: "Reservas", icon: Calendar },
  { id: "menu", label: "Menú", icon: UtensilsCrossed },
  { id: "metrics", label: "Métricas", icon: BarChart3 },
  { id: "orders", label: "Pedidos", icon: ShoppingBag },
];

export function Sidebar({ activeModule, onModuleChange }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarVisible : styles.sidebarHidden}`}>
        <div className="flex flex-col h-full">
          
          <div className={styles.header}>
            <h2 className="text-2xl font-bold text-orange-600">RestaurantOS</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Admin Panel</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { onModuleChange(id); setIsOpen(false); }}
                className={`${styles.navItem} ${activeModule === id ? styles.active : ""}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <footer className={styles.footer}>
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">A</div>
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