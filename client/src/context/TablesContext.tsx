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
        if (!API_URL || !restaurantId) {
            setTables([]);
            return;
        }

        setLoading(true);

        try {
            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
            const params = date || time ? { date, time } : undefined;
            const candidates = buildTableCandidates(API_URL, restaurantId);

            let loadedTables: Table[] = [];

            for (const endpoint of candidates) {
                try {
                    const response = await axios.get(endpoint, { headers, params });
                    const raw = response.data;

                    if (!raw) continue;

                    const parsed: Table[] = Array.isArray(raw) ? raw : [];
                    if (parsed.length === 0) continue;

                    loadedTables = parsed;
                    break;
                } catch (error: unknown) {
                    if (axios.isAxiosError(error)) {
                        const status = error.response?.status;
                        if (status === 404 || !status) continue;
                        throw error;
                    }
                    throw error;
                }
            }

            setTables(loadedTables);
        } catch (error: unknown) {
            const msg = axios.isAxiosError(error)
                ? `${error.response?.status} – ${error.response?.data?.message || error.message}`
                : String(error);
            console.warn(msg);
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