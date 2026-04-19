"use client";

import { ShoppingBag } from "lucide-react";
import styles from "./Orders.module.css";

export function Orders() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Gestión de Pedidos</h2>
        <p>Administra los pedidos en tiempo real</p>
      </header>

      <section className={styles.card}>
        <div className={styles.iconWrapper}>
          <ShoppingBag size={64} className={styles.icon} />
        </div>
        
        <h3 className={styles.title}>Próximamente Disponible</h3>
        
        <p className={styles.description}>
          El módulo de gestión de pedidos en tiempo real estará disponible pronto.
          Podrás visualizar, actualizar y gestionar todos los pedidos del restaurante.
        </p>
      </section>
    </div>
  );
}