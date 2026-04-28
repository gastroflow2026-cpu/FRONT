"use client";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import axios from "axios";
import { getToken } from "@/helpers/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

const buildTableCandidates = (baseUrl: string, restaurantId: string) => [
    `${baseUrl}/restaurants/${restaurantId}/tables/availableTables`,
    `${baseUrl}/restaurants/${restaurantId}/tables/available`,
    `${baseUrl}/restaurants/${restaurantId}/tables`,
    `${baseUrl}/tables/restaurant/${restaurantId}`,
    `${baseUrl}/tables/restaurant/${restaurantId}/available`,
];

export interface Table {
    id: string;
    table_number: number;
    capacity: number;
    zone: string;
    status: string;
    is_active: boolean;
}

interface TablesContextType {
    tables: Table[];
    loading: boolean;
    getTables: (restaurantId: string, date?: string, time?: string) => Promise<void>;
}

export const TablesContext = createContext<TablesContextType>({
    tables: [],
    loading: false,
    getTables: async () => {},
});

const TablesProvider = ({ children }: { children: ReactNode }) => {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(false);

    const getTables = useCallback(async (restaurantId: string, date?: string, time?: string) => {
        try {
            setLoading(true);
            const token = getToken();
            if (!API_URL || !restaurantId) {
                setTables([]);
                return;
            }

            const response = await axios.get(
                `${API_URL}/restaurants/${restaurantId}/tables/availableTables`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    params: { date, time }, // ← query params
                }
                : undefined;

            const candidates = buildTableCandidates(API_URL, restaurantId);
            let loadedTables: Table[] = [];
            let lastError: unknown;

            for (const endpoint of candidates) {
                try {
                    const response = await axios.get(endpoint, { headers });
                    loadedTables = Array.isArray(response.data) ? response.data : [];
                    lastError = null;
                    break;
                } catch (error: unknown) {
                    lastError = error;

                    if (axios.isAxiosError(error) && error.response?.status === 404) {
                        continue;
                    }

                    throw error;
                }
            }

            if (lastError) {
                throw lastError;
            }

            setTables(loadedTables);
        } catch (error: any) {
            console.warn(error.response?.data?.message || 'Error al obtener las mesas');
            setTables([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const value: TablesContextType = useMemo(() => ({
        tables,
        loading,
        getTables,
    }), [tables, loading, getTables]);

    return (
        <TablesContext.Provider value={value}>
            {children}
        </TablesContext.Provider>
    );
};

export const useTables = () => useContext(TablesContext);

export default TablesProvider;