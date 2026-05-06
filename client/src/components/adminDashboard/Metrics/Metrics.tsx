"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Clock3,
  DollarSign,
  RefreshCw,
  ShoppingCart,
  Ticket,
  Users,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import styles from "./Metrics.module.css";
import {
  adminMetricsService,
  AvgOrderTimeMetric,
  DayOfWeekSale,
  MetricsPeriod,
  MetricsSales,
  MetricsSummary,
  OrderStatusMetric,
  ReservationsTodayMetric,
  StaffPerformanceMetric,
  TableOccupancyMetric,
  TopMenuItemMetric,
} from "@/services/adminMetricsService";

type MetricsViewPeriod = MetricsPeriod | "custom";

const PERIOD_LABELS: Record<MetricsPeriod, string> = {
  day: "Hoy",
  week: "Semana",
  month: "Mes",
};

const EXTENDED_PERIOD_LABELS: Record<MetricsViewPeriod, string> = {
  ...PERIOD_LABELS,
  custom: "Rango personalizado",
};

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  EFECTIVO: "#16a34a",
  TARJETA: "#2563eb",
  TRANSFERENCIA: "#7c3aed",
  QR: "#d97706",
  UNKNOWN: "#6b7280",
};

const formatMoney = (value: number) =>
  `$${Number(value || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateLabel = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getDeltaText = (value: number) => `${Math.abs(value).toFixed(1)}%`;

const calculateDelta = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
};

const addDays = (date: string, days: number) => {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
};

const getDateRange = (from: string, to: string) => {
  const values: string[] = [];
  let cursor = from;

  while (cursor <= to) {
    values.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return values;
};

const aggregateSummaryByDay = (items: MetricsSummary[]) => {
  const totalSales = items.reduce((acc, item) => acc + (item.totalSales || 0), 0);
  const orderCount = items.reduce((acc, item) => acc + (item.orderCount || 0), 0);
  const avgTicket = orderCount > 0 ? totalSales / orderCount : 0;
  return { totalSales, orderCount, avgTicket };
};

const aggregateSalesByDay = (items: MetricsSales[]) => {
  const paymentMap = new Map<string, { method: string; count: number; total: number }>();
  const weekMap = new Map<string, { day: string; count: number; total: number }>();

  for (const item of items) {
    for (const method of item.byPaymentMethod) {
      const key = method.method.toUpperCase();
      const current = paymentMap.get(key) || { method: key, count: 0, total: 0 };
      current.count += method.count || 0;
      current.total += method.total || 0;
      paymentMap.set(key, current);
    }

    for (const day of item.byDayOfWeek) {
      const key = day.day;
      const current = weekMap.get(key) || { day: key, count: 0, total: 0 };
      current.count += day.count || 0;
      current.total += day.total || 0;
      weekMap.set(key, current);
    }
  }

  return {
    byPaymentMethod: Array.from(paymentMap.values()).sort((a, b) => b.total - a.total),
    byDayOfWeek: Array.from(weekMap.values()),
  };
};

const aggregateReservationsByDay = (items: ReservationsTodayMetric[]) => ({
  total: items.reduce((acc, item) => acc + (item.total || 0), 0),
  totalGuests: items.reduce((acc, item) => acc + (item.totalGuests || 0), 0),
  confirmed: items.reduce((acc, item) => acc + (item.confirmed || 0), 0),
  pending: items.reduce((acc, item) => acc + (item.pending || 0), 0),
  cancelled: items.reduce((acc, item) => acc + (item.cancelled || 0), 0),
});

const aggregateTopItemsByDay = (items: TopMenuItemMetric[][], limit = 5) => {
  const map = new Map<string, TopMenuItemMetric>();

  for (const group of items) {
    for (const item of group) {
      const key = item.name.trim().toLowerCase();
      const current = map.get(key) || {
        name: item.name,
        totalQuantity: 0,
        totalRevenue: 0,
      };
      current.totalQuantity += item.totalQuantity || 0;
      current.totalRevenue += item.totalRevenue || 0;
      map.set(key, current);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
};

const aggregateStaffByDay = (items: StaffPerformanceMetric[][]) => {
  const map = new Map<string, StaffPerformanceMetric>();

  for (const group of items) {
    for (const item of group) {
      const key = item.waiterName.trim().toLowerCase();
      const current = map.get(key) || {
        waiterName: item.waiterName,
        orderCount: 0,
        totalSales: 0,
        avgTicket: 0,
      };

      current.orderCount += item.orderCount || 0;
      current.totalSales += item.totalSales || 0;
      current.avgTicket = current.orderCount > 0 ? current.totalSales / current.orderCount : 0;
      map.set(key, current);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalSales - a.totalSales);
};

const aggregateAvgTimeByDay = (items: AvgOrderTimeMetric[]) => {
  const weightedTotal = items.reduce((acc, item) => acc + (item.avgMinutes || 0) * (item.sampleSize || 0), 0);
  const sampleSize = items.reduce((acc, item) => acc + (item.sampleSize || 0), 0);

  return {
    avgMinutes: sampleSize > 0 ? weightedTotal / sampleSize : 0,
    sampleSize,
  };
};

const mapStatusLabel = (status: string) => {
  const normalized = status.trim().toUpperCase();
  if (normalized === "PENDIENTE") return "Pendiente";
  if (normalized === "PREPARACION") return "Preparación";
  if (normalized === "SERVIDO") return "Servido";
  if (normalized === "LISTA_PARA_PAGAR") return "Lista para pagar";
  if (normalized === "PAGADO") return "Pagado";
  return status;
};

const mapPaymentMethodLabel = (method: string) => {
  const normalized = method.trim().toUpperCase();
  if (normalized === "EFECTIVO") return "Efectivo";
  if (normalized === "TARJETA") return "Tarjeta";
  if (normalized === "TRANSFERENCIA") return "Transferencia";
  if (normalized === "QR") return "QR";
  return "No definido";
};

const buildPieGradient = (items: MetricsSales["byPaymentMethod"]) => {
  if (!items.length) {
    return "conic-gradient(#e5e7eb 0 100%)";
  }

  const total = items.reduce((acc, item) => acc + (item.total || 0), 0);
  if (total <= 0) {
    return "conic-gradient(#e5e7eb 0 100%)";
  }

  let offset = 0;
  const sections = items.map((item) => {
    const ratio = (item.total || 0) / total;
    const start = offset * 360;
    const end = (offset + ratio) * 360;
    offset += ratio;
    const color = PAYMENT_METHOD_COLORS[item.method.toUpperCase()] || PAYMENT_METHOD_COLORS.UNKNOWN;
    return `${color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${sections.join(", ")})`;
};

export const Metrics = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [period, setPeriod] = useState<MetricsViewPeriod>("day");
  const [selectedDate, setSelectedDate] = useState(today);
  const [rangeStart, setRangeStart] = useState(addDays(today, -6));
  const [rangeEnd, setRangeEnd] = useState(today);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [sales, setSales] = useState<MetricsSales>({ byPaymentMethod: [], byDayOfWeek: [] });
  const [orderStatus, setOrderStatus] = useState<OrderStatusMetric[]>([]);
  const [avgTime, setAvgTime] = useState<AvgOrderTimeMetric | null>(null);
  const [occupancy, setOccupancy] = useState<TableOccupancyMetric | null>(null);
  const [reservations, setReservations] = useState<ReservationsTodayMetric | null>(null);
  const [topItems, setTopItems] = useState<TopMenuItemMetric[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformanceMetric[]>([]);

  const loadMetrics = useCallback(async () => {
    setRangeError(null);

    if (period === "custom") {
      if (!rangeStart || !rangeEnd) {
        setRangeError("Seleccioná fecha desde y fecha hasta para consultar el rango.");
        return;
      }

      if (rangeStart > rangeEnd) {
        setRangeError("La fecha desde no puede ser mayor que la fecha hasta.");
        return;
      }

      if (rangeEnd > today) {
        setRangeError("No se permiten fechas futuras en el rango.");
        return;
      }

      const dates = getDateRange(rangeStart, rangeEnd);
      if (dates.length > 45) {
        setRangeError("El rango máximo permitido es de 45 días para mantener buen rendimiento.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [
          summaryByDay,
          salesByDay,
          reservationsByDay,
          topItemsByDay,
          staffByDay,
          avgTimeByDay,
          orderStatusResponse,
          occupancyResponse,
        ] = await Promise.all([
          Promise.all(dates.map((date) => adminMetricsService.getSummary("day", date))),
          Promise.all(dates.map((date) => adminMetricsService.getSales("day", date))),
          Promise.all(dates.map((date) => adminMetricsService.getReservationsToday("day", date))),
          Promise.all(dates.map((date) => adminMetricsService.getTopMenuItems("day", date, 10))),
          Promise.all(dates.map((date) => adminMetricsService.getStaffPerformance("day", date))),
          Promise.all(dates.map((date) => adminMetricsService.getOrderAvgTime("day", date))),
          adminMetricsService.getOrderStatus(),
          adminMetricsService.getTablesOccupancy(),
        ]);

        const previousStart = addDays(rangeStart, -dates.length);
        const previousEnd = addDays(rangeStart, -1);
        const previousDates = getDateRange(previousStart, previousEnd);
        const previousSummaryByDay = await Promise.all(
          previousDates.map((date) => adminMetricsService.getSummary("day", date)),
        );

        const currentAggregate = aggregateSummaryByDay(summaryByDay);
        const previousAggregate = aggregateSummaryByDay(previousSummaryByDay);

        setSummary({
          totalSales: currentAggregate.totalSales,
          totalSalesDelta: calculateDelta(currentAggregate.totalSales, previousAggregate.totalSales),
          orderCount: currentAggregate.orderCount,
          orderCountDelta: calculateDelta(currentAggregate.orderCount, previousAggregate.orderCount),
          avgTicket: currentAggregate.avgTicket,
          avgTicketDelta: calculateDelta(currentAggregate.avgTicket, previousAggregate.avgTicket),
        });

        setSales(aggregateSalesByDay(salesByDay));
        setReservations(aggregateReservationsByDay(reservationsByDay));
        setTopItems(aggregateTopItemsByDay(topItemsByDay, 5));
        setStaffPerformance(aggregateStaffByDay(staffByDay));
        setAvgTime(aggregateAvgTimeByDay(avgTimeByDay));
        setOrderStatus(orderStatusResponse);
        setOccupancy(occupancyResponse);
      } catch {
        setError("No se pudieron cargar las métricas del restaurante para el rango seleccionado.");
      } finally {
        setIsLoading(false);
      }

      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [
        summaryResponse,
        salesResponse,
        orderStatusResponse,
        avgTimeResponse,
        occupancyResponse,
        reservationsResponse,
        topItemsResponse,
        staffPerformanceResponse,
      ] = await Promise.all([
        adminMetricsService.getSummary(period, selectedDate),
        adminMetricsService.getSales(period, selectedDate),
        adminMetricsService.getOrderStatus(),
        adminMetricsService.getOrderAvgTime(period, selectedDate),
        adminMetricsService.getTablesOccupancy(),
        adminMetricsService.getReservationsToday(period, selectedDate),
        adminMetricsService.getTopMenuItems(period, selectedDate, 5),
        adminMetricsService.getStaffPerformance(period, selectedDate),
      ]);

      setSummary(summaryResponse);
      setSales(salesResponse);
      setOrderStatus(orderStatusResponse);
      setAvgTime(avgTimeResponse);
      setOccupancy(occupancyResponse);
      setReservations(reservationsResponse);
      setTopItems(topItemsResponse);
      setStaffPerformance(staffPerformanceResponse);
    } catch {
      setError("No se pudieron cargar las métricas del restaurante.");
    } finally {
      setIsLoading(false);
    }
  }, [period, rangeEnd, rangeStart, selectedDate, today]);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  const summaryCards = useMemo(() => {
    if (!summary) return [];

    return [
      {
        title: "Ventas Totales",
        value: formatMoney(summary.totalSales),
        icon: DollarSign,
        tone: "orange" as const,
        trend: {
          value: getDeltaText(summary.totalSalesDelta),
          isPositive: summary.totalSalesDelta >= 0,
        },
      },
      {
        title: "Número de Pedidos",
        value: String(summary.orderCount || 0),
        icon: ShoppingCart,
        tone: "blue" as const,
        trend: {
          value: getDeltaText(summary.orderCountDelta),
          isPositive: summary.orderCountDelta >= 0,
        },
      },
      {
        title: "Ticket Promedio",
        value: formatMoney(summary.avgTicket),
        icon: Ticket,
        tone: "emerald" as const,
        trend: {
          value: getDeltaText(summary.avgTicketDelta),
          isPositive: summary.avgTicketDelta >= 0,
        },
      },
      {
        title: "Tiempo Promedio",
        value: `${Math.round(avgTime?.avgMinutes || 0)} min`,
        icon: Clock3,
        tone: "violet" as const,
        trend: {
          value: `${avgTime?.sampleSize || 0} órdenes`,
          isPositive: true,
        },
      },
    ];
  }, [avgTime, summary]);

  const barSeries = useMemo(() => {
    const maxTotal = Math.max(...sales.byDayOfWeek.map((item) => item.total || 0), 0);

    return sales.byDayOfWeek.map((item: DayOfWeekSale) => ({
      ...item,
      ratio: maxTotal > 0 ? ((item.total || 0) / maxTotal) * 100 : 0,
    }));
  }, [sales.byDayOfWeek]);

  const pieGradient = useMemo(
    () => buildPieGradient(sales.byPaymentMethod),
    [sales.byPaymentMethod],
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2>Métricas y Rendimiento</h2>
          <p>
            {period === "custom"
              ? `Monitorea el rendimiento del restaurante para el rango ${formatDateLabel(rangeStart)} al ${formatDateLabel(rangeEnd)}.`
              : `Monitorea el rendimiento del restaurante para ${PERIOD_LABELS[period].toLowerCase()} con corte en ${formatDateLabel(selectedDate)}.`}
          </p>
        </div>

        <div className={styles.controls}>
          <label className={styles.selectLabel} htmlFor="metrics-period">
            Período
          </label>
          <select
            id="metrics-period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as MetricsPeriod)}
            className={styles.select}
          >
            <option value="day">Hoy</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
            <option value="custom">Rango personalizado</option>
          </select>
          {period === "custom" ? (
            <div className={styles.rangeGroup}>
              <label className={styles.selectLabel} htmlFor="metrics-range-start">Desde</label>
              <input
                id="metrics-range-start"
                type="date"
                value={rangeStart}
                max={today}
                onChange={(event) => setRangeStart(event.target.value || rangeStart)}
                className={styles.dateInput}
              />
              <span className={styles.rangeSeparator}>a</span>
              <label className={styles.selectLabel} htmlFor="metrics-range-end">Hasta</label>
              <input
                id="metrics-range-end"
                type="date"
                value={rangeEnd}
                max={today}
                onChange={(event) => setRangeEnd(event.target.value || rangeEnd)}
                className={styles.dateInput}
              />
              <button
                type="button"
                className={styles.quickDateButton}
                onClick={() => {
                  const last7Start = addDays(today, -6);
                  setRangeStart(last7Start);
                  setRangeEnd(today);
                }}
              >
                Últimos 7 días
              </button>
            </div>
          ) : (
            <>
              <label className={styles.selectLabel} htmlFor="metrics-date">
                Fecha
              </label>
              <input
                id="metrics-date"
                type="date"
                value={selectedDate}
                max={today}
                onChange={(event) => setSelectedDate(event.target.value || today)}
                className={styles.dateInput}
              />
              <div className={styles.quickDateButtons}>
                <button
                  type="button"
                  className={styles.quickDateButton}
                  onClick={() => setSelectedDate(today)}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  className={styles.quickDateButton}
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setSelectedDate(yesterday.toISOString().slice(0, 10));
                  }}
                >
                  Ayer
                </button>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              void loadMetrics();
            }}
            className={styles.refreshButton}
            disabled={isLoading}
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>
      </header>

      {rangeError && <div className={styles.errorBanner}>{rangeError}</div>}
      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.metricsGrid}>
        {summaryCards.map((metric, index) => (
          <MetricCard key={`${metric.title}-${index}`} {...metric} />
        ))}
      </div>

      {isLoading ? (
        <div className={styles.loadingBox}>Cargando métricas...</div>
      ) : (
        <>
          <section className={styles.widgetsGrid}>
            <article className={`${styles.widgetCard} ${styles.widgetOrange}`}>
              <h3 className={styles.widgetTitle}>Ocupación de Mesas</h3>
              <p className={styles.widgetValue}>{occupancy?.occupancyRate.toFixed(1) || "0.0"}%</p>
              <p className={styles.widgetCaption}>
                {occupancy?.occupiedTables || 0} ocupadas de {occupancy?.totalTables || 0}
              </p>
            </article>

            <article className={`${styles.widgetCard} ${styles.widgetBlue}`}>
              <h3 className={styles.widgetTitle}>Reservas ({EXTENDED_PERIOD_LABELS[period]})</h3>
              <p className={styles.widgetValue}>{reservations?.total || 0}</p>
              <p className={styles.widgetCaption}>
                {reservations?.confirmed || 0} confirmadas · {reservations?.pending || 0} pendientes
              </p>
            </article>

            <article className={`${styles.widgetCard} ${styles.widgetViolet}`}>
              <h3 className={styles.widgetTitle}>Pedidos por Estado</h3>
              <div className={styles.statusList}>
                {orderStatus.length === 0 ? (
                  <p className={styles.emptyText}>Sin datos disponibles.</p>
                ) : (
                  orderStatus.map((item) => (
                    <div key={item.status} className={styles.statusRow}>
                      <span>{mapStatusLabel(item.status)}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section className={styles.chartsGrid}>
            <article className={`${styles.chartCard} ${styles.pieCardAccent}`}>
              <div className={styles.chartHeader}>
                <h3>Métodos de pago</h3>
                <BarChart3 size={16} />
              </div>
              <div className={styles.pieWrap}>
                <div className={styles.pieChart} style={{ background: pieGradient }} />
                <div className={styles.legendList}>
                  {sales.byPaymentMethod.length === 0 ? (
                    <p className={styles.emptyText}>Sin ventas en el período.</p>
                  ) : (
                    sales.byPaymentMethod.map((item) => {
                      const key = item.method.toUpperCase();
                      const color = PAYMENT_METHOD_COLORS[key] || PAYMENT_METHOD_COLORS.UNKNOWN;
                      return (
                        <div key={`${item.method}-${item.count}`} className={styles.legendItem}>
                          <span className={styles.legendDot} style={{ backgroundColor: color }} />
                          <span>{mapPaymentMethodLabel(item.method)}</span>
                          <strong>{formatMoney(item.total)}</strong>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </article>

            <article className={`${styles.chartCard} ${styles.barCardAccent}`}>
              <div className={styles.chartHeader}>
                <h3>Ventas por día</h3>
                <BarChart3 size={16} />
              </div>
              <div className={styles.barList}>
                {barSeries.length === 0 ? (
                  <p className={styles.emptyText}>Sin ventas en el período.</p>
                ) : (
                  barSeries.map((item) => (
                    <div key={`${item.day}-${item.total}`} className={styles.barRow}>
                      <span className={styles.barLabel}>{item.day}</span>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: `${item.ratio}%` }} />
                      </div>
                      <strong className={styles.barValue}>{formatMoney(item.total)}</strong>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section className={styles.tablesGrid}>
            <div className={styles.tableContainer}>
              <h3 className={styles.tableTitle}>Top productos</h3>
              <div className={styles.scrollArea}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Facturación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.length === 0 ? (
                      <tr>
                        <td colSpan={3} className={styles.emptyCell}>Sin datos para el período.</td>
                      </tr>
                    ) : (
                      topItems.map((item) => (
                        <tr key={`${item.name}-${item.totalQuantity}`}>
                          <td>{item.name}</td>
                          <td>{item.totalQuantity}</td>
                          <td className={styles.amount}>{formatMoney(item.totalRevenue)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <h3 className={styles.tableTitle}>Rendimiento de mozos</h3>
              <div className={styles.scrollArea}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Mozo</th>
                      <th>Pedidos</th>
                      <th>Ventas</th>
                      <th>Ticket promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffPerformance.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={styles.emptyCell}>Sin datos para el período.</td>
                      </tr>
                    ) : (
                      staffPerformance.map((item) => (
                        <tr key={`${item.waiterName}-${item.orderCount}`}>
                          <td>
                            <div className={styles.waiterCell}>
                              <Users size={14} />
                              <span>{item.waiterName}</span>
                            </div>
                          </td>
                          <td>{item.orderCount}</td>
                          <td className={styles.amount}>{formatMoney(item.totalSales)}</td>
                          <td>{formatMoney(item.avgTicket)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

      <div className={styles.footerInfo}>
        <span>Período seleccionado: {EXTENDED_PERIOD_LABELS[period]}</span>
        <span>
          {period === "custom"
            ? `Rango de consulta: ${formatDateLabel(rangeStart)} a ${formatDateLabel(rangeEnd)}`
            : `Fecha de corte: ${formatDateLabel(selectedDate)}`}
        </span>
      </div>
    </div>
  );
};