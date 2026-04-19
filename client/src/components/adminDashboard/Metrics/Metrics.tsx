"use client";

import { MetricCard } from "./MetricCard"
import styles from "./Metrics.module.css";
import { metrics, transactions } from "@/utils/cashierInfo";

export const Metrics = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Métricas y Transacciones</h2>
        <p>Monitorea el rendimiento del restaurante</p>
      </header>

      <div className={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className={styles.tableContainer}>
        <h3 className={styles.tableTitle}>Transacciones Recientes</h3>
        <div className={styles.scrollArea}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Método de Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className={styles.amount}>
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td>{transaction.date}</td>
                  <td>{transaction.method}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[transaction.status]}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};