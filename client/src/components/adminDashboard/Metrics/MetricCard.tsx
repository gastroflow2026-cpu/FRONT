"use client";

import styles from "./MetricCard.module.css";
import { MetricCardProps } from "@/types/Props/MetricCardProps";

export function MetricCard({ title, value, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value}</p>
        
        {trend && (
          <p className={`${styles.trend} ${trend.isPositive ? styles.positive : styles.negative}`}>
            {trend.isPositive ? "+" : ""}{trend.value}
          </p>
        )}
      </div>

      <div className={styles.iconWrapper}>
        <Icon size={24} className={styles.icon} />
      </div>
    </div>
  );
}