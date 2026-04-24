"use client";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import axios from "axios";
import { getToken } from "@/helpers/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

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
    getTables: (restaurantId: string) => Promise<void>;
}

export const TablesContext = createContext<TablesContextType>({
    tables: [],
    loading: false,
    getTables: async () => {},
});

const TablesProvider = ({ children }: { children: ReactNode }) => {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(false);

    const getTables = useCallback(async (restaurantId: string) => {
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
                    headers: token ? {
                        Authorization: `Bearer ${token}`,
                    } : undefined,
                }
            );

            setTables(Array.isArray(response.data) ? response.data : []);
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