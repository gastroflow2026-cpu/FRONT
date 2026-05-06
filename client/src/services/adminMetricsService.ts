import axios from "axios";
import { getToken } from "@/helpers/getToken";
import { getApiBaseUrl } from "@/services/apiBaseUrl";

const API_URL = getApiBaseUrl();

export type MetricsPeriod = "day" | "week" | "month";

export interface MetricsSummary {
  totalSales: number;
  totalSalesDelta: number;
  orderCount: number;
  orderCountDelta: number;
  avgTicket: number;
  avgTicketDelta: number;
}

export interface PaymentMethodSale {
  method: string;
  count: number;
  total: number;
}

export interface DayOfWeekSale {
  day: string;
  count: number;
  total: number;
}

export interface MetricsSales {
  byPaymentMethod: PaymentMethodSale[];
  byDayOfWeek: DayOfWeekSale[];
}

export interface OrderStatusMetric {
  status: string;
  count: number;
}

export interface AvgOrderTimeMetric {
  avgMinutes: number;
  sampleSize: number;
}

export interface TableOccupancyMetric {
  totalTables: number;
  occupiedTables: number;
  freeTables: number;
  occupancyRate: number;
}

export interface ReservationsTodayMetric {
  total: number;
  totalGuests: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

export interface TopMenuItemMetric {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface StaffPerformanceMetric {
  waiterName: string;
  orderCount: number;
  totalSales: number;
  avgTicket: number;
}

const getAuthConfig = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

const periodParams = (period: MetricsPeriod, date: string) => ({ period, date });

export const adminMetricsService = {
  getSummary: async (period: MetricsPeriod, date: string) => {
    const response = await axios.get<MetricsSummary>(`${API_URL}/metrics/summary`, {
      ...getAuthConfig(),
      params: periodParams(period, date),
    });

    return response.data;
  },

  getSales: async (period: MetricsPeriod, date: string) => {
    const response = await axios.get<MetricsSales>(`${API_URL}/metrics/sales`, {
      ...getAuthConfig(),
      params: periodParams(period, date),
    });

    return response.data;
  },

  getOrderStatus: async () => {
    const response = await axios.get<OrderStatusMetric[]>(`${API_URL}/metrics/orders/status`, getAuthConfig());
    return Array.isArray(response.data) ? response.data : [];
  },

  getOrderAvgTime: async (period: MetricsPeriod, date: string) => {
    const response = await axios.get<AvgOrderTimeMetric>(`${API_URL}/metrics/orders/avg-time`, {
      ...getAuthConfig(),
      params: periodParams(period, date),
    });

    return response.data;
  },

  getTablesOccupancy: async () => {
    const response = await axios.get<TableOccupancyMetric>(`${API_URL}/metrics/tables/occupancy`, getAuthConfig());
    return response.data;
  },

  getReservationsToday: async (period: MetricsPeriod, date: string) => {
    const response = await axios.get<ReservationsTodayMetric>(`${API_URL}/metrics/reservations/today`, {
      ...getAuthConfig(),
      params: periodParams(period, date),
    });

    return response.data;
  },

  getTopMenuItems: async (period: MetricsPeriod, date: string, limit = 5) => {
    const response = await axios.get<TopMenuItemMetric[]>(`${API_URL}/metrics/menu/top-items`, {
      ...getAuthConfig(),
      params: {
        ...periodParams(period, date),
        limit,
      },
    });

    return Array.isArray(response.data) ? response.data : [];
  },

  getStaffPerformance: async (period: MetricsPeriod, date: string) => {
    const response = await axios.get<StaffPerformanceMetric[]>(`${API_URL}/metrics/staff/performance`, {
      ...getAuthConfig(),
      params: periodParams(period, date),
    });

    return Array.isArray(response.data) ? response.data : [];
  },
};
